import Link from "next/link";

interface Props {
  page: number;
  total: number;
  pageSize: number;
  basePath: string;
  // Other query params to preserve across page links (e.g. status filter).
  query?: Record<string, string | undefined>;
}

// Server component. Renders Prev / Next links and a page indicator. Hidden
// when the result set fits on a single page.
export default function Pagination({
  page,
  total,
  pageSize,
  basePath,
  query,
}: Props) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  if (totalPages <= 1) return null;

  const buildHref = (target: number): string => {
    const params = new URLSearchParams();
    for (const [k, v] of Object.entries(query ?? {})) {
      if (v) params.set(k, v);
    }
    if (target > 1) params.set("page", String(target));
    const qs = params.toString();
    return qs ? `${basePath}?${qs}` : basePath;
  };

  const hasPrev = page > 1;
  const hasNext = page < totalPages;

  return (
    <nav
      aria-label="Pagination"
      className="flex items-center justify-between gap-4 pt-2 text-[0.65rem] tracking-[0.25em] uppercase"
    >
      {hasPrev ? (
        <Link
          href={buildHref(page - 1)}
          className="px-4 py-2 border border-(--border) text-(--charcoal) hover:border-(--charcoal) bg-(--warm-white) transition-colors"
        >
          ← Prev
        </Link>
      ) : (
        <span className="px-4 py-2 border border-(--border) text-(--smoke) opacity-50 select-none">
          ← Prev
        </span>
      )}

      <span className="text-(--smoke)">
        Page {page} of {totalPages} · {total} total
      </span>

      {hasNext ? (
        <Link
          href={buildHref(page + 1)}
          className="px-4 py-2 border border-(--border) text-(--charcoal) hover:border-(--charcoal) bg-(--warm-white) transition-colors"
        >
          Next →
        </Link>
      ) : (
        <span className="px-4 py-2 border border-(--border) text-(--smoke) opacity-50 select-none">
          Next →
        </span>
      )}
    </nav>
  );
}
