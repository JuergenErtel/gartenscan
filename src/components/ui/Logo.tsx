import { cn } from "@/lib/utils";

interface LogoProps {
  size?: number;
  className?: string;
}

/**
 * gartenscan brand mark: scan brackets framing a stylized leaf pair.
 */
export function LogoMark({ size = 64, className }: LogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden
    >
      {/* Corner brackets */}
      <path
        d="M4 18V10a6 6 0 0 1 6-6h8"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path
        d="M46 4h8a6 6 0 0 1 6 6v8"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path
        d="M60 46v8a6 6 0 0 1-6 6h-8"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path
        d="M18 60h-8a6 6 0 0 1-6-6v-8"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
      {/* Leaf left */}
      <path
        d="M32 46c-5-2-10-6-12-11-2-5 0-10 4-13 3 4 6 9 8 15 1 3 1 6 0 9Z"
        fill="currentColor"
        opacity="0.85"
      />
      {/* Leaf right */}
      <path
        d="M32 46c5-2 10-6 12-11 2-5 0-10-4-13-3 4-6 9-8 15-1 3-1 6 0 9Z"
        fill="currentColor"
      />
      {/* Stem */}
      <path
        d="M32 47v6"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function Logo({
  size = 44,
  className,
}: LogoProps) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <LogoMark size={size} className="text-forest-700" />
      <span
        className="font-serif text-forest-900 font-normal tracking-tight"
        style={{ fontSize: size * 0.82, lineHeight: 1 }}
      >
        garten
        <span className="text-forest-700 font-semibold">scan</span>
      </span>
    </div>
  );
}
