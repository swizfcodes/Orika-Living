import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Order, OrderStatus } from "@/lib/types";
import { fromKobo } from "@/lib/types";
import StatusSelect from "@/components/admin/StatusSelect";
import { updateOrderStatusAction } from "@/lib/admin/orders";

const orderStatuses: readonly OrderStatus[] = [
  "pending",
  "paid",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
];

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminOrderDetailPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) notFound();
  const order = data as Order;

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <Link
          href="/admin/orders"
          className="text-[0.65rem] tracking-[0.3em] uppercase text-(--smoke) hover:text-(--charcoal)"
        >
          ← All orders
        </Link>
      </div>

      <header className="flex flex-wrap items-start justify-between gap-6">
        <div>
          <p className="text-[0.65rem] tracking-[0.35em] uppercase text-(--smoke) mb-2">
            Order · {order.paystack_ref ?? order.id.slice(0, 8)}
          </p>
          <h1 className="font-display text-4xl">
            {order.delivery_address.full_name}
          </h1>
          <p className="text-sm text-(--smoke) mt-1">
            {new Date(order.created_at).toLocaleString()}
          </p>
        </div>

        <OrderStatusControl id={order.id} status={order.status} />
      </header>

      <section className="bg-(--warm-white) border border-(--border) p-8">
        <h2 className="font-display text-xl mb-5">Items</h2>
        <ul className="divide-y divide-(--border)">
          {order.items.map((item) => (
            <li
              key={item.product_id}
              className="py-4 flex items-start justify-between gap-4"
            >
              <div>
                <p className="text-(--charcoal)">{item.name}</p>
                <p className="text-[0.65rem] tracking-[0.3em] uppercase text-(--smoke) mt-1">
                  {item.format} · {item.size_ml}ml · ×{item.quantity}
                </p>
              </div>
              <p className="text-sm text-(--charcoal)">
                {fromKobo(item.price_kobo * item.quantity)}
              </p>
            </li>
          ))}
        </ul>
        <div className="flex items-center justify-between mt-6 pt-6 border-t border-(--border)">
          <p className="text-[0.65rem] tracking-[0.35em] uppercase text-(--smoke)">
            Total
          </p>
          <p className="font-display text-2xl">{fromKobo(order.total_kobo)}</p>
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <InfoCard title="Delivery">
          <p className="text-sm text-(--charcoal) leading-relaxed">
            {order.delivery_address.full_name}
            <br />
            {order.delivery_address.street}
            <br />
            {order.delivery_address.city}, {order.delivery_address.state}
          </p>
        </InfoCard>
        <InfoCard title="Contact">
          <p className="text-sm text-(--charcoal) leading-relaxed">
            <a
              href={`mailto:${order.delivery_address.email}`}
              className="hover:text-(--gold)"
            >
              {order.delivery_address.email}
            </a>
            <br />
            <a
              href={`tel:${order.delivery_address.phone}`}
              className="hover:text-(--gold)"
            >
              {order.delivery_address.phone}
            </a>
          </p>
        </InfoCard>
      </section>
    </div>
  );
}

function InfoCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-(--warm-white) border border-(--border) p-6">
      <p className="text-[0.6rem] tracking-[0.35em] uppercase text-(--smoke) mb-3">
        {title}
      </p>
      {children}
    </div>
  );
}

function OrderStatusControl({ id, status }: { id: string; status: OrderStatus }) {
  const update = async (next: OrderStatus) => {
    "use server";
    return updateOrderStatusAction({ id, status: next });
  };

  return (
    <StatusSelect
      label="Status"
      value={status}
      options={orderStatuses}
      onChange={update}
    />
  );
}
