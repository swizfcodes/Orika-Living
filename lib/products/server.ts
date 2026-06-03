import "server-only";
import { apiGet } from "@/lib/api/client";
import type { Product, ProductFormat } from "@/lib/types";

// ─────────────────────────────────────────────────────────────
// lib/products/server.ts
//
// Public storefront product reads. Migrated from Supabase to the
// hub-system API (/api/store/products). The hub returns products in
// the storefront's exact shape — price_kobo and stock_qty are
// computed live from the ERP, so what the storefront shows always
// agrees with the ERP.
//
// CACHING: these are plain fetches via apiGet, which already applies
// ISR caching (60s revalidate + the "products" tag). They are
// deliberately NOT wrapped in unstable_cache. An outer unstable_cache
// layer freezes the function's return value on whatever it first
// resolved to — and if that first resolution was the empty/unreachable
// state (e.g. during a production build before the API/DB was ready),
// it never refreshes, because there's no revalidate on it and nothing
// calls revalidateTag("products"). That's exactly why getFeaturedProducts
// rendered locally (dev re-runs every request) but showed nothing in
// production. getScents/getCatalogue were already de-cached for the same
// reason; featured/related were simply missed in that cleanup.
// ─────────────────────────────────────────────────────────────

// The hub wraps list responses as { data: [...] }.
interface ListResponse {
  data: Product[];
}

// Result of a catalogue read that preserves *why* it's empty so the
// UI can tell "nothing in stock" apart from "the API is unreachable".
// getActiveProducts (below) still returns a plain Product[] for callers
// like the sitemap that don't care about the distinction.
export type CatalogueResult =
  | { status: "ok"; products: Product[] } // succeeded — products may be []
  | { status: "error"; products: Product[] }; // fetch/parse failed — products is []

export async function getCatalogue(): Promise<CatalogueResult> {
  try {
    const res = await apiGet<ListResponse>("/store/products", {
      tags: ["products"],
    });
    return { status: "ok", products: res.data ?? [] };
  } catch (err) {
    console.error("[getCatalogue] API call failed:", err);
    return { status: "error", products: [] };
  }
}

export async function getActiveProducts(): Promise<Product[]> {
  try {
    const res = await apiGet<ListResponse>("/store/products", {
      tags: ["products"],
    });
    return res.data ?? [];
  } catch (err) {
    console.error("[getActiveProducts] API call failed:", err);
    return [];
  }
}

export async function getFeaturedProducts(
  format: ProductFormat,
  limit: number,
): Promise<Product[]> {
  try {
    const res = await apiGet<ListResponse>(
      `/store/products/featured?format=${encodeURIComponent(format)}&limit=${limit}`,
      { tags: ["products"] },
    );
    return res.data ?? [];
  } catch (err) {
    console.error("[getFeaturedProducts] API call failed:", err);
    return [];
  }
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  try {
    // The hub returns the product object directly (not wrapped).
    return await apiGet<Product>(`/store/products/${encodeURIComponent(slug)}`, {
      tags: ["products"],
    });
  } catch (err) {
    // 404 → product genuinely not found; anything else is logged.
    if ((err as { status?: number }).status !== 404) {
      console.error("[getProductBySlug] API call failed:", err);
    }
    return null;
  }
}

export async function getRelatedProducts(
  family: string,
  excludeId: string,
  limit: number,
): Promise<Product[]> {
  try {
    const res = await apiGet<ListResponse>(
      `/store/products/related?family=${encodeURIComponent(family)}` +
        `&exclude=${excludeId}&limit=${limit}`,
      { tags: ["products"] },
    );
    return res.data ?? [];
  } catch (err) {
    console.error("[getRelatedProducts] API call failed:", err);
    return [];
  }
}
