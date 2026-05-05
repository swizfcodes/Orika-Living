import "server-only";
import { unstable_cache } from "next/cache";
import { createPublicClient } from "@/lib/supabase/public";
import { scents as defaults, type ScentMeta } from "./index";

interface ScentRow {
  family: string;
  name: string;
  slug: string;
  tagline: string;
  description: string;
  top_notes: string[];
  heart_notes: string[];
  base_notes: string[];
  swatch: string;
  ink: string;
  image: string | null;
  display_order: number;
}

function toMeta(row: ScentRow): ScentMeta {
  return {
    family: row.family,
    name: row.name,
    slug: row.slug,
    tagline: row.tagline,
    description: row.description,
    top: row.top_notes,
    heart: row.heart_notes,
    base: row.base_notes,
    swatch: row.swatch,
    ink: row.ink,
    image: row.image ?? undefined,
  };
}

// Returns every scent in the DB (in display order). Falls back to the
// static defaults if the table is empty or the query fails — keeps the
// storefront alive pre-migration.
//
// Cached cross-request via unstable_cache; admin scent CRUD invalidates
// via revalidateTag("scents", "max") for stale-while-revalidate refresh.
export const getScents = unstable_cache(
  async (): Promise<ScentMeta[]> => {
    const supabase = createPublicClient();
    const { data } = await supabase
      .from("scents")
      .select("*")
      .order("display_order", { ascending: true });
    const rows = (data ?? []) as ScentRow[];
    if (rows.length === 0) return defaults;
    return rows.map(toMeta);
  },
  ["scents:list"],
  { tags: ["scents"] },
);

export const getScentBySlug = unstable_cache(
  async (slug: string): Promise<ScentMeta | undefined> => {
    const supabase = createPublicClient();
    const { data } = await supabase
      .from("scents")
      .select("*")
      .eq("slug", slug)
      .maybeSingle();
    if (!data) return undefined;
    return toMeta(data as ScentRow);
  },
  ["scents:bySlug"],
  { tags: ["scents"] },
);
