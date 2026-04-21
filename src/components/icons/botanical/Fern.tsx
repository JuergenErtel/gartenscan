import * as React from "react";

export function Fern({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" fill="none" stroke="#3a2515" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M50 90 L50 30" />
      <path d="M50 55 Q30 45 18 25" />
      <path d="M50 55 Q70 45 82 25" />
      <path d="M50 35 Q35 28 25 12" />
      <path d="M50 35 Q65 28 75 12" />
    </svg>
  );
}
