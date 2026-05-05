import "server-only";
import { unstable_cache } from "next/cache";
import { createPublicClient } from "@/lib/supabase/public";
import { signatures as defaults, type SignatureMeta } from "./index";

interface SignatureRow {
  slug: string;
  name: string;
  size_label: string;
  price_label: string;
  blurb: string;
  image: string | null;
  display_order: number;
}

function toMeta(row: SignatureRow): SignatureMeta {
  return {
    slug: row.slug,
    name: row.name,
    size: row.size_label,
    price: row.price_label,
    blurb: row.blurb,
    image: row.image ?? undefined,
  };
}

// Falls back to the static defaults if the query fails so the home page
// stays up even before migration 0006 is applied. Cached cross-request
// via unstable_cache; admin signature CRUD invalidates via
// revalidateTag("signatures", "max").
export const getSignatures = unstable_cache(
  async (): Promise<SignatureMeta[]> => {
    const supabase = createPublicClient();
    const { data } = await supabase
      .from("signatures")
      .select("*")
      .order("display_order", { ascending: true });

    const rows = (data ?? []) as SignatureRow[];
    if (rows.length === 0) return defaults;
    return rows.map(toMeta);
  },
  ["signatures:list"],
  { tags: ["signatures"] },
);

export const getSignatureBySlug = unstable_cache(
  async (slug: string): Promise<SignatureMeta | undefined> => {
    const supabase = createPublicClient();
    const { data } = await supabase
      .from("signatures")
      .select("*")
      .eq("slug", slug)
      .maybeSingle();
    if (!data) return undefined;
    return toMeta(data as SignatureRow);
  },
  ["signatures:bySlug"],
  { tags: ["signatures"] },
);
