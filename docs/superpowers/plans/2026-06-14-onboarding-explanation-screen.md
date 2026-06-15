# Onboarding-Erklärseite (statt Musterfall) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ersetze den langweiligen Demo-„Musterfall" in Onboarding-Schritt 5 durch eine kurze, sanft animierte 3-Schritte-Erklärseite.

**Architecture:** `src/app/onboarding/scan/page.tsx` wird komplett neu geschrieben. Die Seite nutzt die bestehende `OnboardingShell` (step 5), `OnboardingHeadline`, die wiederverwendbare `TrustStepCard` und den `Button`, plus framer-motion-Stagger für das Einblenden. Route, Schrittreihenfolge und `useOnboarding` bleiben unverändert. Drei nur hier genutzte Demo-Komponenten werden gelöscht.

**Tech Stack:** Next.js 16 (App Router), React 19, framer-motion 11, lucide-react, Tailwind v4. Kein React-Komponenten-Test-Framework vorhanden → Verifikation über `npm run lint`, `npm run build` (typecheckt) und manuellen Mobile-Check.

---

## Vorab: betroffene Dateien

- **Neu geschrieben:** `src/app/onboarding/scan/page.tsx`
- **Gelöscht:** `src/components/features/onboarding/DemoScanCard.tsx`,
  `src/components/features/onboarding/AnalyzingOverlay.tsx`,
  `src/components/features/onboarding/CompactResultView.tsx`
- **Wiederverwendet (unverändert):** `OnboardingShell`, `OnboardingHeadline`,
  `TrustStepCard` (`number`, `icon: LucideIcon`, `title`, `text`),
  `Button` (`variant="editorial"`, `size="lg"`, `fullWidth`)
- **Unverändert:** `src/hooks/useOnboarding.ts`, Route `/onboarding/scan`,
  `src/domain/analytics/onboarding.ts`

Hinweis: `TrustStepCard` wird auch von `src/app/onboarding/trust/page.tsx`
genutzt und darf NICHT verändert werden.

---

### Task 1: Scan-Seite durch Erklärseite ersetzen

**Files:**
- Modify (Vollersatz): `src/app/onboarding/scan/page.tsx`

- [ ] **Step 1: Datei komplett ersetzen**

Ersetze den gesamten Inhalt von `src/app/onboarding/scan/page.tsx` durch:

```tsx
"use client";

import { useEffect } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Camera, Sparkles, Sprout } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { OnboardingShell } from "@/components/features/onboarding/OnboardingShell";
import { OnboardingHeadline } from "@/components/features/onboarding/OnboardingHeadline";
import { TrustStepCard } from "@/components/features/onboarding/TrustStepCard";
import { useOnboarding } from "@/hooks/useOnboarding";
import { trackOnboardingStepViewed } from "@/domain/analytics/onboarding";

const STEPS = [
  {
    icon: Camera,
    title: "Foto machen",
    text: "Pflanze, Unkraut oder Blatt – einfach drauf halten.",
  },
  {
    icon: Sparkles,
    title: "KI erkennt sofort",
    text: "Art, Krankheit und Schädling in Sekunden.",
  },
  {
    icon: Sprout,
    title: "Pflegetipps erhalten",
    text: "Konkrete, saisonale Empfehlungen für deinen Garten.",
  },
];

export default function ScanPage() {
  const { advance } = useOnboarding();
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    trackOnboardingStepViewed("SCAN");
  }, []);

  return (
    <OnboardingShell step={5}>
      <div className="flex-1 pt-6">
        <OnboardingHeadline
          title="So einfach geht's"
          subtitle="In drei Schritten vom Foto zur Pflege-Empfehlung."
        />

        <motion.div
          className="mt-8 space-y-4"
          initial="hidden"
          animate="visible"
          variants={{
            visible: { transition: { staggerChildren: 0.15 } },
            hidden: {},
          }}
        >
          {STEPS.map((step, index) => (
            <motion.div
              key={step.title}
              variants={{
                hidden: { opacity: 0, y: reduceMotion ? 0 : 12 },
                visible: { opacity: 1, y: 0 },
              }}
            >
              <TrustStepCard
                number={index + 1}
                icon={step.icon}
                title={step.title}
                text={step.text}
              />
            </motion.div>
          ))}
        </motion.div>
      </div>

      <div className="pt-8">
        <Button
          onClick={() => advance("SCAN", {})}
          variant="editorial"
          size="lg"
          fullWidth
        >
          Los geht's
        </Button>
      </div>
    </OnboardingShell>
  );
}
```

- [ ] **Step 2: Lint ausführen**

