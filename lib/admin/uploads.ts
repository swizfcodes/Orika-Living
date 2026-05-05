"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { assertAdmin } from "./auth";

// Generic admin image upload to the `product-images` bucket. Used by both
// product, scent, and signature forms.
export async function uploadProductImageAction(
  formData: FormData,
): Promise<{ ok: true; url: string } | { ok: false; error: string }> {
  await assertAdmin();
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, error: "No file provided." };
  }
  if (file.size > 5 * 1024 * 1024) {
    return { ok: false, error: "Image must be under 5MB." };
  }
  if (!file.type.startsWith("image/")) {
    return { ok: false, error: "File must be an image." };
  }

  const admin = createAdminClient();
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
  const path = `${crypto.randomUUID()}.${ext}`;
  const bytes = new Uint8Array(await file.arrayBuffer());

  const { error } = await admin.storage
    .from("product-images")
    .upload(path, bytes, {
      contentType: file.type,
      upsert: false,
    });
  if (error) return { ok: false, error: error.message };

  const { data } = admin.storage.from("product-images").getPublicUrl(path);
  return { ok: true, url: data.publicUrl };
}
