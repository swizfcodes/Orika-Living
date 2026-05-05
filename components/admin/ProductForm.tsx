"use client";

import { useCallback, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { upsertProductAction, deleteProductAction } from "@/lib/admin/products";
import { SCENT_FAMILIES } from "@/lib/constants/scent-families";
import {
  Field,
  TextArea,
  Select,
  FormError,
  FormActions,
  UploadButton,
} from "@/components/admin/forms";
import { useImageUpload } from "@/components/admin/useImageUpload";
import type { Product } from "@/lib/types";

const formats = [
  "Grand Edition",
  "Signature Edition",
  "Curated Gift Set",
  "Car Diffuser",
] as const;

interface Props {
  product?: Product;
}

export default function ProductForm({ product }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const { upload, uploading } = useImageUpload();
  const [error, setError] = useState<string | null>(null);
  const [images, setImages] = useState<string[]>(product?.images ?? []);

  const isEdit = Boolean(product?.id);

  const handleUpload = useCallback(
    async (file: File) => {
      setError(null);
      const result = await upload(file);
      if ("error" in result) {
        setError(result.error);
        return;
      }
      setImages((prev) => [...prev, result.url]);
    },
    [upload],
  );

  const removeImage = useCallback((url: string) => {
    setImages((prev) => prev.filter((u) => u !== url));
  }, []);

  const onSubmit = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const form = e.currentTarget;
      setError(null);
      const fd = new FormData(form);
      fd.set("images", images.join("\n"));
      startTransition(async () => {
        const result = await upsertProductAction(fd);
        if (!result.ok) {
          setError(result.error);
          return;
        }
        router.push("/admin/products");
        router.refresh();
      });
    },
    [images, router],
  );

  const onDelete = useCallback(() => {
    if (!product?.id) return;
    if (!confirm(`Delete "${product.name}"? This can't be undone.`)) return;
    setError(null);
    startTransition(async () => {
      const result = await deleteProductAction(product.id);
      if (!result.ok) {
        setError(result.error ?? "Delete failed");
        return;
      }
      router.push("/admin/products");
      router.refresh();
    });
  }, [product?.id, product?.name, router]);

  return (
    <form onSubmit={onSubmit} className="space-y-8">
      {product?.id && <input type="hidden" name="id" value={product.id} />}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Field label="Name" name="name" defaultValue={product?.name} required />
        <Field
          label="Slug"
          name="slug"
          defaultValue={product?.slug}
          required
          hint="lowercase, hyphens only"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Select
          label="Scent family"
          name="scent_family"
          defaultValue={product?.scent_family}
          options={SCENT_FAMILIES}
        />
        <Select
          label="Format"
          name="format"
          defaultValue={product?.format}
          options={formats}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Field
          label="Price (₦)"
          name="price_naira"
          type="number"
          step="any"
          defaultValue={product ? product.price_kobo / 100 : undefined}
          required
        />
        <Field
          label="Size (ml)"
          name="size_ml"
          type="number"
          defaultValue={product?.size_ml}
          required
        />
        <Field
          label="Stock qty"
          name="stock_qty"
          type="number"
          defaultValue={product?.stock_qty ?? 0}
          required
        />
      </div>

      <TextArea
        label="Description"
        name="description"
        defaultValue={product?.description}
        rows={4}
        required
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Field
          label="Top notes"
          name="top_notes"
          defaultValue={product?.top_notes.join(", ")}
          hint="comma-separated"
        />
        <Field
          label="Heart notes"
          name="heart_notes"
          defaultValue={product?.heart_notes.join(", ")}
          hint="comma-separated"
        />
        <Field
          label="Base notes"
          name="base_notes"
          defaultValue={product?.base_notes.join(", ")}
          hint="comma-separated"
        />
      </div>

      <div className="space-y-4">
        <div>
          <p className="text-[0.6rem] tracking-[0.35em] uppercase text-(--smoke)">
            Images
          </p>
          <ul className="mt-2 text-xs text-(--smoke) space-y-1">
            <li>• JPG or WebP, under 1 MB per image (hard limit).</li>
            <li>• Square framing works best — 1200×1200 or similar.</li>
            <li>• Compress first at tinypng.com if the file is too large.</li>
          </ul>
        </div>

        {images.length > 0 && (
          <ul className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {images.map((url) => (
              <li
                key={url}
                className="relative aspect-square border border-(--border) bg-(--linen) overflow-hidden group"
              >
                <Image
                  src={url}
                  alt=""
                  fill
                  sizes="(min-width: 768px) 25vw, 50vw"
                  className="object-cover"
                />
                <button
                  type="button"
                  onClick={() => removeImage(url)}
                  className="absolute top-2 right-2 text-[0.6rem] tracking-[0.2em] uppercase bg-(--charcoal) text-(--warm-white) px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        )}

        <UploadButton uploading={uploading} onSelect={handleUpload} />
      </div>

      <FormError message={error} />

      <FormActions
        saving={pending}
        busy={uploading}
        saveLabel={isEdit ? "Save changes" : "Create product"}
        onDelete={isEdit ? onDelete : undefined}
      />
    </form>
  );
}
