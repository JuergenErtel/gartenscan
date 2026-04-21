import * as React from "react";
export function Journal({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" fill="none" stroke="#3a2515" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M22 15 L78 15 Q82 15 82 19 L82 85 Q82 89 78 89 L22 89 Q18 89 18 85 L18 19 Q18 15 22 15 Z" />
      <path d="M30 15 L30 89" />
      <path d="M40 30 L70 30 M40 42 L70 42 M40 54 L70 54 M40 66 L60 66" />
    </svg>
  );
}
