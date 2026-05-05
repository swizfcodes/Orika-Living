import type { MetadataRoute } from "next";
import { getActiveProducts } from "@/lib/products/server";
import { getScents } from "@/lib/scents/server";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://orikaliving.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${SITE_URL}/products`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/contact`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${SITE_URL}/stockist`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    },
  ];

  // Catch DB errors so a missing migration or outage doesn't break the
  // sitemap response — return the static routes alone instead.
  let dynamicRoutes: MetadataRoute.Sitemap = [];
  try {
    const [products, scents] = await Promise.all([
      getActiveProducts(),
      getScents(),
    ]);

    dynamicRoutes = [
      ...products.map((p) => ({
        url: `${SITE_URL}/products/${p.slug}`,
        lastModified: new Date(p.created_at),
        changeFrequency: "weekly" as const,
        priority: 0.8,
      })),
      // Scent slugs are filter params on /products, not standalone routes,
      // but they're worth crawling for long-tail SEO.
      ...scents.map((s) => ({
        url: `${SITE_URL}/products?scent=${s.slug}`,
        lastModified: now,
        changeFrequency: "monthly" as const,
        priority: 0.6,
      })),
    ];
  } catch (err) {
    console.error("[sitemap] dynamic routes failed:", err);
  }

  return [...staticRoutes, ...dynamicRoutes];
}
