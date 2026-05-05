interface Props {
  label: string;
  name: string;
  defaultValue?: string;
  options: readonly string[];
}

export default function Select({ label, name, defaultValue, options }: Props) {
  return (
    <label className="block">
      <span className="block text-[0.6rem] tracking-[0.35em] uppercase text-(--smoke) mb-2">
        {label}
      </span>
      <select
        name={name}
        defaultValue={defaultValue ?? options[0]}
        className="w-full bg-(--warm-white) border border-(--border) px-4 py-3 text-sm text-(--charcoal) focus:outline-none focus:border-(--gold)"
      >
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </label>
  );
}
