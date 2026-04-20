"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { isValidEmail } from "@/lib/storage/waitlist";

interface Props {
  onSubmit: (email: string) => void;
  onAfterSubmit: () => void;
}

type CTAPhase = "idle" | "input" | "done";

export function WaitlistCTA({ onSubmit, onAfterSubmit }: Props) {
  const [phase, setPhase] = useState<CTAPhase>("idle");
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);

  function onSubmitClick() {
    if (phase === "idle") {
      setPhase("input");
      return;
    }
    if (phase === "input") {
      if (!isValidEmail(email)) {
        setError("Bitte gültige E-Mail eingeben");
        return;
      }
      onSubmit(email.trim());
      setPhase("done");
      return;
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <AnimatePresence>
        {phase === "input" && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <input
              type="email"
              autoFocus
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError(null);
              }}
              placeholder="deine@email.de"
              className={cn(
                "w-full rounded-full bg-paper px-5 py-3 text-[15px] text-forest-900 placeholder:text-ink-muted/60 border",
                error ? "border-clay-500" : "border-sage-200"
              )}
              style={{ height: 52 }}
            />
            {error && (
              <p className="mt-2 text-[12px] text-clay-600 text-center">
                {error}
              </p>
            )}
          </motion.div>
        )}
        {phase === "done" && (
          <motion.div
            key="done"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="flex items-center justify-center gap-2 rounded-full bg-forest-700/15 px-4 py-3 text-[14px] font-medium text-forest-700"
          >
            <Check className="h-4 w-4" strokeWidth={2.5} />
            Wir melden uns, sobald Premium startet.
          </motion.div>
        )}
      </AnimatePresence>

      {phase !== "done" ? (
        <button
          type="button"
          onClick={onSubmitClick}
          className="flex w-full items-center justify-center gap-2 rounded-full bg-clay-500 hover:bg-clay-600 text-paper text-[15px] font-semibold transition active:scale-[0.98]"
          style={{ height: 52 }}
        >
          {phase === "idle" ? (
            <>
              Ich will dabei sein
              <ArrowRight className="h-4 w-4" />
            </>
          ) : (
            "Absenden"
          )}
        </button>
      ) : (
        <button
          type="button"
          onClick={onAfterSubmit}
          className="flex w-full items-center justify-center gap-2 rounded-full bg-clay-500 hover:bg-clay-600 text-paper text-[15px] font-semibold transition active:scale-[0.98]"
          style={{ height: 52 }}
        >
          Weiter zur App
          <ArrowRight className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
