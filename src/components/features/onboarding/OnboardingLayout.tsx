"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface OnboardingLayoutProps {
  step: number;
  totalSteps: number;
  children: React.ReactNode;
  className?: string;
}

export function OnboardingLayout({
  step,
  totalSteps,
  children,
  className,
}: OnboardingLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-sage-100 via-sage-50 to-paper">
      {/* Progress bar */}
      <div className="sticky top-0 z-30 safe-top px-5 pt-4">
        <div className="mx-auto max-w-lg">
          <div className="flex gap-1.5">
            {Array.from({ length: totalSteps }).map((_, i) => (
              <div
                key={i}
                className={cn(
                  "h-1 flex-1 rounded-full transition-colors duration-500",
                  i < step
                    ? "bg-forest-700"
                    : i === step - 1
                      ? "bg-forest-700"
                      : "bg-sage-200"
                )}
              />
            ))}
          </div>
        </div>
      </div>

      <motion.main
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.2, 0.8, 0.2, 1] }}
        className={cn("mx-auto max-w-lg pb-32", className)}
      >
        {children}
      </motion.main>
    </div>
  );
}
