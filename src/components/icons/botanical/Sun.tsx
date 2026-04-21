import * as React from "react";

export function Sun({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" fill="none" stroke="#3a2515" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="50" cy="50" r="18" />
      <path d="M50 25 L50 12 M50 75 L50 88 M25 50 L12 50 M75 50 L88 50 M33 33 L23 23 M67 67 L77 77 M67 33 L77 23 M33 67 L23 77" />
    </svg>
  );
}
