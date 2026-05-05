"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { productSchema } from "@/lib/validations";
import { assertAdmin } from "./auth";

type ProductActionResult =
  | { ok: true; id: string }
  | { ok: false; error: string };

function parseProductForm(formData: FormData) {
  const splitList = (v: FormDataEntryValue | null) =>
    typeof v === "string"
      ? v
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
      : [];

  const priceNaira = Number(formData.get("price_naira") ?? 0);
  const raw = {
    name: String(formData.get("name") ?? "").trim(),
    slug: String(formData.get("slug") ?? "").trim(),
    scent_family: String(formData.get("scent_family") ?? "").trim(),
    format: String(formData.get("format") ?? "").trim(),
    price_kobo: Math.round(priceNaira * 100),
    size_ml: Number(formData.get("size_ml") ?? 0),
    stock_qty: Number(formData.get("stock_qty") ?? 0),
    description: String(formData.get("description") ?? "").trim(),
    top_notes: splitList(formData.get("top_notes")),
    heart_notes: splitList(formData.get("heart_notes")),
    base_notes: splitList(formData.get("base_notes")),
  };
  return productSchema.safeParse(raw);
}

export async function upsertProductAction(
  formData: FormData,
): Promise<ProductActionResult> {
  await assertAdmin();
  const id = String(formData.get("id") ?? "").trim() || null;
  const parsed = parseProductForm(formData);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const imagesRaw = String(formData.get("images") ?? "");
  const images = imagesRaw
    .split("\n")
    .map((s) => s.trim())
    .filter((s) => s.startsWith("https://"));

  const admin = createAdminClient();

  if (id) {
    const { error } = await admin
      .from("products")
      .update({ ...parsed.data, images })
      .eq("id", id);
    if (error) return { ok: false, error: error.message };
    revalidateTag("products", "max");
    revalidatePath("/admin/products");
    revalidatePath(`/admin/products/${id}`);
    return { ok: true, id };
  }

  const { data, error } = await admin
    .from("products")
    .insert({ ...parsed.data, images })
    .select("id")
    .single();
  if (error || !data) {
    return { ok: false, error: error?.message ?? "Insert failed" };
  }
  revalidateTag("products", "max");
  revalidatePath("/admin/products");
  return { ok: true, id: data.id };
}

export async function deleteProductAction(
  id: string,
): Promise<{ ok: boolean; error?: string }> {
  await assertAdmin();
  const admin = createAdminClient();
  const { error } = await admin.from("products").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidateTag("products", "max");
  revalidatePath("/admin/products");
  return { ok: true };
}
