import "server-only";
import { unstable_cache } from "next/cache";
import { apiGet } from "@/lib/api/client";
import { scents as defaults, type ScentMeta } from "./index";

// ─────────────────────────────────────────────────────────────
// lib/scents/server.ts
//
// Public scent reads. Migrated from Supabase to the hub-system API
// (/api/store/scents). The static `defaults` fallback is kept — if
// the API is unreachable or the table is empty the storefront still
// renders, exactly as before.
// ─────────────────────────────────────────────────────────────

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

interface ListResponse {
  data: ScentRow[];
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

export const getScents = unstable_cache(
  async (): Promise<ScentMeta[]> => {
    try {
      const res = await apiGet<ListResponse>("/store/scents", {
        tags: ["scents"],
      });
      const rows = res.data ?? [];
      if (rows.length === 0) return defaults;
      return rows.map(toMeta);
    } catch (err) {
      console.error("[getScents] API call failed, using defaults:", err);
      return defaults;
    }
  },
  ["scents:list"],
  { tags: ["scents"] },
);

export const getScentBySlug = unstable_cache(
  async (slug: string): Promise<ScentMeta | undefined> => {
    try {
      const row = await apiGet<ScentRow>(
        `/store/scents/${encodeURIComponent(slug)}`,
        { tags: ["scents"] },
      );
      return toMeta(row);
    } catch (err) {
      if ((err as { status?: number }).status === 404) return undefined;
      console.error("[getScentBySlug] API call failed:", err);
      // Fall back to a static default if one matches the slug.
      return defaults.find((s) => s.slug === slug);
    }
  },
  ["scents:bySlug"],
  { tags: ["scents"] },
);
