-- =============================================================================
-- Orika Living — Scents table (editable scent families with hero imagery)
-- The six scent families remain fixed (they're an enum). This table overlays
-- editable copy + photography onto that enum. Public read, admin write.
-- =============================================================================

create table if not exists public.scents (
  family         scent_family primary key,
  name           text not null,
  slug           text not null unique,
  tagline        text not null,
  description    text not null,
  top_notes      text[] not null default '{}',
  heart_notes    text[] not null default '{}',
  base_notes     text[] not null default '{}',
  swatch         text not null,
  ink            text not null,
  image          text,
  display_order  integer not null default 0,
  updated_at     timestamptz not null default now()
);

create index if not exists scents_slug_idx on public.scents (slug);
create index if not exists scents_display_order_idx on public.scents (display_order);

-- RLS: public read, admin write (inserts/seed happen via service role in migration) --
alter table public.scents enable row level security;

drop policy if exists "scents_public_read"   on public.scents;
drop policy if exists "scents_admin_update"  on public.scents;
drop policy if exists "scents_admin_insert"  on public.scents;
drop policy if exists "scents_admin_delete"  on public.scents;

create policy "scents_public_read"
  on public.scents for select
  to anon, authenticated
  using (true);

create policy "scents_admin_insert"
  on public.scents for insert
  to authenticated
  with check (public.is_admin());

create policy "scents_admin_update"
  on public.scents for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "scents_admin_delete"
  on public.scents for delete
  to authenticated
  using (public.is_admin());

-- Seed — mirrors lib/scents/index.ts defaults ---------------------------------
insert into public.scents
  (family, name, slug, tagline, description, top_notes, heart_notes, base_notes, swatch, ink, display_order)
values
  ('Fresh & Marine', 'Ocean Mist', 'ocean-mist',
   'The quiet of the coast',
   'A crisp coastal opening of sea salt and grapefruit settling into a soft veil of driftwood and musk.',
   array['Sea salt','Grapefruit'], array['Sage','Rosemary'], array['Driftwood','Musk'],
   '#B8C9D6', '#2B3A45', 1),

  ('Citrus & Green', 'Lemon Verbana', 'lemon-verbana',
   'Garden-fresh luminosity',
   'Bright lemon, lime and lemongrass leading to verbana and jasmine over warm cedarwood and musk.',
   array['Lemon','Lime','Lemongrass'], array['Verbana','Green Tea','Jasmine'], array['Musk','Cedarwood'],
   '#D8DEB0', '#3A4022', 2),

  ('Oud & Floral', 'Midnight Oud', 'midnight-oud',
   'An opulent hush for evening rooms',
   'Bergamot and lemon lifting a deep allure of oud and rose, anchored by patchouli and sandalwood.',
   array['Bergamot','Lemon'], array['Oud','Rose'], array['Patchouli','Sandalwood'],
   '#2B2820', '#F2EDE4', 3),

  ('Spice & Amber', 'Soleil', 'soleil',
   'Golden-hour warmth',
   'A sunlit composition of citrus and green notes, a spiced floral heart, and a base of wood and amber.',
   array['Citrus','Green'], array['Spices','Floral'], array['Wood','Amber'],
   '#D9A76A', '#3B2A15', 4),

  ('Woody & Deep', 'Orika Rouge', 'orika-rouge',
   'Bold, grounded, distinctly Orika',
   'Spices and citrus awaken a rich heart of teak and cedar, deepened by amber and oud.',
   array['Spices','Citrus'], array['Teak wood','Cedar'], array['Amber','Oud'],
   '#9B4A2E', '#F2EDE4', 5),

  ('Floral & Musk', 'Oud Amour', 'oud-amour',
   'Romantic and softly addictive',
   'Bergamot and green tea opening into jasmine and orchid, closing with sandalwood and musk.',
   array['Bergamot','Green tea'], array['Jasmine','Orchid'], array['Sandalwood','Musk'],
   '#C5A0A7', '#3B1F26', 6)
on conflict (family) do update set
  name          = excluded.name,
  slug          = excluded.slug,
  tagline       = excluded.tagline,
  description   = excluded.description,
  top_notes     = excluded.top_notes,
  heart_notes   = excluded.heart_notes,
  base_notes    = excluded.base_notes,
  swatch        = excluded.swatch,
  ink           = excluded.ink,
  display_order = excluded.display_order;
