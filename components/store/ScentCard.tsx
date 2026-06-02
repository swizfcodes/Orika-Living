import Link from "next/link";
import Image from "next/image";
import type { ScentMeta } from "@/lib/scents";
import { isApiImage } from "@/lib/utils/images";

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
        className="relative aspect-2/3 sm:aspect-3/4 overflow-hidden flex flex-col justify-between p-4 sm:p-8 transition-transform duration-500 group-hover:-translate-y-1"
        style={{ backgroundColor: scent.swatch, color: textColor }}
      >
        {hasImage && (
          <>
            <Image
              src={scent.image!}
              alt={scent.name}
              fill
              sizes="(max-width: 768px) 100vw, 33vw"
              unoptimized={isApiImage(scent.image)}
              className="object-cover transition-transform duration-700 group-hover:scale-105"
            />
            {/* Dual scrim: dark at top so the family eyebrow reads on any
                photograph, dark at bottom for the name + tagline + CTA. */}
            <div
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(to bottom, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.2) 25%, rgba(0,0,0,0.2) 55%, rgba(0,0,0,0.55) 80%, rgba(0,0,0,0.8) 100%)",
              }}
            />
          </>
        )}

        <div className="relative">
          <p
            className="text-[0.55rem] sm:text-[0.6rem] tracking-[0.25em] sm:tracking-[0.35em] uppercase opacity-90 whitespace-nowrap"
            style={
              hasImage ? { textShadow: "0 1px 4px rgba(0,0,0,0.6)" } : undefined
            }
          >
            {scent.family}
          </p>
        </div>

        <div className="relative">
          <h3
            className="font-display text-xl sm:text-3xl md:text-4xl leading-tight whitespace-nowrap"
            style={
              hasImage ? { textShadow: "0 2px 8px rgba(0,0,0,0.5)" } : undefined
            }
          >
            {scent.name}
          </h3>
          <p
            className="mt-2 sm:mt-3 text-xs sm:text-sm italic opacity-95 leading-snug"
            style={
              hasImage ? { textShadow: "0 1px 4px rgba(0,0,0,0.6)" } : undefined
            }
          >
            {scent.tagline}
          </p>
          <div
            className="mt-4 sm:mt-6 h-px w-8 sm:w-10 transition-all duration-500 group-hover:w-20"
            style={{ backgroundColor: textColor, opacity: 0.6 }}
          />
          <p
            className="mt-3 sm:mt-4 text-[0.55rem] sm:text-[0.65rem] tracking-[0.25em] sm:tracking-[0.35em] uppercase opacity-90 whitespace-nowrap"
            style={
              hasImage ? { textShadow: "0 1px 4px rgba(0,0,0,0.6)" } : undefined
            }
          >
            Explore →
          </p>
        </div>
      </div>
    </Link>
  );
}
