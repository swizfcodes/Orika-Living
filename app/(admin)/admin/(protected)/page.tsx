import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import type { Order, Enquiry } from "@/lib/types";
import { fromKobo } from "@/lib/types";
import RevenueChart from "@/components/admin/RevenueChart";
import PageHeader from "@/components/admin/PageHeader";
import EmptyState from "@/components/admin/EmptyState";

export default async function AdminOverviewPage() {
  const supabase = await createClient();

  const since = new Date();
  since.setDate(since.getDate() - 29); // 30-day window including today
  since.setHours(0, 0, 0, 0);

  const [
    { count: totalOrders },
    { count: paidOrders },
    { count: pendingOrders },
    { count: newEnquiries },
    { data: recentOrders },
    { data: recentEnquiries },
    { data: revenueRows },
    { data: timelineRows },
  ] = await Promise.all([
    supabase.from("orders").select("*", { count: "exact", head: true }),
    supabase
      .from("orders")
      .select("*", { count: "exact", head: true })
      .eq("status", "paid"),
    supabase
      .from("orders")
      .select("*", { count: "exact", head: true })
      .eq("status", "pending"),
    supabase
      .from("enquiries")
      .select("*", { count: "exact", head: true })
      .eq("status", "new"),
    supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(5),
    supabase
      .from("enquiries")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(5),
    supabase
      .from("orders")
      .select("total_kobo")
      .in("status", ["paid", "processing", "shipped", "delivered"]),
    supabase
      .from("orders")
      .select("total_kobo, created_at")
      .in("status", ["paid", "processing", "shipped", "delivered"])
      .gte("created_at", since.toISOString()),
  ]);

  const revenue = ((revenueRows ?? []) as { total_kobo: number }[]).reduce(
    (sum, r) => sum + r.total_kobo,
    0,
  );

  // Build a dense 30-day timeline — one point per day, zero-filled.
  const timeline = (timelineRows ?? []) as {
    total_kobo: number;
    created_at: string;
  }[];
  const byDay = new Map<string, { revenue: number; orders: number }>();
  for (const row of timeline) {
    const key = row.created_at.slice(0, 10); // YYYY-MM-DD
    const entry = byDay.get(key) ?? { revenue: 0, orders: 0 };
    entry.revenue += row.total_kobo / 100;
    entry.orders += 1;
    byDay.set(key, entry);
  }
  const chartPoints: { date: string; revenue: number; orders: number }[] = [];
  for (let i = 0; i < 30; i++) {
    const d = new Date(since);
    d.setDate(since.getDate() + i);
    const key = d.toISOString().slice(0, 10);
    const entry = byDay.get(key) ?? { revenue: 0, orders: 0 };
    chartPoints.push({ date: key, ...entry });
  }

  const stats = [
    { label: "Total Orders", value: String(totalOrders ?? 0) },
    { label: "Paid", value: String(paidOrders ?? 0) },
    { label: "Pending", value: String(pendingOrders ?? 0) },
    { label: "New Enquiries", value: String(newEnquiries ?? 0) },
    { label: "Revenue", value: fromKobo(revenue) },
  ];

  return (
    <div className="space-y-10 max-w-6xl">
      <PageHeader eyebrow="Overview" title="Welcome back." />

      <section className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-px bg-(--border) border border-(--border)">
        {stats.map((s) => (
          <div key={s.label} className="bg-(--warm-white) p-6">
            <p className="text-[0.6rem] tracking-[0.35em] uppercase text-(--smoke)">
              {s.label}
            </p>
            <p className="font-display text-3xl mt-2 text-(--charcoal)">
              {s.value}
            </p>
          </div>
        ))}
      </section>

      <section className="bg-(--warm-white) border border-(--border) p-6 md:p-8">
        <div className="flex items-end justify-between gap-4 mb-6">
          <div>
            <p className="text-[0.6rem] tracking-[0.35em] uppercase text-(--smoke)">
              Revenue
            </p>
            <h2 className="font-display text-2xl mt-1">Last 30 days</h2>
          </div>
          <p className="text-xs text-(--smoke)">
            Paid through delivered
          </p>
        </div>
        <RevenueChart points={chartPoints} />
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Panel title="Recent Orders" href="/admin/orders">
          {(recentOrders ?? []).length === 0 ? (
            <EmptyState label="No orders yet." size="sm" />
          ) : (
            <ul className="divide-y divide-(--border)">
              {((recentOrders ?? []) as Order[]).map((o) => (
                <li key={o.id}>
                  <Link
                    href={`/admin/orders/${o.id}`}
                    className="flex items-center justify-between gap-4 py-4 hover:bg-(--linen)/60 px-3 -mx-3 transition-colors"
                  >
                    <div className="min-w-0">
                      <p className="text-sm text-(--charcoal) truncate">
                        {o.delivery_address.full_name}
                      </p>
                      <p className="text-[0.65rem] tracking-[0.3em] uppercase text-(--smoke) mt-1">
                        {o.status} · {new Date(o.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <p className="text-sm text-(--charcoal) shrink-0">
                      {fromKobo(o.total_kobo)}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel title="Recent Enquiries" href="/admin/enquiries">
          {(recentEnquiries ?? []).length === 0 ? (
            <EmptyState label="No enquiries yet." size="sm" />
          ) : (
            <ul className="divide-y divide-(--border)">
              {((recentEnquiries ?? []) as Enquiry[]).map((e) => (
                <li key={e.id}>
                  <Link
                    href="/admin/enquiries"
                    className="block py-4 hover:bg-(--linen)/60 px-3 -mx-3 transition-colors"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <p className="text-sm text-(--charcoal) truncate">{e.name}</p>
                      <span className="text-[0.6rem] tracking-[0.3em] uppercase text-(--smoke) shrink-0">
                        {e.status}
                      </span>
                    </div>
                    <p className="text-xs text-(--smoke) mt-1 truncate">{e.type}</p>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </section>
    </div>
  );
}

function Panel({
  title,
  href,
  children,
}: {
  title: string;
  href: string;
  children: React.ReactNode;
}) {
  return (
    <section className="bg-(--warm-white) border border-(--border) p-6 md:p-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display text-2xl">{title}</h2>
        <Link
          href={href}
          className="text-[0.65rem] tracking-[0.3em] uppercase text-(--smoke) hover:text-(--gold)"
        >
          View all →
        </Link>
      </div>
      {children}
    </section>
  );
}

