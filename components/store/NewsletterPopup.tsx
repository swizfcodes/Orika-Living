"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useActionState } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { subscribeAction } from "@/lib/newsletter/actions";
import { initialSubscribeState } from "@/lib/newsletter/state";
import logo from "@/assets/images/orikaLogo.png";

const STORAGE_KEY = "orika.newsletter.seen.v1";
const TRIGGER_DELAY_MS = 8000;

// Routes where the popup is suppressed regardless of state — purchase and
// order flows are focus contexts; an interrupt here costs conversions.
const SUPPRESSED_PREFIXES = ["/checkout", "/orders"];

export default function NewsletterPopup() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState(
    subscribeAction,
    initialSubscribeState,
  );

  const suppressed = SUPPRESSED_PREFIXES.some((p) => pathname.startsWith(p));

  // First-mount delay timer. Skipped if the user has already subscribed,
  // dismissed, or we're on a focus-mode page.
  useEffect(() => {
    if (suppressed) return;
    let already = false;
    try {
      already = Boolean(localStorage.getItem(STORAGE_KEY));
    } catch {
      // localStorage unavailable (private mode, embedded webview) — don't
      // pop up. Fail closed: better to skip than nag.
      return;
    }
    if (already) return;
    const timer = setTimeout(() => setOpen(true), TRIGGER_DELAY_MS);
    return () => clearTimeout(timer);
  }, [suppressed]);

  // On successful subscribe: stamp the storage key so we never pop up
  // again, and auto-close after a moment so the user reads the success.
  useEffect(() => {
    if (state.status !== "success") return;
    markSubscribed();
    const timer = setTimeout(() => setOpen(false), 2500);
    return () => clearTimeout(timer);
  }, [state.status]);

  // Dismiss does NOT persist — the popup will reappear on the next page
  // load, giving the user another chance. Only an actual subscription
  // suppresses future shows.
  const dismiss = () => {
    setOpen(false);
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={dismiss}
            className="fixed inset-0 z-50 bg-(--charcoal)/40 backdrop-blur-sm"
            aria-hidden="true"
          />
          <motion.div
            key="dialog"
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.96 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="newsletter-popup-heading"
            className="fixed inset-0 z-50 flex items-center justify-center px-6 pointer-events-none"
          >
            <div className="relative w-full max-w-md bg-(--warm-white) border border-(--border) p-10 md:p-12 pointer-events-auto shadow-xl">
              <button
                type="button"
                onClick={dismiss}
                aria-label="Close"
                className="absolute top-4 right-4 p-2 text-(--smoke) hover:text-(--charcoal) transition-colors"
              >
                <X size={18} strokeWidth={1.6} />
              </button>

              <div className="text-center">
                <Image
                  src={logo}
                  alt="Orika Living"
                  sizes="120px"
                  className="h-10 w-auto mx-auto mb-6"
                />
                <p className="text-[0.6rem] tracking-[0.4em] uppercase text-(--gold) mb-3">
                  The Newsletter
                </p>
                <h2
                  id="newsletter-popup-heading"
                  className="font-display text-3xl text-(--charcoal) leading-tight mb-4"
                >
                  Quietly kept in the loop.
                </h2>
                <p className="text-sm text-(--smoke) leading-relaxed mb-8">
                  Be the first to hear about new compositions, seasonal
                  editions, and quiet launches from the studio.
                </p>

                {state.status === "success" ? (
                  <p className="text-sm text-(--charcoal) py-4">
                    {state.message ?? "You're on the list."}
                  </p>
                ) : (
                  <form action={formAction} className="space-y-3">
                    <input type="hidden" name="source" value="popup" />
                    <input
                      type="email"
                      name="email"
                      required
                      disabled={pending}
                      placeholder="your@email.com"
                      autoComplete="email"
                      className="w-full border-b border-(--border) bg-transparent py-3 text-(--charcoal) text-center focus:outline-none focus:border-(--gold) transition-colors disabled:opacity-60"
                    />
                    {state.status === "error" && state.message && (
                      <p className="text-xs text-red-700">{state.message}</p>
                    )}
                    <button
                      type="submit"
                      disabled={pending}
                      className="w-full bg-(--charcoal) text-(--warm-white) py-3 text-xs tracking-[0.3em] uppercase hover:bg-(--ink) transition-colors disabled:opacity-60"
                    >
                      {pending ? "Adding…" : "Subscribe"}
                    </button>
                    <p className="text-[0.6rem] tracking-[0.25em] uppercase text-(--smoke) pt-2">
                      No spam. Unsubscribe anytime.
                    </p>
                  </form>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function markSubscribed() {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ status: "subscribed", at: Date.now() }),
    );
  } catch {
    // Quota exceeded or storage unavailable — best effort.
  }
}
