// Closed enum of seed scent families. Stored as free text in the DB since
// migration 0006 — admins can introduce new families — but these six remain
// the canonical defaults shown in the product-form dropdown and used by the
// seed data in `lib/scents/index.ts`.

export const SCENT_FAMILIES = [
  "Fresh & Marine",
  "Citrus & Green",
  "Oud & Floral",
  "Spice & Amber",
  "Woody & Deep",
  "Floral & Musk",
] as const;

export type ScentFamily = (typeof SCENT_FAMILIES)[number];
