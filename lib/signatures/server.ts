import "server-only";
import { apiGet } from "@/lib/api/client";
import { resolveImageUrl } from "@/lib/utils/images";
import { signatures as defaults, type SignatureMeta } from "./index";

// ─────────────────────────────────────────────────────────────
// lib/signatures/server.ts
//
// Public signature reads. Migrated from Supabase to the hub-system
// API (/api/store/signatures). Static `defaults` fallback retained
// so the home page stays up if the API is unreachable.
//
// CACHING: plain apiGet (60s ISR + "signatures" tag), deliberately
// NOT wrapped in unstable_cache — same reasoning as products/scents:
// an outer cache layer freezes the result on the first (possibly
// empty/unreachable) resolution and never refreshes, so signatures
// edited or seeded in the ERP would never appear in production.
// ─────────────────────────────────────────────────────────────

interface SignatureRow {
  slug: string;
  name: string;
  size_label: string;
  price_label: string;
  blurb: string;
  image: string | null;
  display_order: number;
}

interface ListResponse {
  data: SignatureRow[];
}

function toMeta(row: SignatureRow): SignatureMeta {
  return {
    slug: row.slug,
    name: row.name,
    size: row.size_label,
    price: row.price_label,
    blurb: row.blurb,
    image: resolveImageUrl(row.image) ?? undefined,
  };
}

export async function getSignatures(): Promise<SignatureMeta[]> {
  try {
    const res = await apiGet<ListResponse>("/store/signatures", {
      tags: ["signatures"],
    });
    const rows = res.data ?? [];
    if (rows.length === 0) return defaults;
    return rows.map(toMeta);
  } catch (err) {
    console.error("[getSignatures] API call failed, using defaults:", err);
    return defaults;
  }
}

export async function getSignatureBySlug(
  slug: string,
): Promise<SignatureMeta | undefined> {
  // The hub exposes signatures only as a list; resolve by slug from that
  // list. (A dedicated by-slug route can be added later if a signature
  // detail page needs it.)
  try {
    const all = await getSignatures();
    return all.find((s) => s.slug === slug);
  } catch (err) {
    console.error("[getSignatureBySlug] failed:", err);
    return defaults.find((s) => s.slug === slug);
  }
}
