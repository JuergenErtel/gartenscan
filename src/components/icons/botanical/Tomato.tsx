import * as React from "react";

export function Tomato({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      stroke="#3a2515"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M50 90 Q50 60 35 40 Q40 30 50 30 Q60 30 65 40 Q50 60 50 90" />
      <path d="M50 70 L40 50 M50 70 L60 50 M50 50 L42 35 M50 50 L58 35" />
      <circle cx="50" cy="22" r="4" fill="#a04030" stroke="none" />
    </svg>
  );
}
