import { scentByFamily } from "@/lib/scents";
import type { ScentFamily } from "@/lib/types";

interface Props {
  family: ScentFamily;
  name: string;
  className?: string;
}

// Branded fallback used when a product has no uploaded photography yet.
// Swatch + ink colours come from the scent palette in lib/scents.ts.
export default function ProductPlaceholder({ family, name, className }: Props) {
  const scent = scentByFamily.get(family);
  const swatch = scent?.swatch ?? "#EDE6DB";
  const ink = scent?.ink ?? "#2B2820";

  return (
    <div
      className={className}
      style={{ backgroundColor: swatch, color: ink }}
      role="img"
      aria-label={`${name} — image coming soon`}
    >
      <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center">
        <span className="text-[0.65rem] tracking-[0.4em] uppercase opacity-70">
          Orika Living
        </span>
        <span className="font-display italic text-3xl md:text-4xl mt-4 leading-tight">
          {name}
        </span>
        <span className="mt-6 w-10 h-px" style={{ backgroundColor: ink, opacity: 0.4 }} />
        <span className="text-[0.6rem] tracking-[0.35em] uppercase mt-4 opacity-60">
          {family}
        </span>
      </div>
    </div>
  );
}
