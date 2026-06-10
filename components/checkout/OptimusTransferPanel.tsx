"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { fromKobo } from "@/lib/types";

// How often we silently re-check whether the bank transfer has landed.
const POLL_INTERVAL_MS = 6000;

interface OptimusVerifyResponse {
  ok: boolean;
  order_id?: string;
  status?: string;
}

interface OptimusTransferPanelProps {
  open: boolean;
  orderId: string;
  transactionRef: string;
  virtualAccount: string;
  bankName: string;
  amountKobo: number;
  // Fired once the hub confirms the transfer (clears cart + redirects).
  onConfirmed: (orderId: string) => void;
  onClose: () => void;
}

export default function OptimusTransferPanel({
  open,
  orderId,
  transactionRef,
  virtualAccount,
  bankName,
  amountKobo,
  onConfirmed,
  onClose,
}: OptimusTransferPanelProps) {
  const [checking, setChecking] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [copied, setCopied] = useState(false);
  const [hint, setHint] = useState<string | null>(null);
  // Guards against double-firing onConfirmed (poll + manual click racing).
  const doneRef = useRef(false);

  const verify = useCallback(
    async (manual: boolean) => {
      if (doneRef.current) return;
      setChecking(true);
      if (manual) setHint(null);
      try {
        const res = await fetch(
          `/api/optimus/verify?transaction_ref=${encodeURIComponent(
            transactionRef,
          )}`,
          { cache: "no-store" },
        );
        const body = (await res.json()) as OptimusVerifyResponse;
        if (body.ok) {
          doneRef.current = true;
          setConfirmed(true);
          // Brief beat so the confirmed state is visible before redirect.
          setTimeout(() => onConfirmed(body.order_id ?? orderId), 900);
        } else if (manual) {
          setHint(
            "We haven't seen the transfer yet. Bank transfers can take a minute or two — we'll confirm automatically.",
          );
        }
      } catch {
        if (manual) {
          setHint("Couldn't check just now. Please try again in a moment.");
        }
      } finally {
        setChecking(false);
      }
    },
    [transactionRef, orderId, onConfirmed],
  );

  // Auto-poll while the panel is open and not yet confirmed.
  useEffect(() => {
    if (!open || confirmed) return;
    const id = setInterval(() => {
      void verify(false);
    }, POLL_INTERVAL_MS);
    return () => clearInterval(id);
  }, [open, confirmed, verify]);

  const copyAccount = async () => {
    try {
      await navigator.clipboard.writeText(virtualAccount);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // Clipboard unavailable (e.g. insecure context) — no-op; the
      // number is on screen for manual copy.
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="op-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-50 bg-black/40"
            aria-hidden="true"
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center px-6 py-10 overflow-y-auto pointer-events-none">
            <motion.div
              key="op-dialog"
              initial={{ opacity: 0, y: 24, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 24, scale: 0.98 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              role="dialog"
              aria-modal="true"
              aria-label="Complete your bank transfer"
              className="pointer-events-auto w-full max-w-md bg-(--warm-white) shadow-xl my-auto"
            >
              <div className="flex items-center justify-between px-8 pt-7 pb-5 border-b border-(--border)">
                <div>
                  <p className="text-[0.6rem] tracking-[0.35em] uppercase text-(--smoke) mb-1">
                    Bank transfer
                  </p>
                  <p className="font-display text-2xl text-(--charcoal)">
                    {confirmed ? "Payment received" : "Transfer to complete"}
                  </p>
                </div>
                {!confirmed && (
                  <button
                    type="button"
                    onClick={onClose}
                    className="text-(--smoke) hover:text-(--charcoal) transition-colors"
                    aria-label="Close"
                  >
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                    >
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                )}
              </div>

              {confirmed ? (
                <div className="px-8 py-12 text-center">
                  <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full border border-(--gold) text-(--gold)">
                    <svg
                      width="26"
                      height="26"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                  <p className="text-sm text-(--smoke)">
                    Confirmed. Taking you to your order…
                  </p>
                </div>
              ) : (
                <>
                  <div className="px-8 py-6 space-y-5">
                    <p className="text-sm text-(--smoke) leading-relaxed">
                      Transfer the exact amount below to this account from your
                      banking app. We&rsquo;ll confirm automatically the moment
                      it lands — this usually takes a minute or two.
                    </p>

                    <div className="border border-(--border) divide-y divide-(--border)">
                      <DetailRow label="Bank" value={bankName} />
                      <div className="flex items-center justify-between px-5 py-4">
                        <div className="min-w-0">
                          <p className="text-[0.6rem] tracking-[0.3em] uppercase text-(--smoke) mb-1">
                            Account number
                          </p>
                          <p className="font-mono text-lg text-(--charcoal) tracking-wide">
                            {virtualAccount}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={copyAccount}
                          className="shrink-0 text-[0.6rem] tracking-[0.3em] uppercase border border-(--border) px-3 py-2 text-(--charcoal) hover:border-(--gold) transition-colors"
                        >
                          {copied ? "Copied" : "Copy"}
                        </button>
                      </div>
                      <DetailRow label="Amount" value={fromKobo(amountKobo)} />
                    </div>

                    {hint && (
                      <p className="text-xs text-(--smoke) bg-(--linen) px-4 py-3 leading-relaxed">
                        {hint}
                      </p>
                    )}

                    <div className="flex items-center gap-2 text-xs text-(--smoke)">
                      <span className="relative flex h-2 w-2">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-(--gold) opacity-60" />
                        <span className="relative inline-flex h-2 w-2 rounded-full bg-(--gold)" />
                      </span>
                      Waiting for your transfer…
                    </div>
                  </div>

                  <div className="px-8 pb-7 pt-1 border-t border-(--border) space-y-3">
                    <button
                      type="button"
                      onClick={() => verify(true)}
                      disabled={checking}
                      className="w-full bg-(--charcoal) text-(--warm-white) py-4 text-xs tracking-[0.3em] uppercase hover:bg-(--ink) transition-colors disabled:opacity-60"
                    >
                      {checking ? "Checking…" : "I've sent the transfer"}
                    </button>
                    <p className="text-xs text-(--smoke) leading-relaxed text-center">
                      Keep this open until we confirm. You can also safely close
                      it — we&rsquo;ll email your receipt once payment settles.
                    </p>
                  </div>
                </>
              )}
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between px-5 py-4">
      <span className="text-[0.6rem] tracking-[0.3em] uppercase text-(--smoke)">
        {label}
      </span>
      <span className="text-sm text-(--charcoal)">{value}</span>
    </div>
  );
}
