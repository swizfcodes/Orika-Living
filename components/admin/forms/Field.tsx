interface Props {
  label: string;
  name: string;
  type?: string;
  defaultValue?: string | number;
  required?: boolean;
  hint?: string;
  step?: string;
}

export default function Field({
  label,
  name,
  type = "text",
  defaultValue,
  required,
  hint,
  step,
}: Props) {
  return (
    <label className="block">
      <span className="block text-[0.6rem] tracking-[0.35em] uppercase text-(--smoke) mb-2">
        {label}
      </span>
      <input
        name={name}
        type={type}
        step={step}
        defaultValue={defaultValue}
        required={required}
        className="w-full bg-(--warm-white) border border-(--border) px-4 py-3 text-sm text-(--charcoal) focus:outline-none focus:border-(--gold)"
      />
      {hint && <span className="block text-xs text-(--smoke) mt-1">{hint}</span>}
    </label>
  );
}
