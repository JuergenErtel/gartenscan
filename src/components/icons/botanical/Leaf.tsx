import * as React from "react";

export function Leaf({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" fill="none" stroke="#3a2515" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M25 75 Q15 40 50 15 Q85 40 75 75 Q50 88 25 75 Z" />
      <path d="M50 18 L50 80" />
      <path d="M50 35 L35 45 M50 50 L30 60 M50 65 L38 73" />
      <path d="M50 35 L65 45 M50 50 L70 60 M50 65 L62 73" />
    </svg>
  );
}
