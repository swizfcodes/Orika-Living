import Link from "next/link";
import Image from "next/image";
import type { Product } from "@/lib/types";
import { fromKobo } from "@/lib/types";
import { getProductImage } from "@/lib/utils/images";
import ProductPlaceholder from "./ProductPlaceholder";

interface Props {
  product: Product;
  priority?: boolean;
}

export default function ProductCard({ product, priority }: Props) {
  const image = getProductImage(product);

  return (
    <Link
      href={`/products/${product.slug}`}
      className="group block"
    >
      <div className="relative aspect-[4/5] overflow-hidden bg-(--parchment) mb-5">
        {image ? (
          <Image
            src={image}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            priority={priority}
            className="object-cover transition-transform duration-700 group-hover:scale-105"
          />
        ) : (
          <ProductPlaceholder
            family={product.scent_family}
            name={product.name}
            className="absolute inset-0 transition-transform duration-700 group-hover:scale-105"
          />
        )}
      </div>

      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[0.6rem] tracking-[0.35em] uppercase text-(--smoke) mb-1.5">
            {product.format}
          </p>
          <h3 className="font-display text-xl text-(--charcoal) leading-tight">
            {product.name}
          </h3>
          <p className="text-xs text-(--smoke) mt-1">
            {product.size_ml}ml · {product.scent_family}
          </p>
        </div>
        <p className="text-sm text-(--charcoal) whitespace-nowrap pt-1">
          {fromKobo(product.price_kobo)}
        </p>
      </div>
    </Link>
  );
}
