import * as React from "react";
import { cn } from "@/lib/utils";
import { botanicalRegistry, type BotanicalName } from "@/components/icons/botanical";

interface BotanicalIconProps {
  name: BotanicalName;
  size?: number;
  framed?: boolean;
  animate?: boolean;
  className?: string;
  ariaLabel?: string;
}

export function BotanicalIcon({
  name,
  size = 48,
  framed = true,
  animate = false,
  className,
  ariaLabel,
}: BotanicalIconProps) {
  const Mark = botanicalRegistry[name];
  if (!Mark) return null;

  const inner = (
    <Mark
      className={cn(
        "h-[70%] w-[70%]",
        animate && "[&_path]:anim-write [&_circle]:anim-bloom [&_ellipse]:anim-bloom"
      )}
    />
  );

  if (!framed) {
    return (
      <span
        className={cn("inline-flex items-center justify-center", className)}
        style={{ width: size, height: size }}
        role={ariaLabel ? "img" : undefined}
        aria-label={ariaLabel}
      >
        {inner}
      </span>
    );
  }

  return (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded-full bg-cream border-[1.5px] border-terra-500/70",
        className
      )}
      style={{ width: size, height: size }}
      role={ariaLabel ? "img" : undefined}
      aria-label={ariaLabel}
    >
      {inner}
    </span>
  );
}
