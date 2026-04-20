"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface ChipProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean;
  icon?: React.ReactNode;
}

export function Chip({
  active,
  icon,
  children,
  className,
  ...props
}: ChipProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-[13px] font-medium transition-all duration-200",
        active
          ? "bg-forest-700 text-paper border-forest-700 shadow-[0_2px_10px_rgba(46,74,56,0.2)]"
          : "bg-paper text-forest-800 border-sage-200 hover:border-forest-700/40",
        className
      )}
      {...props}
    >
      {icon}
      {children}
    </button>
  );
}
