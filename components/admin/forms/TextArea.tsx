interface Props {
  label: string;
  name: string;
  defaultValue?: string;
  rows?: number;
  required?: boolean;
}

export default function TextArea({
  label,
  name,
  defaultValue,
  rows = 3,
  required,
}: Props) {
  return (
    <label className="block">
      <span className="block text-[0.6rem] tracking-[0.35em] uppercase text-(--smoke) mb-2">
        {label}
      </span>
      <textarea
        name={name}
        rows={rows}
        defaultValue={defaultValue}
        required={required}
        className="w-full bg-(--warm-white) border border-(--border) px-4 py-3 text-sm text-(--charcoal) focus:outline-none focus:border-(--gold)"
      />
    </label>
  );
}
