import * as React from "react";
export function Mildew({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" fill="none" stroke="#3a2515" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M25 75 Q15 40 50 15 Q85 40 75 75 Q50 88 25 75 Z" />
      <path d="M50 18 L50 80" />
      <circle cx="35" cy="40" r="3" />
      <circle cx="60" cy="35" r="2.5" />
      <circle cx="42" cy="55" r="3.5" />
      <circle cx="65" cy="55" r="2" />
      <circle cx="38" cy="68" r="2.5" />
      <circle cx="58" cy="70" r="3" />
    </svg>
  );
}
