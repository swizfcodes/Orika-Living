"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { assertAdmin } from "./auth";

// Signatures: editorial content for the home "Range" section.
export async function upsertSignatureAction(
  formData: FormData,
): Promise<{ ok: true; slug: string } | { ok: false; error: string }> {
  await assertAdmin();

  const originalSlug = String(formData.get("original_slug") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim();
  const slug = String(formData.get("slug") ?? "").trim();
  const sizeLabel = String(formData.get("size_label") ?? "").trim();
  const priceLabel = String(formData.get("price_label") ?? "").trim();
  const blurb = String(formData.get("blurb") ?? "").trim();
  const displayOrder = Number(formData.get("display_order") ?? 0);
  const imageRaw = String(formData.get("image") ?? "").trim();

  if (!name || !slug || !sizeLabel || !priceLabel || !blurb) {
    return { ok: false, error: "All text fields are required." };
  }
  if (!/^[a-z0-9-]+$/.test(slug)) {
    return { ok: false, error: "Slug must be lowercase with hyphens only." };
  }

  const image = imageRaw.startsWith("https://") ? imageRaw : null;
  const admin = createAdminClient();

  const row = {
    slug,
    name,
    size_label: sizeLabel,
    price_label: priceLabel,
    blurb,
    image,
    display_order: Number.isFinite(displayOrder) ? displayOrder : 0,
    updated_at: new Date().toISOString(),
  };

  if (originalSlug) {
    const { error } = await admin
      .from("signatures")
      .update(row)
      .eq("slug", originalSlug);
    if (error) return { ok: false, error: error.message };
  } else {
    const { error } = await admin.from("signatures").insert(row);
    if (error) return { ok: false, error: error.message };
  }

  revalidateTag("signatures", "max");
  revalidatePath("/admin/scents");
  revalidatePath(`/admin/scents/signatures/${encodeURIComponent(slug)}`);
  return { ok: true, slug };
}

export async function deleteSignatureAction(
  slug: string,
): Promise<{ ok: boolean; error?: string }> {
  await assertAdmin();
  const admin = createAdminClient();
  const { error } = await admin.from("signatures").delete().eq("slug", slug);
  if (error) return { ok: false, error: error.message };
  revalidateTag("signatures", "max");
  revalidatePath("/admin/scents");
  return { ok: true };
}
