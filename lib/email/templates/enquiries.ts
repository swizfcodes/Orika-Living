import "server-only";
import { send, ADMIN_TO, APP_URL } from "../client";
import {
  baseEmail,
  heading,
  paragraph,
  detailRow,
  detailTable,
  ctaButton,
  goldDivider,
  quoteBlock,
  escapeHtml,
} from "./base";
import { FOUNDER } from "@/lib/constants/contact";
import type { EnquiryType } from "@/lib/types";

export async function notifyAdminEnquiry(data: {
  id?: string;
  name: string;
  email: string;
  phone: string;
  type: EnquiryType;
  message: string;
}): Promise<void> {
  if (!ADMIN_TO) return;
  const html = baseEmail(`
    ${heading(`New ${data.type}`, "New enquiry")}
    ${paragraph("An enquiry has just been submitted on orikaliving.com.")}
    ${detailTable(`
      ${detailRow("From", escapeHtml(data.name))}
      ${detailRow("Email", escapeHtml(data.email))}
      ${detailRow("Phone", escapeHtml(data.phone))}
      ${detailRow("Type", escapeHtml(data.type))}
    `)}
    ${quoteBlock("Message", escapeHtml(data.message).replace(/\n/g, "<br/>"))}
    ${ctaButton(`${APP_URL}/admin/enquiries`, "Open inbox")}
  `);

  await send({
    to: ADMIN_TO,
    replyTo: data.email,
    subject: `New enquiry · ${data.type} — ${data.name}`,
    html,
    text: `${data.type} from ${data.name} (${data.email}, ${data.phone})\n\n${data.message}\n\nInbox: ${APP_URL}/admin/enquiries`,
  });
}

export async function sendEnquiryConfirmation(data: {
  name: string;
  email: string;
  type: EnquiryType;
}): Promise<void> {
  const retail = data.type === "Retail / Stockist Partnership";
  const bodyCopy = retail
    ? "Thank you for your interest in stocking Orika Living. Our team will review your enquiry and be in touch within two business days with a trade pack, wholesale pricing and proposed next steps."
    : "We've received your enquiry and one of us will be in touch within two business days.";

  const html = baseEmail(`
    ${heading(`Thank you, ${escapeHtml(data.name.split(" ")[0] ?? data.name)}.`, "Enquiry received")}
    ${paragraph(bodyCopy)}
    ${goldDivider()}
    ${paragraph("In the meantime, you're welcome to continue exploring the collection.")}
    ${ctaButton(`${APP_URL}/products`, "View the collection")}
  `);

  await send({
    to: data.email,
    subject: "We've received your enquiry — Orika Living",
    html,
    text: `Hi ${data.name},\n\n${bodyCopy}\n\nIn the meantime: ${APP_URL}/products\n\n— Orika Living`,
  });
}

export async function sendTradePackEmail(data: {
  name: string;
  email: string;
  pdf: { filename: string; base64: string };
}): Promise<void> {
  const html = baseEmail(`
    ${heading("Your Orika Living trade pack.", "For retail partners")}
    ${paragraph(`Hi ${escapeHtml(data.name.split(" ")[0] ?? data.name)}, please find the Orika Living trade pack attached. It covers the brand, the portfolio, wholesale pricing, and the sell-through support we provide to retail partners.`)}
    ${paragraph("If anything needs clarification — volumes, exclusivity, launch timing — reply directly to this email and we'll set up a call.")}
    ${goldDivider()}
    <p style="margin:0;color:#8E867A;font-size:12px;line-height:1.7;">
      ${FOUNDER.name} · ${FOUNDER.role}<br/>
      <a href="mailto:${FOUNDER.email}" style="color:#D4AE5A;text-decoration:none;">${FOUNDER.email}</a>
    </p>
  `);

  await send({
    to: data.email,
    replyTo: FOUNDER.email,
    subject: "Orika Living · Luxury Retail Placement Proposal",
    html,
    text: `Hi ${data.name},\n\nPlease find the Orika Living trade pack attached. It covers the brand, portfolio, wholesale pricing and sell-through support for retail partners.\n\nReply to this email to set up a call.\n\n${FOUNDER.name} · ${FOUNDER.role}\n${FOUNDER.email}`,
    attachments: [{ filename: data.pdf.filename, content: data.pdf.base64 }],
  });
}