Run: `npm run lint`
Expected: keine Fehler für `src/app/onboarding/scan/page.tsx` (insbesondere
keine „unused import"-Warnungen – alte Imports wie `DemoScanCard`,
`AnalyzingOverlay`, `CompactResultView`, `getContentById` sind entfernt).

- [ ] **Step 3: Typecheck via Build (nur diese Datei kompiliert sauber)**

Run: `npx tsc --noEmit`
Expected: PASS (keine Typfehler). Falls `tsc` nicht direkt verfügbar ist,
ersatzweise `npm run build` und auf erfolgreichen Kompilierungs-Schritt achten.

- [ ] **Step 4: Commit**

```bash
git add src/app/onboarding/scan/page.tsx
git commit -m "feat(onboarding): replace demo Musterfall with 3-step explanation screen"
```

---

### Task 2: Ungenutzte Demo-Komponenten entfernen

Diese drei Komponenten werden nach Task 1 nur noch in Doku referenziert (per
Grep verifiziert), nicht mehr im Code.

**Files:**
- Delete: `src/components/features/onboarding/DemoScanCard.tsx`
- Delete: `src/components/features/onboarding/AnalyzingOverlay.tsx`
- Delete: `src/components/features/onboarding/CompactResultView.tsx`

- [ ] **Step 1: Sicherstellen, dass keine Code-Referenzen mehr bestehen**

Run: `git grep -n "DemoScanCard\|AnalyzingOverlay\|CompactResultView" -- "src/**"`
Expected: keine Treffer in `src/` (Treffer in `docs/` sind ok und bleiben).

- [ ] **Step 2: Dateien löschen**

```bash
git rm src/components/features/onboarding/DemoScanCard.tsx \
       src/components/features/onboarding/AnalyzingOverlay.tsx \
       src/components/features/onboarding/CompactResultView.tsx
```

- [ ] **Step 3: Build verifizieren (keine hängenden Imports)**

Run: `npm run build`
Expected: PASS – Build läuft durch, keine „Module not found"-Fehler.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "chore(onboarding): remove unused demo scan components"
```

---

### Task 3: Manuelle Mobile-Verifikation

Kein automatisierter Test (kein Komponenten-Test-Framework im Projekt). Stattdessen
manueller Durchlauf.

**Files:** keine

- [ ] **Step 1: Dev-Server starten**

Run: `npm run dev`
Expected: Server läuft auf `http://localhost:3000`.

- [ ] **Step 2: In mobiler Ansicht prüfen**

Browser-DevTools auf Telefon-Viewport (z. B. iPhone 12, 390×844) stellen und
`http://localhost:3000/onboarding/welcome` öffnen, bis Schritt 5 durchklicken
(oder direkt `http://localhost:3000/onboarding/scan`).
Prüfen:
- Headline „So einfach geht's" + Subline sichtbar.
- Drei Schritt-Karten (Foto / KI erkennt / Pflegetipps) erscheinen gestaffelt
  nacheinander, jeweils mit „Schritt 1/2/3"-Label und Lucide-Icon.
- Kein „Überspringen"-Link, kein Demo-Picker, kein Analyse-Overlay.
- Button „Los geht's" führt zur PREMIUM-Seite (`/onboarding/premium`).
- Zurück-Button (oben links) funktioniert.
- Layout passt ohne horizontales Scrollen.

- [ ] **Step 3: Reduced-Motion gegenprüfen (optional)**

In DevTools „Emulate prefers-reduced-motion: reduce" aktivieren, Seite neu laden.
Expected: Karten blenden ohne Y-Versatz ein (kein Springen), Inhalt voll sichtbar.

---

## Self-Review-Notiz

- **Spec-Abdeckung:** Erklärseite (Task 1), Animation + reduced-motion (Task 1),
  Cleanup ungenutzter Komponenten (Task 2), Mobile-Verifikation (Task 3),
  `trackOnboardingStepViewed("SCAN")` beibehalten (Task 1), CTA → PREMIUM via
  `advance("SCAN", {})` (Task 1). Kein Skip-Link (Task 1).
- **Abweichung vom Spec (Verbesserung):** Statt Emoji-Icons werden Lucide-Icons
  über die bereits existierende `TrustStepCard` verwendet – konsistent mit der
  TRUST-Seite. Der separate „Icon-Scale-Pop" entfällt; die Karten-Stagger-
  Animation liefert den lebendigen Eindruck, ohne die geteilte `TrustStepCard`
  anzufassen.
- **Typkonsistenz:** `TrustStepCard`-Props (`number`, `icon: LucideIcon`,
  `title`, `text`) und `Button`-Props (`variant="editorial"`, `size="lg"`,
  `fullWidth`) entsprechen der bestehenden Nutzung in `trust/page.tsx`.
