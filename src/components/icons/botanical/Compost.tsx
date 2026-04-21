import * as React from "react";
export function Compost({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" fill="none" stroke="#3a2515" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M20 80 L80 80 L75 35 L25 35 Z" />
      <path d="M30 35 L30 80 M50 35 L50 80 M70 35 L70 80" />
      <path d="M35 25 Q40 15 50 18 Q55 22 50 28" />
      <path d="M55 22 Q65 18 68 28" />
    </svg>
  );
}
