import { getCatalogue } from "@/lib/products/server";
import { getScents } from "@/lib/scents/server";
import ProductsBrowser from "@/components/store/ProductsBrowser";

interface PageProps {
  searchParams: Promise<{ scent?: string }>;
}

export default async function ProductsPage({ searchParams }: PageProps) {
  const { scent } = await searchParams;
  const [catalogue, scents] = await Promise.all([
    getCatalogue(),
    getScents(),
  ]);

  return (
    <ProductsBrowser
      products={catalogue.products}
      scents={scents}
      initialScentSlug={scent}
      loadFailed={catalogue.status === "error"}
    />
  );
}
