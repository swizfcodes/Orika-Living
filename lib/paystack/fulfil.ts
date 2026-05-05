import { revalidateTag } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendOrderConfirmation } from "@/lib/email/templates/orders";
import type { CartItem, DeliveryAddress } from "@/lib/types";

export type FulfilResult =
  | { ok: true; alreadyPaid: boolean; orderId: string }
  | { ok: false; reason: string };

// Idempotent transition: pending → paid. Safe to call from both the webhook
// and the client-initiated verify route; whichever arrives first flips the
// row, the other no-ops and returns alreadyPaid=true.
export async function markOrderPaid(options: {
  reference: string;
  amountKobo: number;
}): Promise<FulfilResult> {
  const supabase = createAdminClient();
  const { reference, amountKobo } = options;

  const { data: order, error: lookupError } = await supabase
    .from("orders")
    .select("id, status, total_kobo, items, delivery_address")
    .eq("paystack_ref", reference)
    .single();

  if (lookupError || !order) {
    return { ok: false, reason: "Order not found for reference." };
  }

  if (order.total_kobo !== amountKobo) {
    return { ok: false, reason: "Amount mismatch." };
  }

  if (order.status !== "pending") {
    return { ok: true, alreadyPaid: true, orderId: order.id };
  }

  const { error: updateError } = await supabase
    .from("orders")
    .update({ status: "paid" })
    .eq("id", order.id)
    .eq("status", "pending");

  if (updateError) {
    return { ok: false, reason: "Could not update order status." };
  }

  // Stock decrement — runs exactly once per order thanks to the guard above.
  const items = (order.items ?? []) as CartItem[];
  for (const item of items) {
    await supabase.rpc("decrement_stock", {
      p_product_id: item.product_id,
      p_qty: item.quantity,
    });
  }

  // Items just dropped in stock_qty (and possibly flipped in_stock=false via
  // a DB trigger). Public product listings cache `in_stock = true` rows, so
  // invalidate the products tag for stale-while-revalidate refresh.
  revalidateTag("products", "max");

  // Confirmation email — runs exactly once per order (same guard).
  const addr = order.delivery_address as DeliveryAddress | null;
  if (addr?.email) {
    await sendOrderConfirmation({
      name: addr.full_name,
      email: addr.email,
      reference,
      totalKobo: order.total_kobo,
      items,
      deliveryCity: addr.city,
      deliveryState: addr.state,
    }).catch(() => {});
  }

  return { ok: true, alreadyPaid: false, orderId: order.id };
}
