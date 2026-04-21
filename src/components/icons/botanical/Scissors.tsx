import * as React from "react";
export function Scissors({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" fill="none" stroke="#3a2515" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="30" cy="72" r="10" />
      <circle cx="70" cy="72" r="10" />
      <path d="M37 65 L88 14 M63 65 L12 14" />
    </svg>
  );
}
