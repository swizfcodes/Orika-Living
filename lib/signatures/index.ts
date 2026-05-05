export interface SignatureMeta {
  slug: string;
  name: string;
  size: string;
  price: string;
  blurb: string;
  image?: string;
}

export const signatures: SignatureMeta[] = [
  {
    slug: "grand-edition",
    name: "Grand Edition",
    size: "1000ml",
    price: "₦125,000",
    blurb:
      "Our flagship vessel — a statement piece for entryways, living rooms and open spaces.",
  },
  {
    slug: "signature-edition",
    name: "Signature Edition",
    size: "500ml",
    price: "₦99,500",
    blurb:
      "The everyday luxury — balanced for bedrooms, studies and quieter corners.",
  },
  {
    slug: "curated-gift-set",
    name: "Curated Gift Set",
    size: "3 × 250ml",
    price: "₦110,000",
    blurb:
      "A trio of scents, gift-ready in signature Orika packaging. For the people you choose deliberately.",
  },
  {
    slug: "car-diffuser",
    name: "Car Diffuser",
    size: "8ml",
    price: "₦6,500",
    blurb:
      "Scent beyond the home — a compact companion for the drive.",
  },
];
