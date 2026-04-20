"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { ProgressDots } from "./ProgressDots";

interface Props {
  step: number; // 1..6
  hideProgress?: boolean;
  hideBack?: boolean;
  backHref?: string;
  children: React.ReactNode;
  className?: string;
}

export function OnboardingShell({
  step,
  hideProgress,
  hideBack,
  backHref,
  children,
  className,
}: Props) {
  const router = useRouter();

  return (
    <div
      className={cn(
        "min-h-[100dvh] bg-sage-50 flex flex-col safe-top",
        className
      )}
    >
      <header className="flex items-center justify-between px-4 pt-3 pb-2">
        <div className="w-10">
          {!hideBack &&
            (backHref ? (
              <Link
                href={backHref}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-paper/80 hover:bg-paper active:scale-95 transition"
                aria-label="Zurück"
              >
                <ArrowLeft className="h-5 w-5 text-forest-700" />
              </Link>
            ) : (
              <button
                onClick={() => router.back()}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-paper/80 hover:bg-paper active:scale-95 transition"
                aria-label="Zurück"
              >
                <ArrowLeft className="h-5 w-5 text-forest-700" />
              </button>
            ))}
        </div>
        <div className="flex-1 flex justify-center">
          {!hideProgress && <ProgressDots active={step} />}
        </div>
        <div className="w-10" />
      </header>
      <main className="flex-1 flex flex-col mx-auto w-full max-w-lg px-5 pb-[max(env(safe-area-inset-bottom),1.5rem)]">
        {children}
      </main>
    </div>
  );
}
