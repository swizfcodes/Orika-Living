import Link from "next/link";
import { notFound } from "next/navigation";
import { getSignatureBySlug } from "@/lib/signatures/server";
import SignatureForm from "@/components/admin/SignatureForm";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function AdminSignatureEditPage({ params }: PageProps) {
  const { slug: raw } = await params;
  const slug = decodeURIComponent(raw);
  const signature = await getSignatureBySlug(slug);
  if (!signature) notFound();

  return (
    <div className="space-y-8 max-w-4xl">
      <Link
        href="/admin/scents?tab=signatures"
        className="text-[0.65rem] tracking-[0.3em] uppercase text-(--smoke) hover:text-(--charcoal)"
      >
        ← All signatures
      </Link>

      <header>
        <p className="text-[0.65rem] tracking-[0.35em] uppercase text-(--smoke) mb-2">
          {signature.size}
        </p>
        <h1 className="font-display text-4xl md:text-5xl">{signature.name}</h1>
      </header>

      <SignatureForm signature={signature} />
    </div>
  );
}
