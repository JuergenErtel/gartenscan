import * as React from "react";
export function Worm({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" fill="none" stroke="#3a2515" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M15 70 Q30 50 45 70 Q60 90 75 70 Q85 60 85 55" />
      <circle cx="86" cy="52" r="3" />
    </svg>
  );
}
