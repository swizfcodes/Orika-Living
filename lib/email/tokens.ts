import "server-only";
import { timingSafeEqual } from "node:crypto";
import { APP_URL } from "./client";

// Required in production: empty/missing values would silently produce
// predictable HMAC tokens. Fail fast at module load instead.
const SESSION_SECRET = process.env.SESSION_SECRET ?? "";
if (!SESSION_SECRET && process.env.NODE_ENV === "production") {
  throw new Error("SESSION_SECRET is required in production.");
}

// HMAC-SHA256 of the lowercase email — appended to unsubscribe links so the
// public endpoint can verify the request came from a real Resend send.
export async function generateUnsubscribeUrl(email: string): Promise<string> {
  if (!SESSION_SECRET) return `${APP_URL}/unsubscribe`;
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(SESSION_SECRET),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(email.toLowerCase()));
  const token = Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return `${APP_URL}/api/unsubscribe?email=${encodeURIComponent(email.toLowerCase())}&token=${token}`;
}

export async function verifyUnsubscribeToken(
  email: string,
  token: string,
): Promise<boolean> {
  if (!SESSION_SECRET || !email || !token) return false;
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(SESSION_SECRET),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(email.toLowerCase()));
  const expected = Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  if (expected.length !== token.length) return false;
  return timingSafeEqual(Buffer.from(expected), Buffer.from(token));
}
