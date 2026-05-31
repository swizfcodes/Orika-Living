import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { fromKobo } from "@/lib/types";
import { getProductImage, isApiImage } from "@/lib/utils/images";
import { getScents } from "@/lib/scents/server";
import {
  getProductBySlug,
  getRelatedProducts,
} from "@/lib/products/server";
import AddToCart from "@/components/store/AddToCart";
import ProductCard from "@/components/store/ProductCard";
import ProductPlaceholder from "@/components/store/ProductPlaceholder";
import FadeIn from "@/components/motion/FadeIn";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return {};
  return {
    title: `${product.name} — Orika Living`,
    description: product.description,
  };
}

export default async function ProductDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const image = getProductImage(product);
  const [scents, related] = await Promise.all([
    getScents(),
    getRelatedProducts(product.scent_family, product.id, 3),
  ]);
  const scent = scents.find((s) => s.family === product.scent_family);

  return (
    <>
      <div className="max-w-7xl mx-auto px-6 lg:px-10 pt-10">
        <nav className="text-[0.65rem] tracking-[0.3em] uppercase text-(--smoke) flex gap-3 flex-wrap">
          <Link href="/" className="hover:text-(--charcoal)">Home</Link>
          <span>/</span>
          <Link href="/products" className="hover:text-(--charcoal)">Collection</Link>
          <span>/</span>
          <span className="text-(--charcoal)">{product.name}</span>
        </nav>
      </div>

      <section className="max-w-7xl mx-auto px-6 lg:px-10 py-12 md:py-16 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
        <FadeIn>
          <div className="relative aspect-[4/5] bg-(--parchment) overflow-hidden">
            {image ? (
              <Image
                src={image}
                alt={product.name}
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                priority
                unoptimized={isApiImage(image)}
                className="object-cover"
              />
            ) : (
              <ProductPlaceholder
                family={product.scent_family}
                name={product.name}
                className="absolute inset-0"
              />
            )}
          </div>
        </FadeIn>

        <FadeIn delay={0.1}>
          <div className="lg:pt-8">
            <p className="text-[0.65rem] tracking-[0.35em] uppercase text-(--smoke) mb-3">
              {product.format} · {product.size_ml}ml
            </p>
            <h1 className="font-display text-5xl md:text-6xl text-(--charcoal) leading-[1.05]">
              {product.name}
            </h1>
            {scent && (
              <p className="mt-4 text-base italic text-(--smoke)">
                {scent.tagline}
              </p>
            )}

            <p className="mt-8 font-display text-3xl text-(--charcoal)">
              {fromKobo(product.price_kobo)}
            </p>

            <div className="mt-10">
              <AddToCart product={product} />
            </div>

            <div className="mt-10 pt-10 border-t border-(--border)">
              <p className="text-[0.65rem] tracking-[0.35em] uppercase text-(--smoke) mb-4">
                Composition
              </p>
              <p className="text-base text-(--charcoal) leading-relaxed">
                {product.description}
              </p>
            </div>

            <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-8">
              <NoteGroup label="Top" notes={product.top_notes} />
              <NoteGroup label="Heart" notes={product.heart_notes} />
              <NoteGroup label="Base" notes={product.base_notes} />
            </div>

            <div className="mt-10 pt-10 border-t border-(--border) grid grid-cols-2 gap-6 text-sm">
              <div>
                <p className="text-[0.6rem] tracking-[0.35em] uppercase text-(--smoke) mb-2">
                  Scent Family
                </p>
                <p className="text-(--charcoal)">{product.scent_family}</p>
              </div>
              <div>
                <p className="text-[0.6rem] tracking-[0.35em] uppercase text-(--smoke) mb-2">
                  Availability
                </p>
                <p className="text-(--charcoal)">
                  {product.in_stock && product.stock_qty > 0
                    ? "In stock · Ships from Lagos"
                    : "Currently unavailable"}
                </p>
              </div>
            </div>
          </div>
        </FadeIn>
      </section>

      {related.length > 0 && (
        <section className="bg-(--linen) py-20 md:py-28 px-6 lg:px-10 mt-12">
          <div className="max-w-7xl mx-auto">
            <FadeIn>
              <div className="mb-12">
                <p className="text-[0.7rem] tracking-[0.4em] uppercase text-(--smoke) mb-3">
                  Also in {product.scent_family}
                </p>
                <h2 className="font-display text-3xl md:text-4xl text-(--charcoal)">
                  Continue the ritual
                </h2>
              </div>
            </FadeIn>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {related.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}

function NoteGroup({ label, notes }: { label: string; notes: string[] }) {
  return (
    <div>
      <p className="text-[0.6rem] tracking-[0.35em] uppercase text-(--gold) mb-3">
        {label}
      </p>
      <ul className="space-y-1.5">
        {notes.map((n) => (
          <li key={n} className="text-sm text-(--charcoal)">
            {n}
          </li>
        ))}
      </ul>
    </div>
  );
}
