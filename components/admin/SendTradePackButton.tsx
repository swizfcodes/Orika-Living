"use client";

import { useState, useTransition } from "react";
import { sendTradePackAction } from "@/lib/admin/enquiries";

interface Props {
  enquiryId: string;
  alreadySentAt: string | null;
}

export default function SendTradePackButton({ enquiryId, alreadySentAt }: Props) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [sentAt, setSentAt] = useState<string | null>(alreadySentAt);

  const label = sentAt
    ? `Resend trade pack · last sent ${new Date(sentAt).toLocaleDateString()}`
    : "Send trade pack";

  return (
    <div className="flex flex-col items-start gap-1">
      <button
        type="button"
        disabled={pending}
        onClick={() => {
          if (sentAt && !confirm("Already sent. Send the trade pack again?")) return;
          setError(null);
          startTransition(async () => {
            const res = await sendTradePackAction({ id: enquiryId });
            if (res.ok) {
              setSentAt(new Date().toISOString());
            } else {
              setError(res.error ?? "Could not send.");
            }
          });
        }}
        className={`text-[0.6rem] tracking-[0.3em] uppercase px-3 py-2 border transition-colors disabled:opacity-50 ${
          sentAt
            ? "border-(--border) text-(--smoke) hover:text-(--charcoal) hover:border-(--charcoal) bg-(--warm-white)"
            : "border-(--charcoal) text-(--warm-white) bg-(--charcoal) hover:bg-(--ink)"
        }`}
      >
        {pending ? "Sending…" : label}
      </button>
      {error && <p className="text-[0.65rem] text-red-600 max-w-xs">{error}</p>}
    </div>
  );
}
