"use server";

import { apiPost } from "@/lib/api/client";
import { checkoutSchema, type PaymentMethod } from "@/lib/validations";

// ─────────────────────────────────────────────────────────────
// lib/checkout/actions.ts
//
// Order creation. Migrated from Supabase to the hub-system API.
//
// The price re-derivation, stock check and order-cap that used to
// live here now run on the BACKEND (POST /api/store/orders) — the
// hub re-prices every line from the ERP and never trusts a
// client-supplied total. This action just validates the shape and
// forwards the cart.
//
// Two payment methods are supported, selected client-side and
// forwarded as `payment_method`:
//   - "paystack"    → returns a Paystack `reference` for the popup
//   - "optimus_pay" → the hub provisions an Optimus virtual account
//     and returns its number/bank + the `optimus_transaction_ref`
//     the customer's bank transfer is matched against.
// ─────────────────────────────────────────────────────────────

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
  payment_method?: PaymentMethod;
}

export type CreateOrderResult =
  | {
      ok: true;
      payment_method: "paystack";
      order_id: string;
      reference: string;
      amount_kobo: number;
      email: string;
    }
  | {
      ok: true;
      payment_method: "optimus_pay";
      order_id: string;
      transaction_ref: string;
      virtual_account: string;
      bank_name: string;
      amount_kobo: number;
      email: string;
    }
  | { ok: false; error: string };

// The hub's POST /store/orders success responses (one per method).
interface PaystackOrderApiResponse {
  ok: true;
  order_id: string;
  payment_method: "paystack";
  reference: string;
  amount_kobo: number;
  email: string;
}

interface OptimusOrderApiResponse {
  ok: true;
  order_id: string;
  payment_method: "optimus_pay";
  optimus_transaction_ref: string;
  optimus_virtual_account: string;
  optimus_bank_name: string;
  amount_kobo: number;
  email: string;
}

type OrderApiResponse = PaystackOrderApiResponse | OptimusOrderApiResponse;

export async function createOrderAction(
  input: CreateOrderInput,
): Promise<CreateOrderResult> {
  // Shape validation only — the authoritative price/stock checks are
  // the backend's job.
  const parsed = checkoutSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "Please check your details and try again." };
  }

  const paymentMethod: PaymentMethod =
    parsed.data.payment_method ?? "paystack";

  try {
    const res = await apiPost<OrderApiResponse>("/store/orders", {
      delivery_address: parsed.data.delivery_address,
      items: parsed.data.items,
      payment_method: paymentMethod,
    });

    if (res.payment_method === "optimus_pay") {
      return {
        ok: true,
        payment_method: "optimus_pay",
        order_id: res.order_id,
        transaction_ref: res.optimus_transaction_ref,
        virtual_account: res.optimus_virtual_account,
        bank_name: res.optimus_bank_name,
        amount_kobo: res.amount_kobo,
        email: res.email,
      };
    }

    return {
      ok: true,
      payment_method: "paystack",
      order_id: res.order_id,
      reference: res.reference,
      amount_kobo: res.amount_kobo,
      email: res.email,
    };
  } catch (err) {
    // The hub returns a clear message (out of stock, item unavailable,
    // total too high) — surface it to the customer.
    const message =
      err instanceof Error ? err.message : "Could not create your order.";
    console.error("[createOrderAction] API call failed:", err);
    // Strip the "API 4xx on /path:" prefix the client adds, keep the
    // human part after the colon if present.
    const clean = message.includes(": ")
      ? message.slice(message.lastIndexOf(": ") + 2)
      : "Could not create your order. Please try again.";
    return { ok: false, error: clean };
  }
}
