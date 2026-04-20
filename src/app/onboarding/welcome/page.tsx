"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { LogoMark } from "@/components/ui/Logo";
import { track } from "@/domain/analytics/tracker";
import { EVENT } from "@/domain/analytics/events";

export default function WelcomePage() {
  useEffect(() => {
    track(EVENT.ONBOARDING_STARTED);
  }, []);

  return (
    <div className="relative min-h-screen overflow-hidden bg-forest-900">
      {/* Full-bleed background image */}
      <div className="absolute inset-0">
        <Image
          src="https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=1600&q=85"
          alt="Garten im warmen Licht"
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-forest-900/30 via-forest-900/50 to-forest-900" />
      </div>

      <div className="relative z-10 flex min-h-screen flex-col px-6 safe-top safe-bottom">
        {/* Top logo */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="flex items-center gap-3 pt-4"
        >
          <LogoMark size={36} className="text-paper" />
          <span className="font-serif text-[22px] text-paper">
            garten<span className="font-semibold">scan</span>
          </span>
        </motion.div>

        {/* Spacer */}
        <div className="flex-1 min-h-[30vh]" />

        {/* Hero text */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.7 }}
        >
          <p className="text-[11px] uppercase tracking-[0.18em] font-semibold text-sage-200 mb-4">
            Willkommen
          </p>
          <h1 className="font-serif text-[44px] md:text-[56px] leading-[1.02] tracking-tight text-paper font-normal">
            Dein Garten.
            <br />
            <span className="text-sage-200">Verstanden.</span>
          </h1>
          <p className="mt-5 text-[16px] leading-relaxed text-sage-200/90 max-w-[85%]">
            Mach ein Foto. Wir sagen dir, was es ist, ob du handeln musst, und
            was genau zu tun ist.
          </p>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.5 }}
          className="mt-10 mb-4 space-y-3"
        >
          <Button
            href="/onboarding/use-cases"
            fullWidth
            size="lg"
            className="!bg-paper !text-forest-900 hover:!bg-paper/95"
            iconRight={<ArrowRight className="h-4 w-4" />}
            onClick={() =>
              track(EVENT.LANDING_CTA_CLICKED, { source: "welcome" })
            }
          >
            Los geht's
          </Button>
          <p className="text-center text-[12px] text-sage-200/70">
            Kostenlos starten · 7 Tage Premium gratis
          </p>
        </motion.div>
      </div>
    </div>
  );
}
