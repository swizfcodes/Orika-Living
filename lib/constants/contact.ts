// Single source of truth for public-facing contact details. Update here only.
// Used by the contact page, footer, and outbound email templates.

export const FOUNDER = {
  name: "Bola Ayeni",
  role: "Founder",
  email: "bola@orikaliving.com",
} as const;

export const MARKETING = {
  name: "Morayo Ayeni",
  role: "Marketing Manager",
  email: "morayo.ayeni@gmail.com",
} as const;

export const CONTACTS = [FOUNDER, MARKETING] as const;
