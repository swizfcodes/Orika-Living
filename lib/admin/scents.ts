"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { assertAdmin } from "./auth";

function splitList(v: FormDataEntryValue | null): string[] {
  return typeof v === "string"
    ? v
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
    : [];
}

// Scents are slug-keyed since migration 0006; admin can add / edit / delete.
export async function upsertScentAction(
  formData: FormData,
): Promise<{ ok: true; slug: string } | { ok: false; error: string }> {
  await assertAdmin();

  const originalSlug = String(formData.get("original_slug") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim();
  const slug = String(formData.get("slug") ?? "").trim();
  const family = String(formData.get("family") ?? "").trim();
  const tagline = String(formData.get("tagline") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const swatch = String(formData.get("swatch") ?? "").trim();
  const ink = String(formData.get("ink") ?? "").trim();
  const imageRaw = String(formData.get("image") ?? "").trim();

  if (!name || !slug || !family || !tagline || !description || !swatch || !ink) {
    return { ok: false, error: "All text fields are required." };
  }
  if (!/^[a-z0-9-]+$/.test(slug)) {
    return { ok: false, error: "Slug must be lowercase with hyphens only." };
  }
  if (!/^#[0-9a-fA-F]{6}$/.test(swatch) || !/^#[0-9a-fA-F]{6}$/.test(ink)) {
    return { ok: false, error: "Swatch and ink must be hex colours (e.g. #B8C9D6)." };
  }

  const image = imageRaw.startsWith("https://") ? imageRaw : null;
  const admin = createAdminClient();

  const row = {
    slug,
    name,
    family,
    tagline,
    description,
    top_notes: splitList(formData.get("top_notes")),
    heart_notes: splitList(formData.get("heart_notes")),
    base_notes: splitList(formData.get("base_notes")),
    swatch,
    ink,
    image,
    updated_at: new Date().toISOString(),
  };

  if (originalSlug) {
    const { error } = await admin
      .from("scents")
      .update(row)
      .eq("slug", originalSlug);
    if (error) return { ok: false, error: error.message };
  } else {
    const { error } = await admin.from("scents").insert(row);
    if (error) return { ok: false, error: error.message };
  }

  revalidateTag("scents", "max");
  revalidatePath("/admin/scents");
  revalidatePath(`/admin/scents/${encodeURIComponent(slug)}`);
  return { ok: true, slug };
}

export async function deleteScentAction(
  slug: string,
): Promise<{ ok: boolean; error?: string }> {
  await assertAdmin();
  const admin = createAdminClient();
  const { error } = await admin.from("scents").delete().eq("slug", slug);
  if (error) return { ok: false, error: error.message };
  revalidateTag("scents", "max");
  revalidatePath("/admin/scents");
  return { ok: true };
}
