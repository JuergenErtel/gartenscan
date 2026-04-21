import * as React from "react";
export function Aphid({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" fill="none" stroke="#3a2515" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <ellipse cx="35" cy="55" rx="14" ry="11" />
      <ellipse cx="58" cy="48" rx="11" ry="9" />
      <ellipse cx="75" cy="42" rx="8" ry="7" />
      <path d="M30 65 L25 75 M40 65 L40 76 M50 60 L52 72" />
    </svg>
  );
}
