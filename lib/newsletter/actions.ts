"use server";

import { z } from "zod";
import { apiPost } from "@/lib/api/client";
import type { SubscribeFormState } from "@/lib/newsletter/state";

// ─────────────────────────────────────────────────────────────
// lib/newsletter/actions.ts
//
// Public newsletter subscribe. Migrated from Supabase to the
// hub-system API (POST /api/store/newsletter/subscribe).
//
// What moved to the backend:
//   - rate limiting (was the Supabase `rate_limits` table; the hub
//     applies its own request limiting)
//   - the welcome email (the hub sends it via SMTP)
//   - the upsert into newsletter_subscribers
//
// What was REMOVED: sendCampaignAction and removeSubscriberAction.
// Those were storefront-admin functions — and the storefront admin
// has been discarded. Newsletter campaigns are now sent from the
// ERP. This file keeps only the public subscribe action.
// ─────────────────────────────────────────────────────────────

const subscribeSchema = z.object({
  email: z.string().email("Please enter a valid email."),
  source: z.string().max(40).default("footer"),
});

export async function subscribeAction(
  _prev: SubscribeFormState,
  formData: FormData,
): Promise<SubscribeFormState> {
  try {
    const parsed = subscribeSchema.safeParse({
      email: String(formData.get("email") ?? "")
        .trim()
        .toLowerCase(),
      source: String(formData.get("source") ?? "footer"),
    });
    if (!parsed.success) {
      return {
        status: "error",
        message: parsed.error.issues[0]?.message ?? "Invalid email.",
      };
    }

    await apiPost("/store/newsletter/subscribe", {
      email: parsed.data.email,
      source: parsed.data.source,
    });

    return {
      status: "success",
      message: "You're on the list — check your inbox.",
    };
  } catch (err) {
    // The hub returns 429 with a clear message when rate-limited.
    const message = err instanceof Error ? err.message : "";
    if (message.includes("429")) {
      return {
        status: "error",
        message: "Too many requests. Please try again shortly.",
      };
    }
    console.error("[subscribeAction] API call failed:", err);
    return {
      status: "error",
      message: "Could not subscribe right now. Please try again.",
    };
  }
}
