import Link from "next/link";
import ScentForm from "@/components/admin/ScentForm";

export default function AdminScentNewPage() {
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
          New scent
        </p>
        <h1 className="font-display text-4xl md:text-5xl">Add a scent</h1>
      </header>

      <ScentForm />
    </div>
  );
}
