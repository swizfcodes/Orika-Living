import EnquiryForm from "@/components/store/EnquiryForm";
import FadeIn from "@/components/motion/FadeIn";

export const metadata = {
  title: "Become a Stockist — Orika Living",
  description:
    "Bring Orika Living to your shelves. Premium Nigerian reed diffusers with considered retail support — displays, tester reeds, launch events, staff training.",
};

const advantages = [
  {
    title: "Clear Upsell Pathway",
    body: "Structured upsell from 500ml to 1000ml — customers begin with a smaller format and trade up as brand affinity and usage grow. A natural progression for repeat customers.",
  },
  {
    title: "Gift Set Increases Transaction Value",
    body: "Curated gift sets drive higher retail transaction value, offering a refined, ready-to-gift experience that encourages customers to purchase across the range.",
  },
  {
    title: "Add-On Revenue from Car Diffuser",
    body: "Car diffusers drive incremental revenue by extending Orika's product ecosystem beyond the home — increasing purchase frequency and customer touchpoints.",
  },
  {
    title: "Refill and Repeat Purchase Opportunity",
    body: "Refills unlock a recurring revenue stream by encouraging customers to replenish their favourite scents, supporting retention and increasing lifetime value.",
  },
];

const support = [
  {
    title: "Tester Units Provided",
    body: "On-shelf testers so customers can experience each scent before purchase — the single biggest lever for conversion in the category.",
  },
  {
    title: "Display Support Materials",
    body: "Retail-ready merchandising — plinths, signage and tester reeds configured for your floor.",
  },
  {
    title: "Seasonal Campaign Assets",
    body: "Refreshed creative through the year, aligned to gifting peaks and seasonal moments.",
  },
  {
    title: "Digital Content for In-Store Marketing",
    body: "Scent cards, lookbook imagery and digital assets for your screens, newsletters and social channels.",
  },
];

const audience = {
  age: "24–60+",
  location: "Nigeria",
  psychographics:
    "Aspirational, taste-driven individuals drawn to understated luxury, who see their living spaces as an extension of their identity. Intentional about how their environments look, feel and smell, investing in elevated home aesthetics and sensory experiences that create comfort, calm and quiet sophistication. Willing to pay a premium for products that feel distinctive, well-designed and emotionally resonant.",
  behaviours:
    "Intentional, lifestyle-driven behaviours centred on curation and experience. They actively invest in their homes — décor, fragrance and design pieces that enhance atmosphere and reflect personal taste. Shop selectively, prioritising quality and aesthetic alignment over impulse, and repurchase products that integrate seamlessly into their routines.",
};

