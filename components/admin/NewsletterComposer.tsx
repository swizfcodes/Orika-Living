"use client";

import { useActionState } from "react";
import {
  sendCampaignAction,
  initialCampaignState,
} from "@/lib/newsletter/actions";

interface Props {
  activeCount: number;
}

export default function NewsletterComposer({ activeCount }: Props) {
  const [state, formAction, pending] = useActionState(
    sendCampaignAction,
    initialCampaignState,
  );

  const label =
    "block text-[0.65rem] tracking-[0.3em] uppercase mb-2 text-(--smoke)";
  const input =
    "w-full border-b border-(--border) bg-transparent py-2 focus:outline-none focus:border-(--charcoal) transition-colors disabled:opacity-60";

  return (
    <form action={formAction} className="space-y-6">
      <div>
        <label htmlFor="subject" className={label}>
          Email subject
        </label>
        <input
          id="subject"
          name="subject"
          required
          maxLength={140}
          disabled={pending}
          className={input}
          placeholder="A quiet launch from the studio"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[160px_1fr] gap-6">
        <div>
          <label htmlFor="eyebrow" className={label}>
            Eyebrow
          </label>
          <input
            id="eyebrow"
            name="eyebrow"
            maxLength={60}
            disabled={pending}
            className={input}
            placeholder="Introducing"
          />
        </div>
        <div>
          <label htmlFor="title" className={label}>
            Headline
          </label>
          <input
            id="title"
            name="title"
            required
            maxLength={140}
            disabled={pending}
            className={input}
            placeholder="Orika Rouge, in a new vessel"
          />
        </div>
      </div>

      <div>
        <label htmlFor="body_html" className={label}>
          Body (HTML allowed)
        </label>
        <textarea
          id="body_html"
          name="body_html"
          required
          rows={8}
          disabled={pending}
          className={`${input} resize-y font-mono text-sm`}
          placeholder="<p>Dear friend,</p><p>…</p>"
        />
      </div>

      <div>
        <label htmlFor="body_text" className={label}>
          Plain text fallback
        </label>
        <textarea
          id="body_text"
          name="body_text"
          required
          rows={4}
          disabled={pending}
          className={`${input} resize-y`}
          placeholder="The plain-text version of the body for clients that strip HTML."
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="cta_label" className={label}>
            CTA label (optional)
          </label>
          <input
            id="cta_label"
            name="cta_label"
            maxLength={40}
            disabled={pending}
            className={input}
            placeholder="Discover Orika Rouge"
          />
        </div>
        <div>
          <label htmlFor="cta_href" className={label}>
            CTA link (optional)
          </label>
          <input
            id="cta_href"
            name="cta_href"
            type="url"
            disabled={pending}
            className={input}
            placeholder="https://orikaliving.com/products/orika-rouge"
          />
        </div>
      </div>

      <div className="pt-6 border-t border-(--border) flex flex-wrap items-center justify-between gap-4">
        <p className="text-xs text-(--smoke)">
          Sending to{" "}
          <span className="text-(--charcoal) font-medium">
            {activeCount} active subscriber{activeCount === 1 ? "" : "s"}
          </span>
          . This cannot be undone.
        </p>
        <button
          type="submit"
          disabled={pending || activeCount === 0}
          className="bg-(--charcoal) text-(--warm-white) px-8 py-3 text-xs tracking-[0.3em] uppercase disabled:opacity-50 hover:bg-(--ink) transition-colors"
        >
          {pending ? "Sending…" : "Send campaign"}
        </button>
      </div>

      {state.status === "success" && state.message && (
        <p className="text-sm text-green-700">{state.message}</p>
      )}
      {state.status === "error" && state.message && (
        <p className="text-sm text-red-600">{state.message}</p>
      )}
    </form>
  );
}
