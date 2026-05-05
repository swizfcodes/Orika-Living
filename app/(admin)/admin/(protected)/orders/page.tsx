import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import type { Order, OrderStatus } from "@/lib/types";
import { fromKobo } from "@/lib/types";
import Pagination from "@/components/admin/Pagination";
import PageHeader from "@/components/admin/PageHeader";
import EmptyState from "@/components/admin/EmptyState";
import FilterPills from "@/components/admin/FilterPills";

const PAGE_SIZE = 50;

const statuses: (OrderStatus | "all")[] = [
  "all",
  "pending",
  "paid",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
];

interface PageProps {
  searchParams: Promise<{ status?: string; page?: string }>;
}

export default async function AdminOrdersPage({ searchParams }: PageProps) {
  const { status, page: rawPage } = await searchParams;
  const active = (statuses.includes(status as OrderStatus) ? status : "all") as
    | OrderStatus
    | "all";
  const page = Math.max(1, parseInt(rawPage ?? "1", 10) || 1);
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const supabase = await createClient();
  let query = supabase
    .from("orders")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, to);
  if (active !== "all") query = query.eq("status", active);
  const { data, count } = await query;
  const orders = (data ?? []) as Order[];

  return (
    <div className="space-y-8 max-w-6xl">
      <PageHeader title="Orders" />

      <FilterPills
        options={statuses}
        active={active}
        basePath="/admin/orders"
      />

      <section className="bg-(--warm-white) border border-(--border) overflow-x-auto">
        {orders.length === 0 ? (
          <EmptyState label="No orders in this bucket." />
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-(--linen) text-[0.6rem] tracking-[0.3em] uppercase text-(--smoke)">
              <tr>
                <th className="text-left font-normal px-6 py-4">Customer</th>
                <th className="text-left font-normal px-6 py-4">Items</th>
                <th className="text-left font-normal px-6 py-4">Status</th>
                <th className="text-right font-normal px-6 py-4">Total</th>
                <th className="text-right font-normal px-6 py-4">Date</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id} className="border-t border-(--border) hover:bg-(--linen)/50">
                  <td className="px-6 py-4">
                    <Link
                      href={`/admin/orders/${o.id}`}
                      className="block hover:text-(--gold)"
                    >
                      <p className="text-(--charcoal)">{o.delivery_address.full_name}</p>
                      <p className="text-xs text-(--smoke) mt-0.5">
                        {o.delivery_address.email}
                      </p>
                    </Link>
                  </td>
                  <td className="px-6 py-4 text-(--smoke)">
                    {o.items.reduce((n, i) => n + i.quantity, 0)}
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-[0.65rem] tracking-[0.25em] capitalize text-(--charcoal)">
                      {o.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right text-(--charcoal)">
                    {fromKobo(o.total_kobo)}
                  </td>
                  <td className="px-6 py-4 text-right text-(--smoke)">
                    {new Date(o.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      <Pagination
        page={page}
        total={count ?? 0}
        pageSize={PAGE_SIZE}
        basePath="/admin/orders"
        query={{ status: active === "all" ? undefined : active }}
      />
    </div>
  );
}
