import * as React from "react";
export function Pot({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" fill="none" stroke="#3a2515" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M25 45 L75 45 L70 88 L30 88 Z" />
      <path d="M22 45 L78 45 Q82 45 82 41 L82 38 Q82 35 78 35 L22 35 Q18 35 18 38 L18 41 Q18 45 22 45" />
      <path d="M50 35 L50 18 Q50 10 55 10" />
      <path d="M44 25 Q40 18 50 18 Q60 18 56 25" />
    </svg>
  );
}
