import * as React from "react";
export function Snail({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" fill="none" stroke="#3a2515" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M15 75 Q40 75 50 65 L70 50" />
      <circle cx="50" cy="55" r="22" />
      <circle cx="50" cy="55" r="14" />
      <circle cx="50" cy="55" r="6" />
      <path d="M70 50 L78 40 M68 45 L75 35" />
    </svg>
  );
}
