import EnquiryForm from "@/components/store/EnquiryForm";
import FadeIn from "@/components/motion/FadeIn";
import { CONTACTS } from "@/lib/constants/contact";

export const metadata = {
  title: "Contact — Orika Living",
  description:
    "Get in touch with Orika Living. Retail, wholesale, corporate gifting, hospitality placement, events and general enquiries.",
};

export default function ContactPage() {
  return (
    <section className="py-20 md:py-28 px-6 lg:px-10">
      <div className="max-w-6xl mx-auto">
        <FadeIn>
          <div className="text-center mb-16 max-w-2xl mx-auto">
            <p className="text-[0.7rem] tracking-[0.4em] uppercase text-(--smoke) mb-4">
              Contact
            </p>
            <h1 className="font-display text-5xl md:text-6xl text-(--charcoal) leading-[1.05]">
              We&rsquo;d love to hear from you.
            </h1>
            <p className="mt-6 text-base text-(--smoke) leading-relaxed">
              Whether you&rsquo;re curious about a scent, planning a corporate
              gift, or exploring a stockist partnership — share the details and
              we&rsquo;ll be back within two business days.
            </p>
          </div>
        </FadeIn>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.4fr] gap-12 lg:gap-20 items-start">
          <FadeIn>
            <aside className="space-y-10">
              <div>
                <p className="text-[0.65rem] tracking-[0.35em] uppercase text-(--smoke) mb-3">
                  Direct
                </p>
                <div className="space-y-5">
                  {CONTACTS.map((c) => (
                    <div key={c.email}>
                      <p className="font-display text-xl text-(--charcoal)">{c.name}</p>
                      <p className="text-[0.6rem] tracking-[0.3em] uppercase text-(--smoke) mt-1 mb-1">
                        {c.role}
                      </p>
                      <a
                        href={`mailto:${c.email}`}
                        className="text-sm text-(--smoke) hover:text-(--gold) transition-colors"
                      >
                        {c.email}
                      </a>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-[0.65rem] tracking-[0.35em] uppercase text-(--smoke) mb-3">
                  Registered
                </p>
                <p className="text-sm text-(--charcoal) leading-relaxed">
                  Orika Living Ltd
                  <br />
                  Lagos, Nigeria
                  <br />
                  RC No: 9354060
                </p>
              </div>

              <div>
                <p className="text-[0.65rem] tracking-[0.35em] uppercase text-(--smoke) mb-3">
                  Response time
                </p>
                <p className="text-sm text-(--charcoal) leading-relaxed">
                  Within two business days. Stockist enquiries are prioritised.
                </p>
              </div>
            </aside>
          </FadeIn>

          <FadeIn delay={0.1}>
            <div className="bg-(--linen) p-8 md:p-12">
              <EnquiryForm />
            </div>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}