export default function StockistPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative bg-(--charcoal) text-(--warm-white) overflow-hidden">
        <div className="absolute inset-0 pointer-events-none opacity-20">
          <div
            className="absolute -top-32 -right-32 w-160 h-160 rounded-full blur-3xl"
            style={{ background: "radial-gradient(circle, #D4AE5A 0%, transparent 60%)" }}
          />
        </div>
        <div className="relative max-w-5xl mx-auto px-6 lg:px-10 py-24 md:py-36 text-center">
          <FadeIn>
            <p className="text-[0.7rem] tracking-[0.5em] uppercase opacity-60 mb-6">
              For Retail Partners
            </p>
          </FadeIn>
          <FadeIn delay={0.1}>
            <h1 className="font-display text-5xl md:text-7xl leading-[0.95]">
              A considered addition to <span className="italic">your shelf.</span>
            </h1>
          </FadeIn>
          <FadeIn delay={0.2}>
            <p className="mt-8 text-base md:text-lg opacity-80 max-w-2xl mx-auto leading-relaxed">
              Orika Living partners with a small, deliberate set of stockists who
              share our commitment to considered retail. If that sounds like you,
              we&rsquo;d love to start the conversation.
            </p>
          </FadeIn>
        </div>
      </section>

      {/* Target audience */}
      <section className="py-24 md:py-32 px-6 lg:px-10 bg-(--parchment)">
        <div className="max-w-6xl mx-auto">
          <FadeIn>
            <div className="max-w-2xl mb-16">
              <p className="text-[0.7rem] tracking-[0.4em] uppercase text-(--smoke) mb-4">
                Target Audience
              </p>
              <h2 className="font-display text-4xl md:text-5xl text-(--charcoal)">
                Who the Orika customer is.
              </h2>
            </div>
          </FadeIn>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-12">
            <FadeIn>
              <div>
                <p className="text-[0.6rem] tracking-[0.35em] uppercase text-(--gold) mb-3">
                  Psychographics
                </p>
                <p className="text-sm text-(--smoke) leading-relaxed">
                  {audience.psychographics}
                </p>
              </div>
            </FadeIn>
            <FadeIn delay={0.05}>
              <div>
                <p className="text-[0.6rem] tracking-[0.35em] uppercase text-(--gold) mb-3">
                  Behaviours
                </p>
                <p className="text-sm text-(--smoke) leading-relaxed">
                  {audience.behaviours}
                </p>
              </div>
            </FadeIn>
          </div>
          <FadeIn delay={0.1}>
            <div className="mt-14 pt-10 border-t border-(--border) grid grid-cols-2 sm:grid-cols-4 gap-6 text-sm">
              <div>
                <p className="text-[0.6rem] tracking-[0.35em] uppercase text-(--smoke) mb-2">
                  Age
                </p>
                <p className="text-(--charcoal)">{audience.age}</p>
              </div>
              <div>
                <p className="text-[0.6rem] tracking-[0.35em] uppercase text-(--smoke) mb-2">
                  Location
                </p>
                <p className="text-(--charcoal)">{audience.location}</p>
              </div>
              <div>
                <p className="text-[0.6rem] tracking-[0.35em] uppercase text-(--smoke) mb-2">
                  Gender
                </p>
                <p className="text-(--charcoal)">Unisex skew female</p>
              </div>
              <div>
                <p className="text-[0.6rem] tracking-[0.35em] uppercase text-(--smoke) mb-2">
                  Income
                </p>
                <p className="text-(--charcoal)">Upper-middle & above</p>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Commercial advantage */}
      <section className="py-24 md:py-32 px-6 lg:px-10">
        <div className="max-w-6xl mx-auto">
          <FadeIn>
            <div className="max-w-2xl mb-16">
              <p className="text-[0.7rem] tracking-[0.4em] uppercase text-(--smoke) mb-4">
                Retail Commercial Advantage
              </p>
              <h2 className="font-display text-4xl md:text-5xl text-(--charcoal)">
                Built for sell-through, not just shelf-presence.
              </h2>
            </div>
          </FadeIn>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-14">
            {advantages.map((a, i) => (
              <FadeIn key={a.title} delay={i * 0.05}>
                <div>
                  <p className="text-[0.6rem] tracking-[0.35em] uppercase text-(--gold) mb-3">
                    0{i + 1}
                  </p>
                  <h3 className="font-display text-2xl text-(--charcoal) mb-3">
                    {a.title}
                  </h3>
                  <p className="text-sm text-(--smoke) leading-relaxed">{a.body}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Sell-through support */}
      <section className="bg-(--linen) py-24 md:py-32 px-6 lg:px-10">
        <div className="max-w-6xl mx-auto">
          <FadeIn>
            <div className="max-w-2xl mb-16">
              <p className="text-[0.7rem] tracking-[0.4em] uppercase text-(--smoke) mb-4">
                Sell-Through Support
              </p>
              <h2 className="font-display text-4xl md:text-5xl text-(--charcoal)">
                Everything your floor needs to convert.
              </h2>
            </div>
          </FadeIn>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-14">
            {support.map((s, i) => (
              <FadeIn key={s.title} delay={i * 0.05}>
                <div className="border-l border-(--gold) pl-6">
                  <h3 className="font-display text-2xl text-(--charcoal) mb-3">
                    {s.title}
                  </h3>
                  <p className="text-sm text-(--smoke) leading-relaxed">{s.body}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Form */}
      <section id="enquire" className="py-24 md:py-32 px-6 lg:px-10">
        <div className="max-w-3xl mx-auto">
          <FadeIn>
            <div className="text-center mb-12">
              <p className="text-[0.7rem] tracking-[0.4em] uppercase text-(--smoke) mb-4">
                Start the Conversation
              </p>
              <h2 className="font-display text-4xl md:text-5xl text-(--charcoal)">
                Tell us about your store.
              </h2>
              <p className="mt-6 text-sm text-(--smoke) leading-relaxed max-w-xl mx-auto">
                We&rsquo;ll respond within two business days with a trade pack,
                wholesale pricing, and proposed next steps.
              </p>
            </div>
          </FadeIn>
          <FadeIn delay={0.1}>
            <div className="bg-(--warm-white) border border-(--border) p-8 md:p-12">
              <EnquiryForm defaultType="Retail / Stockist Partnership" />
            </div>
          </FadeIn>
        </div>
      </section>
    </>
  );
}
