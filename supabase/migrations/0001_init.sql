-- =============================================================================
-- Orika Living — Initial schema, RLS policies, and seed data
-- Run this file in the Supabase SQL editor. Safe to re-run (idempotent).
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Extensions
-- -----------------------------------------------------------------------------
create extension if not exists "pgcrypto";

-- -----------------------------------------------------------------------------
-- Enums
-- -----------------------------------------------------------------------------
do $$ begin
  create type scent_family as enum (
    'Fresh & Marine',
    'Citrus & Green',
    'Oud & Floral',
    'Spice & Amber',
    'Woody & Deep',
    'Floral & Musk'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type product_format as enum (
    'Grand Edition',
    'Signature Edition',
    'Curated Gift Set',
    'Car Diffuser'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type order_status as enum (
    'pending','paid','processing','shipped','delivered','cancelled'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type enquiry_type as enum (
    'Retail / Stockist Partnership',
    'Bulk / Wholesale Order',
    'Corporate Gifting',
    'Hotel / Hospitality Placement',
    'Event Setup',
    'General Enquiry'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type enquiry_status as enum ('new','read','replied','closed');
exception when duplicate_object then null; end $$;

-- -----------------------------------------------------------------------------
-- Tables
-- -----------------------------------------------------------------------------

-- admins: linked to auth.users; service role manages rows
create table if not exists public.admins (
  id          uuid primary key references auth.users(id) on delete cascade,
  email       text not null unique,
  role        text not null default 'admin' check (role in ('admin','owner')),
  created_at  timestamptz not null default now()
);

-- customers: linked to auth.users (optional; anon checkout still possible via service role)
create table if not exists public.customers (
  id            uuid primary key references auth.users(id) on delete cascade,
  email         text not null unique,
  full_name     text not null,
  phone         text not null,
  total_orders  integer not null default 0,
  created_at    timestamptz not null default now()
);

-- products
create table if not exists public.products (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  slug          text not null unique,
  scent_family  scent_family not null,
  format        product_format not null,
  price_kobo    bigint not null check (price_kobo >= 0),
  size_ml       integer not null check (size_ml > 0),
  stock_qty     integer not null default 0 check (stock_qty >= 0),
  in_stock      boolean generated always as (stock_qty > 0) stored,
  images        text[] not null default '{}',
  description   text not null,
  top_notes     text[] not null default '{}',
  heart_notes   text[] not null default '{}',
  base_notes    text[] not null default '{}',
  created_at    timestamptz not null default now()
);

-- orders
create table if not exists public.orders (
  id                uuid primary key default gen_random_uuid(),
  customer_id       uuid references public.customers(id) on delete set null,
  status            order_status not null default 'pending',
  total_kobo        bigint not null check (total_kobo >= 0),
  paystack_ref      text unique,
  delivery_address  jsonb not null,
  items             jsonb not null,
  created_at        timestamptz not null default now()
);

-- enquiries
create table if not exists public.enquiries (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  email       text not null,
  phone       text not null,
  type        enquiry_type not null,
  message     text not null,
  status      enquiry_status not null default 'new',
  created_at  timestamptz not null default now()
);

-- -----------------------------------------------------------------------------
-- Indexes
-- -----------------------------------------------------------------------------
create index if not exists products_slug_idx          on public.products (slug);
create index if not exists products_format_idx        on public.products (format);
create index if not exists products_scent_family_idx  on public.products (scent_family);
create index if not exists products_created_at_idx    on public.products (created_at desc);

create index if not exists orders_status_idx          on public.orders (status);
create index if not exists orders_customer_id_idx     on public.orders (customer_id);
create index if not exists orders_paystack_ref_idx    on public.orders (paystack_ref);
create index if not exists orders_created_at_idx      on public.orders (created_at desc);

create index if not exists enquiries_status_idx       on public.enquiries (status);
create index if not exists enquiries_created_at_idx   on public.enquiries (created_at desc);

create index if not exists customers_email_idx        on public.customers (email);

-- -----------------------------------------------------------------------------
-- Helper: is_admin() — checks if the current auth.uid() is in admins table
-- SECURITY DEFINER so it can be used inside RLS without recursive checks.
-- -----------------------------------------------------------------------------
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.admins where id = auth.uid());
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated;

-- -----------------------------------------------------------------------------
-- Enable RLS
-- -----------------------------------------------------------------------------
alter table public.products   enable row level security;
alter table public.orders     enable row level security;
alter table public.enquiries  enable row level security;
alter table public.customers  enable row level security;
alter table public.admins     enable row level security;

-- -----------------------------------------------------------------------------
-- RLS policies
-- Drop-then-create pattern to keep this file re-runnable.
-- -----------------------------------------------------------------------------

-- PRODUCTS: public read, admin write
drop policy if exists "products_public_read"  on public.products;
drop policy if exists "products_admin_insert" on public.products;
drop policy if exists "products_admin_update" on public.products;
drop policy if exists "products_admin_delete" on public.products;

create policy "products_public_read"
  on public.products for select
  to anon, authenticated
  using (true);

create policy "products_admin_insert"
  on public.products for insert
  to authenticated
  with check (public.is_admin());

create policy "products_admin_update"
  on public.products for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "products_admin_delete"
  on public.products for delete
  to authenticated
  using (public.is_admin());

-- ORDERS: customer reads own, admin reads/updates all.
-- Inserts happen server-side via service role (bypasses RLS).
drop policy if exists "orders_customer_read" on public.orders;
drop policy if exists "orders_admin_read"    on public.orders;
drop policy if exists "orders_admin_update"  on public.orders;

create policy "orders_customer_read"
  on public.orders for select
  to authenticated
  using (customer_id = auth.uid());

create policy "orders_admin_read"
  on public.orders for select
  to authenticated
  using (public.is_admin());

create policy "orders_admin_update"
  on public.orders for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ENQUIRIES: public insert, admin read/update, admin delete
drop policy if exists "enquiries_public_insert" on public.enquiries;
drop policy if exists "enquiries_admin_read"    on public.enquiries;
drop policy if exists "enquiries_admin_update"  on public.enquiries;
drop policy if exists "enquiries_admin_delete"  on public.enquiries;

create policy "enquiries_public_insert"
  on public.enquiries for insert
  to anon, authenticated
  with check (true);

create policy "enquiries_admin_read"
  on public.enquiries for select
  to authenticated
  using (public.is_admin());

create policy "enquiries_admin_update"
  on public.enquiries for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "enquiries_admin_delete"
  on public.enquiries for delete
  to authenticated
  using (public.is_admin());

-- CUSTOMERS: admin only (writes happen via service role)
drop policy if exists "customers_admin_read"   on public.customers;
drop policy if exists "customers_admin_update" on public.customers;
drop policy if exists "customers_admin_delete" on public.customers;

create policy "customers_admin_read"
  on public.customers for select
  to authenticated
  using (public.is_admin());

create policy "customers_admin_update"
  on public.customers for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "customers_admin_delete"
  on public.customers for delete
  to authenticated
  using (public.is_admin());

-- ADMINS: authenticated user can read own row (for layout guard);
-- all writes go through service role only.
drop policy if exists "admins_read_own" on public.admins;

create policy "admins_read_own"
  on public.admins for select
  to authenticated
  using (id = auth.uid());

-- =============================================================================
-- Seed data — 6 scents × 4 formats = 24 products
-- Prices stored in kobo (naira × 100).
-- =============================================================================

insert into public.products
  (name, slug, scent_family, format, price_kobo, size_ml, stock_qty,
   images, description, top_notes, heart_notes, base_notes)
values
  -- Ocean Mist — Fresh & Marine ------------------------------------------------
  ('Ocean Mist — Grand Edition',
   'ocean-mist-grand-edition',
   'Fresh & Marine','Grand Edition',12500000,1000,50,
   array['/images/products/ocean-mist-grand.jpg'],
   'A crisp coastal opening of sea salt and grapefruit gives way to aromatic sage and rosemary, settling into a soft veil of driftwood and musk. Clean, open, unhurried.',
   array['Sea salt','Grapefruit'],
   array['Sage','Rosemary'],
   array['Driftwood','Musk']),

  ('Ocean Mist — Signature Edition',
   'ocean-mist-signature-edition',
   'Fresh & Marine','Signature Edition',9950000,500,50,
   array['/images/products/ocean-mist-signature.jpg'],
   'A crisp coastal opening of sea salt and grapefruit gives way to aromatic sage and rosemary, settling into a soft veil of driftwood and musk. Clean, open, unhurried.',
   array['Sea salt','Grapefruit'],
   array['Sage','Rosemary'],
   array['Driftwood','Musk']),

  ('Ocean Mist — Curated Gift Set',
   'ocean-mist-curated-gift-set',
   'Fresh & Marine','Curated Gift Set',11000000,750,30,
   array['/images/products/ocean-mist-gift.jpg'],
   'A trio of 250ml diffusers — a coastal opening of sea salt and grapefruit leading to sage, rosemary, driftwood and musk. Gift-ready in signature Orika packaging.',
   array['Sea salt','Grapefruit'],
   array['Sage','Rosemary'],
   array['Driftwood','Musk']),

  ('Ocean Mist — Car Diffuser',
   'ocean-mist-car-diffuser',
   'Fresh & Marine','Car Diffuser',650000,8,100,
   array['/images/products/ocean-mist-car.jpg'],
   'Carry the quiet of the coast with you — sea salt, grapefruit, sage and driftwood in a compact 8ml car diffuser.',
   array['Sea salt','Grapefruit'],
   array['Sage','Rosemary'],
   array['Driftwood','Musk']),

  -- Lemon Verbana — Citrus & Green --------------------------------------------
  ('Lemon Verbana — Grand Edition',
   'lemon-verbana-grand-edition',
   'Citrus & Green','Grand Edition',12500000,1000,50,
   array['/images/products/lemon-verbana-grand.jpg'],
   'Bright lemon, lime and lemongrass brighten the air before a green heart of verbana and jasmine unfolds over warm cedarwood and musk. Luminous and garden-fresh.',
   array['Lemon','Lime','Lemongrass'],
   array['Verbana','Green Tea','Jasmine'],
   array['Musk','Cedarwood']),

  ('Lemon Verbana — Signature Edition',
   'lemon-verbana-signature-edition',
   'Citrus & Green','Signature Edition',9950000,500,50,
   array['/images/products/lemon-verbana-signature.jpg'],
   'Bright lemon, lime and lemongrass brighten the air before a green heart of verbana and jasmine unfolds over warm cedarwood and musk. Luminous and garden-fresh.',
   array['Lemon','Lime','Lemongrass'],
   array['Verbana','Green Tea','Jasmine'],
   array['Musk','Cedarwood']),

  ('Lemon Verbana — Curated Gift Set',
   'lemon-verbana-curated-gift-set',
   'Citrus & Green','Curated Gift Set',11000000,750,30,
   array['/images/products/lemon-verbana-gift.jpg'],
   'Three 250ml diffusers of our garden-fresh signature — lemon, lime, lemongrass leading to verbana, jasmine and a soft cedarwood finish.',
   array['Lemon','Lime','Lemongrass'],
   array['Verbana','Green Tea','Jasmine'],
   array['Musk','Cedarwood']),

  ('Lemon Verbana — Car Diffuser',
   'lemon-verbana-car-diffuser',
   'Citrus & Green','Car Diffuser',650000,8,100,
   array['/images/products/lemon-verbana-car.jpg'],
   'A pocket of bright citrus and green tea for your drive — lemon, lemongrass, verbana and cedarwood in an 8ml diffuser.',
   array['Lemon','Lime','Lemongrass'],
   array['Verbana','Green Tea','Jasmine'],
   array['Musk','Cedarwood']),

  -- Midnight Oud — Oud & Floral -----------------------------------------------
  ('Midnight Oud — Grand Edition',
   'midnight-oud-grand-edition',
   'Oud & Floral','Grand Edition',12500000,1000,50,
   array['/images/products/midnight-oud-grand.jpg'],
   'Bergamot and lemon lift the deep allure of oud and rose, anchored by patchouli and sandalwood. A quiet, opulent hush for evening rooms.',
   array['Bergamot','Lemon'],
   array['Oud','Rose'],
   array['Patchouli','Sandalwood']),

  ('Midnight Oud — Signature Edition',
   'midnight-oud-signature-edition',
   'Oud & Floral','Signature Edition',9950000,500,50,
   array['/images/products/midnight-oud-signature.jpg'],
   'Bergamot and lemon lift the deep allure of oud and rose, anchored by patchouli and sandalwood. A quiet, opulent hush for evening rooms.',
   array['Bergamot','Lemon'],
   array['Oud','Rose'],
   array['Patchouli','Sandalwood']),

  ('Midnight Oud — Curated Gift Set',
   'midnight-oud-curated-gift-set',
   'Oud & Floral','Curated Gift Set',11000000,750,30,
   array['/images/products/midnight-oud-gift.jpg'],
   'A trio of 250ml Midnight Oud diffusers — bergamot, oud, rose, patchouli and sandalwood, presented in our signature gift packaging.',
   array['Bergamot','Lemon'],
   array['Oud','Rose'],
   array['Patchouli','Sandalwood']),

  ('Midnight Oud — Car Diffuser',
   'midnight-oud-car-diffuser',
   'Oud & Floral','Car Diffuser',650000,8,100,
   array['/images/products/midnight-oud-car.jpg'],
   'The hush of Midnight Oud in a compact 8ml car diffuser — bergamot, oud, rose and sandalwood on every drive.',
   array['Bergamot','Lemon'],
   array['Oud','Rose'],
   array['Patchouli','Sandalwood']),

  -- Soleil — Spice & Amber ----------------------------------------------------
  ('Soleil — Grand Edition',
   'soleil-grand-edition',
   'Spice & Amber','Grand Edition',12500000,1000,50,
   array['/images/products/soleil-grand.jpg'],
   'A sunlit composition of citrus and green top notes, a spiced floral heart, and a warm base of wood and amber. Golden-hour warmth in every diffusion.',
   array['Citrus','Green'],
   array['Spices','Floral'],
   array['Wood','Amber']),

  ('Soleil — Signature Edition',
   'soleil-signature-edition',
   'Spice & Amber','Signature Edition',9950000,500,50,
   array['/images/products/soleil-signature.jpg'],
   'A sunlit composition of citrus and green top notes, a spiced floral heart, and a warm base of wood and amber. Golden-hour warmth in every diffusion.',
   array['Citrus','Green'],
   array['Spices','Floral'],
   array['Wood','Amber']),

  ('Soleil — Curated Gift Set',
   'soleil-curated-gift-set',
   'Spice & Amber','Curated Gift Set',11000000,750,30,
   array['/images/products/soleil-gift.jpg'],
   'Three 250ml Soleil diffusers — citrus and green opening into spiced florals, wood and amber. Warmth you can gift.',
   array['Citrus','Green'],
   array['Spices','Floral'],
   array['Wood','Amber']),

  ('Soleil — Car Diffuser',
   'soleil-car-diffuser',
   'Spice & Amber','Car Diffuser',650000,8,100,
   array['/images/products/soleil-car.jpg'],
   'Golden-hour warmth on the move — citrus, spices, wood and amber in a compact 8ml car diffuser.',
   array['Citrus','Green'],
   array['Spices','Floral'],
   array['Wood','Amber']),

  -- Orika Rouge — Woody & Deep ------------------------------------------------
  ('Orika Rouge — Grand Edition',
   'orika-rouge-grand-edition',
   'Woody & Deep','Grand Edition',12500000,1000,50,
   array['/images/products/orika-rouge-grand.jpg'],
   'Spices and citrus awaken a rich heart of teak and cedar, deepened by amber and oud. Our signature — bold, grounded, distinctly Orika.',
   array['Spices','Citrus'],
   array['Teak wood','Cedar'],
   array['Amber','Oud']),

  ('Orika Rouge — Signature Edition',
   'orika-rouge-signature-edition',
   'Woody & Deep','Signature Edition',9950000,500,50,
   array['/images/products/orika-rouge-signature.jpg'],
   'Spices and citrus awaken a rich heart of teak and cedar, deepened by amber and oud. Our signature — bold, grounded, distinctly Orika.',
   array['Spices','Citrus'],
   array['Teak wood','Cedar'],
   array['Amber','Oud']),

  ('Orika Rouge — Curated Gift Set',
   'orika-rouge-curated-gift-set',
   'Woody & Deep','Curated Gift Set',11000000,750,30,
   array['/images/products/orika-rouge-gift.jpg'],
   'A trio of 250ml Orika Rouge diffusers — spices, citrus, teak, cedar, amber and oud. Our boldest statement in gift form.',
   array['Spices','Citrus'],
   array['Teak wood','Cedar'],
   array['Amber','Oud']),

  ('Orika Rouge — Car Diffuser',
   'orika-rouge-car-diffuser',
   'Woody & Deep','Car Diffuser',650000,8,100,
   array['/images/products/orika-rouge-car.jpg'],
   'Our signature scent, compacted — spiced citrus, teak, cedar, amber and oud in an 8ml car diffuser.',
   array['Spices','Citrus'],
   array['Teak wood','Cedar'],
   array['Amber','Oud']),

  -- Oud Amour — Floral & Musk -------------------------------------------------
  ('Oud Amour — Grand Edition',
   'oud-amour-grand-edition',
   'Floral & Musk','Grand Edition',12500000,1000,50,
   array['/images/products/oud-amour-grand.jpg'],
   'Bergamot and green tea open into a tender floral pairing of jasmine and orchid, closing with sandalwood and musk. Romantic and softly addictive.',
   array['Bergamot','Green tea'],
   array['Jasmine','Orchid'],
   array['Sandalwood','Musk']),

  ('Oud Amour — Signature Edition',
   'oud-amour-signature-edition',
   'Floral & Musk','Signature Edition',9950000,500,50,
   array['/images/products/oud-amour-signature.jpg'],
   'Bergamot and green tea open into a tender floral pairing of jasmine and orchid, closing with sandalwood and musk. Romantic and softly addictive.',
   array['Bergamot','Green tea'],
   array['Jasmine','Orchid'],
   array['Sandalwood','Musk']),

  ('Oud Amour — Curated Gift Set',
   'oud-amour-curated-gift-set',
   'Floral & Musk','Curated Gift Set',11000000,750,30,
   array['/images/products/oud-amour-gift.jpg'],
   'Three 250ml Oud Amour diffusers — bergamot, green tea, jasmine, orchid, sandalwood and musk. A softly romantic gift.',
   array['Bergamot','Green tea'],
   array['Jasmine','Orchid'],
   array['Sandalwood','Musk']),

  ('Oud Amour — Car Diffuser',
   'oud-amour-car-diffuser',
   'Floral & Musk','Car Diffuser',650000,8,100,
   array['/images/products/oud-amour-car.jpg'],
   'A tender floral for the road — bergamot, jasmine, orchid, sandalwood and musk in a compact 8ml car diffuser.',
   array['Bergamot','Green tea'],
   array['Jasmine','Orchid'],
   array['Sandalwood','Musk'])
on conflict (slug) do update set
  name         = excluded.name,
  scent_family = excluded.scent_family,
  format       = excluded.format,
  price_kobo   = excluded.price_kobo,
  size_ml      = excluded.size_ml,
  images       = excluded.images,
  description  = excluded.description,
  top_notes    = excluded.top_notes,
  heart_notes  = excluded.heart_notes,
  base_notes   = excluded.base_notes;

-- =============================================================================
-- Done. Next: promote a user to admin manually once signed up via /admin/login:
--   insert into public.admins (id, email, role)
--   values ('<auth.users.id>', 'bola@orikaliving.com', 'owner');
-- =============================================================================
