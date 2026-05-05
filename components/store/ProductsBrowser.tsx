"use client";

import Image from "next/image";
import { useMemo, useState, useEffect } from "react";
import type { Product, ProductFormat } from "@/lib/types";
import type { ScentMeta } from "@/lib/scents";
import ProductCard from "@/components/store/ProductCard";
import FadeIn from "@/components/motion/FadeIn";

const formatOptions: ProductFormat[] = [
  "Grand Edition",
  "Signature Edition",
  "Curated Gift Set",
  "Car Diffuser",
];

interface Props {
  products: Product[];
  scents: ScentMeta[];
  initialScentSlug?: string;
}

export default function ProductsBrowser({
  products,
  scents,
  initialScentSlug,
}: Props) {
  const initialFamily = useMemo<string>(() => {
    if (!initialScentSlug) return "All";
    const match = scents.find((s) => s.slug === initialScentSlug);
    return match ? match.family : "All";
  }, [initialScentSlug, scents]);

  const [family, setFamily] = useState<string>(initialFamily);
  const [format, setFormat] = useState<ProductFormat | "All">("All");

  // Re-sync when the URL scent param changes (back/forward navigation).
  useEffect(() => {
    setFamily(initialFamily);
  }, [initialFamily]);

  const activeScent = useMemo(
    () =>
      family === "All"
        ? null
        : scents.find((s) => s.family === family) ?? null,
    [family, scents],
  );

  const filtered = useMemo(() => {
    return products.filter((p) => {
      if (family !== "All" && p.scent_family !== family) return false;
      if (format !== "All" && p.format !== format) return false;
      return true;
    });
  }, [products, family, format]);

  const hasHeroImage = Boolean(activeScent?.image);
  const heroTextColor = activeScent
    ? hasHeroImage
      ? "#F2EDE4"
      : activeScent.ink
    : "#F2EDE4";

  const carouselScents = useMemo(
    () => scents.filter((s) => Boolean(s.image)),
    [scents],
  );
  const [carouselIndex, setCarouselIndex] = useState(0);

  useEffect(() => {
    if (activeScent || carouselScents.length < 2) return;
    const id = setInterval(() => {
      setCarouselIndex((i) => (i + 1) % carouselScents.length);
    }, 5000);
    return () => clearInterval(id);
  }, [activeScent, carouselScents.length]);

  useEffect(() => {
    if (carouselIndex >= carouselScents.length) setCarouselIndex(0);
  }, [carouselScents.length, carouselIndex]);

  return (
    <>
      <section
        className="relative overflow-hidden h-[50vh] lg:h-screen flex items-center justify-center px-6 lg:px-10 transition-colors duration-700"
        style={{
          backgroundColor: activeScent ? activeScent.swatch : undefined,
        }}
      >
        {!activeScent && carouselScents.length === 0 && (
          <div className="absolute inset-0 bg-(--linen)" />
        )}

        {!activeScent &&
          carouselScents.map((s, i) => (
            <Image
              key={s.slug}
              src={s.image!}
              alt={s.name}
              fill
              priority={i === 0}
              sizes="100vw"
              className="object-cover transition-opacity duration-1000"
              style={{ opacity: i === carouselIndex ? 1 : 0 }}
            />
          ))}

        {activeScent?.image && (
          <Image
            key={activeScent.slug}
            src={activeScent.image}
            alt={activeScent.name}
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
        )}

        {(activeScent?.image || (!activeScent && carouselScents.length > 0)) && (
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(to bottom, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.35) 50%, rgba(0,0,0,0.55) 100%)",
            }}
          />
        )}

        <div className="relative max-w-4xl mx-auto text-center">
          <FadeIn key={activeScent?.slug ?? "all"}>
            <p
              className="text-[0.7rem] tracking-[0.4em] uppercase mb-5"
              style={{
                color:
                  !activeScent && carouselScents.length === 0
                    ? "var(--smoke)"
                    : heroTextColor,
                opacity: activeScent ? 0.85 : 1,
              }}
            >
              {activeScent ? activeScent.family : "The Collection"}
            </p>
          </FadeIn>
          <FadeIn key={`h-${activeScent?.slug ?? "all"}`} delay={0.1}>
            <h1
              className="font-display text-5xl md:text-7xl leading-[0.95]"
              style={{
                color:
                  !activeScent && carouselScents.length === 0
                    ? "var(--charcoal)"
                    : heroTextColor,
              }}
            >
              {activeScent
                ? activeScent.name
                : "Six scents. Four formats. One ritual."}
            </h1>
          </FadeIn>
          <FadeIn key={`p-${activeScent?.slug ?? "all"}`} delay={0.2}>
            <p
              className="mt-6 text-base max-w-2xl mx-auto leading-relaxed"
              style={{
                color:
                  !activeScent && carouselScents.length === 0
                    ? "var(--smoke)"
                    : heroTextColor,
                opacity: activeScent ? 0.9 : 1,
              }}
            >
              {activeScent
                ? activeScent.description
                : "Every piece in the Orika Living collection is crafted for long-lasting diffusion and considered presentation — at home, in hospitality, or on the shelves of boutique retail."}
            </p>
          </FadeIn>
        </div>

        {!activeScent && carouselScents.length > 1 && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
            {carouselScents.map((s, i) => (
              <button
                key={s.slug}
                type="button"
                aria-label={`Show ${s.name}`}
                onClick={() => setCarouselIndex(i)}
                className="h-1 transition-all duration-500"
                style={{
                  width: i === carouselIndex ? "2rem" : "0.75rem",
                  backgroundColor:
                    i === carouselIndex
                      ? "#F2EDE4"
                      : "rgba(242,237,228,0.5)",
                }}
              />
            ))}
          </div>
        )}
      </section>

      <section className="px-6 lg:px-10 py-12">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col gap-6 mb-14 pb-6 border-b border-(--border)">
            <FilterRow
              label="Scent"
              options={["All", ...scents.map((s) => s.family)]}
              value={family}
              onChange={setFamily}
            />
            <FilterRow
              label="Format"
              options={["All", ...formatOptions] as (ProductFormat | "All")[]}
              value={format}
              onChange={setFormat}
            />
          </div>

          {filtered.length === 0 ? (
            <p className="text-center font-display text-2xl text-(--smoke) py-24">
              No pieces match that combination. Try another scent or format.
            </p>
          ) : (
            <>
              <p className="text-[0.65rem] tracking-[0.35em] uppercase text-(--smoke) mb-8">
                {filtered.length} piece{filtered.length === 1 ? "" : "s"}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-14">
                {filtered.map((p, i) => (
                  <ProductCard key={p.id} product={p} priority={i < 3} />
                ))}
              </div>
            </>
          )}
        </div>
      </section>
    </>
  );
}

interface FilterRowProps<T extends string> {
  label: string;
  options: readonly T[];
  value: T;
  onChange: (value: T) => void;
}

function FilterRow<T extends string>({
  label,
  options,
  value,
  onChange,
}: FilterRowProps<T>) {
  return (
    <div className="space-y-3">
      <span className="block text-[0.6rem] tracking-[0.35em] uppercase text-(--smoke)">
        {label}
      </span>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
        {options.map((opt) => {
          const active = opt === value;
          return (
            <button
              key={opt}
              type="button"
              onClick={() => onChange(opt)}
              className={`text-[0.65rem] tracking-[0.25em] uppercase px-4 py-3 border transition-colors text-center ${
                active
                  ? "bg-(--charcoal) text-(--warm-white) border-(--charcoal)"
                  : "bg-transparent text-(--charcoal) border-(--border) hover:border-(--charcoal)"
              }`}
            >
              {opt}
            </button>
          );
        })}
      </div>
    </div>
  );
}
