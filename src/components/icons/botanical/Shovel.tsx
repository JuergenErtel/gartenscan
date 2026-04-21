import * as React from "react";
export function Shovel({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" fill="none" stroke="#3a2515" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M50 10 L50 55" />
      <rect x="44" y="10" width="12" height="8" rx="2" />
      <path d="M30 55 L50 80 L70 55 Q70 50 50 50 Q30 50 30 55 Z" />
    </svg>
  );
}
