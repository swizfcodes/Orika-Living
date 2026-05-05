import { NextResponse } from "next/server";
import crypto from "node:crypto";
import { markOrderPaid } from "@/lib/paystack/fulfil";

// Force the Node runtime — edge doesn't expose node:crypto's timingSafeEqual.
export const runtime = "nodejs";

interface PaystackEvent {
  event: string;
  data: {
    reference: string;
    amount: number;
    status: string;
  };
}

export async function POST(req: Request) {
  const secret = process.env.PAYSTACK_SECRET_KEY;
  if (!secret) {
    return NextResponse.json({ ok: false }, { status: 500 });
  }

  const signature = req.headers.get("x-paystack-signature");
  const raw = await req.text();

  // Paystack signs the raw body with HMAC-SHA512 using the secret key.
  const expected = crypto
    .createHmac("sha512", secret)
    .update(raw)
    .digest("hex");

  if (
    !signature ||
    signature.length !== expected.length ||
    !crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))
  ) {
    // Log invalid signatures so repeated forgery attempts are visible in
    // monitoring. Never 401 — reply 200 so Paystack doesn't retry a forged
    // request forever, but make sure we don't mutate anything.
    console.warn("[paystack/webhook] invalid signature", {
      ip: req.headers.get("x-forwarded-for") ?? req.headers.get("x-real-ip"),
      signature_present: Boolean(signature),
      signature_length: signature?.length ?? 0,
      expected_length: expected.length,
      ts: new Date().toISOString(),
    });
    return NextResponse.json({ ok: false });
  }

  let event: PaystackEvent;
  try {
    event = JSON.parse(raw) as PaystackEvent;
  } catch {
    return NextResponse.json({ ok: false });
  }

  if (event.event !== "charge.success") {
    // Any other event type is acknowledged but ignored.
    return NextResponse.json({ ok: true });
  }

  const { reference, amount, status } = event.data;
  if (status !== "success") {
    return NextResponse.json({ ok: true });
  }

  await markOrderPaid({ reference, amountKobo: amount });
  return NextResponse.json({ ok: true });
}
