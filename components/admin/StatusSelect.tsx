"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";

interface Props<T extends string> {
  value: T;
  options: readonly T[];
  onChange: (value: T) => Promise<{ ok: boolean; error?: string }>;
  label?: string;
}

export default function StatusSelect<T extends string>({
  value,
  options,
  onChange,
  label,
}: Props<T>) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <label className="inline-flex items-center gap-3">
      {label && (
        <span className="text-[0.6rem] tracking-[0.35em] uppercase text-(--smoke)">
          {label}
        </span>
      )}
      <select
        value={value}
        disabled={pending}
        onChange={(e) => {
          const next = e.target.value as T;
          startTransition(async () => {
            const result = await onChange(next);
            if (!result.ok) {
              alert(result.error ?? "Update failed.");
              return;
            }
            router.refresh();
          });
        }}
        className="bg-(--warm-white) border border-(--border) px-3 py-2 text-sm text-(--charcoal) capitalize focus:outline-none focus:border-(--gold) disabled:opacity-60"
      >
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </label>
  );
}
