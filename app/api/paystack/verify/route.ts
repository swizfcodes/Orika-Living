import { NextResponse } from "next/server";
import { verifyPaystackTransaction } from "@/lib/paystack/verify";
import { markOrderPaid } from "@/lib/paystack/fulfil";
import { checkRateLimit, getClientIp } from "@/lib/ratelimit";

// Client-initiated verification. Called from the checkout page right after
// the Paystack popup reports success, so the success screen can show
// confirmed state immediately without waiting for the webhook.
export async function GET(req: Request) {
  const ip = getClientIp(req.headers);
  const rl = await checkRateLimit("paystack-verify", ip, 10, 60);
  if (!rl.allowed) {
    return NextResponse.json(
      { ok: false, error: "Too many requests. Please try again shortly." },
      { status: 429 },
    );
  }

  const url = new URL(req.url);
  const reference = url.searchParams.get("reference");
  if (!reference) {
    return NextResponse.json({ ok: false, error: "Missing reference." }, { status: 400 });
  }

  const tx = await verifyPaystackTransaction(reference);
  if (!tx || tx.status !== "success") {
    return NextResponse.json(
      { ok: false, error: "Transaction not successful." },
      { status: 400 },
    );
  }

  const result = await markOrderPaid({
    reference: tx.reference,
    amountKobo: tx.amount,
  });

  if (!result.ok) {
    return NextResponse.json({ ok: false, error: result.reason }, { status: 400 });
  }

  return NextResponse.json({ ok: true, order_id: result.orderId });
}
