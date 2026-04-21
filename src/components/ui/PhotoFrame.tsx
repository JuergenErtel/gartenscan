// src/components/ui/PhotoFrame.tsx
import * as React from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

type AspectRatio = "square" | "portrait" | "wide" | "hero";

const ratioClasses: Record<AspectRatio, string> = {
  square: "aspect-square",
  portrait: "aspect-[3/4]",
  wide: "aspect-[16/9]",
  hero: "aspect-[5/4]",
};

interface PhotoFrameProps {
  src: string;
  alt: string;
  ratio?: AspectRatio;
  grade?: boolean;
  vignette?: boolean;
  rounded?: string;
  priority?: boolean;
  sizes?: string;
  className?: string;
}

/**
 * Konsistenter Foto-Container mit Editorial-Grading-Layer.
 * Default: warm Sepia, weiches Kontrast-Roll-off, sanftes Vignette.
 */
export function PhotoFrame({
  src,
  alt,
  ratio = "square",
  grade = true,
  vignette = true,
  rounded = "rounded-2xl",
  priority,
  sizes = "(max-width: 768px) 100vw, 500px",
  className,
}: PhotoFrameProps) {
  return (
    <div
      className={cn(
        "relative w-full overflow-hidden",
        ratioClasses[ratio],
        rounded,
        className
      )}
    >
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        priority={priority}
        className={cn(
          "object-cover",
          grade && "[filter:contrast(0.92)_saturate(0.85)_sepia(0.12)_brightness(1.02)]"
        )}
      />
      {vignette && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 [background:radial-gradient(ellipse_at_center,transparent_50%,rgba(58,37,21,0.18)_100%)]"
        />
      )}
    </div>
  );
}
