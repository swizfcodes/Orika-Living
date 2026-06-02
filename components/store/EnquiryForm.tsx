"use client";

import { useActionState } from "react";
import type { EnquiryType } from "@/lib/types";
import { submitEnquiryAction } from "@/lib/enquiries/actions";
import { initialEnquiryState } from "@/lib/enquiries/state";

const enquiryTypes: EnquiryType[] = [
  "Retail / Stockist Partnership",
  "Bulk / Wholesale Order",
  "Corporate Gifting",
  "Hotel / Hospitality Placement",
  "Event Setup",
  "General Enquiry",
];

interface Props {
  defaultType?: EnquiryType;
  hideTypeSelect?: boolean;
  tone?: "light" | "dark";
}

export default function EnquiryForm({
  defaultType = "General Enquiry",
  hideTypeSelect = false,
  tone = "light",
}: Props) {
  const [state, formAction, pending] = useActionState(
    submitEnquiryAction,
    initialEnquiryState,
  );

  const isDark = tone === "dark";
  const label = `block text-[0.65rem] tracking-[0.3em] uppercase mb-2 ${
    isDark ? "text-white/60" : "text-(--smoke)"
  }`;
  const input = `w-full border-b bg-transparent py-2 focus:outline-none transition-colors disabled:opacity-60 ${
    isDark
      ? "border-white/30 text-(--warm-white) focus:border-(--gold-light)"
      : "border-(--border) text-(--charcoal) focus:border-(--gold)"
  }`;

  if (state.status === "success") {
    return (
      <div
        className={`p-10 text-center ${
          isDark
            ? "bg-white/5 border border-white/10 text-(--warm-white)"
            : "bg-(--linen)"
        }`}
        role="status"
      >
        <p
          className={`text-[0.65rem] tracking-[0.35em] uppercase mb-4 ${
            isDark ? "text-white/60" : "text-(--smoke)"
          }`}
        >
          Received
        </p>
        <p className="font-display text-3xl leading-tight mb-3">Thank you.</p>
        <p className={`text-sm ${isDark ? "opacity-80" : "text-(--smoke)"}`}>
          {state.message}
        </p>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <FieldWrapper
          label="Name"
          error={state.fieldErrors?.name}
          labelClass={label}
        >
          <input
            name="name"
            type="text"
            autoComplete="name"
            required
            minLength={2}
            disabled={pending}
            className={input}
          />
        </FieldWrapper>
        <FieldWrapper
          label="Email"
          error={state.fieldErrors?.email}
          labelClass={label}
        >
          <input
            name="email"
            type="email"
            autoComplete="email"
            required
            disabled={pending}
            className={input}
          />
        </FieldWrapper>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <FieldWrapper
          label="Phone"
          error={state.fieldErrors?.phone}
          labelClass={label}
        >
          <input
            name="phone"
            type="tel"
            autoComplete="tel"
            required
            minLength={10}
            disabled={pending}
            className={input}
          />
        </FieldWrapper>

        {hideTypeSelect ? (
          <input type="hidden" name="type" value={defaultType} />
        ) : (
          <FieldWrapper
            label="Enquiry Type"
            error={state.fieldErrors?.type}
            labelClass={label}
          >
            <select
              name="type"
              defaultValue={defaultType}
              disabled={pending}
              className={`${input} appearance-none pr-8 ${
                isDark ? "[&>option]:text-(--charcoal)" : ""
              }`}
            >
              {enquiryTypes.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </FieldWrapper>
        )}
      </div>

      <FieldWrapper
        label="Message"
        error={state.fieldErrors?.message}
        labelClass={label}
      >
        <textarea
          name="message"
          rows={5}
          required
          minLength={10}
          disabled={pending}
          className={`${input} resize-none`}
        />
      </FieldWrapper>

      {state.status === "error" && !state.fieldErrors && (
        <p
          role="alert"
          className="text-sm text-red-800 bg-red-50 border border-red-100 px-4 py-3"
        >
          {state.message}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className={`w-full py-4 text-xs tracking-[0.3em] uppercase transition-colors disabled:opacity-60 ${
          isDark
            ? "bg-(--warm-white) text-(--charcoal) hover:bg-(--gold-light)"
            : "bg-(--charcoal) text-(--warm-white) hover:bg-(--ink)"
        }`}
      >
        {pending ? "Sending…" : "Send Enquiry"}
      </button>
    </form>
  );
}

function FieldWrapper({
  label,
  error,
  labelClass,
  children,
}: {
  label: string;
  error?: string;
  labelClass: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className={labelClass}>{label}</label>
      {children}
      {error && <p className="mt-2 text-xs text-red-700">{error}</p>}
    </div>
  );
}
