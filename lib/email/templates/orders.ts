import "server-only";
import { send, APP_URL } from "../client";
import {
  baseEmail,
  heading,
  paragraph,
  detailRow,
  detailTable,
  ctaButton,
  escapeHtml,
} from "./base";
import { fromKobo } from "@/lib/types";
import type { CartItem, OrderStatus } from "@/lib/types";

function renderItemsTable(items: CartItem[]): string {
  const rows = items
    .map(
      (item) => `
      <tr>
        <td style="padding:14px 0;border-bottom:1px solid #E6DFD1;">
          <p style="margin:0;color:#2B2620;font-size:13px;">${escapeHtml(item.name)}</p>
          <p style="margin:2px 0 0;color:#8E867A;font-size:11px;">${escapeHtml(item.format)} · ${item.size_ml}ml · ×${item.quantity}</p>
        </td>
        <td align="right" style="padding:14px 0;border-bottom:1px solid #E6DFD1;color:#2B2620;font-size:13px;vertical-align:top;">
          ${fromKobo(item.price_kobo * item.quantity)}
        </td>
      </tr>`,
    )
    .join("");
  return `<table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:12px 0 0;">${rows}</table>`;
}

export async function sendOrderConfirmation(data: {
  name: string;
  email: string;
  reference: string;
  totalKobo: number;
  items: CartItem[];
  deliveryCity: string;
  deliveryState: string;
}): Promise<void> {
  const html = baseEmail(`
    ${heading("Your order is confirmed.", "Thank you")}
    ${paragraph(`Hi ${escapeHtml(data.name.split(" ")[0] ?? data.name)}, thank you for your order. Each vessel is prepared by hand and dispatched from Lagos — we'll email you again the moment it's on its way.`)}
    ${detailTable(`
      ${detailRow("Reference", escapeHtml(data.reference))}
      ${detailRow("Delivering to", `${escapeHtml(data.deliveryCity)}, ${escapeHtml(data.deliveryState)}`)}
    `)}
    ${renderItemsTable(data.items)}
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:14px;">
      <tr>
        <td style="color:#8E867A;font-size:10px;letter-spacing:0.25em;text-transform:uppercase;">Total paid</td>
        <td align="right" style="color:#2B2620;font-size:18px;font-family:Georgia,'Times New Roman',serif;">${fromKobo(data.totalKobo)}</td>
      </tr>
    </table>
    ${ctaButton(`${APP_URL}/account/orders`, "View order")}
  `);

  await send({
    to: data.email,
    subject: `Order confirmed · ${data.reference} — Orika Living`,
    html,
    text: `Hi ${data.name}, thank you for your order.\n\nReference: ${data.reference}\nTotal: ${fromKobo(data.totalKobo)}\nDelivering to: ${data.deliveryCity}, ${data.deliveryState}\n\nView: ${APP_URL}/account/orders`,
  });
}

export async function sendOrderStatusEmail(data: {
  name: string;
  email: string;
  reference: string;
  status: OrderStatus;
  trackingNote?: string;
}): Promise<void> {
  const config: Record<
    OrderStatus,
    { eyebrow: string; title: string; body: string; subject: string }
  > = {
    pending: {
      eyebrow: "Awaiting payment",
      title: "Your order is awaiting payment.",
      body: "Complete the Paystack checkout to confirm your order.",
      subject: `Order awaiting payment · ${data.reference}`,
    },
    paid: {
      eyebrow: "Payment received",
      title: "Payment received.",
      body: "Your payment has cleared and your order is being prepared.",
      subject: `Payment received · ${data.reference}`,
    },
    processing: {
      eyebrow: "In preparation",
      title: "Your order is being prepared.",
      body: "Each vessel is hand-finished before it leaves our studio. We'll email again the moment it's handed to the courier.",
      subject: `Order in preparation · ${data.reference}`,
    },
    shipped: {
      eyebrow: "Dispatched",
      title: "Your order is on its way.",
      body: "Your Orika Living order has been handed to our courier. Expect delivery within 2–5 business days depending on location.",
      subject: `Dispatched · ${data.reference}`,
    },
    delivered: {
      eyebrow: "Delivered",
      title: "Your order has been delivered.",
      body: "We hope it finds its place quietly — thank you for choosing Orika Living.",
      subject: `Delivered · ${data.reference}`,
    },
    cancelled: {
      eyebrow: "Cancelled",
      title: "Your order has been cancelled.",
      body: "If this wasn't expected, please reply to this email and we'll look into it straight away.",
      subject: `Order cancelled · ${data.reference}`,
    },
  };

  const cfg = config[data.status];
  const html = baseEmail(`
    ${heading(cfg.title, cfg.eyebrow)}
    ${paragraph(`Hi ${escapeHtml(data.name.split(" ")[0] ?? data.name)}, ${cfg.body}`)}
    ${detailTable(`
      ${detailRow("Reference", escapeHtml(data.reference))}
      ${detailRow("Status", cfg.eyebrow)}
      ${data.trackingNote ? detailRow("Note", escapeHtml(data.trackingNote)) : ""}
    `)}
    ${ctaButton(`${APP_URL}/account/orders`, "View order")}
  `);

  await send({
    to: data.email,
    subject: `${cfg.subject} — Orika Living`,
    html,
    text: `Hi ${data.name}, ${cfg.body}\n\nReference: ${data.reference}\nStatus: ${cfg.eyebrow}\n${data.trackingNote ? "Note: " + data.trackingNote + "\n" : ""}View: ${APP_URL}/account/orders`,
  });
}
