"use client";

import { useState } from "react";

interface Props {
  label: string;
  name: string;
  defaultValue: string;
  hint?: string;
}

// Native colour-picker swatch + hex input. Synced via local state so the
// preview reflects edits to the text field and vice-versa.
export default function ColorField({ label, name, defaultValue, hint }: Props) {
  const [value, setValue] = useState(defaultValue);
  const isValidHex = /^#[0-9a-fA-F]{6}$/.test(value);
  return (
    <div className="block">
      <span className="block text-[0.6rem] tracking-[0.35em] uppercase text-(--smoke) mb-2">
        {label}
      </span>
      <div className="flex items-stretch border border-(--border) bg-(--warm-white) focus-within:border-(--gold)">
        <label
          className="relative w-16 shrink-0 cursor-pointer border-r border-(--border)"
          style={{ backgroundColor: isValidHex ? value : "transparent" }}
          aria-label={`${label} colour picker`}
        >
          <input
            type="color"
            value={isValidHex ? value : "#000000"}
            onChange={(e) => setValue(e.target.value)}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
        </label>
        <input
          name={name}
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          pattern="^#[0-9a-fA-F]{6}$"
          required
          spellCheck={false}
          className="flex-1 px-4 py-3 text-sm text-(--charcoal) bg-transparent focus:outline-none font-mono"
        />
      </div>
      {hint && <span className="block text-xs text-(--smoke) mt-1">{hint}</span>}
    </div>
  );
}
