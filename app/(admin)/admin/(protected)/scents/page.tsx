import Link from "next/link";
import Image from "next/image";
import { getScents } from "@/lib/scents/server";
import { getSignatures } from "@/lib/signatures/server";

interface PageProps {
  searchParams: Promise<{ tab?: string }>;
}

export default async function AdminScentsPage({ searchParams }: PageProps) {
  const { tab } = await searchParams;
  const activeTab: "scents" | "signatures" =
    tab === "signatures" ? "signatures" : "scents";

  const [scents, signatures] = await Promise.all([
    getScents(),
    getSignatures(),
  ]);

  return (
    <div className="space-y-8 max-w-6xl">
      <header>
        <p className="text-[0.65rem] tracking-[0.35em] uppercase text-(--smoke) mb-2">
          Admin
        </p>
        <h1 className="font-display text-4xl md:text-5xl">Scents & Signatures</h1>
        <p className="text-sm text-(--smoke) mt-2">
          Edit copy, palette and photography. Add new entries as the portfolio grows.
        </p>
      </header>

      <div className="flex items-center justify-between border-b border-(--border)">
        <nav className="flex gap-1">
          <TabLink
            href="/admin/scents"
            label={`Scents (${scents.length})`}
            active={activeTab === "scents"}
          />
          <TabLink
            href="/admin/scents?tab=signatures"
            label={`Signatures (${signatures.length})`}
            active={activeTab === "signatures"}
          />
        </nav>
        <Link
          href={
            activeTab === "signatures"
              ? "/admin/signatures/new"
              : "/admin/scents/new"
          }
          className="text-[0.65rem] tracking-[0.3em] uppercase px-4 py-2 bg-(--charcoal) text-(--warm-white) hover:bg-(--gold) transition-colors"
        >
          + Add {activeTab === "signatures" ? "signature" : "scent"}
        </Link>
      </div>

      {activeTab === "scents" ? (
        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {scents.map((s) => (
            <li key={s.slug}>
              <Link
                href={`/admin/scents/${encodeURIComponent(s.slug)}`}
                className="block border border-(--border) hover:border-(--charcoal) transition-colors overflow-hidden"
              >
                <div
                  className="relative aspect-4/3"
                  style={{ backgroundColor: s.swatch, color: s.ink }}
                >
                  {s.image ? (
                    <Image
                      src={s.image}
                      alt={s.name}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-[0.6rem] tracking-[0.35em] uppercase opacity-60">
                        No image
                      </span>
                    </div>
                  )}
                </div>
                <div className="p-5 bg-(--warm-white)">
                  <p className="text-[0.6rem] tracking-[0.35em] uppercase text-(--smoke) mb-1">
                    {s.family}
                  </p>
                  <p className="font-display text-xl text-(--charcoal)">
                    {s.name}
                  </p>
                  <p className="text-xs italic text-(--smoke) mt-1">
                    {s.tagline}
                  </p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {signatures.map((sig) => (
            <li key={sig.slug}>
              <Link
                href={`/admin/signatures/${encodeURIComponent(sig.slug)}`}
                className="block border border-(--border) hover:border-(--charcoal) transition-colors overflow-hidden"
              >
                <div className="relative aspect-4/3 bg-(--linen)">
                  {sig.image ? (
                    <Image
                      src={sig.image}
                      alt={sig.name}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-[0.6rem] tracking-[0.35em] uppercase text-(--smoke)">
                        No image
                      </span>
                    </div>
                  )}
                </div>
                <div className="p-5 bg-(--warm-white)">
                  <p className="text-[0.6rem] tracking-[0.35em] uppercase text-(--gold) mb-1">
                    {sig.size}
                  </p>
                  <p className="font-display text-xl text-(--charcoal)">
                    {sig.name}
                  </p>
                  <p className="text-xs text-(--smoke) mt-1">{sig.price}</p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function TabLink({
  href,
  label,
  active,
}: {
  href: string;
  label: string;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={`text-[0.65rem] tracking-[0.3em] uppercase px-4 py-3 border-b-2 transition-colors ${
        active
          ? "border-(--charcoal) text-(--charcoal)"
          : "border-transparent text-(--smoke) hover:text-(--charcoal)"
      }`}
    >
      {label}
    </Link>
  );
}
