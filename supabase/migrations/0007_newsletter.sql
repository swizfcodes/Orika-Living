-- Newsletter: subscribers + campaigns
-- ─────────────────────────────────────────────────────────────────────────────

create table if not exists public.newsletter_subscribers (
  email            text primary key,
  subscribed_at    timestamptz not null default now(),
  unsubscribed_at  timestamptz,
  source           text not null default 'footer'
);

create index if not exists idx_newsletter_active
  on public.newsletter_subscribers (subscribed_at desc)
  where unsubscribed_at is null;

alter table public.newsletter_subscribers enable row level security;

-- Public can subscribe (insert). No public select — protects the list.
create policy "subscribers_public_insert"
  on public.newsletter_subscribers for insert
  to anon, authenticated
  with check (true);

-- Admins can read / update / delete.
create policy "subscribers_admin_select"
  on public.newsletter_subscribers for select
  to authenticated
  using (public.is_admin());

create policy "subscribers_admin_update"
  on public.newsletter_subscribers for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "subscribers_admin_delete"
  on public.newsletter_subscribers for delete
  to authenticated
  using (public.is_admin());


create table if not exists public.newsletter_campaigns (
  id               uuid primary key default gen_random_uuid(),
  subject          text not null,
  eyebrow          text,
  title            text not null,
  body_html        text not null,
  body_text        text not null,
  cta_href         text,
  cta_label        text,
  sent_at          timestamptz,
  sent_by          uuid references auth.users(id) on delete set null,
  recipient_count  integer not null default 0,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create index if not exists idx_campaigns_created on public.newsletter_campaigns (created_at desc);

alter table public.newsletter_campaigns enable row level security;

create policy "campaigns_admin_all"
  on public.newsletter_campaigns for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create or replace function public.touch_newsletter_campaigns()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

drop trigger if exists trg_touch_newsletter_campaigns on public.newsletter_campaigns;
create trigger trg_touch_newsletter_campaigns
  before update on public.newsletter_campaigns
  for each row execute function public.touch_newsletter_campaigns();


-- Realtime — admin subscriber list + campaign list auto-refresh.
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'newsletter_subscribers'
  ) then
    alter publication supabase_realtime add table public.newsletter_subscribers;
  end if;

  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'newsletter_campaigns'
  ) then
    alter publication supabase_realtime add table public.newsletter_campaigns;
  end if;
end $$;
