"use client";

import Link from "next/link";
import Image from "next/image";
import { useActionState } from "react";
import { motion } from "framer-motion";
import { sendPasswordResetAction } from "@/lib/auth/actions";
import { initialResetRequestState } from "@/lib/auth/state";
import logo from "@/assets/images/orikaLogo.png";

export default function ForgotPasswordPage() {
  const [state, formAction, pending] = useActionState(
    sendPasswordResetAction,
    initialResetRequestState,
  );

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
            sizes="180px"
            priority
            className="h-12 w-auto mx-auto mb-6"
          />
          <h1 className="font-display text-4xl text-(--charcoal) mb-3">
            Reset your password
          </h1>
          <p className="text-xs tracking-[0.35em] uppercase text-(--smoke)">
            Admin Access
          </p>
        </div>

        {state.status === "success" ? (
          <div className="bg-(--warm-white) border border-(--border) p-10 text-center space-y-4">
            <p className="font-display text-2xl text-(--charcoal)">
              Check your inbox.
            </p>
            <p className="text-sm text-(--smoke) leading-relaxed">
              If that email belongs to an Orika admin account, a reset link is
              on its way. It expires shortly — please use it promptly.
            </p>
            <Link
              href="/admin/login"
              className="inline-block text-xs tracking-[0.3em] uppercase text-(--charcoal) hover:text-(--gold) transition-colors mt-6"
            >
              Back to sign in
            </Link>
          </div>
        ) : (
          <form
            action={formAction}
            className="bg-(--warm-white) border border-(--border) p-10 space-y-7"
          >
            <p className="text-sm text-(--smoke) leading-relaxed">
              Enter your admin email and we&apos;ll send you a secure link to
              set a new password.
            </p>

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
              {pending ? "Sending…" : "Send reset link"}
            </button>

            <div className="text-center">
              <Link
                href="/admin/login"
                className="text-xs tracking-[0.2em] uppercase text-(--smoke) hover:text-(--gold) transition-colors"
              >
                Back to sign in
              </Link>
            </div>
          </form>
        )}
      </motion.div>
    </main>
  );
}
