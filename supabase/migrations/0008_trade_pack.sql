-- Trade pack: private storage bucket + audit columns on enquiries.
-- ─────────────────────────────────────────────────────────────────────────────

-- Private bucket (no public read). Served only via service-role fetch.
insert into storage.buckets (id, name, public)
values ('trade-pack', 'trade-pack', false)
on conflict (id) do nothing;

drop policy if exists "trade_pack_admin_select" on storage.objects;
drop policy if exists "trade_pack_admin_insert" on storage.objects;
drop policy if exists "trade_pack_admin_update" on storage.objects;
drop policy if exists "trade_pack_admin_delete" on storage.objects;

create policy "trade_pack_admin_select"
  on storage.objects for select
  to authenticated
  using (bucket_id = 'trade-pack' and public.is_admin());

create policy "trade_pack_admin_insert"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'trade-pack' and public.is_admin());

create policy "trade_pack_admin_update"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'trade-pack' and public.is_admin())
  with check (bucket_id = 'trade-pack' and public.is_admin());

create policy "trade_pack_admin_delete"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'trade-pack' and public.is_admin());


-- Audit columns on enquiries — lets the UI say "sent 3 days ago" and
-- prevents accidental double-sends.
alter table public.enquiries
  add column if not exists trade_pack_sent_at timestamptz,
  add column if not exists trade_pack_sent_by uuid references auth.users(id) on delete set null;
