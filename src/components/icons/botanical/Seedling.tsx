import * as React from "react";
export function Seedling({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" fill="none" stroke="#3a2515" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M50 88 L50 50" />
      <path d="M50 55 Q35 50 28 35 Q42 32 50 55 Z" />
      <path d="M50 55 Q65 50 72 35 Q58 32 50 55 Z" />
      <path d="M30 88 L70 88" />
    </svg>
  );
}
