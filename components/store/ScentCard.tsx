import Link from "next/link";
import Image from "next/image";
import type { ScentMeta } from "@/lib/scents";

interface Props {
  scent: ScentMeta;
}

export default function ScentCard({ scent }: Props) {
  const hasImage = Boolean(scent.image);
  // When an image is present, text sits over a dark gradient — use warm white.
  const textColor = hasImage ? "#F2EDE4" : scent.ink;

  return (
    <Link href={`/products?scent=${scent.slug}`} className="group block">
      <div
        className="relative aspect-[3/4] overflow-hidden flex flex-col justify-between p-8 transition-transform duration-500 group-hover:-translate-y-1"
        style={{ backgroundColor: scent.swatch, color: textColor }}
      >
        {hasImage && (
          <>
            <Image
              src={scent.image!}
              alt={scent.name}
              fill
              sizes="(max-width: 768px) 100vw, 33vw"
              className="object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(to top, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.35) 40%, rgba(0,0,0,0.1) 70%, rgba(0,0,0,0.05) 100%)",
              }}
            />
          </>
        )}

        <div className="relative">
          <p className="text-[0.6rem] tracking-[0.35em] uppercase opacity-80">
            {scent.family}
          </p>
        </div>

        <div className="relative">
          <h3 className="font-display text-3xl md:text-4xl leading-tight drop-shadow-sm">
            {scent.name}
          </h3>
          <p className="mt-3 text-sm italic opacity-95">{scent.tagline}</p>
          <div
            className="mt-6 h-px w-10 transition-all duration-500 group-hover:w-20"
            style={{ backgroundColor: textColor, opacity: 0.5 }}
          />
          <p className="mt-4 text-[0.65rem] tracking-[0.35em] uppercase opacity-85">
            Explore →
          </p>
        </div>
      </div>
    </Link>
  );
}
