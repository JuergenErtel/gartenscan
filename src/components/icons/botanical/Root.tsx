import * as React from "react";
export function Root({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" fill="none" stroke="#3a2515" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M50 10 L50 50" />
      <path d="M50 50 Q35 60 30 80 M50 50 Q65 60 70 80" />
      <path d="M50 55 Q40 70 45 88 M50 55 Q60 70 55 88" />
      <path d="M50 60 Q50 75 50 90" />
    </svg>
  );
}
