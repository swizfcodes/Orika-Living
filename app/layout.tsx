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

export const metadata: Metadata = {
  title: "Orika Living — Rooted in Elegance",
  description:
    "Premium reed diffusers crafted to transform your space. Six signature scents, beautifully designed for every environment.",
  keywords: [
    "reed diffuser",
    "home fragrance",
    "luxury diffuser",
    "Nigeria",
    "Lagos",
  ],
  openGraph: {
    title: "Orika Living",
    description: "Premium home fragrance. Rooted in elegance.",
    url: process.env.NEXT_PUBLIC_SITE_URL,
    siteName: "Orika Living",
    locale: "en_NG",
    type: "website",
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
