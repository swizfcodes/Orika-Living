import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV !== "production";

// React Fast Refresh and debug-time stack reconstruction rely on eval() in dev.
// Production bundles never call eval() — keep the strict policy there.
const scriptSrc = [
  "'self'",
  "'unsafe-inline'",
  isDev && "'unsafe-eval'",
  "https://js.paystack.co",
  "https://checkout.paystack.com",
]
  .filter(Boolean)
  .join(" ");

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**.supabase.co" },
      // ERP document images (product gallery) served by the hub API.
      { protocol: "http", hostname: "localhost", port: "7000" },
      // Production API origin — set NEXT_PUBLIC_IMAGE_HOST to the API's
      // hostname (e.g. api.orikaliving.com) when deploying.
      ...(process.env.NEXT_PUBLIC_IMAGE_HOST
        ? [
            {
              protocol: "https" as const,
              hostname: process.env.NEXT_PUBLIC_IMAGE_HOST,
            },
          ]
        : []),
    ],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              `script-src ${scriptSrc}`,
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com",
              `img-src 'self' blob: http://localhost:7000 ${process.env.NEXT_PUBLIC_IMAGE_HOST ? `https://${process.env.NEXT_PUBLIC_IMAGE_HOST}` : ""} https://app.orikaliving.com https://*.supabase.co https://*.paystack.co https://*.paystack.com`,
              "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.paystack.co https://checkout.paystack.com",
              "frame-src https://js.paystack.co https://checkout.paystack.com https://standard.paystack.co",
            ].join("; "),
          },
        ],
      },
    ];
  },
};

export default nextConfig;
