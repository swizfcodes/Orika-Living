"use client";

import Link from "next/link";
import Image from "next/image";
import { useActionState, useState } from "react";
import { motion } from "framer-motion";
import { signInAction } from "@/lib/auth/actions";
import { initialLoginState } from "@/lib/auth/state";
import logo from "@/assets/images/orikaLogo.png";

export default function AdminLoginPage() {
  const [state, formAction, pending] = useActionState(
    signInAction,
    initialLoginState,
  );
  const [showPassword, setShowPassword] = useState(false);

  return (
    <main className="min-h-screen bg-(--linen) flex items-center justify-center px-6 py-16">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-10">
          <Image
            src={logo}
            alt="Orika Living"
            sizes="220px"
            priority
            className="h-16 w-auto mx-auto mb-4"
          />
          <p className="text-xs tracking-[0.35em] uppercase text-(--smoke)">
            Admin Access
          </p>
        </div>

        <form
          action={formAction}
          className="bg-(--warm-white) border border-(--border) p-10 space-y-7"
        >
          <div>
            <label
              htmlFor="email"
              className="block text-[0.7rem] tracking-[0.25em] uppercase text-(--smoke) mb-2"
            >
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              disabled={pending}
              className="w-full border-b border-(--border) bg-transparent py-2 text-(--charcoal) focus:outline-none focus:border-(--gold) transition-colors disabled:opacity-60"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label
                htmlFor="password"
                className="block text-[0.7rem] tracking-[0.25em] uppercase text-(--smoke)"
              >
                Password
              </label>
              <Link
                href="/admin/forgot-password"
                className="text-[0.7rem] tracking-[0.2em] uppercase text-(--smoke) hover:text-(--gold) transition-colors"
              >
                Forgot?
              </Link>
            </div>
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                required
                minLength={8}
                disabled={pending}
                className="w-full border-b border-(--border) bg-transparent py-2 pr-10 text-(--charcoal) focus:outline-none focus:border-(--gold) transition-colors disabled:opacity-60"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                aria-pressed={showPassword}
                className="absolute right-0 top-1/2 -translate-y-1/2 p-2 text-(--smoke) hover:text-(--charcoal) transition-colors"
              >
                {showPassword ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            </div>
          </div>

          {state.status === "error" && (
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
            className="w-full bg-(--charcoal) text-(--warm-white) py-3 text-xs tracking-[0.3em] uppercase hover:bg-(--ink) disabled:opacity-60 transition-colors"
          >
            {pending ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <p className="text-center text-xs tracking-[0.2em] uppercase text-(--smoke) mt-8">
          Rooted in Nature
        </p>
      </motion.div>
    </main>
  );
}

function EyeIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M17.94 17.94A10.94 10.94 0 0 1 12 19c-6.5 0-10-7-10-7a19.77 19.77 0 0 1 4.22-5.31" />
      <path d="M9.9 4.24A10.94 10.94 0 0 1 12 4c6.5 0 10 7 10 7a19.8 19.8 0 0 1-2.13 3.19" />
      <path d="M14.12 14.12A3 3 0 1 1 9.88 9.88" />
      <line x1="2" y1="2" x2="22" y2="22" />
    </svg>
  );
}
