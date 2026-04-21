import * as React from "react";
export function Compass({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" fill="none" stroke="#3a2515" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="50" cy="50" r="35" />
      <path d="M50 25 L60 50 L50 75 L40 50 Z" fill="#a04030" stroke="#3a2515" />
      <circle cx="50" cy="50" r="3" fill="#3a2515" stroke="none" />
    </svg>
  );
}
