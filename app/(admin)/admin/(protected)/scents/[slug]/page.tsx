import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ScentForm from "@/components/admin/ScentForm";
import type { ScentMeta } from "@/lib/scents";

interface ScentRow {
  slug: string;
  name: string;
  family: string;
  tagline: string;
  description: string;
  top_notes: string[];
  heart_notes: string[];
  base_notes: string[];
  swatch: string;
  ink: string;
  image: string | null;
}

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function AdminScentEditPage({ params }: PageProps) {
  const { slug: raw } = await params;
  const slug = decodeURIComponent(raw);

  const supabase = await createClient();
  const { data } = await supabase
    .from("scents")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();
  if (!data) notFound();

  const row = data as ScentRow;
  const scent: ScentMeta = {
    slug: row.slug,
    name: row.name,
    family: row.family,
    tagline: row.tagline,
    description: row.description,
    top: row.top_notes,
    heart: row.heart_notes,
    base: row.base_notes,
    swatch: row.swatch,
    ink: row.ink,
    image: row.image ?? undefined,
  };

  return (
    <div className="space-y-8 max-w-4xl">
      <Link
        href="/admin/scents"
        className="text-[0.65rem] tracking-[0.3em] uppercase text-(--smoke) hover:text-(--charcoal)"
      >
        ← All scents
      </Link>

      <header>
        <p className="text-[0.65rem] tracking-[0.35em] uppercase text-(--smoke) mb-2">
          {scent.family}
        </p>
        <h1 className="font-display text-4xl md:text-5xl">{scent.name}</h1>
      </header>

      <ScentForm scent={scent} />
    </div>
  );
}
