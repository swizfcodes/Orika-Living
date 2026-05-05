"use client";

import { useEffect, useState } from "react";

const LETTERS = ["O", "R", "I", "K", "A"];
const LETTER_STAGGER_MS = 180;
const LETTER_DURATION_MS = 600;
const HOLD_MS = 350;
const FADE_MS = 600;

const VISIBLE_MS =
  LETTERS.length * LETTER_STAGGER_MS + LETTER_DURATION_MS + HOLD_MS;

// Window-scoped flag: cleared by hard refresh, survives SPA navigation.
declare global {
  interface Window {
    __orikaLoaderShown?: boolean;
  }
}

type Phase = "showing" | "fading" | "gone";

export default function OrikaLoader() {
  // Default to "showing" so the server renders the loader covering the page
  // from the very first paint — no flash of homepage before the loader
  // appears. JS dismisses it after the animation finishes.
  const [phase, setPhase] = useState<Phase>("showing");

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Already shown this session (SPA nav back to home) — dismiss without
    // re-running the animation. There's a single-frame flash because SSR
    // renders the loader; that's a tolerable cost vs. losing the SSR-first
    // experience on the initial load.
    if (window.__orikaLoaderShown) {
      setPhase("gone");
      return;
    }

    // Set the flag only after the timer fires — handles dev strict-mode
    // double-mount cleanly (each mount sees flag still false, schedules
    // fresh timers; cleanup on unmount cancels the previous run).
    const fadeTimer = setTimeout(() => setPhase("fading"), VISIBLE_MS);
    const goneTimer = setTimeout(() => {
      window.__orikaLoaderShown = true;
      setPhase("gone");
    }, VISIBLE_MS + FADE_MS);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(goneTimer);
    };
  }, []);

  // Lock body scroll while the loader covers the page.
  useEffect(() => {
    if (phase === "gone") return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [phase]);

  if (phase === "gone") return null;

  return (
    <div
      className="fixed inset-0 z-[100] bg-(--linen) flex items-center justify-center"
      style={{
        opacity: phase === "fading" ? 0 : 1,
        transition: `opacity ${FADE_MS}ms ease-out`,
      }}
      aria-hidden="true"
    >
      <div className="flex font-display text-7xl md:text-9xl text-(--charcoal) tracking-[0.3em] pl-[0.3em]">
        {LETTERS.map((letter, i) => (
          <span
            key={letter}
            style={{
              opacity: 0,
              transform: "translateY(30px)",
              animation: `orika-letter-reveal ${LETTER_DURATION_MS}ms cubic-bezier(0.22, 1, 0.36, 1) ${i * LETTER_STAGGER_MS}ms forwards`,
            }}
          >
            {letter}
          </span>
        ))}
      </div>
      <style>{`
        @keyframes orika-letter-reveal {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
