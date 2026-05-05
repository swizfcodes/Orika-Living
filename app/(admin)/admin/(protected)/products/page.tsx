import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import type { Product } from "@/lib/types";
import { fromKobo } from "@/lib/types";
import Pagination from "@/components/admin/Pagination";
import PageHeader from "@/components/admin/PageHeader";
import EmptyState from "@/components/admin/EmptyState";

const PAGE_SIZE = 50;

interface PageProps {
  searchParams: Promise<{ page?: string }>;
}

export default async function AdminProductsPage({ searchParams }: PageProps) {
  const { page: rawPage } = await searchParams;
  const page = Math.max(1, parseInt(rawPage ?? "1", 10) || 1);
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const supabase = await createClient();
  const { data, count } = await supabase
    .from("products")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, to);
  const products = (data ?? []) as Product[];

  return (
    <div className="space-y-8 max-w-6xl">
      <PageHeader
        title="Products"
        action={
          <Link
            href="/admin/products/new"
            className="text-[0.65rem] tracking-[0.3em] uppercase px-6 py-3 bg-(--charcoal) text-(--warm-white) hover:bg-(--gold) transition-colors"
          >
            + New product
          </Link>
        }
      />

      <section className="bg-(--warm-white) border border-(--border) overflow-x-auto">
        {products.length === 0 ? (
          <EmptyState label="No products yet." />
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-(--linen) text-[0.6rem] tracking-[0.3em] uppercase text-(--smoke)">
              <tr>
                <th className="text-left font-normal px-6 py-4">Name</th>
                <th className="text-left font-normal px-6 py-4">Format</th>
                <th className="text-left font-normal px-6 py-4">Scent</th>
                <th className="text-right font-normal px-6 py-4">Price</th>
                <th className="text-right font-normal px-6 py-4">Stock</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr
                  key={p.id}
                  className="border-t border-(--border) hover:bg-(--linen)/50"
                >
                  <td className="px-6 py-4">
                    <Link
                      href={`/admin/products/${p.id}`}
                      className="block hover:text-(--gold)"
                    >
                      <p className="text-(--charcoal)">{p.name}</p>
                      <p className="text-xs text-(--smoke) mt-0.5">/{p.slug}</p>
                    </Link>
                  </td>
                  <td className="px-6 py-4 text-(--smoke)">{p.format}</td>
                  <td className="px-6 py-4 text-(--smoke)">{p.scent_family}</td>
                  <td className="px-6 py-4 text-right text-(--charcoal)">
                    {fromKobo(p.price_kobo)}
                  </td>
                  <td
                    className={`px-6 py-4 text-right ${
                      p.stock_qty === 0 ? "text-(--gold)" : "text-(--charcoal)"
                    }`}
                  >
                    {p.stock_qty}
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
        basePath="/admin/products"
      />
    </div>
  );
}
