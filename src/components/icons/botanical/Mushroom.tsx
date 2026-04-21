import * as React from "react";

export function Mushroom({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" fill="none" stroke="#3a2515" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M20 50 Q20 25 50 25 Q80 25 80 50 Q80 55 75 55 L25 55 Q20 55 20 50 Z" />
      <path d="M40 55 L40 80 Q40 88 50 88 Q60 88 60 80 L60 55" />
      <circle cx="40" cy="40" r="2.5" fill="#3a2515" stroke="none" />
      <circle cx="55" cy="35" r="2" fill="#3a2515" stroke="none" />
      <circle cx="65" cy="44" r="1.8" fill="#3a2515" stroke="none" />
    </svg>
  );
}
