// Next.js Server Actions cap request bodies at 1 MB. The file is wrapped in
// a multipart/form-data envelope, so we ceiling the file itself a little
// below 1 MB to leave headroom for the form fields + boundaries.
export const MAX_UPLOAD_BYTES = 950 * 1024;

export const ACCEPTED_MIME_TYPES = [
  "image/jpeg",
  "image/webp",
  "image/png",
] as const;

export const UPLOAD_ACCEPT_ATTR = ACCEPTED_MIME_TYPES.join(",");

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export function validateUploadFile(
  file: File,
): { ok: true } | { ok: false; error: string } {
  if (!ACCEPTED_MIME_TYPES.includes(file.type as (typeof ACCEPTED_MIME_TYPES)[number])) {
    return {
      ok: false,
      error: `"${file.name}" is ${file.type || "an unsupported format"}. Upload a JPG, PNG or WebP.`,
    };
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    return {
      ok: false,
      error: `"${file.name}" is ${formatBytes(file.size)} — please keep it under 1 MB. Try compressing at tinypng.com or exporting as WebP.`,
    };
  }
  return { ok: true };
}
