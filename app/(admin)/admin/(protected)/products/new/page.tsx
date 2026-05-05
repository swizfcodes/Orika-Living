import Link from "next/link";
import ProductForm from "@/components/admin/ProductForm";

export default function NewProductPage() {
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
          Admin
        </p>
        <h1 className="font-display text-4xl md:text-5xl">New product</h1>
      </header>

      <ProductForm />
    </div>
  );
}
