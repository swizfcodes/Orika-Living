import { NextResponse, type NextRequest } from "next/server";
import { checkRateLimit, getClientIp } from "@/lib/ratelimit";

function page(body: string, status = 200): NextResponse {
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>Unsubscribe — Orika Living</title>
<style>
  body{margin:0;min-height:100vh;display:flex;align-items:center;justify-content:center;background:#F4EFE7;color:#2B2620;font-family:Georgia,'Times New Roman',serif;}
  .card{max-width:480px;padding:48px 40px;background:#FFFFFF;border:1px solid #E6DFD1;text-align:center;}
  .eyebrow{font-family:Helvetica,Arial,sans-serif;font-size:10px;letter-spacing:0.4em;text-transform:uppercase;color:#D4AE5A;margin:0 0 16px;}
  h1{font-size:28px;font-weight:400;margin:0 0 14px;line-height:1.25;}
  p{font-family:Helvetica,Arial,sans-serif;font-size:14px;color:#5A544C;line-height:1.7;margin:0 0 24px;}
  a{display:inline-block;padding:13px 32px;background:#2B2620;color:#F4EFE7;font-family:Helvetica,Arial,sans-serif;font-size:11px;letter-spacing:0.3em;text-transform:uppercase;text-decoration:none;}
</style>
</head>
<body>
  <div class="card">${body}</div>
</body>
</html>`;
  return new NextResponse(html, {
    status,
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}

export async function GET(request: NextRequest) {
  const ip = getClientIp(request.headers);
  const rl = await checkRateLimit("unsubscribe", ip, 30, 60);
  if (!rl.allowed) {
    return page(
      `<p class="eyebrow">Slow down</p><h1>Too many requests.</h1><p>Please wait a moment and try again.</p><a href="/">Return to Orika Living</a>`,
      429,
    );
  }

  const url = new URL(request.url);
  const token = url.searchParams.get("token") ?? "";

  if (!token) {
    return page(
      `<p class="eyebrow">Invalid link</p><h1>This link isn't valid.</h1><p>Use the link at the bottom of the email we sent you.</p><a href="/">Return to Orika Living</a>`,
      400,
    );
  }

  // Call your ERP backend
  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:7000";
  const res = await fetch(`${apiUrl}/api/store/newsletter/unsubscribe`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token }),
  });

  if (!res.ok) {
    return page(
      `<p class="eyebrow">Invalid link</p><h1>This link couldn't be verified.</h1><p>If you'd still like to be removed, reply to any email from us.</p><a href="/">Return to Orika Living</a>`,
      400,
    );
  }

  return page(
    `<p class="eyebrow">Unsubscribed</p><h1>You've been removed from the list.</h1><p>You won't receive any more newsletters from Orika Living.</p><a href="/">Return to Orika Living</a>`,
  );
}

// Some mail clients POST to List-Unsubscribe one-click.
export async function POST(request: NextRequest) {
  return GET(request);
}
