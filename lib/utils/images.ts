import type { Product } from "@/lib/types";

/**
 * Returns the first uploaded image URL for a product, or null if none.
 * Admin uploads write public Supabase Storage URLs into `products.images`.
 * Components must render a branded fallback when this returns null.
 */
export function getProductImage(product: Pick<Product, "images">): string | null {
  const first = product.images?.[0];
  if (!first) return null;
  // Only trust Supabase Storage URLs. Any legacy local path (e.g. /images/...)
  // is treated as missing so the branded placeholder renders instead of 404ing.
  return first.startsWith("https://") ? first : null;
}
