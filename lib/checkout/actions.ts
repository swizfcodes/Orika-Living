"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { checkoutSchema, MAX_ORDER_KOBO } from "@/lib/validations";
import type { CartItem, Product } from "@/lib/types";

export interface CreateOrderInput {
  delivery_address: {
    full_name: string;
    phone: string;
    email: string;
    street: string;
    city: string;
    state: string;
  };
  items: { product_id: string; quantity: number }[];
}

export type CreateOrderResult =
  | {
      ok: true;
      order_id: string;
      reference: string;
      amount_kobo: number;
      email: string;
    }
  | { ok: false; error: string };

// Creates a pending order server-side. The cart total is ALWAYS re-derived
// from the DB — clients cannot influence pricing. The returned `reference`
// doubles as the Paystack transaction reference and the order id.
export async function createOrderAction(
  input: CreateOrderInput,
): Promise<CreateOrderResult> {
  const parsed = checkoutSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "Please check your details and try again." };
  }

  const { delivery_address, items } = parsed.data;
  const supabase = createAdminClient();

  const ids = items.map((i) => i.product_id);
  const { data: products, error: fetchError } = await supabase
    .from("products")
    .select("*")
    .in("id", ids);

  if (fetchError || !products || products.length !== ids.length) {
    console.error("[createOrderAction] product fetch failed:", fetchError, {
      requested: ids.length,
      received: products?.length ?? 0,
    });
    return { ok: false, error: "One or more items are unavailable." };
  }

  const productMap = new Map<string, Product>(
    (products as Product[]).map((p) => [p.id, p]),
  );

  const lineItems: CartItem[] = [];
  let totalKobo = 0;

  for (const { product_id, quantity } of items) {
    const p = productMap.get(product_id);
    if (!p) return { ok: false, error: "Product no longer available." };
    if (!p.in_stock || p.stock_qty < quantity) {
      return { ok: false, error: `${p.name} is out of stock.` };
    }

    totalKobo += p.price_kobo * quantity;
    lineItems.push({
      product_id: p.id,
      name: p.name,
      price_kobo: p.price_kobo,
      quantity,
      image: p.images?.[0] ?? "",
      size_ml: p.size_ml,
      format: p.format,
    });
  }

  if (totalKobo > MAX_ORDER_KOBO) {
    console.error("[createOrderAction] order exceeds max amount:", totalKobo);
    return { ok: false, error: "Order total exceeds the allowed limit." };
  }

  const { data: inserted, error: insertError } = await supabase
    .from("orders")
    .insert({
      status: "pending",
      total_kobo: totalKobo,
      delivery_address,
      items: lineItems,
    })
    .select("id")
    .single();

  if (insertError || !inserted) {
    console.error("[createOrderAction] insert failed:", insertError);
    return {
      ok: false,
      error: insertError?.message ?? "Could not create your order. Please retry.",
    };
  }

  // Use the order id itself as the Paystack reference so webhook/verify
  // can look up the order without an extra mapping column.
  const reference = `orika_${inserted.id}`;

  const { error: refError } = await supabase
    .from("orders")
    .update({ paystack_ref: reference })
    .eq("id", inserted.id);

  if (refError) {
    console.error("[createOrderAction] ref update failed:", refError);
    return { ok: false, error: refError.message };
  }

  return {
    ok: true,
    order_id: inserted.id,
    reference,
    amount_kobo: totalKobo,
    email: delivery_address.email,
  };
}
