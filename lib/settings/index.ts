// ─────────────────────────────────────────────────────────────
// lib/settings/index.ts
//
// Storefront homepage content that's managed from the ERP
// (Settings · Storefront · Content). The defaults below mirror the
// copy that was previously hardcoded in app/(store)/page.tsx, so the
// page renders identically if the API is unreachable or the settings
// row hasn't been seeded yet.
// ─────────────────────────────────────────────────────────────

export interface StoreSettings {
  // Hero
  heroEyebrow: string;
  heroHeadline: string;
  heroHeadlineAccent: string; // the italic word ("Nature")
  heroNote: string;
  heroImage?: string; // resolved absolute URL, or undefined → use bundled banner
  // "Range" / formats section header
  rangeEyebrow: string;
  rangeTitle: string;
  rangeSubtitle: string;
}

export const storeSettingsDefaults: StoreSettings = {
  heroEyebrow: "Orika Living · Lagos, Nigeria",
  heroHeadline: "Rooted in",
  heroHeadlineAccent: "Nature",
  heroNote:
    "Premium reed diffusers crafted to transform a room into an experience. Six signature scents. One quiet ritual.",
  rangeEyebrow: "The Range",
  rangeTitle: "Four formats. Every occasion.",
  rangeSubtitle:
    "From flagship statement pieces to the compact car diffuser — Orika scales with the space and the moment.",
};
