import "server-only";
import { APP_URL } from "../client";

// ── Base HTML wrapper ─────────────────────────────────────────────────────────
// Warm cream outer, white card, charcoal text, gold accents. Table-based for
// maximum email-client compatibility.
export function baseEmail(body: string, opts?: { unsubUrl?: string }): string {
  const unsubFooter = opts?.unsubUrl
    ? `<p style="margin:12px 0 0;text-align:center;">
         <a href="${opts.unsubUrl}" style="color:#8E867A;font-size:10px;letter-spacing:0.15em;text-decoration:underline;">Unsubscribe</a>
       </p>`
    : "";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <meta http-equiv="X-UA-Compatible" content="IE=edge"/>
  <title>Orika Living</title>
</head>
<body style="margin:0;padding:0;background:#F4EFE7;font-family:Georgia,'Times New Roman',serif;color:#2B2620;-webkit-font-smoothing:antialiased;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#F4EFE7;">
    <tr>
      <td align="center" style="padding:40px 16px;">

        <!-- Card -->
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:580px;width:100%;background:#FFFFFF;border:1px solid #E6DFD1;">

          <!-- Header -->
          <tr>
            <td align="center" style="padding:36px 40px 28px;border-bottom:1px solid #E6DFD1;">
              <p style="margin:0 0 8px;font-family:Georgia,'Times New Roman',serif;color:#2B2620;font-size:28px;font-weight:400;letter-spacing:0.02em;">Orika Living</p>
              <p style="margin:0;color:#8E867A;font-size:9px;letter-spacing:0.4em;text-transform:uppercase;">Rooted in Elegance</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:40px 44px;font-family:Helvetica,Arial,sans-serif;">
              ${body}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="padding:22px 40px;border-top:1px solid #E6DFD1;background:#FAF6EE;">
              <p style="margin:0 0 4px;color:#8E867A;font-size:10px;letter-spacing:0.15em;">© Orika Living · Lagos, Nigeria · RC No: 9354060</p>
              <p style="margin:0;">
                <a href="${APP_URL}" style="color:#8E867A;font-size:10px;text-decoration:none;">${APP_URL.replace(/^https?:\/\//, "")}</a>
              </p>
              ${unsubFooter}
            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>
</body>
</html>`;
}

// ── Reusable snippets ─────────────────────────────────────────────────────────
export function heading(text: string, eyebrow?: string): string {
  const eyebrowHtml = eyebrow
    ? `<p style="margin:0 0 10px;color:#D4AE5A;font-size:10px;letter-spacing:0.35em;text-transform:uppercase;font-family:Helvetica,Arial,sans-serif;">${eyebrow}</p>`
    : "";
  return `
    ${eyebrowHtml}
    <h1 style="margin:0 0 20px;font-family:Georgia,'Times New Roman',serif;color:#2B2620;font-size:26px;font-weight:400;line-height:1.25;letter-spacing:-0.01em;">${text}</h1>`;
}

export function paragraph(text: string): string {
  return `<p style="margin:0 0 16px;color:#5A544C;font-size:14px;line-height:1.7;">${text}</p>`;
}

export function detailRow(label: string, value: string): string {
  return `
  <tr>
    <td style="padding:10px 0;border-bottom:1px solid #E6DFD1;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td style="color:#8E867A;font-size:10px;font-weight:600;letter-spacing:0.25em;text-transform:uppercase;width:42%;">${label}</td>
          <td align="right" style="color:#2B2620;font-size:13px;">${value}</td>
        </tr>
      </table>
    </td>
  </tr>`;
}

export function detailTable(rows: string): string {
  return `<table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:12px 0 24px;">${rows}</table>`;
}

export function ctaButton(href: string, label: string): string {
  return `
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:28px 0 0;">
    <tr>
      <td align="center">
        <a href="${href}" style="display:inline-block;padding:14px 36px;background:#2B2620;color:#F4EFE7;font-family:Helvetica,Arial,sans-serif;font-size:11px;font-weight:600;letter-spacing:0.3em;text-transform:uppercase;text-decoration:none;">${label}</a>
      </td>
    </tr>
  </table>`;
}

export function goldDivider(): string {
  return `<div style="width:40px;height:1px;background:#D4AE5A;margin:24px auto;"></div>`;
}

export function quoteBlock(label: string, text: string): string {
  return `
  <div style="margin:20px 0;padding:18px 22px;background:#FAF6EE;border-left:2px solid #D4AE5A;">
    <p style="margin:0 0 6px;color:#8E867A;font-size:9px;font-weight:600;letter-spacing:0.3em;text-transform:uppercase;">${label}</p>
    <p style="margin:0;color:#2B2620;font-size:13px;line-height:1.7;">${text}</p>
  </div>`;
}

export function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
