"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Sprout, Calendar, User, Camera } from "lucide-react";
import { cn } from "@/lib/utils";

const tabs = [
  {
    href: "/app",
    label: "Start",
    icon: Home,
    match: (p: string) => p === "/app",
  },
  {
    href: "/garden",
    label: "Garten",
    icon: Sprout,
    match: (p: string) => p.startsWith("/garden"),
  },
  {
    href: "/history",
    label: "Verlauf",
    icon: Calendar,
    match: (p: string) => p.startsWith("/history"),
  },
  {
    href: "/coach",
    label: "Coach",
    icon: User,
    match: (p: string) => p.startsWith("/coach") || p.startsWith("/premium"),
  },
];

export function BottomNav() {
  const pathname = usePathname();

  // Hide on scan flow for focus
  if (pathname.startsWith("/scan/new")) return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 pointer-events-none">
      <div className="mx-auto max-w-lg px-4 pb-[max(env(safe-area-inset-bottom),0.75rem)] pt-2">
        <div className="pointer-events-auto relative flex items-end justify-between rounded-[28px] bg-cream/95 backdrop-blur-xl px-3 py-2 shadow-[0_12px_40px_rgba(58,37,21,0.12)] border border-terra-500/20">
          {tabs.slice(0, 2).map((t) => (
            <NavItem
              key={t.href}
              {...t}
              active={t.match(pathname)}
            />
          ))}
          <Link
            href="/scan/new"
            className="group relative -mt-8 shrink-0"
            aria-label="Scan starten"
          >
            <span className="absolute inset-0 rounded-full bg-clay-500/30 blur-xl group-hover:bg-clay-500/40 transition" />
            <span className="relative flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-forest-700 to-moss-500 shadow-[0_10px_24px_rgba(46,74,56,0.35)] ring-[3px] ring-paper group-active:scale-95 transition-transform duration-150">
              <Camera className="h-7 w-7 text-paper" strokeWidth={1.75} />
            </span>
          </Link>
          {tabs.slice(2).map((t) => (
            <NavItem
              key={t.href}
              {...t}
              active={t.match(pathname)}
            />
          ))}
        </div>
      </div>
    </nav>
  );
}

function NavItem({
  href,
  label,
  icon: Icon,
  active,
}: {
  href: string;
  label: string;
  icon: React.ElementType;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "relative flex flex-1 flex-col items-center justify-center gap-1 rounded-2xl py-2 transition-colors",
        active ? "text-bark-900" : "text-ink-soft hover:text-bark-900"
      )}
    >
      <Icon
        className={cn("h-5 w-5 transition-all", active && "scale-110")}
        strokeWidth={active ? 2 : 1.75}
      />
      <span
        className={cn(
          "text-[10px] font-medium tracking-wide",
          active && "font-semibold"
        )}
      >
        {label}
      </span>
      {active && (
        <span
          aria-hidden
          className="absolute -bottom-0.5 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-bark-900"
        />
      )}
    </Link>
  );
}
