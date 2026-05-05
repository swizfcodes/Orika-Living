import Link from "next/link";
import SignatureForm from "@/components/admin/SignatureForm";
import { getSignatures } from "@/lib/signatures/server";

export default async function AdminSignatureNewPage() {
  const existing = await getSignatures();
  const nextDisplayOrder = existing.length + 1;

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
          New signature
        </p>
        <h1 className="font-display text-4xl md:text-5xl">Add a signature</h1>
      </header>

      <SignatureForm nextDisplayOrder={nextDisplayOrder} />
    </div>
  );
}
