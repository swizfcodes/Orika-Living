import Link from "next/link";
import Image from "next/image";
import { isApiImage } from "@/lib/utils/images";
//import heroProduct from "@/assets/images/orika product no bg.png";
import heroBanner from "@/assets/images/OrikaStyledImageWebBanner-1.jpg";
import { getScents } from "@/lib/scents/server";
import { getSignatures } from "@/lib/signatures/server";
import { getFeaturedProducts } from "@/lib/products/server";
import FadeIn from "@/components/motion/FadeIn";
import ProductCard from "@/components/store/ProductCard";
import ScentCard from "@/components/store/ScentCard";
import OrikaLoader from "@/components/store/OrikaLoader";

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
      <OrikaLoader />

      {/* Hero */}
      <section className="relative min-h-[90vh] overflow-hidden">
        {/* Background photograph */}
        <Image
          src={heroBanner}
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        {/* Scrim — keeps text legible regardless of the underlying
            photograph's contrast. Heavier in the middle where the headline
            sits, softer at the edges to avoid a hard letterbox look. */}
        <div className="absolute inset-0 pointer-events-none bg-black/30" />
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "linear-gradient(to bottom, rgba(0,0,0,0.25) 0%, rgba(0,0,0,0.55) 50%, rgba(0,0,0,0.75) 100%)",
          }}
        />

        <div className="relative z-10 min-h-[90vh] flex flex-col justify-center items-center px-6 lg:px-10 py-24 text-center">
          <FadeIn delay={0.1}>
            <p className="inline-block whitespace-nowrap bg-black/70 text-[0.6rem] sm:text-[0.7rem] tracking-[0.3em] sm:tracking-[0.5em] uppercase text-(--warm-white) px-4 py-2 mb-6 rounded-lg">
              Orika Living · Lagos, Nigeria
            </p>
          </FadeIn>
          <FadeIn delay={0.2}>
            <h1 className="font-display text-6xl md:text-7xl lg:text-8xl text-(--warm-white) leading-[0.95]">
              Rooted in
              <br />
              <span className="italic">Nature</span>
            </h1>
          </FadeIn>
          <FadeIn delay={0.35}>
            <p className="mt-8 text-base md:text-lg text-(--warm-white)/90 max-w-xl leading-relaxed">
              Premium reed diffusers crafted to transform a room into an
              experience. Six signature scents. One quiet ritual.
            </p>
          </FadeIn>
          <FadeIn delay={0.5}>
            <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/products"
                className="bg-(--warm-white) text-(--charcoal) px-10 py-4 text-xs tracking-[0.3em] uppercase hover:bg-(--gold-light) transition-colors"
              >
                Shop the Collection
              </Link>
              <Link
                href="#scents"
                className="text-[0.7rem] tracking-[0.3em] uppercase text-(--warm-white) gold-underline px-4 py-4"
              >
                Discover the Scents
              </Link>
            </div>
          </FadeIn>
        </div>
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
            <ul className="mt-12 grid grid-cols-2 sm:grid-cols-3 gap-3 max-w-2xl mx-auto">
              {brandDescriptors.map((d) => (
                <li
                  key={d}
                  className="border border-(--border) rounded-full px-5 py-2 text-[0.65rem] tracking-[0.35em] uppercase text-(--charcoal) bg-(--warm-white) text-center"
                >
                  {d}
                </li>
              ))}
            </ul>
          </FadeIn>
        </div>
      </section>

      {/* Scent portfolio */}
      <section
        id="scents"
        className="py-28 md:py-36 px-6 lg:px-10 bg-(--linen)"
      >
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

          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
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
                From flagship statement pieces to the compact car diffuser —
                Orika scales with the space and the moment.
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
                        unoptimized={isApiImage(f.image)}
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
                    <p className="mt-6 text-base text-(--charcoal)">
                      {f.price}
                    </p>
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
              Orika embodies refined luxury, rooted in nature.
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
                Orika partners with stockists who share our commitment to
                considered retail. If that sounds like you, we&rsquo;d love to
                talk.
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
