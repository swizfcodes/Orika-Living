import Link from "next/link";

interface Props {
  options: readonly string[];
  active: string;
  basePath: string;
  // The option that maps to "no query param" — typically "all". Visiting
  // basePath alone shows that bucket.
  defaultValue?: string;
  paramName?: string;
}

// Rendered as <Link>s rather than buttons so filter changes survive a page
// reload and are crawlable. Used by the orders and enquiries lists.
export default function FilterPills({
  options,
  active,
  basePath,
  defaultValue = "all",
  paramName = "status",
}: Props) {
  return (
    <nav className="flex flex-wrap gap-2">
      {options.map((opt) => {
        const isActive = opt === active;
        const href =
          opt === defaultValue ? basePath : `${basePath}?${paramName}=${opt}`;
        return (
          <Link
            key={opt}
            href={href}
            className={`text-[0.65rem] tracking-[0.25em] capitalize px-4 py-2 border transition-colors ${
              isActive
                ? "bg-(--charcoal) text-(--warm-white) border-(--charcoal)"
                : "border-(--border) text-(--charcoal) hover:border-(--charcoal) bg-(--warm-white)"
            }`}
          >
            {opt}
          </Link>
        );
      })}
    </nav>
  );
}
