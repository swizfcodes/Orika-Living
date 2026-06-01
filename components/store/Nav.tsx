"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, X, ShoppingBag } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/lib/store";
import { openCart, selectCartCount } from "@/lib/store/cartSlice";
import logo from "@/assets/images/orikaLogo.png";

const leftLinks = [
  { href: "/products", label: "Collection" },
  { href: "/#scents", label: "Scents" },
  { href: "/#vision", label: "Vision" },
];

const rightLinks = [
  { href: "/stockist", label: "Stockist" },
  { href: "/contact", label: "Contact" },
];

const navLinks = [...leftLinks, ...rightLinks];

// Hash links (/#scents, /#vision) are anchors within the homepage — they
// don't represent distinct routes, so they never get an "active" state.
// Only proper page routes do.
function isActiveLink(pathname: string, href: string): boolean {
  if (href.includes("#")) return false;
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function Nav() {
  const dispatch = useAppDispatch();
  const count = useAppSelector(selectCartCount);
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Lock body scroll when the full-screen menu is open.
  useEffect(() => {
    if (mobileOpen) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [mobileOpen]);

  return (
    <>
      <header
        className={`sticky top-0 z-40 transition-colors duration-300 ${
          scrolled
            ? "bg-(--warm-white)/95 backdrop-blur border-b border-(--border)"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-10 h-16 md:h-24 grid grid-cols-3 items-center">
          {/* Left: links 1–3 on desktop, burger on mobile */}
          <div className="flex items-center">
            <button
              type="button"
              className="md:hidden p-2 -ml-2 text-(--charcoal) z-50"
              onClick={() => setMobileOpen((v) => !v)}
              aria-label="Toggle menu"
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? (
                <X size={24} strokeWidth={1.6} />
              ) : (
                <Menu size={24} strokeWidth={1.6} />
              )}
            </button>
            <nav className="hidden md:flex items-center gap-8 lg:gap-10">
              {leftLinks.map((l) => {
                const active = isActiveLink(pathname, l.href);
                return (
                  <Link
                    key={l.href}
                    href={l.href}
                    aria-current={active ? "page" : undefined}
                    className={`text-[0.7rem] tracking-[0.3em] uppercase gold-underline transition-colors ${active ? "is-active text-(--gold)" : "text-(--charcoal)"}`}
                  >
                    {l.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Center: logo */}
          <div className="flex justify-center">
            <Link href="/" aria-label="Orika Living — home" className="block">
              <Image
                src={logo}
                alt="Orika Living"
                priority
                sizes="(min-width: 768px) 200px, 120px"
                className="h-9 md:h-16 w-auto"
              />
            </Link>
          </div>

          {/* Right: links 4–5 on desktop + cart */}
          <div className="flex items-center justify-end gap-6 md:gap-8 lg:gap-10">
            <nav className="hidden md:flex items-center gap-8 lg:gap-10">
              {rightLinks.map((l) => {
                const active = isActiveLink(pathname, l.href);
                return (
                  <Link
                    key={l.href}
                    href={l.href}
                    aria-current={active ? "page" : undefined}
                    className={`text-[0.7rem] tracking-[0.3em] uppercase gold-underline transition-colors ${active ? "is-active text-(--gold)" : "text-(--charcoal)"}`}
                  >
                    {l.label}
                  </Link>
                );
              })}
            </nav>
            <button
              type="button"
              onClick={() => dispatch(openCart())}
              className="relative flex items-center gap-2 text-[0.7rem] tracking-[0.3em] uppercase text-(--charcoal) hover:text-(--gold) transition-colors"
              aria-label={`Cart (${count} items)`}
            >
              <ShoppingBag size={18} strokeWidth={1.6} />
              <span className="hidden sm:inline">Cart</span>
              {count > 0 && (
                <span className="absolute -top-2 -right-3 bg-(--gold) text-(--warm-white) text-[0.6rem] w-5 h-5 rounded-full flex items-center justify-center font-medium">
                  {count}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 z-50 bg-(--warm-white) flex flex-col overflow-hidden"
          role="dialog"
          aria-modal="true"
        >
          <div className="h-16 shrink-0 grid grid-cols-3 items-center px-6">
            <div />
            <Link
              href="/"
              onClick={() => setMobileOpen(false)}
              aria-label="Orika Living — home"
              className="flex justify-center"
            >
              <Image
                src={logo}
                alt="Orika Living"
                sizes="120px"
                className="h-9 w-auto"
              />
            </Link>
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              aria-label="Close menu"
              className="p-2 -mr-2 text-(--charcoal) hover:text-(--gold) transition-colors justify-self-end"
            >
              <X size={24} strokeWidth={1.6} />
            </button>
          </div>
          <nav className="flex-1 flex flex-col items-center justify-center gap-8 px-8">
            {navLinks.map((l, i) => {
              const active = isActiveLink(pathname, l.href);
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  onClick={() => setMobileOpen(false)}
                  aria-current={active ? "page" : undefined}
                  className={`font-display text-4xl transition-colors hover:text-(--gold) ${active ? "text-(--gold) italic" : "text-(--charcoal)"}`}
                  style={{
                    opacity: 0,
                    animation: `fadeInUp 0.4s ease-out ${i * 0.05 + 0.1}s forwards`,
                  }}
                >
                  {l.label}
                </Link>
              );
            })}
          </nav>
          <div className="shrink-0 px-8 py-8 border-t border-(--border) text-center">
            <p className="text-[0.6rem] tracking-[0.35em] uppercase text-(--smoke)">
              Orika Living · Lagos
            </p>
          </div>

          <style>{`
            @keyframes fadeInUp {
              from { opacity: 0; transform: translateY(12px); }
              to { opacity: 1; transform: translateY(0); }
            }
          `}</style>
        </div>
      )}
    </>
  );
}
