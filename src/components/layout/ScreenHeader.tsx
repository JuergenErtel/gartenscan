"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

interface ScreenHeaderProps {
  title?: string;
  back?: boolean | string;
  right?: React.ReactNode;
  className?: string;
  transparent?: boolean;
}

export function ScreenHeader({
  title,
  back,
  right,
  className,
  transparent,
}: ScreenHeaderProps) {
  const router = useRouter();

  const handleBack = () => {
    if (typeof back === "string") return;
    router.back();
  };

  return (
    <header
      className={cn(
        "sticky top-0 z-30 flex items-center justify-between gap-3 px-4 h-14 safe-top",
        transparent
          ? "bg-transparent"
          : "bg-sage-50/85 backdrop-blur-md border-b border-sage-200/60",
        className
      )}
    >
      <div className="flex items-center gap-2 min-w-[44px]">
        {back &&
          (typeof back === "string" ? (
            <Link
              href={back}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-paper/80 hover:bg-paper active:scale-95 transition"
            >
              <ArrowLeft className="h-5 w-5 text-forest-700" />
            </Link>
          ) : (
            <button
              onClick={handleBack}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-paper/80 hover:bg-paper active:scale-95 transition"
            >
              <ArrowLeft className="h-5 w-5 text-forest-700" />
            </button>
          ))}
      </div>
      {title && (
        <h1 className="text-[15px] font-semibold text-forest-900 tracking-tight truncate">
          {title}
        </h1>
      )}
      <div className="flex items-center gap-2 min-w-[44px] justify-end">
        {right}
      </div>
    </header>
  );
}
