import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Product } from "@/lib/types";
import ProductForm from "@/components/admin/ProductForm";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminProductEditPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) notFound();
  const product = data as Product;

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <Link
          href="/admin/products"
          className="text-[0.65rem] tracking-[0.3em] uppercase text-(--smoke) hover:text-(--charcoal)"
        >
          ← All products
        </Link>
      </div>

      <header>
        <p className="text-[0.65rem] tracking-[0.35em] uppercase text-(--smoke) mb-2">
          Edit product
        </p>
        <h1 className="font-display text-4xl">{product.name}</h1>
      </header>

      <ProductForm product={product} />
    </div>
  );
}
