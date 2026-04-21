import * as React from "react";
export function Pest({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" fill="none" stroke="#3a2515" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <ellipse cx="50" cy="55" rx="22" ry="15" />
      <circle cx="42" cy="50" r="2" fill="#3a2515" stroke="none" />
      <circle cx="58" cy="50" r="2" fill="#3a2515" stroke="none" />
      <path d="M28 50 L18 42 M28 60 L18 65 M72 50 L82 42 M72 60 L82 65" />
      <path d="M40 38 L36 28 M50 35 L50 25 M60 38 L64 28" />
    </svg>
  );
}
