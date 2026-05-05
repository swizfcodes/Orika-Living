"use client";

import { useTransition } from "react";
import { removeSubscriberAction } from "@/lib/newsletter/actions";

export default function RemoveSubscriberButton({ email }: { email: string }) {
  const [pending, startTransition] = useTransition();
  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        if (!confirm(`Remove ${email} from the list?`)) return;
        startTransition(() => {
          removeSubscriberAction(email);
        });
      }}
      className="text-[0.6rem] tracking-[0.25em] uppercase text-(--smoke) hover:text-red-600 disabled:opacity-50 transition-colors"
    >
      {pending ? "Removing…" : "Remove"}
    </button>
  );
}
