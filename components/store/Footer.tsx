import Link from "next/link";
import Image from "next/image";
import NewsletterForm from "./NewsletterForm";
import { CONTACTS } from "@/lib/constants/contact";
import logo from "@/assets/images/orikaLogo.png";

export default function Footer() {
  return (
    <footer className="bg-(--charcoal) text-(--warm-white) mt-32">
      <div className="max-w-7xl mx-auto px-6 lg:px-10 py-20 grid grid-cols-1 md:grid-cols-4 gap-12">
        <div className="md:col-span-2">
          <Image
            src={logo}
            alt="Orika Living"
            sizes="200px"
            className="h-14 w-auto mb-6 brightness-0 invert"
          />
          <p className="text-sm leading-relaxed opacity-80 max-w-md">
            Premium Nigerian reed diffusers, crafted to transform a room into an
            experience. Every vessel a quiet statement — rooted in nature.
          </p>
          <div className="mt-10 max-w-sm">
            <p className="text-[0.65rem] tracking-[0.35em] uppercase opacity-60 mb-3">
              The Newsletter
            </p>
            <NewsletterForm source="footer" tone="dark" />
          </div>
        </div>

        <div>
          <p className="text-[0.65rem] tracking-[0.35em] uppercase opacity-60 mb-5">
            Explore
          </p>
          <ul className="space-y-3 text-sm">
            <li>
              <Link
                href="/products"
                className="hover:text-(--gold-light) transition-colors"
              >
                Collection
              </Link>
            </li>
            <li>
              <Link
                href="/#scents"
                className="hover:text-(--gold-light) transition-colors"
              >
                Signature Scents
              </Link>
            </li>
            <li>
              <Link
                href="/#vision"
                className="hover:text-(--gold-light) transition-colors"
              >
                Our Vision
              </Link>
            </li>
            <li>
              <Link
                href="/stockist"
                className="hover:text-(--gold-light) transition-colors"
              >
                Become a Stockist
              </Link>
            </li>
            <li>
              <Link
                href="/contact"
                className="hover:text-(--gold-light) transition-colors"
              >
                Contact
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <p className="text-[0.65rem] tracking-[0.35em] uppercase opacity-60 mb-5">
            Contact
          </p>
          <ul className="space-y-3 text-sm">
            {CONTACTS.map((c, i) => (
              <li key={c.email} className={i > 0 ? "pt-2" : undefined}>
                <span className="opacity-60 block mb-0.5">
                  {c.name} · {c.role}
                </span>
                <a
                  href={`mailto:${c.email}`}
                  className="hover:text-(--gold-light) transition-colors"
                >
                  {c.email}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 py-6 flex flex-col md:flex-row items-center justify-between gap-3 text-[0.65rem] tracking-[0.25em] uppercase opacity-60">
          <p>© {new Date().getFullYear()} Orika Living. All rights reserved.</p>
          <p>RC No: 9354060 · Lagos, Nigeria</p>
        </div>
      </div>
    </footer>
  );
}
