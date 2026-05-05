"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAppDispatch, useAppSelector } from "@/lib/store";
import {
  clearCart,
  selectCartItems,
  selectCartTotal,
} from "@/lib/store/cartSlice";
import { fromKobo } from "@/lib/types";
import { createOrderAction } from "@/lib/checkout/actions";
import FadeIn from "@/components/motion/FadeIn";

type FieldErrors = Partial<
  Record<"full_name" | "phone" | "email" | "street" | "city" | "state", string>
>;

export default function CheckoutPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const items = useAppSelector(selectCartItems);
  const total = useAppSelector(selectCartTotal);

  const [pending, startTransition] = useTransition();
  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  const checkoutItems = useMemo(
    () => items.map((i) => ({ product_id: i.product_id, quantity: i.quantity })),
    [items],
  );

  if (items.length === 0) {
    return (
      <section className="min-h-[60vh] flex items-center justify-center px-6 py-24">
        <div className="text-center max-w-md">
          <p className="text-[0.7rem] tracking-[0.35em] uppercase text-(--smoke) mb-4">
            Checkout
          </p>
          <h1 className="font-display text-4xl text-(--charcoal) mb-4">
            Your cart is empty
          </h1>
          <p className="text-sm text-(--smoke) mb-8">
            Add a piece to begin your Orika ritual.
          </p>
          <Link
            href="/products"
            className="inline-block bg-(--charcoal) text-(--warm-white) px-10 py-4 text-xs tracking-[0.3em] uppercase hover:bg-(--ink)"
          >
            Browse Collection
          </Link>
        </div>
      </section>
    );
  }

  const onSubmit = (formData: FormData) => {
    setFormError(null);
    setFieldErrors({});

    const address = {
      full_name: String(formData.get("full_name") ?? "").trim(),
      phone: String(formData.get("phone") ?? "").trim(),
      email: String(formData.get("email") ?? "").trim(),
      street: String(formData.get("street") ?? "").trim(),
      city: String(formData.get("city") ?? "").trim(),
      state: String(formData.get("state") ?? "").trim(),
    };

    const errors: FieldErrors = {};
    if (address.full_name.length < 2) errors.full_name = "Required";
    if (address.phone.length < 10) errors.phone = "Enter a valid phone";
    if (!/^\S+@\S+\.\S+$/.test(address.email)) errors.email = "Enter a valid email";
    if (address.street.length < 5) errors.street = "Required";
    if (address.city.length < 2) errors.city = "Required";
    if (address.state.length < 2) errors.state = "Required";
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    startTransition(async () => {
      const result = await createOrderAction({
        delivery_address: address,
        items: checkoutItems,
      });

      if (!result.ok) {
        setFormError(result.error);
        return;
      }

      const publicKey = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY;
      if (!publicKey) {
        setFormError("Payment is not configured. Please contact us.");
        return;
      }

      // Dynamic import — @paystack/inline-js references window at module
      // init, so importing it at top-level crashes Next's server render.
      const { default: PaystackPop } = await import("@paystack/inline-js");
      const paystack = new PaystackPop();
      paystack.newTransaction({
        key: publicKey,
        email: result.email,
        amount: result.amount_kobo,
        reference: result.reference,
        currency: "NGN",
        onSuccess: async ({ reference }) => {
          try {
            const res = await fetch(
              `/api/paystack/verify?reference=${encodeURIComponent(reference)}`,
              { cache: "no-store" },
            );
            const body = (await res.json()) as { ok: boolean };
            if (body.ok) {
              dispatch(clearCart());
              router.push(`/orders/${result.order_id}?ref=${reference}`);
            } else {
              router.push(`/orders/${result.order_id}?ref=${reference}&pending=1`);
            }
          } catch {
            router.push(`/orders/${result.order_id}?ref=${reference}&pending=1`);
          }
        },
        onCancel: () => {
          setFormError("Payment was cancelled. You can retry whenever you're ready.");
        },
      });
    });
  };

  return (
    <section className="max-w-6xl mx-auto px-6 lg:px-10 py-14 md:py-20">
      <FadeIn>
        <div className="mb-12 text-center">
          <p className="text-[0.7rem] tracking-[0.4em] uppercase text-(--smoke) mb-3">
            Checkout
          </p>
          <h1 className="font-display text-4xl md:text-5xl text-(--charcoal)">
            A few details, and your pieces are on the way.
          </h1>
        </div>
      </FadeIn>

      <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-12 lg:gap-16 items-start">
        <form action={onSubmit} className="space-y-8">
          <div>
            <p className="text-[0.65rem] tracking-[0.35em] uppercase text-(--smoke) mb-6">
              Contact
            </p>
            <Field
              name="full_name"
              label="Full name"
              error={fieldErrors.full_name}
              disabled={pending}
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-6">
              <Field
                name="email"
                label="Email"
                type="email"
                autoComplete="email"
                error={fieldErrors.email}
                disabled={pending}
              />
              <Field
                name="phone"
                label="Phone"
                type="tel"
                autoComplete="tel"
                error={fieldErrors.phone}
                disabled={pending}
              />
            </div>
          </div>

          <div className="pt-8 border-t border-(--border)">
            <p className="text-[0.65rem] tracking-[0.35em] uppercase text-(--smoke) mb-6">
              Delivery
            </p>
            <Field
              name="street"
              label="Street address"
              autoComplete="street-address"
              error={fieldErrors.street}
              disabled={pending}
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-6">
              <Field
                name="city"
                label="City"
                autoComplete="address-level2"
                error={fieldErrors.city}
                disabled={pending}
              />
              <Field
                name="state"
                label="State"
                autoComplete="address-level1"
                error={fieldErrors.state}
                disabled={pending}
              />
            </div>
          </div>

          {formError && (
            <p
              role="alert"
              className="text-sm text-red-800 bg-red-50 border border-red-100 px-4 py-3"
            >
              {formError}
            </p>
          )}

          <button
            type="submit"
            disabled={pending}
            className="w-full bg-(--charcoal) text-(--warm-white) py-4 text-xs tracking-[0.3em] uppercase hover:bg-(--ink) transition-colors disabled:opacity-60"
          >
            {pending ? "Preparing payment…" : `Pay ${fromKobo(total)}`}
          </button>

          <p className="text-xs text-(--smoke) leading-relaxed">
            Payments are processed securely by Paystack. Orika Living does not
            store card details.
          </p>
        </form>

        <aside className="bg-(--linen) p-8 lg:p-10">
          <p className="text-[0.65rem] tracking-[0.35em] uppercase text-(--smoke) mb-6">
            Order Summary
          </p>
          <ul className="space-y-5">
            {items.map((item) => (
              <li key={item.product_id} className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="font-display text-lg text-(--charcoal) leading-tight">
                    {item.name}
                  </p>
                  <p className="text-[0.65rem] tracking-[0.3em] uppercase text-(--smoke) mt-1">
                    {item.format} · {item.size_ml}ml · ×{item.quantity}
                  </p>
                </div>
                <p className="text-sm text-(--charcoal) shrink-0">
                  {fromKobo(item.price_kobo * item.quantity)}
                </p>
              </li>
            ))}
          </ul>

          <div className="border-t border-(--border) mt-8 pt-6 space-y-3">
            <Row label="Subtotal" value={fromKobo(total)} />
            <Row label="Delivery" value="Calculated with you" muted />
            <div className="flex items-center justify-between pt-3 border-t border-(--border)">
              <p className="text-[0.65rem] tracking-[0.35em] uppercase text-(--smoke)">
                Total
              </p>
              <p className="font-display text-2xl text-(--charcoal)">
                {fromKobo(total)}
              </p>
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}

interface FieldProps {
  name: string;
  label: string;
  type?: string;
  autoComplete?: string;
  error?: string;
  disabled?: boolean;
}

function Field({
  name,
  label,
  type = "text",
  autoComplete,
  error,
  disabled,
}: FieldProps) {
  return (
    <div>
      <label
        htmlFor={name}
        className="block text-[0.65rem] tracking-[0.3em] uppercase text-(--smoke) mb-2"
      >
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        autoComplete={autoComplete}
        disabled={disabled}
        className={`w-full border-b bg-transparent py-2 text-(--charcoal) focus:outline-none transition-colors disabled:opacity-60 ${
          error ? "border-red-400" : "border-(--border) focus:border-(--gold)"
        }`}
      />
      {error && <p className="mt-2 text-xs text-red-700">{error}</p>}
    </div>
  );
}

function Row({
  label,
  value,
  muted,
}: {
  label: string;
  value: string;
  muted?: boolean;
}) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-(--smoke)">{label}</span>
      <span className={muted ? "text-(--smoke)" : "text-(--charcoal)"}>{value}</span>
    </div>
  );
}
