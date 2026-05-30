import Link from "next/link";
import { notFound } from "next/navigation";
import { apiFetch } from "@/lib/api/client";
import type { Order } from "@/lib/types";
import { fromKobo } from "@/lib/types";
import FadeIn from "@/components/motion/FadeIn";

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ ref?: string; pending?: string }>;
}

// The order id in the URL is the only way to reach this page — treat
// it as a capability token: not enumerable, not indexed by search
// engines. The hub's GET /store/orders/:id returns the order.
export const metadata = {
  robots: { index: false, follow: false },
};

export default async function OrderSuccessPage({ params, searchParams }: PageProps) {
  const [{ id }, { ref, pending: pendingFlag }] = await Promise.all([
    params,
    searchParams,
  ]);

  let order: Order;
  try {
    order = await apiFetch<Order>(`/store/orders/${id}`, {
      method: "GET",
      cache: "no-store",
    });
  } catch (err) {
    if ((err as { status?: number }).status !== 404) {
      console.error("[OrderSuccessPage] order fetch failed:", err);
    }
    notFound();
  }

  const isPaid = order.status === "paid" || order.status === "processing" ||
    order.status === "shipped" || order.status === "delivered";
  const isPending = !isPaid && (pendingFlag === "1" || order.status === "pending");

  return (
    <section className="max-w-3xl mx-auto px-6 lg:px-10 py-20 md:py-28">
      <FadeIn>
        <div className="text-center mb-14">
          <p className="text-[0.7rem] tracking-[0.4em] uppercase text-(--smoke) mb-5">
            {isPaid ? "Order Confirmed" : isPending ? "Confirming Payment" : "Order"}
          </p>
          <h1 className="font-display text-5xl md:text-6xl text-(--charcoal) leading-[1.05]">
            {isPaid
              ? "Thank you."
              : isPending
                ? "Almost there."
                : "We're reviewing your order."}
          </h1>
          <p className="mt-6 text-base text-(--smoke) max-w-xl mx-auto leading-relaxed">
            {isPaid ? (
              <>
                Your order is on its way through our fulfilment team. A confirmation
                has been sent to{" "}
                <span className="text-(--charcoal)">{order.delivery_address.email}</span>.
              </>
            ) : isPending ? (
              <>
                Paystack is still confirming your payment — this usually takes a
                few seconds. You can safely leave this page; we&rsquo;ll email you
                at{" "}
                <span className="text-(--charcoal)">{order.delivery_address.email}</span>{" "}
                as soon as it&rsquo;s settled.
              </>
            ) : (
              <>We&rsquo;ll be in touch at <span className="text-(--charcoal)">{order.delivery_address.email}</span>.</>
            )}
          </p>
        </div>
      </FadeIn>

      <FadeIn delay={0.1}>
        <div className="border border-(--border) bg-(--warm-white) p-8 md:p-10">
          <div className="flex flex-wrap items-start justify-between gap-6 pb-6 border-b border-(--border)">
            <div>
              <p className="text-[0.6rem] tracking-[0.35em] uppercase text-(--smoke) mb-2">
                Order reference
              </p>
              <p className="text-sm text-(--charcoal) font-mono">
                {ref ?? order.paystack_ref ?? order.id.slice(0, 8)}
              </p>
            </div>
            <div>
              <p className="text-[0.6rem] tracking-[0.35em] uppercase text-(--smoke) mb-2">
                Status
              </p>
              <p className="text-sm text-(--charcoal) capitalize">{order.status}</p>
            </div>
          </div>

          <div className="py-6 border-b border-(--border)">
            <p className="text-[0.6rem] tracking-[0.35em] uppercase text-(--smoke) mb-5">
              Items
            </p>
            <ul className="space-y-4">
              {order.items.map((item) => (
                <li
                  key={item.product_id}
                  className="flex items-start justify-between gap-4"
                >
                  <div className="min-w-0">
                    <p className="font-display text-lg text-(--charcoal) leading-tight">
                      {item.name}
                    </p>
                    <p className="text-[0.65rem] tracking-[0.3em] uppercase text-(--smoke) mt-1">
                      {item.format} · {item.size_ml}ml · ×{item.quantity}
                    </p>
                  </div>
                  <p className="text-sm text-(--charcoal) shrink-0">
                    {fromKobo(item.price_kobo * item.quantity)}
                  </p>
                </li>
              ))}
            </ul>
          </div>

          <div className="py-6 border-b border-(--border) grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <p className="text-[0.6rem] tracking-[0.35em] uppercase text-(--smoke) mb-2">
                Delivering to
              </p>
              <p className="text-sm text-(--charcoal) leading-relaxed">
                {order.delivery_address.full_name}
                <br />
                {order.delivery_address.street}
                <br />
                {order.delivery_address.city}, {order.delivery_address.state}
              </p>
            </div>
            <div>
              <p className="text-[0.6rem] tracking-[0.35em] uppercase text-(--smoke) mb-2">
                Contact
              </p>
              <p className="text-sm text-(--charcoal) leading-relaxed">
                {order.delivery_address.email}
                <br />
                {order.delivery_address.phone}
              </p>
            </div>
          </div>

          <div className="pt-6 flex items-center justify-between">
            <p className="text-[0.65rem] tracking-[0.35em] uppercase text-(--smoke)">
              Total paid
            </p>
            <p className="font-display text-3xl text-(--charcoal)">
              {fromKobo(order.total_kobo)}
            </p>
          </div>
        </div>
      </FadeIn>

      <div className="mt-12 text-center">
        <Link
          href="/products"
          className="text-[0.7rem] tracking-[0.3em] uppercase gold-underline text-(--charcoal)"
        >
          Continue shopping →
        </Link>
      </div>
    </section>
  );
}