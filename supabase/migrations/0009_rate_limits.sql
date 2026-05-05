-- Rate limiting: fixed-window counter table + atomic RPC.
-- ─────────────────────────────────────────────────────────────────────────────
-- Each row tracks one (action, key) pair: e.g. ("enquiries", "1.2.3.4").
-- The RPC atomically increments the counter and resets the window if it has
-- elapsed, returning whether the call is allowed.

create table if not exists public.rate_limits (
  key                 text        primary key,
  count               int         not null,
  window_started_at   timestamptz not null
);

-- Index for the cleanup query below.
create index if not exists idx_rate_limits_window
  on public.rate_limits (window_started_at);

-- RLS on with no policies — only service role accesses this table.
alter table public.rate_limits enable row level security;

-- Atomic check-and-increment. Fixed window: when the existing window has
-- expired, count resets to 1 and the window restarts at now(); otherwise
-- count is incremented in place. Returns the resulting count so the caller
-- can decide whether to allow the request.
create or replace function public.check_rate_limit(
  p_key             text,
  p_max             int,
  p_window_seconds  int
) returns table (
  allowed   boolean,
  remaining int,
  reset_at  timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_now           timestamptz := now();
  v_count         int;
  v_window_start  timestamptz;
  v_expiry        interval := make_interval(secs => p_window_seconds);
begin
  insert into public.rate_limits as r (key, count, window_started_at)
  values (p_key, 1, v_now)
  on conflict (key) do update
    set count = case
                  when r.window_started_at + v_expiry < v_now then 1
                  else r.count + 1
                end,
        window_started_at = case
                              when r.window_started_at + v_expiry < v_now then v_now
                              else r.window_started_at
                            end
  returning r.count, r.window_started_at
  into v_count, v_window_start;

  return query
  select
    v_count <= p_max,
    greatest(0, p_max - v_count),
    v_window_start + v_expiry;
end;
$$;

-- Optional housekeeping: drop rows whose window ended more than a day ago.
-- Call manually or wire to pg_cron if desired.
create or replace function public.prune_rate_limits()
returns void
language sql
security definer
set search_path = public
as $$
  delete from public.rate_limits
  where window_started_at < now() - interval '1 day';
$$;
