import "server-only";

// ─────────────────────────────────────────────────────────────
// lib/api/client.ts
//
// The single HTTP client for talking to the hub-system backend.
// Replaces every `lib/supabase/*` client. The storefront no longer
// holds a database connection — it calls the ERP's REST API.
//
// BASE comes from NEXT_PUBLIC_API_URL:
//   dev  → http://localhost:7000/api
//   prod → https://app.orikaliving.com/api
// ─────────────────────────────────────────────────────────────

const BASE = process.env.NEXT_PUBLIC_API_URL;

if (!BASE) {
  // Fail fast at module load if the env var is missing — better than
  // a confusing "fetch failed" on the first request.
  console.warn(
    "[api/client] NEXT_PUBLIC_API_URL is not set — API calls will fail.",
  );
}

export interface ApiError extends Error {
  status?: number;
}

interface ApiFetchOptions extends RequestInit {
  // Next.js fetch caching — pass-through. Public reads use
  // { next: { revalidate, tags } }; mutations use { cache: "no-store" }.
  next?: { revalidate?: number | false; tags?: string[] };
}

/**
 * Core fetch wrapper. Throws an ApiError carrying the HTTP status on
 * any non-2xx response so callers can branch on err.status (e.g. a
 * 404 → return null/undefined rather than crash the page).
 */
export async function apiFetch<T>(
  path: string,
  options: ApiFetchOptions = {},
): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (!res.ok) {
    let detail = "";
    try {
      const body = await res.json();
      detail = body?.message || body?.error || "";
    } catch {
      // non-JSON error body — ignore
    }
    const err: ApiError = new Error(
      `API ${res.status} on ${path}${detail ? `: ${detail}` : ""}`,
    );
    err.status = res.status;
    throw err;
  }

  // 204 No Content — nothing to parse.
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

/**
 * GET helper for public reads. Defaults to a 60s ISR revalidate and
 * accepts cache tags so a future webhook/admin action can call
 * revalidateTag() to refresh.
 */
export function apiGet<T>(
  path: string,
  opts: { revalidate?: number | false; tags?: string[] } = {},
): Promise<T> {
  return apiFetch<T>(path, {
    method: "GET",
    next: {
      revalidate: opts.revalidate ?? 60,
      tags: opts.tags,
    },
  });
}

/**
 * POST helper for mutations (checkout, newsletter, enquiries).
 * Never cached.
 */
export function apiPost<T>(path: string, body: unknown): Promise<T> {
  return apiFetch<T>(path, {
    method: "POST",
    cache: "no-store",
    body: JSON.stringify(body),
  });
}
