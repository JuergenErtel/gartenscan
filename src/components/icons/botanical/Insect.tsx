import * as React from "react";
export function Insect({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" fill="none" stroke="#3a2515" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <ellipse cx="50" cy="55" rx="14" ry="22" />
      <path d="M50 33 L50 22 M44 26 L50 33 M56 26 L50 33" />
      <path d="M36 50 L20 45 M36 60 L18 60 M36 70 L20 75" />
      <path d="M64 50 L80 45 M64 60 L82 60 M64 70 L80 75" />
      <circle cx="44" cy="42" r="1.5" fill="#3a2515" stroke="none" />
      <circle cx="56" cy="42" r="1.5" fill="#3a2515" stroke="none" />
    </svg>
  );
}
