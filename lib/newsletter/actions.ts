"use server";

import { z } from "zod";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { assertAdmin } from "@/lib/admin/auth";
import { checkRateLimit, getClientIp } from "@/lib/ratelimit";
import {
  sendNewsletterWelcome,
  sendNewsletterCampaign,
} from "@/lib/email/templates/newsletter";
import type {
  SubscribeFormState,
  CampaignFormState,
} from "@/lib/newsletter/state";

// ── Public subscribe ──────────────────────────────────────────────────────────

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
      email: String(formData.get("email") ?? "").trim().toLowerCase(),
      source: String(formData.get("source") ?? "footer"),
    });
    if (!parsed.success) {
      return {
        status: "error",
        message: parsed.error.issues[0]?.message ?? "Invalid email.",
      };
    }

    // Rate-limit by email AND IP — separate buckets so neither dimension
    // alone can be used to drown the limiter. Wrapped in try/catch so a
    // missing migration or transient Supabase outage fails open instead
    // of breaking the subscribe flow entirely.
    let allowed = true;
    try {
      const ip = getClientIp(await headers());
      const [emailRl, ipRl] = await Promise.all([
        checkRateLimit("newsletter-subscribe", `email:${parsed.data.email}`, 5, 3600),
        checkRateLimit("newsletter-subscribe", `ip:${ip}`, 20, 3600),
      ]);
      allowed = emailRl.allowed && ipRl.allowed;
    } catch (err) {
      console.error("[subscribeAction] ratelimit check failed:", err);
    }
    if (!allowed) {
      return {
        status: "error",
        message: "Too many requests. Please try again shortly.",
      };
    }

    const supabase = createAdminClient();
    // Upsert so re-subscribing after an unsubscribe clears the unsubscribed_at.
    const { error } = await supabase
      .from("newsletter_subscribers")
      .upsert(
        {
          email: parsed.data.email,
          source: parsed.data.source,
          subscribed_at: new Date().toISOString(),
          unsubscribed_at: null,
        },
        { onConflict: "email" },
      );

    if (error) {
      console.error("[subscribeAction] upsert failed:", error);
      return {
        status: "error",
        message: "Could not subscribe right now. Please try again.",
      };
    }

    await sendNewsletterWelcome(parsed.data.email).catch((err) => {
      console.error("[subscribeAction] welcome email failed:", err);
    });

    return {
      status: "success",
      message: "You're on the list — check your inbox.",
    };
  } catch (err) {
    // Last-resort guard: any unhandled throw becomes a clean form error
    // instead of a Vercel 500 page.
    console.error("[subscribeAction] unexpected error:", err);
    return {
      status: "error",
      message: "Something went wrong. Please try again.",
    };
  }
}

// ── Admin: send a campaign ────────────────────────────────────────────────────

const campaignSchema = z.object({
  subject: z.string().min(3).max(140),
  eyebrow: z.string().max(60).optional().or(z.literal("")),
  title: z.string().min(3).max(140),
  bodyHtml: z.string().min(10),
  bodyText: z.string().min(10),
  ctaHref: z.string().url().optional().or(z.literal("")),
  ctaLabel: z.string().max(40).optional().or(z.literal("")),
});

export async function sendCampaignAction(
  _prev: CampaignFormState,
  formData: FormData,
): Promise<CampaignFormState> {
  try {
    await assertAdmin();
  } catch {
    return { status: "error", message: "Unauthorised." };
  }

  const parsed = campaignSchema.safeParse({
    subject: String(formData.get("subject") ?? "").trim(),
    eyebrow: String(formData.get("eyebrow") ?? "").trim(),
    title: String(formData.get("title") ?? "").trim(),
    bodyHtml: String(formData.get("body_html") ?? ""),
    bodyText: String(formData.get("body_text") ?? ""),
    ctaHref: String(formData.get("cta_href") ?? "").trim(),
    ctaLabel: String(formData.get("cta_label") ?? "").trim(),
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: parsed.error.issues[0]?.message ?? "Please check the form.",
    };
  }

  const admin = createAdminClient();
  const { data: subs, error: listError } = await admin
    .from("newsletter_subscribers")
    .select("email")
    .is("unsubscribed_at", null);

  if (listError) {
    return { status: "error", message: "Could not load subscribers." };
  }

  const recipients = (subs ?? []).map((r) => r.email as string);
  if (recipients.length === 0) {
    return { status: "error", message: "No active subscribers." };
  }

  const { data: { user } } = await (await createClient()).auth.getUser();

  const { data: campaign, error: campaignError } = await admin
    .from("newsletter_campaigns")
    .insert({
      subject: parsed.data.subject,
      eyebrow: parsed.data.eyebrow || null,
      title: parsed.data.title,
      body_html: parsed.data.bodyHtml,
      body_text: parsed.data.bodyText,
      cta_href: parsed.data.ctaHref || null,
      cta_label: parsed.data.ctaLabel || null,
      sent_by: user?.id ?? null,
      recipient_count: 0,
    })
    .select("id")
    .single();

  if (campaignError || !campaign) {
    return { status: "error", message: "Could not record campaign." };
  }

  let delivered = 0;
  for (const email of recipients) {
    const res = await sendNewsletterCampaign({
      email,
      subject: parsed.data.subject,
      eyebrow: parsed.data.eyebrow || undefined,
      title: parsed.data.title,
      bodyHtml: parsed.data.bodyHtml,
      bodyText: parsed.data.bodyText,
      ctaHref: parsed.data.ctaHref || undefined,
      ctaLabel: parsed.data.ctaLabel || undefined,
    });
    if (res.ok) delivered++;
  }

  await admin
    .from("newsletter_campaigns")
    .update({
      sent_at: new Date().toISOString(),
      recipient_count: delivered,
    })
    .eq("id", campaign.id);

  revalidatePath("/admin/newsletter");
  return {
    status: "success",
    message: `Sent to ${delivered} of ${recipients.length} subscribers.`,
    recipientCount: delivered,
  };
}

export async function removeSubscriberAction(email: string) {
  try {
    await assertAdmin();
  } catch {
    return { ok: false as const };
  }
  const admin = createAdminClient();
  await admin.from("newsletter_subscribers").delete().eq("email", email);
  revalidatePath("/admin/newsletter");
  return { ok: true as const };
}
