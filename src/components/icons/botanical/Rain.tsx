import * as React from "react";
export function Rain({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" fill="none" stroke="#3a2515" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M25 35 Q15 35 15 25 Q15 15 25 15 Q30 5 45 12 Q60 5 70 18 Q85 18 85 33 Q85 42 75 42 L25 42 Q15 42 15 35 Z" />
      <path d="M30 58 L25 72 M50 58 L45 72 M70 58 L65 72 M40 65 L35 80 M60 65 L55 80" />
    </svg>
  );
}
