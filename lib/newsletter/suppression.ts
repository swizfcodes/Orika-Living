"use client";

// Single source of truth for "this device has subscribed / seen the
// newsletter prompt", so the popup is suppressed no matter WHERE the
// person subscribed (popup, footer form, etc.). Per-device only —
// localStorage can't follow someone across browsers.

const STORAGE_KEY = "orika.newsletter.seen.v1";

export function hasSeenNewsletter(): boolean {
  try {
    return Boolean(localStorage.getItem(STORAGE_KEY));
  } catch {
    // Storage unavailable (private mode / webview). Treat as "seen" so we
    // fail closed and don't nag in environments we can't remember.
    return true;
  }
}

export function markNewsletterSubscribed(): void {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ status: "subscribed", at: Date.now() }),
    );
  } catch {
    // Quota exceeded or unavailable — best effort.
  }
}
