"use client";

import { useCallback, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { upsertScentAction, deleteScentAction } from "@/lib/admin/scents";
import {
  Field,
  TextArea,
  ColorField,
  FormError,
  FormActions,
  UploadButton,
} from "@/components/admin/forms";
import { useImageUpload } from "@/components/admin/useImageUpload";
import type { ScentMeta } from "@/lib/scents";

interface Props {
  scent?: ScentMeta;
}

const blank: ScentMeta = {
  name: "",
  slug: "",
  family: "",
  tagline: "",
  description: "",
  top: [],
  heart: [],
  base: [],
  swatch: "#B8C9D6",
  ink: "#2B3A45",
};

export default function ScentForm({ scent }: Props) {
  const router = useRouter();
  const editing = Boolean(scent?.slug);
  const initial = scent ?? blank;

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
        const result = await upsertScentAction(fd);
        if (!result.ok) {
          setError(result.error);
          return;
        }
        router.push("/admin/scents");
        router.refresh();
      });
    },
    [image, router],
  );

  const onDelete = useCallback(() => {
    if (!scent?.slug) return;
    if (!confirm(`Delete "${scent.name}"? This can't be undone.`)) return;
    setError(null);
    startTransition(async () => {
      const result = await deleteScentAction(scent.slug);
      if (!result.ok) {
        setError(result.error ?? "Delete failed");
        return;
      }
      router.push("/admin/scents");
      router.refresh();
    });
  }, [scent?.slug, scent?.name, router]);

  return (
    <form onSubmit={onSubmit} className="space-y-8">
      {editing && (
        <input type="hidden" name="original_slug" value={initial.slug} />
      )}

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

      <Field
        label="Family"
        name="family"
        defaultValue={initial.family}
        required
        hint="e.g. Fresh & Marine, Woody & Deep — shown above the scent name."
      />

      <Field
        label="Tagline"
        name="tagline"
        defaultValue={initial.tagline}
        required
      />

      <TextArea
        label="Description"
        name="description"
        defaultValue={initial.description}
        rows={3}
        required
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Field
          label="Top notes"
          name="top_notes"
          defaultValue={initial.top.join(", ")}
          hint="comma-separated"
        />
        <Field
          label="Heart notes"
          name="heart_notes"
          defaultValue={initial.heart.join(", ")}
          hint="comma-separated"
        />
        <Field
          label="Base notes"
          name="base_notes"
          defaultValue={initial.base.join(", ")}
          hint="comma-separated"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ColorField
          label="Swatch (background)"
          name="swatch"
          defaultValue={initial.swatch}
          hint="Fallback card background when no hero image is uploaded."
        />
        <ColorField
          label="Ink (text)"
          name="ink"
          defaultValue={initial.ink}
          hint="Used for card text only when no image is set. Pick a colour that contrasts the swatch."
        />
      </div>

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
            No image yet — the swatch colour will be used as the background.
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
        saveLabel={editing ? "Save changes" : "Create scent"}
        onDelete={editing ? onDelete : undefined}
      />
    </form>
  );
}
