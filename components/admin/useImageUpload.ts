"use client";

import { useCallback, useState } from "react";
import { validateUploadFile } from "@/lib/admin/upload";
import { uploadProductImageAction } from "@/lib/admin/uploads";

export type UploadResult = { url: string } | { error: string };

// Wraps client-side validation + the upload server action with an
// `uploading` flag callers can use to disable form submission. Caller owns
// error display so the same banner can show validation, upload, submit,
// and delete failures in one place.
export function useImageUpload() {
  const [uploading, setUploading] = useState(false);

  const upload = useCallback(async (file: File): Promise<UploadResult> => {
    const check = validateUploadFile(file);
    if (!check.ok) return { error: check.error };
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const result = await uploadProductImageAction(fd);
      return result.ok ? { url: result.url } : { error: result.error };
    } finally {
      setUploading(false);
    }
  }, []);

  return { upload, uploading };
}
