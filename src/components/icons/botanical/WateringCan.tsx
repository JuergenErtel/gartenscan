import * as React from "react";
export function WateringCan({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" fill="none" stroke="#3a2515" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M25 40 L25 75 Q25 85 35 85 L65 85 Q75 85 75 75 L75 40 Z" />
      <path d="M75 50 L92 35 L92 28" />
      <path d="M88 22 L92 28 L96 22 M88 32 L92 28 L96 32" />
      <path d="M30 30 L70 30 Q72 35 70 40 L30 40 Q28 35 30 30 Z" />
      <path d="M40 25 L60 25" />
    </svg>
  );
}
