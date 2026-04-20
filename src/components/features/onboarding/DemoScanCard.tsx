"use client";

import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  label: string;
  hint: string;
  image: string;
  onClick: () => void;
  disabled?: boolean;
  className?: string;
}

export function DemoScanCard({
  label,
  hint,
  image,
  onClick,
  disabled,
  className,
}: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "group relative flex items-center gap-4 rounded-2xl bg-paper p-3 text-left shadow-[0_2px_12px_rgba(28,42,33,0.06)] transition",
        disabled
          ? "opacity-50"
          : "hover:shadow-[0_4px_16px_rgba(28,42,33,0.08)] active:scale-[0.99]",
        className
      )}
    >
      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl">
        <Image
          src={image}
          alt={label}
          fill
          sizes="64px"
          className="object-cover"
        />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[15px] font-semibold text-forest-900 truncate">
          {label}
        </p>
        <p className="text-[12px] text-ink-muted truncate">{hint}</p>
      </div>
      <ArrowRight className="h-4 w-4 text-forest-700 opacity-60 group-hover:opacity-100 transition" />
    </button>
  );
}
