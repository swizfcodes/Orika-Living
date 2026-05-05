import { createClient } from "@/lib/supabase/server";
import { fromKobo } from "@/lib/types";
import PageHeader from "@/components/admin/PageHeader";
import EmptyState from "@/components/admin/EmptyState";
import Pagination from "@/components/admin/Pagination";

const PAGE_SIZE = 50;

interface CustomerSummary {
  email: string;
  full_name: string;
  phone: string;
  order_count: number;
  lifetime_kobo: number;
  last_order_at: string;
}

interface PageProps {
  searchParams: Promise<{ page?: string }>;
}

export default async function AdminCustomersPage({ searchParams }: PageProps) {
  const { page: rawPage } = await searchParams;
  const page = Math.max(1, parseInt(rawPage ?? "1", 10) || 1);
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  // Aggregation lives in the `customer_summary` view (migration 0010).
  // Pagination here is safe because each row IS one customer — unlike
  // paginating the orders table, which would break lifetime totals.
  const supabase = await createClient();
  const { data, count } = await supabase
    .from("customer_summary")
    .select("*", { count: "exact" })
    .order("lifetime_kobo", { ascending: false })
    .range(from, to);

  const customers = (data ?? []) as CustomerSummary[];

  return (
    <div className="space-y-8 max-w-6xl">
      <PageHeader
        title="Customers"
        subtitle="Derived from order history, ranked by lifetime value."
      />

      <section className="bg-(--warm-white) border border-(--border) overflow-x-auto">
        {customers.length === 0 ? (
          <EmptyState label="No customers yet." />
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-(--linen) text-[0.6rem] tracking-[0.3em] uppercase text-(--smoke)">
              <tr>
                <th className="text-left font-normal px-6 py-4">Name</th>
                <th className="text-left font-normal px-6 py-4">Contact</th>
                <th className="text-right font-normal px-6 py-4">Orders</th>
                <th className="text-right font-normal px-6 py-4">Lifetime</th>
                <th className="text-right font-normal px-6 py-4">Last order</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((c) => (
                <tr
                  key={c.email}
                  className="border-t border-(--border) hover:bg-(--linen)/50"
                >
                  <td className="px-6 py-4 text-(--charcoal)">{c.full_name}</td>
                  <td className="px-6 py-4">
                    <a
                      href={`mailto:${c.email}`}
                      className="block text-(--charcoal) hover:text-(--gold) truncate"
                    >
                      {c.email}
                    </a>
                    <a
                      href={`tel:${c.phone}`}
                      className="block text-xs text-(--smoke) hover:text-(--gold) mt-0.5"
                    >
                      {c.phone}
                    </a>
                  </td>
                  <td className="px-6 py-4 text-right text-(--charcoal)">
                    {c.order_count}
                  </td>
                  <td className="px-6 py-4 text-right text-(--charcoal)">
                    {fromKobo(c.lifetime_kobo)}
                  </td>
                  <td className="px-6 py-4 text-right text-(--smoke)">
                    {new Date(c.last_order_at).toLocaleDateString()}
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
        basePath="/admin/customers"
      />
    </div>
  );
}
