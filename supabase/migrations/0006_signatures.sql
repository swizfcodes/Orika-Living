-- =============================================================================
-- Orika Living — Signatures (product formats) + unshackle scents
-- 1. Migrate scents PK from `family` (enum) to `slug` so admin can add new
--    scent families beyond the fixed six.
-- 2. Convert products.scent_family from enum to text for the same reason.
-- 3. New `signatures` table: editorial content for the "Range" section on
--    the home page. Slug-keyed, freely addable, admin CRUD + hero image.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. Scents: slug is the new primary key; family becomes free text
-- -----------------------------------------------------------------------------
do $$
begin
  if exists (
    select 1 from pg_constraint
    where conname = 'scents_pkey' and conrelid = 'public.scents'::regclass
  ) then
    alter table public.scents drop constraint scents_pkey;
  end if;

  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'scents'
      and column_name = 'family' and udt_name = 'scent_family'
  ) then
    alter table public.scents alter column family type text using family::text;
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'scents_pkey' and conrelid = 'public.scents'::regclass
  ) then
    alter table public.scents add constraint scents_pkey primary key (slug);
  end if;
end $$;

-- Allow multiple scents per family now
drop index if exists scents_slug_idx;
create index if not exists scents_family_idx on public.scents (family);

-- -----------------------------------------------------------------------------
-- 2. Products: scent_family as text so admin can use new families freely
-- -----------------------------------------------------------------------------
do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'products'
      and column_name = 'scent_family' and udt_name = 'scent_family'
  ) then
    alter table public.products alter column scent_family type text using scent_family::text;
  end if;
end $$;

-- -----------------------------------------------------------------------------
-- 3. Signatures table
-- -----------------------------------------------------------------------------
create table if not exists public.signatures (
  slug           text primary key,
  name           text not null,
  size_label     text not null,
  price_label    text not null,
  blurb          text not null,
  image          text,
  display_order  integer not null default 0,
  updated_at     timestamptz not null default now()
);

create index if not exists signatures_display_order_idx
  on public.signatures (display_order);

alter table public.signatures enable row level security;

drop policy if exists "signatures_public_read"  on public.signatures;
drop policy if exists "signatures_admin_insert" on public.signatures;
drop policy if exists "signatures_admin_update" on public.signatures;
drop policy if exists "signatures_admin_delete" on public.signatures;

create policy "signatures_public_read"
  on public.signatures for select
  to anon, authenticated
  using (true);

create policy "signatures_admin_insert"
  on public.signatures for insert
  to authenticated
  with check (public.is_admin());

create policy "signatures_admin_update"
  on public.signatures for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "signatures_admin_delete"
  on public.signatures for delete
  to authenticated
  using (public.is_admin());

-- Seed — mirrors the static `formats` defaults in lib/scents/index.ts
insert into public.signatures (slug, name, size_label, price_label, blurb, display_order)
values
  ('grand-edition',     'Grand Edition',     '1000ml',   '₦125,000',
   'Our flagship vessel — a statement piece for entryways, living rooms and open spaces.',
   1),
  ('signature-edition', 'Signature Edition', '500ml',    '₦99,500',
   'The everyday luxury — balanced for bedrooms, studies and quieter corners.',
   2),
  ('curated-gift-set',  'Curated Gift Set',  '3 × 250ml','₦110,000',
   'A trio of scents, gift-ready in signature Orika packaging. For the people you choose deliberately.',
   3),
  ('car-diffuser',      'Car Diffuser',      '8ml',      '₦6,500',
   'Scent beyond the home — a compact companion for the drive.',
   4)
on conflict (slug) do nothing;

-- -----------------------------------------------------------------------------
-- 4. Realtime publication — storefront + admin subscribe to signatures too
-- -----------------------------------------------------------------------------
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'signatures'
  ) then
    alter publication supabase_realtime add table public.signatures;
  end if;
end $$;
