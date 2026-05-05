import "server-only";
import { send, APP_URL } from "../client";
import {
  baseEmail,
  heading,
  paragraph,
  ctaButton,
  goldDivider,
} from "./base";
import { generateUnsubscribeUrl } from "../tokens";

export async function sendNewsletterWelcome(email: string): Promise<void> {
  const unsubUrl = await generateUnsubscribeUrl(email);
  const html = baseEmail(
    `
    ${heading("You're on the list.", "Welcome")}
    ${paragraph("Thank you for subscribing to Orika Living. You'll be among the first to hear about new compositions, seasonal editions, and quiet launches from the studio.")}
    ${goldDivider()}
    ${paragraph("We send thoughtfully — not often. Expect something in your inbox once or twice a month, at most.")}
    ${ctaButton(`${APP_URL}/products`, "Explore the collection")}
  `,
    { unsubUrl },
  );

  await send({
    to: email,
    subject: "Welcome to Orika Living",
    html,
    text: `You're subscribed to Orika Living.\n\nWe send thoughtfully — once or twice a month, at most.\n\nExplore: ${APP_URL}/products\n\nUnsubscribe: ${unsubUrl}`,
    headers: {
      "List-Unsubscribe": `<${unsubUrl}>`,
      "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
    },
  });
}

export async function sendNewsletterCampaign(data: {
  email: string;
  subject: string;
  eyebrow?: string;
  title: string;
  bodyHtml: string; // pre-escaped/trusted HTML from admin composer
  bodyText: string;
  ctaHref?: string;
  ctaLabel?: string;
}): Promise<{ ok: boolean }> {
  const unsubUrl = await generateUnsubscribeUrl(data.email);
  const cta =
    data.ctaHref && data.ctaLabel ? ctaButton(data.ctaHref, data.ctaLabel) : "";
  const html = baseEmail(
    `
    ${heading(data.title, data.eyebrow)}
    <div style="color:#5A544C;font-size:14px;line-height:1.75;">${data.bodyHtml}</div>
    ${cta}
  `,
    { unsubUrl },
  );

  const res = await send({
    to: data.email,
    subject: data.subject,
    html,
    text: `${data.bodyText}\n\n${data.ctaHref ? data.ctaLabel + ": " + data.ctaHref + "\n\n" : ""}Unsubscribe: ${unsubUrl}`,
    headers: {
      "List-Unsubscribe": `<${unsubUrl}>`,
      "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
    },
  });
  return { ok: res.ok };
}
