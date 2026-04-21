import * as React from "react";
export function Fruit({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" fill="none" stroke="#3a2515" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M50 25 Q25 25 25 55 Q25 85 50 85 Q75 85 75 55 Q75 25 50 25" />
      <path d="M50 25 Q50 18 55 12 Q60 8 65 12" />
      <path d="M50 25 L45 12" />
    </svg>
  );
}
