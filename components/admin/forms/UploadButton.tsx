"use client";

import { UPLOAD_ACCEPT_ATTR } from "@/lib/admin/upload";

interface Props {
  uploading: boolean;
  label?: string;
  uploadingLabel?: string;
  onSelect: (file: File) => void | Promise<void>;
}

// File-picker styled to match the rest of the admin chrome. Resets the
// input value after each pick so the same file can be re-selected.
export default function UploadButton({
  uploading,
  label = "+ Upload image",
  uploadingLabel = "Uploading…",
  onSelect,
}: Props) {
  return (
    <label className="inline-flex items-center gap-3 cursor-pointer">
      <span className="text-[0.6rem] tracking-[0.3em] uppercase px-5 py-3 border border-(--charcoal) text-(--charcoal) hover:bg-(--charcoal) hover:text-(--warm-white) transition-colors">
        {uploading ? uploadingLabel : label}
      </span>
      <input
        type="file"
        accept={UPLOAD_ACCEPT_ATTR}
        className="hidden"
        disabled={uploading}
        onChange={(e) => {
          const file = e.target.files?.[0];
          e.target.value = "";
          if (file) onSelect(file);
        }}
      />
    </label>
  );
}
