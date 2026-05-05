-- =============================================================================
-- Orika Living — Product image storage
-- Public bucket `product-images`; admins upload/update/delete, anyone reads.
-- Also clears placeholder image paths from the seed so the storefront does not
-- 404 before real photography has been uploaded.
-- =============================================================================

-- Bucket ----------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

-- Storage policies ------------------------------------------------------------
-- storage.objects already has RLS on by default in Supabase.

drop policy if exists "product_images_public_read"   on storage.objects;
drop policy if exists "product_images_admin_insert"  on storage.objects;
drop policy if exists "product_images_admin_update"  on storage.objects;
drop policy if exists "product_images_admin_delete"  on storage.objects;

create policy "product_images_public_read"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'product-images');

create policy "product_images_admin_insert"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'product-images' and public.is_admin());

create policy "product_images_admin_update"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'product-images' and public.is_admin())
  with check (bucket_id = 'product-images' and public.is_admin());

create policy "product_images_admin_delete"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'product-images' and public.is_admin());

-- Clear placeholder image paths from the seed ---------------------------------
-- Admins will upload real photography via the Phase 7 admin UI; stored URLs
-- returned by supabase.storage.from('product-images').getPublicUrl(path)
-- are written back into products.images.
update public.products set images = '{}'
where images <@ array[
  '/images/products/ocean-mist-grand.jpg',
  '/images/products/ocean-mist-signature.jpg',
  '/images/products/ocean-mist-gift.jpg',
  '/images/products/ocean-mist-car.jpg',
  '/images/products/lemon-verbana-grand.jpg',
  '/images/products/lemon-verbana-signature.jpg',
  '/images/products/lemon-verbana-gift.jpg',
  '/images/products/lemon-verbana-car.jpg',
  '/images/products/midnight-oud-grand.jpg',
  '/images/products/midnight-oud-signature.jpg',
  '/images/products/midnight-oud-gift.jpg',
  '/images/products/midnight-oud-car.jpg',
  '/images/products/soleil-grand.jpg',
  '/images/products/soleil-signature.jpg',
  '/images/products/soleil-gift.jpg',
  '/images/products/soleil-car.jpg',
  '/images/products/orika-rouge-grand.jpg',
  '/images/products/orika-rouge-signature.jpg',
  '/images/products/orika-rouge-gift.jpg',
  '/images/products/orika-rouge-car.jpg',
  '/images/products/oud-amour-grand.jpg',
  '/images/products/oud-amour-signature.jpg',
  '/images/products/oud-amour-gift.jpg',
  '/images/products/oud-amour-car.jpg'
];
