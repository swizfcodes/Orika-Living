import "server-only";
import { Resend } from "resend";

// Lazy-init the Resend client so missing keys don't crash at module load.
// Falls back to no-op (logs and returns ok:false) if RESEND_API_KEY is unset.
let client: Resend | null = null;
function getResend(): Resend | null {
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  if (!client) client = new Resend(key);
  return client;
}

export const FROM =
  process.env.RESEND_FROM_EMAIL ?? "Orika Living <onboarding@resend.dev>";
export const ADMIN_TO = process.env.ADMIN_EMAIL ?? "";
export const APP_URL = (
  process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"
).replace(/\/$/, "");

interface EmailAttachment {
  filename: string;
  content: string; // base64-encoded
}

interface SendOpts {
  to: string | string[];
  subject: string;
  html: string;
  text: string;
  replyTo?: string;
  headers?: Record<string, string>;
  attachments?: EmailAttachment[];
}

export async function send(
  opts: SendOpts,
): Promise<{ ok: boolean; id?: string }> {
  const resend = getResend();
  if (!resend) {
    console.warn(
      "[email] RESEND_API_KEY missing — skipping send:",
      opts.subject,
    );
    return { ok: false };
  }
  try {
    const { data, error } = await resend.emails.send({
      from: FROM,
      to: opts.to,
      subject: opts.subject,
      html: opts.html,
      text: opts.text,
      ...(opts.replyTo ? { replyTo: opts.replyTo } : {}),
      ...(opts.headers ? { headers: opts.headers } : {}),
      ...(opts.attachments ? { attachments: opts.attachments } : {}),
    });
    if (error) {
      console.error("[email] resend error:", error);
      return { ok: false };
    }
    return { ok: true, id: data?.id };
  } catch (err) {
    console.error("[email] unexpected error:", err);
    return { ok: false };
  }
}
