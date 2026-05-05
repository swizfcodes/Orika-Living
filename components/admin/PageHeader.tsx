interface Props {
  // Eyebrow label above the title. Defaults to "Admin"; pass another label
  // for sections that aren't part of the admin chrome (e.g. "Overview").
  eyebrow?: string;
  title: string;
  subtitle?: string;
  // Optional right-aligned slot — typically a primary action like
  // "+ New product".
  action?: React.ReactNode;
}

export default function PageHeader({
  eyebrow = "Admin",
  title,
  subtitle,
  action,
}: Props) {
  return (
    <header className="flex flex-wrap items-end justify-between gap-4">
      <div>
        <p className="text-[0.65rem] tracking-[0.35em] uppercase text-(--smoke) mb-2">
          {eyebrow}
        </p>
        <h1 className="font-display text-4xl md:text-5xl">{title}</h1>
        {subtitle && (
          <p className="text-sm text-(--smoke) mt-2">{subtitle}</p>
        )}
      </div>
      {action}
    </header>
  );
}
