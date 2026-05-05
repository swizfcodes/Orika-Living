import { getActiveProducts } from "@/lib/products/server";
import { getScents } from "@/lib/scents/server";
import ProductsBrowser from "@/components/store/ProductsBrowser";

interface PageProps {
  searchParams: Promise<{ scent?: string }>;
}

export default async function ProductsPage({ searchParams }: PageProps) {
  const { scent } = await searchParams;
  const [products, scents] = await Promise.all([
    getActiveProducts(),
    getScents(),
  ]);

  return (
    <ProductsBrowser
      products={products}
      scents={scents}
      initialScentSlug={scent}
    />
  );
}
