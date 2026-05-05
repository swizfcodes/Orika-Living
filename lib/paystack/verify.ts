// Server-side Paystack helpers. Never import this from client code —
// PAYSTACK_SECRET_KEY must not ship to the browser.

export interface PaystackTransaction {
  status: "success" | "failed" | "abandoned" | string;
  reference: string;
  amount: number; // in kobo
  currency: string;
  customer: { email: string };
  paid_at: string | null;
}

interface VerifyResponse {
  status: boolean;
  message: string;
  data: PaystackTransaction;
}

export async function verifyPaystackTransaction(
  reference: string,
): Promise<PaystackTransaction | null> {
  const res = await fetch(
    `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
    {
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY!}`,
      },
      cache: "no-store",
    },
  );

  if (!res.ok) return null;
  const body = (await res.json()) as VerifyResponse;
  if (!body.status || !body.data) return null;
  return body.data;
}
