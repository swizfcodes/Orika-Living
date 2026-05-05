import type { ScentFamily } from "@/lib/types";

export interface ScentMeta {
  name: string;
  slug: string;
  // Free-text since migration 0006 — admin can add new families beyond the
  // original six. ScentFamily remains available for the seed defaults.
  family: string;
  tagline: string;
  description: string;
  top: string[];
  heart: string[];
  base: string[];
  // A tonal swatch used on cards and placeholders.
  swatch: string;
  ink: string;
  // Optional hero photography uploaded via admin. Overlays the swatch.
  image?: string;
}

interface DefaultScent extends ScentMeta {
  family: ScentFamily;
}

export const scents: DefaultScent[] = [
  {
    name: "Ocean Mist",
    slug: "ocean-mist",
    family: "Fresh & Marine",
    tagline: "The quiet of the coast",
    description:
      "A crisp coastal opening of sea salt and grapefruit settling into a soft veil of driftwood and musk.",
    top: ["Sea salt", "Grapefruit"],
    heart: ["Sage", "Rosemary"],
    base: ["Driftwood", "Musk"],
    swatch: "#B8C9D6",
    ink: "#2B3A45",
  },
  {
    name: "Lemon Verbana",
    slug: "lemon-verbana",
    family: "Citrus & Green",
    tagline: "Garden-fresh luminosity",
    description:
      "Bright lemon, lime and lemongrass leading to verbana and jasmine over warm cedarwood and musk.",
    top: ["Lemon", "Lime", "Lemongrass"],
    heart: ["Verbana", "Green Tea", "Jasmine"],
    base: ["Musk", "Cedarwood"],
    swatch: "#D8DEB0",
    ink: "#3A4022",
  },
  {
    name: "Midnight Oud",
    slug: "midnight-oud",
    family: "Oud & Floral",
    tagline: "An opulent hush for evening rooms",
    description:
      "Bergamot and lemon lifting a deep allure of oud and rose, anchored by patchouli and sandalwood.",
    top: ["Bergamot", "Lemon"],
    heart: ["Oud", "Rose"],
    base: ["Patchouli", "Sandalwood"],
    swatch: "#2B2820",
    ink: "#F2EDE4",
  },
  {
    name: "Soleil",
    slug: "soleil",
    family: "Spice & Amber",
    tagline: "Golden-hour warmth",
    description:
      "A sunlit composition of citrus and green notes, a spiced floral heart, and a base of wood and amber.",
    top: ["Citrus", "Green"],
    heart: ["Spices", "Floral"],
    base: ["Wood", "Amber"],
    swatch: "#D9A76A",
    ink: "#3B2A15",
  },
  {
    name: "Orika Rouge",
    slug: "orika-rouge",
    family: "Woody & Deep",
    tagline: "Bold, grounded, distinctly Orika",
    description:
      "Spices and citrus awaken a rich heart of teak and cedar, deepened by amber and oud.",
    top: ["Spices", "Citrus"],
    heart: ["Teak wood", "Cedar"],
    base: ["Amber", "Oud"],
    swatch: "#9B4A2E",
    ink: "#F2EDE4",
  },
  {
    name: "Oud Amour",
    slug: "oud-amour",
    family: "Floral & Musk",
    tagline: "Romantic and softly addictive",
    description:
      "Bergamot and green tea opening into jasmine and orchid, closing with sandalwood and musk.",
    top: ["Bergamot", "Green tea"],
    heart: ["Jasmine", "Orchid"],
    base: ["Sandalwood", "Musk"],
    swatch: "#C5A0A7",
    ink: "#3B1F26",
  },
];

export const scentByFamily = new Map<ScentFamily, DefaultScent>(
  scents.map((s) => [s.family, s]),
);

export const formats = [
  {
    name: "Grand Edition",
    size: "1000ml",
    price: "₦125,000",
    blurb:
      "Our flagship vessel — a statement piece for entryways, living rooms and open spaces.",
  },
  {
    name: "Signature Edition",
    size: "500ml",
    price: "₦99,500",
    blurb:
      "The everyday luxury — balanced for bedrooms, studies and quieter corners.",
  },
  {
    name: "Curated Gift Set",
    size: "3 × 250ml",
    price: "₦110,000",
    blurb:
      "A trio of scents, gift-ready in signature Orika packaging. For the people you choose deliberately.",
  },
  {
    name: "Car Diffuser",
    size: "8ml",
    price: "₦6,500",
    blurb:
      "Scent beyond the home — a compact companion for the drive.",
  },
] as const;
