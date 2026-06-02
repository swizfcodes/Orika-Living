import type { Product } from "@/lib/types";

// The API base, e.g. http://localhost:7000/api — strip the trailing
// "/api" to get the origin we prefix document-image paths with.
const API_ORIGIN = (process.env.NEXT_PUBLIC_API_URL ?? "").replace(
  /\/api\/?$/,
  "",
);

/**
 * Resolve an image reference into a loadable absolute URL, or null.
 * Accepts:
 *   - absolute https:// URLs (e.g. S3/Supabase) → used as-is
 *   - backend document paths like /api/documents/{id}/image → prefixed
 *     with the API origin so the browser can load them cross-origin
 * Anything else (legacy local paths) → null, so the branded placeholder
 * renders instead of 404ing.
 */
export function resolveImageUrl(ref: string | null | undefined): string | null {
  if (!ref) return null;
  if (ref.startsWith("https://")) return ref;
  if (ref.startsWith("/api/")) return `${API_ORIGIN}${ref}`;
  return null;
}

/**
 * Returns the first uploaded image URL for a product, or null if none.
 * Images come from the ERP product gallery as /api/documents/{id}/image
 * paths (resolved here), or legacy absolute URLs.
 */
export function getProductImage(
  product: Pick<Product, "images">,
): string | null {
  return resolveImageUrl(product.images?.[0]);
}

/**
 * Next.js's image optimizer refuses to fetch upstream images that resolve
 * to private/localhost IPs (SSRF protection), and would also need every
 * backend host whitelisted in remotePatterns. For images served by our own
 * API we skip the optimizer and let the browser load them directly. Returns
 * true when an <Image> for this URL should be rendered `unoptimized`.
 */
export function isApiImage(url: string | null | undefined): boolean {
  if (!url) return false;
  return url.startsWith(API_ORIGIN) && API_ORIGIN.length > 0;
}
