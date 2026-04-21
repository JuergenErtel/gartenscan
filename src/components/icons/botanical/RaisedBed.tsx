import * as React from "react";
export function RaisedBed({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" fill="none" stroke="#3a2515" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect x="10" y="50" width="80" height="35" rx="2" />
      <path d="M10 60 L90 60" />
      <path d="M25 50 L25 38 Q25 30 35 32" />
      <path d="M25 38 L20 30 M25 38 L30 30" />
      <path d="M50 50 L50 25 Q50 15 60 18" />
      <path d="M50 25 L43 15 M50 25 L57 15" />
      <path d="M75 50 L75 35 Q75 28 82 30" />
      <path d="M75 35 L70 27 M75 35 L80 27" />
    </svg>
  );
}
