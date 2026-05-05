import Link from "next/link";
import Image from "next/image";
import heroProduct from "@/assets/images/orika product no bg.png";
import { getScents } from "@/lib/scents/server";
import { getSignatures } from "@/lib/signatures/server";
import { getFeaturedProducts } from "@/lib/products/server";
import FadeIn from "@/components/motion/FadeIn";
import ProductCard from "@/components/store/ProductCard";
import ScentCard from "@/components/store/ScentCard";

const brandDescriptors = [
  "Alluring",
  "Sophisticated",
  "Immersive",
  "Contemporary",
  "Modern",
  "Refined",
];

export default async function HomePage() {
  const [featured, scents, signatures] = await Promise.all([
    getFeaturedProducts("Signature Edition", 3),
    getScents(),
    getSignatures(),
  ]);

  return (
    <>
      {/* Hero */}
      <section className="relative min-h-[90vh] overflow-hidden bg-(--linen)">
        <div className="absolute inset-0 pointer-events-none">
          <div
            className="absolute -top-24 -right-20 w-152 h-152 rounded-full blur-3xl opacity-40"
            style={{ background: "radial-gradient(circle, #D4AE5A 0%, transparent 60%)" }}
          />
          <div
            className="absolute -bottom-32 -left-16 w-120 h-120 rounded-full blur-3xl opacity-30"
            style={{ background: "radial-gradient(circle, #9B4A2E 0%, transparent 60%)" }}
          />
        </div>

        {/* Text — left half on desktop, centred on mobile */}
        <div className="relative z-10 min-h-[90vh] flex flex-col justify-center md:w-1/2 px-6 lg:px-16 py-24 text-center md:text-left">
          <FadeIn delay={0.1}>
            <p className="text-[0.7rem] tracking-[0.5em] uppercase text-(--smoke) mb-6">
              Orika Living · Lagos, Nigeria
            </p>
          </FadeIn>
          <FadeIn delay={0.2}>
            <h1 className="font-display text-6xl md:text-7xl lg:text-8xl text-(--charcoal) leading-[0.95]">
              Rooted in
              <br />
              <span className="italic">Elegance</span>
            </h1>
          </FadeIn>
          <FadeIn delay={0.35}>
            <p className="mt-8 text-base md:text-lg text-(--smoke) max-w-lg leading-relaxed">
              Premium reed diffusers crafted to transform a room into an experience.
              Six signature scents. One quiet ritual.
            </p>
          </FadeIn>
          <FadeIn delay={0.5}>
            <div className="mt-12 flex flex-col sm:flex-row items-center md:items-start justify-center md:justify-start gap-4">
              <Link
                href="/products"
                className="bg-(--charcoal) text-(--warm-white) px-10 py-4 text-xs tracking-[0.3em] uppercase hover:bg-(--ink) transition-colors"
              >
                Shop the Collection
              </Link>
              <Link
                href="#scents"
                className="text-[0.7rem] tracking-[0.3em] uppercase text-(--charcoal) gold-underline px-4 py-4"
              >
                Discover the Scents
              </Link>
            </div>
          </FadeIn>
        </div>

        {/* Product image — absolute right half, full height, desktop only */}
        <FadeIn delay={0.3} className="hidden md:block absolute top-0 right-0 w-1/2 h-full">
          <Image
            src={heroProduct}
            alt="Orika Living reed diffuser"
            fill
            priority
            className="object-contain drop-shadow-2xl"
            sizes="50vw"
          />
        </FadeIn>
      </section>

      {/* Brand overview */}
      <section className="py-28 md:py-36 px-6 lg:px-10 bg-(--warm-white)">
        <div className="max-w-4xl mx-auto text-center">
          <FadeIn>
            <p className="text-[0.7rem] tracking-[0.4em] uppercase text-(--smoke) mb-6">
              Brand Overview
            </p>
          </FadeIn>
          <FadeIn delay={0.1}>
            <p className="font-display text-2xl md:text-3xl text-(--charcoal) leading-[1.35]">
              Orika is a luxury home fragrance brand dedicated to creating scent
              experiences that elevate everyday living. Rooted in craftsmanship
              and intentional design, Orika diffusers are created to bring
              refined luxury into modern spaces.
            </p>
          </FadeIn>
          <FadeIn delay={0.25}>
            <ul className="mt-12 flex flex-wrap justify-center gap-3">
              {brandDescriptors.map((d) => (
                <li
                  key={d}
                  className="border border-(--border) rounded-full px-5 py-2 text-[0.65rem] tracking-[0.35em] uppercase text-(--charcoal) bg-(--warm-white)"
                >
                  {d}
                </li>
              ))}
            </ul>
          </FadeIn>
        </div>
      </section>

      {/* Scent portfolio */}
      <section id="scents" className="py-28 md:py-36 px-6 lg:px-10 bg-(--linen)">
        <div className="max-w-7xl mx-auto">
          <FadeIn>
            <div className="text-center mb-16 max-w-2xl mx-auto">
              <p className="text-[0.7rem] tracking-[0.4em] uppercase text-(--smoke) mb-4">
                The Scent Portfolio
              </p>
              <h2 className="font-display text-4xl md:text-5xl text-(--charcoal) mb-5">
                Six signatures. Distinct worlds.
              </h2>
              <p className="text-base text-(--smoke) leading-relaxed">
                Our bottles are designed for a strong shelf presence with a
                colour-differentiated six-scent portfolio — each composition
                built to transform a room into an experience.
              </p>
            </div>
          </FadeIn>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {scents.map((scent, i) => (
              <FadeIn key={scent.slug} delay={i * 0.05}>
                <ScentCard scent={scent} />
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Featured products */}
      {featured.length > 0 && (
        <section className="py-20 px-6 lg:px-10 bg-(--parchment)">
          <div className="max-w-7xl mx-auto">
            <FadeIn>
              <div className="flex items-end justify-between mb-12 flex-wrap gap-4">
                <div>
                  <p className="text-[0.7rem] tracking-[0.4em] uppercase text-(--smoke) mb-3">
                    Signature Edition
                  </p>
                  <h2 className="font-display text-4xl md:text-5xl text-(--charcoal)">
                    The everyday ritual
                  </h2>
                </div>
                <Link
                  href="/products"
                  className="text-[0.7rem] tracking-[0.3em] uppercase gold-underline text-(--charcoal)"
                >
                  View the full collection →
                </Link>
              </div>
            </FadeIn>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {featured.map((p, i) => (
                <FadeIn key={p.id} delay={i * 0.05}>
                  <ProductCard product={p} priority={i === 0} />
                </FadeIn>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Formats / range */}
      <section className="py-28 md:py-36 px-6 lg:px-10">
        <div className="max-w-6xl mx-auto">
          <FadeIn>
            <div className="text-center mb-16 max-w-2xl mx-auto">
              <p className="text-[0.7rem] tracking-[0.4em] uppercase text-(--smoke) mb-4">
                The Range
              </p>
              <h2 className="font-display text-4xl md:text-5xl text-(--charcoal) mb-5">
                Four formats. Every occasion.
              </h2>
              <p className="text-base text-(--smoke) leading-relaxed">
                From flagship statement pieces to the compact car diffuser — Orika
                scales with the space and the moment.
              </p>
            </div>
          </FadeIn>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-px bg-(--border) border border-(--border)">
            {signatures.map((f, i) => (
              <FadeIn key={f.slug} delay={i * 0.05}>
                <div className="relative bg-(--warm-white) h-full flex flex-col overflow-hidden">
                  {f.image && (
                    <div className="relative aspect-4/3">
                      <Image
                        src={f.image}
                        alt={f.name}
                        fill
                        sizes="(min-width: 1024px) 25vw, (min-width: 768px) 50vw, 100vw"
                        className="object-cover"
                      />
                    </div>
                  )}
                  <div className="p-8 flex flex-col flex-1">
                    <p className="text-[0.6rem] tracking-[0.35em] uppercase text-(--gold) mb-3">
                      {f.size}
                    </p>
                    <h3 className="font-display text-2xl text-(--charcoal) mb-3">
                      {f.name}
                    </h3>
                    <p className="text-sm text-(--smoke) leading-relaxed flex-1">
                      {f.blurb}
                    </p>
                    <p className="mt-6 text-base text-(--charcoal)">{f.price}</p>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Vision */}
      <section id="vision" className="py-28 md:py-36 px-6 lg:px-10">
        <div className="max-w-4xl mx-auto text-center">
          <FadeIn>
            <p className="text-[0.7rem] tracking-[0.4em] uppercase text-(--smoke) mb-6">
              Our Vision
            </p>
          </FadeIn>
          <FadeIn delay={0.1}>
            <p className="font-display text-3xl md:text-5xl text-(--charcoal) leading-tight italic">
              To shape how people experience their spaces — turning everyday
              environments into sanctuaries of beauty, calm, and refined living
              through the power of fragrance.
            </p>
          </FadeIn>
          <FadeIn delay={0.2}>
            <p className="mt-10 text-base text-(--smoke) max-w-2xl mx-auto leading-relaxed">
              From carefully selected notes to beautifully designed vessels,
              every detail reflects our commitment to timeless sophistication.
            </p>
          </FadeIn>
          <FadeIn delay={0.3}>
            <p className="mt-6 text-sm tracking-[0.25em] uppercase text-(--gold)">
              Orika embodies refined luxury, rooted in elegance.
            </p>
          </FadeIn>
        </div>
      </section>

      {/* Stockist / retail CTA */}
      <section className="py-20 px-6 lg:px-10 bg-(--charcoal) text-(--warm-white)">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <FadeIn>
            <div>
              <p className="text-[0.7rem] tracking-[0.4em] uppercase opacity-60 mb-4">
                For Retail Partners
              </p>
              <h2 className="font-display text-4xl md:text-5xl leading-tight">
                Bring Orika Living to your shelves.
              </h2>
            </div>
          </FadeIn>
          <FadeIn delay={0.15}>
            <div>
              <p className="text-base opacity-80 leading-relaxed mb-6">
                A distinctive own-brand line, healthy margins, category-leading
                aesthetics and in-store activation support — including styled
                displays, tester reeds, launch-night events and staff training.
              </p>
              <p className="text-base opacity-80 leading-relaxed mb-8">
                Orika partners with stockists who share our commitment to considered
                retail. If that sounds like you, we&rsquo;d love to talk.
              </p>
              <Link
                href="/stockist"
                className="inline-block bg-(--warm-white) text-(--charcoal) px-10 py-4 text-xs tracking-[0.3em] uppercase hover:bg-(--gold-light) hover:text-(--charcoal) transition-colors"
              >
                Become a Stockist
              </Link>
            </div>
          </FadeIn>
        </div>
      </section>
    </>
  );
}
