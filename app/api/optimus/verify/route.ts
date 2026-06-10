import { NextResponse } from "next/server";
import { apiFetch } from "@/lib/api/client";

// ─────────────────────────────────────────────────────────────
// app/api/optimus/verify/route.ts
//
// Client-initiated Optimus Pay verification. Optimus has no popup —
// the customer transfers to a virtual account, and the bank fires a
// server-to-server webhook to the hub. The checkout page polls this
// route (and offers an "I've sent it" button) so the success screen
// can flip to confirmed without waiting on the webhook round-trip.
//
// Mirrors app/api/paystack/verify: a thin proxy to the hub's
// GET /store/optimus/verify?transaction_ref=. Fulfilment (mark paid,
// decrement ERP stock, post revenue + COGS journals) happens entirely
// backend-side and is idempotent with the Optimus webhook, so it is
// safe for both to fire for the same transaction_ref.
// ─────────────────────────────────────────────────────────────

interface VerifyResponse {
  ok: boolean;
  order_id?: string;
  status?: string;
  already?: boolean;
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const transactionRef = url.searchParams.get("transaction_ref");
  if (!transactionRef) {
    return NextResponse.json(
      { ok: false, error: "Missing transaction_ref." },
      { status: 400 },
    );
  }

  try {
    const result = await apiFetch<VerifyResponse>(
      `/store/optimus/verify?transaction_ref=${encodeURIComponent(
        transactionRef,
      )}`,
      { method: "GET", cache: "no-store" },
    );

    // The backend returns { ok: true, status: "paid" } once the
    // transfer has landed, or throws 404 while it is still pending.
    if (!result.ok) {
      return NextResponse.json(
        { ok: false, status: result.status ?? "pending" },
        { status: 200 },
      );
    }
    return NextResponse.json({
      ok: true,
      order_id: result.order_id,
      status: result.status ?? "paid",
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "";
    if (message.includes("429")) {
      return NextResponse.json(
        { ok: false, error: "Too many requests. Please try again shortly." },
        { status: 429 },
      );
    }
    // A 404 means the transfer hasn't been matched yet — that's the
    // normal "still pending" state while polling, not a hard error.
    if (message.includes("404")) {
      return NextResponse.json({ ok: false, status: "pending" });
    }
    console.error("[optimus/verify] backend call failed:", err);
    return NextResponse.json(
      { ok: false, error: "Could not verify payment." },
      { status: 400 },
    );
  }
}
