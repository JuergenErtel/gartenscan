import * as React from "react";
import { cn } from "@/lib/utils";

interface StatePanelProps {
  mark: React.ReactNode;
  title: string;
  body: string;
  children?: React.ReactNode;
  className?: string;
}

export function StatePanel({ mark, title, body, children, className }: StatePanelProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center px-6 py-12 mx-auto max-w-sm",
        className
      )}
    >
      {mark}
      <h3 className="display-m mt-6 mb-2 text-bark-900">{title}</h3>
      <p className="text-[14px] leading-relaxed text-ink-muted mb-6">{body}</p>
      {children}
    </div>
  );
}
