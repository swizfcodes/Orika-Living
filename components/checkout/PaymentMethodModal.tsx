"use client";

import { AnimatePresence, motion } from "framer-motion";
import type { PaymentMethod } from "@/lib/types";
import { fromKobo } from "@/lib/types";

// Optimus Pay is exposed only when explicitly enabled, so the bank's
// virtual-account service can be toggled without a redeploy. Paystack
// is always available.
const OPTIMUS_ENABLED =
  process.env.NEXT_PUBLIC_OPTIMUS_ENABLED === "true";

interface PaymentMethodModalProps {
  open: boolean;
  total: number;
  pending: boolean;
  // The method currently being initialised (so we can show a spinner on
  // the chosen card), or null when idle.
  pendingMethod: PaymentMethod | null;
  onSelect: (method: PaymentMethod) => void;
  onClose: () => void;
}

export default function PaymentMethodModal({
  open,
  total,
  pending,
  pendingMethod,
  onSelect,
  onClose,
}: PaymentMethodModalProps) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="pm-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={() => !pending && onClose()}
            className="fixed inset-0 z-50 bg-black/40"
            aria-hidden="true"
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center px-6 pointer-events-none">
            <motion.div
              key="pm-dialog"
              initial={{ opacity: 0, y: 24, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 24, scale: 0.98 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              role="dialog"
              aria-modal="true"
              aria-label="Choose a payment method"
              className="pointer-events-auto w-full max-w-md bg-(--warm-white) shadow-xl"
            >
              <div className="flex items-center justify-between px-8 pt-7 pb-5 border-b border-(--border)">
                <div>
                  <p className="text-[0.6rem] tracking-[0.35em] uppercase text-(--smoke) mb-1">
                    Payment
                  </p>
                  <p className="font-display text-2xl text-(--charcoal)">
                    Choose how to pay
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => !pending && onClose()}
                  disabled={pending}
                  className="text-(--smoke) hover:text-(--charcoal) transition-colors disabled:opacity-40"
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
              </div>

              <div className="px-8 py-6 space-y-4">
                <MethodCard
                  title="Pay with card"
                  subtitle="Card, bank or USSD · secured by Paystack"
                  loading={pending && pendingMethod === "paystack"}
                  disabled={pending}
                  onClick={() => onSelect("paystack")}
                />

                {OPTIMUS_ENABLED && (
                  <MethodCard
                    title="Bank transfer"
                    subtitle="Get an account number · powered by Optimus Pay"
                    loading={pending && pendingMethod === "optimus_pay"}
                    disabled={pending}
                    onClick={() => onSelect("optimus_pay")}
                  />
                )}
              </div>

              <div className="px-8 pb-7 pt-1 flex items-center justify-between border-t border-(--border)">
                <span className="text-[0.65rem] tracking-[0.35em] uppercase text-(--smoke)">
                  Total
                </span>
                <span className="font-display text-2xl text-(--charcoal)">
                  {fromKobo(total)}
                </span>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}

interface MethodCardProps {
  title: string;
  subtitle: string;
  loading: boolean;
  disabled: boolean;
  onClick: () => void;
}

function MethodCard({
  title,
  subtitle,
  loading,
  disabled,
  onClick,
}: MethodCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="w-full text-left border border-(--border) px-6 py-5 flex items-center justify-between gap-4 hover:border-(--gold) transition-colors disabled:opacity-60 disabled:hover:border-(--border)"
    >
      <span className="min-w-0">
        <span className="block text-sm tracking-[0.1em] uppercase text-(--charcoal)">
          {title}
        </span>
        <span className="block text-xs text-(--smoke) mt-1">{subtitle}</span>
      </span>
      <span className="shrink-0 text-(--smoke)" aria-hidden="true">
        {loading ? (
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            className="animate-spin"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M12 3a9 9 0 1 0 9 9" strokeLinecap="round" />
          </svg>
        ) : (
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="9 6 15 12 9 18" />
          </svg>
        )}
      </span>
    </button>
  );
}
