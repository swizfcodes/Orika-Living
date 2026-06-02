"use client";

import { useActionState, useEffect } from "react";
import { subscribeAction } from "@/lib/newsletter/actions";
import { initialSubscribeState } from "@/lib/newsletter/state";
import { markNewsletterSubscribed } from "@/lib/newsletter/suppression";

interface Props {
  source?: string;
  tone?: "light" | "dark";
}

export default function NewsletterForm({
  source = "footer",
  tone = "dark",
}: Props) {
  const [state, formAction, pending] = useActionState(
    subscribeAction,
    initialSubscribeState,
  );
  const isDark = tone === "dark";

  // Subscribing via the footer should also stop the popup on this device —
  // otherwise a footer subscriber keeps getting nagged by the popup.
  useEffect(() => {
    if (state.status === "success") markNewsletterSubscribed();
  }, [state.status]);

  if (state.status === "success") {
    return (
      <p
        className={`text-xs leading-relaxed ${
          isDark ? "text-white/80" : "text-(--smoke)"
        }`}
      >
        {state.message}
      </p>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <input type="hidden" name="source" value={source} />
      <div
        className={`flex items-center border-b transition-colors ${
          isDark
            ? "border-white/30 focus-within:border-(--gold-light)"
            : "border-(--border) focus-within:border-(--charcoal)"
        }`}
      >
        <input
          type="email"
          name="email"
          required
          placeholder="Your email"
          disabled={pending}
          className={`flex-1 bg-transparent py-2 text-sm focus:outline-none disabled:opacity-60 ${
            isDark
              ? "text-white placeholder:text-white/40"
              : "text-(--charcoal) placeholder:text-(--smoke)"
          }`}
        />
        <button
          type="submit"
          disabled={pending}
          className={`text-[0.6rem] tracking-[0.3em] uppercase px-3 py-2 disabled:opacity-50 transition-colors ${
            isDark
              ? "text-(--gold-light) hover:text-white"
              : "text-(--gold) hover:text-(--charcoal)"
          }`}
        >
          {pending ? "…" : "Subscribe"}
        </button>
      </div>
      {state.status === "error" && state.message && (
        <p className={`text-xs ${isDark ? "text-red-300" : "text-red-600"}`}>
          {state.message}
        </p>
      )}
      <p
        className={`text-[0.6rem] leading-relaxed ${
          isDark ? "opacity-50" : "text-(--smoke)"
        }`}
      >
        Sent thoughtfully — once or twice a month. Unsubscribe any time.
      </p>
    </form>
  );
}
