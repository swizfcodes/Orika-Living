interface Props {
  label: string;
  size?: "sm" | "lg";
}

// Italic centered placeholder for empty list/table sections in admin views.
// `sm` is for inline panels (e.g. dashboard cards); `lg` is for full-page lists.
export default function EmptyState({ label, size = "lg" }: Props) {
  const padding = size === "sm" ? "py-8" : "p-10";
  return (
    <p className={`${padding} text-center text-sm text-(--smoke) italic`}>
      {label}
    </p>
  );
}
