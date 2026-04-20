"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  X,
  Zap,
  Image as ImageIcon,
  Sparkles,
  Camera,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Chip } from "@/components/ui/Chip";
import type { Category } from "@/lib/types";
import { cn } from "@/lib/utils";

const categories: { id: "AUTO" | Category; label: string }[] = [
  { id: "AUTO", label: "Automatisch" },
  { id: "PLANT", label: "Pflanze" },
  { id: "WEED", label: "Unkraut" },
  { id: "PEST", label: "Insekt" },
  { id: "DISEASE", label: "Krankheit" },
];

const sampleUrl =
  "https://images.unsplash.com/photo-1597848212624-a19eb35e2651?w=1200&q=80";

export default function ScanNewPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"AUTO" | Category>("AUTO");
  const [phase, setPhase] = useState<"capture" | "analyzing">("capture");
  const [flash, setFlash] = useState(false);
  const [progressStep, setProgressStep] = useState(0);

  const steps = [
    "Bildstruktur einlesen",
    "Blattmuster analysieren",
    "Vergleich mit 12.000 Arten",
    "Kontext deines Gartens prüfen",
  ];

  useEffect(() => {
    if (phase !== "analyzing") return;
    const intervals: ReturnType<typeof setTimeout>[] = [];
    steps.forEach((_, i) => {
      intervals.push(
        setTimeout(() => setProgressStep(i + 1), (i + 1) * 700)
      );
    });
    intervals.push(
      setTimeout(() => {
        router.push("/scan/disease_echter_mehltau");
      }, steps.length * 700 + 400)
    );
    return () => intervals.forEach(clearTimeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  const handleCapture = () => {
    setFlash(true);
    setTimeout(() => setFlash(false), 200);
    setTimeout(() => setPhase("analyzing"), 250);
  };

  return (
    <div className="fixed inset-0 bg-forest-900 text-paper overflow-hidden">
      {/* Sample image as "camera view" */}
      <div className="absolute inset-0">
        <Image
          src={sampleUrl}
          alt="Kamera-Ansicht"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-forest-900/80 via-transparent to-forest-900/40" />
      </div>

      {/* Top bar */}
      <div className="relative z-10 flex items-center justify-between px-5 pt-[max(env(safe-area-inset-top),1rem)] pb-3">
        <button
          onClick={() => router.back()}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-black/30 backdrop-blur active:scale-95 transition"
        >
          <X className="h-5 w-5 text-paper" />
        </button>
        <div className="flex items-center gap-2">
          <button className="flex h-10 w-10 items-center justify-center rounded-full bg-black/30 backdrop-blur">
            <Zap className="h-4.5 w-4.5 text-paper" strokeWidth={1.75} />
          </button>
        </div>
      </div>

      {/* Focus frame */}
      <AnimatePresence>
        {phase === "capture" && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            className="relative z-10 flex items-center justify-center px-10 mt-4"
            style={{ height: "50vh" }}
          >
            <div className="relative h-full w-full max-w-sm">
              <CornerBrackets />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="rounded-full bg-paper/90 backdrop-blur px-3 py-1.5 text-[11px] font-semibold text-forest-900 flex items-center gap-1.5">
                  <Sparkles className="h-3 w-3 text-clay-500" />
                  Pflanze erkannt
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hint */}
      {phase === "capture" && (
        <p className="relative z-10 text-center text-[13px] text-paper/80 mt-6 font-medium">
          Halte die Kamera ruhig auf das Objekt
        </p>
      )}

      {/* Bottom controls */}
      {phase === "capture" && (
        <div className="absolute bottom-0 left-0 right-0 z-10 pb-[max(env(safe-area-inset-bottom),1.5rem)]">
          {/* Category chips */}
          <div className="overflow-x-auto scroll-hidden px-5 pb-4">
            <div className="flex gap-2 w-max">
              {categories.map((c) => (
                <Chip
                  key={c.id}
                  active={mode === c.id}
                  onClick={() => setMode(c.id)}
                  className={cn(
                    mode === c.id
                      ? "!bg-paper !text-forest-900 !border-paper"
                      : "!bg-black/30 !text-paper !border-paper/20 backdrop-blur"
                  )}
                >
                  {c.label}
                </Chip>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between px-12">
            <button className="flex h-14 w-14 flex-col items-center justify-center gap-1 rounded-2xl bg-black/30 backdrop-blur active:scale-95 transition">
              <ImageIcon className="h-5 w-5 text-paper" strokeWidth={1.75} />
              <span className="text-[9px] font-medium text-paper">Galerie</span>
            </button>
            <button
              onClick={handleCapture}
              className="group relative flex h-20 w-20 items-center justify-center"
            >
              <span className="absolute inset-0 rounded-full bg-paper/20 group-active:bg-paper/30 transition" />
              <span className="relative flex h-16 w-16 items-center justify-center rounded-full bg-paper ring-[3px] ring-paper/40 shadow-[0_10px_30px_rgba(0,0,0,0.3)] group-active:scale-95 transition-transform duration-150">
                <Camera className="h-6 w-6 text-forest-800" strokeWidth={1.75} />
              </span>
            </button>
            <button className="h-14 w-14 rounded-2xl bg-black/30 backdrop-blur flex items-center justify-center active:scale-95 transition">
              <span className="text-[10px] font-medium text-paper leading-none text-center">
                Auto
                <br />
                Blitz
              </span>
            </button>
          </div>
        </div>
      )}

      {/* Flash */}
      <AnimatePresence>
        {flash && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.9 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="absolute inset-0 z-20 bg-paper pointer-events-none"
          />
        )}
      </AnimatePresence>

      {/* Analyzing overlay */}
      <AnimatePresence>
        {phase === "analyzing" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-forest-900/75 backdrop-blur-xl px-8"
          >
            <div className="relative flex h-32 w-32 items-center justify-center mb-8">
              <div className="absolute inset-0 rounded-full border-2 border-paper/20" />
              <motion.div
                className="absolute inset-0 rounded-full border-2 border-t-paper border-r-paper/60 border-b-transparent border-l-transparent"
                animate={{ rotate: 360 }}
                transition={{ duration: 1.6, repeat: Infinity, ease: "linear" }}
              />
              <Sparkles className="h-10 w-10 text-paper" strokeWidth={1.5} />
            </div>
            <p className="font-serif text-[26px] leading-tight text-paper mb-1 font-normal text-center">
              Ich analysiere dein Foto
            </p>
            <p className="text-[13px] text-sage-200/80 mb-10 text-center">
              Das dauert nur einen Moment
            </p>
            <div className="flex flex-col gap-3 w-full max-w-xs">
              {steps.map((s, i) => (
                <motion.div
                  key={s}
                  initial={{ opacity: 0.3 }}
                  animate={{ opacity: progressStep > i ? 1 : 0.3 }}
                  className="flex items-center gap-3 text-[13px]"
                >
                  <div
                    className={cn(
                      "flex h-5 w-5 items-center justify-center rounded-full transition",
                      progressStep > i
                        ? "bg-paper text-forest-900"
                        : "border border-paper/30"
                    )}
                  >
                    {progressStep > i && (
                      <motion.svg
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="h-3 w-3"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M5 13l4 4L19 7"
                        />
                      </motion.svg>
                    )}
                  </div>
                  <span className="text-paper/90">{s}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function CornerBrackets() {
  return (
    <>
      {(
        [
          "top-0 left-0",
          "top-0 right-0 rotate-90",
          "bottom-0 right-0 rotate-180",
          "bottom-0 left-0 -rotate-90",
        ] as const
      ).map((pos) => (
        <div
          key={pos}
          className={cn(
            "absolute h-8 w-8 border-l-2 border-t-2 border-paper/80 rounded-tl-md",
            pos
          )}
        />
      ))}
    </>
  );
}
