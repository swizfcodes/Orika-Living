"use client";

import { useCallback, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  upsertSignatureAction,
  deleteSignatureAction,
} from "@/lib/admin/signatures";
import {
  Field,
  TextArea,
  FormError,
  FormActions,
  UploadButton,
} from "@/components/admin/forms";
import { useImageUpload } from "@/components/admin/useImageUpload";
import type { SignatureMeta } from "@/lib/signatures";

interface Props {
  signature?: SignatureMeta;
  nextDisplayOrder?: number;
}

const blank: SignatureMeta = {
  slug: "",
  name: "",
  size: "",
  price: "",
  blurb: "",
};

export default function SignatureForm({ signature, nextDisplayOrder }: Props) {
  const router = useRouter();
  const editing = Boolean(signature?.slug);
  const initial = signature ?? blank;

  const [pending, startTransition] = useTransition();
  const { upload, uploading } = useImageUpload();
  const [error, setError] = useState<string | null>(null);
  const [image, setImage] = useState<string | null>(initial.image ?? null);

  const handleUpload = useCallback(
    async (file: File) => {
      setError(null);
      const result = await upload(file);
      if ("error" in result) {
        setError(result.error);
        return;
      }
      setImage(result.url);
    },
    [upload],
  );

  const onSubmit = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const form = e.currentTarget;
      setError(null);
      const fd = new FormData(form);
      fd.set("image", image ?? "");
      startTransition(async () => {
        const result = await upsertSignatureAction(fd);
        if (!result.ok) {
          setError(result.error);
          return;
        }
        router.push("/admin/scents?tab=signatures");
        router.refresh();
      });
    },
    [image, router],
  );

  const onDelete = useCallback(() => {
    if (!signature?.slug) return;
    if (!confirm(`Delete "${signature.name}"? This can't be undone.`)) return;
    setError(null);
    startTransition(async () => {
      const result = await deleteSignatureAction(signature.slug);
      if (!result.ok) {
        setError(result.error ?? "Delete failed");
        return;
      }
      router.push("/admin/scents?tab=signatures");
      router.refresh();
    });
  }, [signature?.slug, signature?.name, router]);

  return (
    <form onSubmit={onSubmit} className="space-y-8">
      {editing && (
        <input type="hidden" name="original_slug" value={initial.slug} />
      )}
      <input
        type="hidden"
        name="display_order"
        value={nextDisplayOrder ?? 0}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Field label="Name" name="name" defaultValue={initial.name} required />
        <Field
          label="Slug"
          name="slug"
          defaultValue={initial.slug}
          required
          hint="lowercase, hyphens only"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Field
          label="Size label"
          name="size_label"
          defaultValue={initial.size}
          required
          hint="e.g. 1000ml, 3 × 250ml"
        />
        <Field
          label="Price label"
          name="price_label"
          defaultValue={initial.price}
          required
          hint="e.g. ₦125,000"
        />
      </div>

      <TextArea
        label="Blurb"
        name="blurb"
        defaultValue={initial.blurb}
        rows={3}
        required
      />

      <div className="space-y-4">
        <div>
          <p className="text-[0.6rem] tracking-[0.35em] uppercase text-(--smoke)">
            Hero image
          </p>
          <ul className="mt-2 text-xs text-(--smoke) space-y-1">
            <li>• JPG or WebP, under 1 MB (hard limit).</li>
            <li>• Landscape works best — 1600×1200 or similar.</li>
            <li>• Compress first at tinypng.com if the file is too large.</li>
          </ul>
        </div>

        {image ? (
          <div className="relative aspect-4/3 max-w-md border border-(--border) bg-(--linen) overflow-hidden">
            <Image
              src={image}
              alt=""
              fill
              sizes="(min-width: 768px) 24rem, 100vw"
              className="object-cover"
            />
            <button
              type="button"
              onClick={() => setImage(null)}
              className="absolute top-2 right-2 text-[0.6rem] tracking-[0.2em] uppercase bg-(--charcoal) text-(--warm-white) px-3 py-1.5"
            >
              Remove
            </button>
          </div>
        ) : (
          <p className="text-xs text-(--smoke) italic">
            No image yet — the card will render as a plain tile.
          </p>
        )}

        <UploadButton
          uploading={uploading}
          label={image ? "Replace image" : "+ Upload image"}
          onSelect={handleUpload}
        />
      </div>

      <FormError message={error} />

      <FormActions
        saving={pending}
        busy={uploading}
        saveLabel={editing ? "Save changes" : "Create signature"}
        onDelete={editing ? onDelete : undefined}
      />
    </form>
  );
}
