import "server-only";
import { unstable_cache } from "next/cache";
import { createPublicClient } from "@/lib/supabase/public";
import type { Product, ProductFormat } from "@/lib/types";

// Public storefront product reads. All wrapped in unstable_cache with the
// "products" tag so admin CRUD and the post-payment stock decrement can
// trigger revalidation via revalidateTag("products", "max").

export const getActiveProducts = unstable_cache(
  async (): Promise<Product[]> => {
    const supabase = createPublicClient();
    const { data } = await supabase
      .from("products")
      .select("*")
      .eq("in_stock", true)
      .order("created_at", { ascending: false });
    return (data ?? []) as Product[];
  },
  ["products:active"],
  { tags: ["products"] },
);

// Used by the homepage to surface a few signature-edition pieces.
export const getFeaturedProducts = unstable_cache(
  async (format: ProductFormat, limit: number): Promise<Product[]> => {
    const supabase = createPublicClient();
    const { data } = await supabase
      .from("products")
      .select("*")
      .eq("in_stock", true)
      .eq("format", format)
      .order("created_at", { ascending: false })
      .limit(limit);
    return (data ?? []) as Product[];
  },
  ["products:featured"],
  { tags: ["products"] },
);

// Single product by slug. Called once for `generateMetadata` and once for
// the page body — unstable_cache dedupes both calls to a single round trip.
export const getProductBySlug = unstable_cache(
  async (slug: string): Promise<Product | null> => {
    const supabase = createPublicClient();
    const { data } = await supabase
      .from("products")
      .select("*")
      .eq("slug", slug)
      .maybeSingle();
    return (data as Product | null) ?? null;
  },
  ["products:bySlug"],
  { tags: ["products"] },
);

// "Also in {family}" recommendations on the product detail page.
export const getRelatedProducts = unstable_cache(
  async (
    family: string,
    excludeId: string,
    limit: number,
  ): Promise<Product[]> => {
    const supabase = createPublicClient();
    const { data } = await supabase
      .from("products")
      .select("*")
      .eq("scent_family", family)
      .neq("id", excludeId)
      .eq("in_stock", true)
      .limit(limit);
    return (data ?? []) as Product[];
  },
  ["products:related"],
  { tags: ["products"] },
);
