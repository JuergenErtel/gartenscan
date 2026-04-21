import * as React from "react";
export function Flower({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" fill="none" stroke="#3a2515" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="50" cy="35" r="6" />
      <ellipse cx="50" cy="20" rx="6" ry="10" />
      <ellipse cx="65" cy="30" rx="10" ry="6" />
      <ellipse cx="65" cy="45" rx="6" ry="10" transform="rotate(45 65 45)" />
      <ellipse cx="50" cy="50" rx="10" ry="6" />
      <ellipse cx="35" cy="45" rx="6" ry="10" transform="rotate(-45 35 45)" />
      <ellipse cx="35" cy="30" rx="10" ry="6" />
      <path d="M50 42 L50 90" />
      <path d="M50 70 L62 60 M50 78 L38 68" />
    </svg>
  );
}
