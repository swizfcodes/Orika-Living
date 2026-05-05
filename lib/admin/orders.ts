"use server";

import { revalidatePath } from "next/cache";
import { sendOrderStatusEmail } from "@/lib/email/templates/orders";
import type { OrderStatus, DeliveryAddress } from "@/lib/types";
import { assertAdmin } from "./auth";

export async function updateOrderStatusAction(input: {
  id: string;
  status: OrderStatus;
}) {
  const supabase = await assertAdmin();
  const { data: before } = await supabase
    .from("orders")
    .select("status, paystack_ref, delivery_address")
    .eq("id", input.id)
    .maybeSingle();

  const { error } = await supabase
    .from("orders")
    .update({ status: input.status })
    .eq("id", input.id);
  if (error) return { ok: false as const, error: error.message };

  // Transition notification — fire-and-forget, and only when the status
  // actually changed. Skip "paid" here since markOrderPaid() already emails
  // the customer on Paystack verification.
  const changed = before && before.status !== input.status;
  const addr = before?.delivery_address as DeliveryAddress | null;
  if (changed && input.status !== "paid" && addr?.email && before?.paystack_ref) {
    await sendOrderStatusEmail({
      name: addr.full_name,
      email: addr.email,
      reference: before.paystack_ref,
      status: input.status,
    }).catch(() => {});
  }

  revalidatePath("/admin");
  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${input.id}`);
  return { ok: true as const };
}
