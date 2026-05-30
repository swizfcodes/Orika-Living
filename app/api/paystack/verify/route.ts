import { NextResponse } from "next/server";
import { apiFetch } from "@/lib/api/client";

// ─────────────────────────────────────────────────────────────
// app/api/paystack/verify/route.ts
//
// Client-initiated payment verification. Called from the checkout
// page right after the Paystack popup reports success, so the
// success screen can show a confirmed state without waiting for the
// webhook.
//
// Migrated: verification + fulfilment (mark paid, decrement ERP
// stock, post revenue + COGS journals) all happen on the backend —
// GET /api/store/paystack/verify. This route is now a thin proxy.
// Rate limiting moved to the backend too.
//
// The backend endpoint is idempotent with the Paystack webhook, so
// it is safe for both to fire for the same reference.
// ─────────────────────────────────────────────────────────────

interface VerifyResponse {
  ok: boolean;
  order_id?: string;
  status?: string;
  already?: boolean;
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const reference = url.searchParams.get("reference");
  if (!reference) {
    return NextResponse.json(
      { ok: false, error: "Missing reference." },
      { status: 400 },
    );
  }

  try {
    const result = await apiFetch<VerifyResponse>(
      `/store/paystack/verify?reference=${encodeURIComponent(reference)}`,
      { method: "GET", cache: "no-store" },
    );

    if (!result.ok) {
      return NextResponse.json(
        { ok: false, error: "Transaction not successful." },
        { status: 400 },
      );
    }
    return NextResponse.json({ ok: true, order_id: result.order_id });
  } catch (err) {
    const message = err instanceof Error ? err.message : "";
    if (message.includes("429")) {
      return NextResponse.json(
        { ok: false, error: "Too many requests. Please try again shortly." },
        { status: 429 },
      );
    }
    console.error("[paystack/verify] backend call failed:", err);
    return NextResponse.json(
      { ok: false, error: "Could not verify payment." },
      { status: 400 },
    );
  }
}
