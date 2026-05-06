import type { Metadata } from "next";
import { Cormorant_Garamond, Jost } from "next/font/google";
import "./globals.css";
import StoreProvider from "@/components/providers/StoreProvider";
import CustomCursor from "@/components/ui/CustomCursor";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
  display: "swap",
});

const jost = Jost({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-jost",
  display: "swap",
});

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://orikaliving.com";

const OG_TITLE = "Orika Living — Premium Reed Diffusers Crafted in Lagos";
const OG_DESCRIPTION =
  "Premium reed diffusers crafted to transform your space. Six signature scents, beautifully designed for home, retail and hospitality.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Orika Living — Rooted in Nature",
    template: "%s · Orika Living",
  },
  description:
    "Premium reed diffusers crafted to transform your space. Six signature scents, beautifully designed for every environment.",
  keywords: [
    "reed diffuser",
    "home fragrance",
    "luxury diffuser",
    "Nigeria",
    "Lagos",
    "Orika Living",
    "scent",
    "interior",
  ],
  authors: [{ name: "Orika Living" }],
  creator: "Orika Living",
  publisher: "Orika Living",
  // app/opengraph-image.png is auto-applied by Next.js — no need to list it
  openGraph: {
    title: OG_TITLE,
    description: OG_DESCRIPTION,
    url: SITE_URL,
    siteName: "Orika Living",
    locale: "en_NG",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: OG_TITLE,
    description: OG_DESCRIPTION,
  },
  alternates: {
    canonical: SITE_URL,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${cormorant.variable} ${jost.variable}`}>
      <body className="font-jost antialiased bg-[#FAF8F4] text-[#2B2820]">
        <StoreProvider>
          <CustomCursor />
          {children}
        </StoreProvider>
      </body>
    </html>
  );
}
