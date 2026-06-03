import "server-only";
import { apiGet } from "@/lib/api/client";
import { resolveImageUrl } from "@/lib/utils/images";
import { storeSettingsDefaults, type StoreSettings } from "./index";

// ─────────────────────────────────────────────────────────────
// lib/settings/server.ts
//
// Public read of the storefront content singleton (/api/store/settings).
// Any blank field falls back to the static default, so a partially
// filled row still renders a complete page.
//
// CACHING: plain apiGet (60s ISR + "settings" tag). NOT wrapped in
// unstable_cache — same freeze-on-stale reasoning as products/scents.
// ─────────────────────────────────────────────────────────────

interface SettingsRow {
  hero_eyebrow: string | null;
  hero_headline: string | null;
  hero_headline_accent: string | null;
  hero_note: string | null;
  hero_image: string | null;
  range_eyebrow: string | null;
  range_title: string | null;
  range_subtitle: string | null;
}

function toSettings(row: SettingsRow | null): StoreSettings {
  if (!row) return storeSettingsDefaults;
  return {
    heroEyebrow: row.hero_eyebrow || storeSettingsDefaults.heroEyebrow,
    heroHeadline: row.hero_headline || storeSettingsDefaults.heroHeadline,
    heroHeadlineAccent:
      row.hero_headline_accent || storeSettingsDefaults.heroHeadlineAccent,
    heroNote: row.hero_note || storeSettingsDefaults.heroNote,
    heroImage: resolveImageUrl(row.hero_image) ?? undefined,
    rangeEyebrow: row.range_eyebrow || storeSettingsDefaults.rangeEyebrow,
    rangeTitle: row.range_title || storeSettingsDefaults.rangeTitle,
    rangeSubtitle:
      row.range_subtitle || storeSettingsDefaults.rangeSubtitle,
  };
}

export async function getStoreSettings(): Promise<StoreSettings> {
  try {
    // The hub returns the row object directly (or null if unseeded).
    const row = await apiGet<SettingsRow | null>("/store/settings", {
      tags: ["settings"],
    });
    return toSettings(row);
  } catch (err) {
    console.error("[getStoreSettings] API call failed, using defaults:", err);
    return storeSettingsDefaults;
  }
}
