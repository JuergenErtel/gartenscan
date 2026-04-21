# High-End Design-Overhaul Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** gartenscan visuell von „solider Plant-App" auf „Premium Magazine-Style Product" heben — durch ein eigenes „Warm Botanical Studio"-Design-System mit Hybrid-Bildwelt (echte Fotos + botanische Linien-Illustrationen) und drei cinematischen Signature Moments (Onboarding, Scan-Capture, Result-Reveal).

**Architecture:** Vier deploybare Phasen. Phase 1 erweitert nur CSS-Tokens/Klassen (zero-risk). Phase 2 fügt neue Komponenten hinzu und upgradet bestehende rückwärtskompatibel. Phase 3 redesignt die drei Signature Moments mit voller cinematischer Investition. Phase 4 rollt das System auf alle Rest-Screens aus. Bestehende State-Maschinen, Routing, Daten-Flows bleiben unangetastet.

**Tech Stack:** Next.js 15 (App Router), Tailwind v4 (`@theme` directive), Fraunces + Inter Google Fonts, Framer Motion (bereits eingebunden), Lucide Icons, Inline-SVG für Botanical-Marks. Keine Test-Infrastruktur im Projekt — Verifikation erfolgt via Dev-Server-Smoke-Test (manuell oder via Chrome DevTools MCP wenn verfügbar).

**Spec:** [`docs/superpowers/specs/2026-04-21-design-overhaul-design.md`](../specs/2026-04-21-design-overhaul-design.md)

---

## File Structure

### Files to create (Phase 2 + 3)

```
src/components/ui/PhotoFrame.tsx
src/components/ui/BotanicalIcon.tsx
src/components/ui/EmptyState.tsx
src/components/ui/LoadingState.tsx
src/components/ui/ErrorState.tsx
src/components/icons/botanical/index.ts
src/components/icons/botanical/Tomato.tsx
src/components/icons/botanical/Fern.tsx
src/components/icons/botanical/Mushroom.tsx
src/components/icons/botanical/Leaf.tsx
src/components/icons/botanical/Sun.tsx
src/components/icons/botanical/Insect.tsx
src/components/icons/botanical/Snail.tsx
src/components/icons/botanical/Aphid.tsx
src/components/icons/botanical/Worm.tsx
src/components/icons/botanical/Rain.tsx
src/components/icons/botanical/Shovel.tsx
src/components/icons/botanical/Scissors.tsx
src/components/icons/botanical/WateringCan.tsx
src/components/icons/botanical/Root.tsx
src/components/icons/botanical/Fruit.tsx
src/components/icons/botanical/Flower.tsx
src/components/icons/botanical/Mildew.tsx
src/components/icons/botanical/Pest.tsx
src/components/icons/botanical/Compost.tsx
src/components/icons/botanical/Pot.tsx
src/components/icons/botanical/RaisedBed.tsx
src/components/icons/botanical/Seedling.tsx
src/components/icons/botanical/Journal.tsx
src/components/icons/botanical/Compass.tsx
```

### Files to modify

```
src/app/globals.css                                    (Phase 1)
src/components/ui/Button.tsx                           (Phase 2)
src/components/ui/Card.tsx                             (Phase 2)
src/components/layout/BottomNav.tsx                    (Phase 2)
src/components/features/onboarding/OnboardingShell.tsx (Phase 3)
src/components/features/onboarding/ProgressDots.tsx    (Phase 3)
src/components/features/onboarding/AnalyzingOverlay.tsx (Phase 3)
src/components/features/onboarding/CompactResultView.tsx (Phase 3)
src/app/onboarding/welcome/page.tsx                    (Phase 3)
src/app/onboarding/trust/page.tsx                      (Phase 3)
src/app/scan/new/page.tsx                              (Phase 3)
src/app/scan/[id]/page.tsx                             (Phase 3)
src/app/app/page.tsx                                   (Phase 4)
src/app/garden/page.tsx                                (Phase 4)
src/app/history/page.tsx                               (Phase 4)
src/app/coach/page.tsx                                 (Phase 4)
src/app/premium/page.tsx                               (Phase 4)
```

---

## Verification Workflow

Da das Projekt keine Test-Suite hat, ist die Verifikation per Task:

```bash
# Dev-Server läuft idealerweise dauerhaft in einem zweiten Terminal:
cd C:/users/juerg/gartenscanner
npm run dev
# → http://localhost:3000
```

Nach jedem Task:
1. Browser auf relevante Route navigieren (Mobile-Viewport: 390 × 844 / iPhone 14)
2. Visuelle Verifikation gegen die Spec-Beschreibung
3. Optional: Chrome DevTools MCP `take_screenshot` für Vorher/Nachher

Wenn Chrome DevTools MCP nicht verfügbar ist: User bittet um manuelle Sichtkontrolle in einer Pause-Notiz.

---

## Phase 1 · Foundation

### Task 1: Erweiterte Farbtoken in globals.css

**Files:**
- Modify: `src/app/globals.css:3-55` (im `@theme`-Block)

- [ ] **Step 1: Bestehenden @theme-Block lesen**

```bash
sed -n '3,55p' src/app/globals.css
```
Expected: zeigt aktuelle Color-Tokens (forest, moss, sage, clay, sun, berry, sky, paper, ink-shortcuts, fonts, radius, shadows).

- [ ] **Step 2: Neue Tokens nach den bestehenden Color-Blocks einfügen**

In `src/app/globals.css` direkt nach Zeile 32 (`--color-sky-100: #dbe5eb;`) und vor dem `/* Ink shortcuts */`-Kommentar einfügen:

```css

  /* ===== Editorial Warm Tokens (2026-04 Overhaul) ===== */
  --color-bark-900: #3a2515;
  --color-clay-800: #6b3a1f;
  --color-terra-500: #a87842;
  --color-cream: #fefaf2;
  --color-linen: #f4ead8;
```

Außerdem im Shadow-Block (nach Zeile 54 `--shadow-float`) ergänzen:

```css
  --shadow-editorial: 0 8px 28px rgba(58, 42, 21, 0.08);
  --shadow-editorial-lg: 0 16px 48px rgba(58, 42, 21, 0.12);
```

- [ ] **Step 3: Verifizieren via Dev-Server**

Dev-Server starten (falls nicht schon läuft):
```bash
npm run dev
```
Browser öffnen, in DevTools-Console eingeben:
```js
getComputedStyle(document.documentElement).getPropertyValue('--color-bark-900')
```
Expected: `" #3a2515"` (mit führendem Space).

- [ ] **Step 4: Commit**

```bash
git add src/app/globals.css
git commit -m "feat(design): add warm editorial color tokens"
```

---

### Task 2: Editorial-Typografie-Klassen

**Files:**
- Modify: `src/app/globals.css:76-110` (Typography helpers section)

- [ ] **Step 1: Bestehende Typography-Klassen lesen**

```bash
sed -n '76,110p' src/app/globals.css
```
Expected: zeigt `.font-serif`, `.display-xl`, `.display-l`, `.display-m`, `.micro`.

- [ ] **Step 2: Neue Klassen nach `.micro` (nach Zeile 110) einfügen**

In `src/app/globals.css` direkt nach dem `.micro`-Block einfügen:

```css

/* ===== Editorial Typography (2026-04 Overhaul) ===== */
.pull-quote {
  font-family: var(--font-serif);
  font-style: italic;
  font-weight: 500;
  font-size: 1.125rem;
  line-height: 1.5;
  color: var(--color-bark-900);
  background: var(--color-linen);
  border-left: 3px solid var(--color-clay-800);
  border-radius: 0 8px 8px 0;
  padding: 0.75rem 0.875rem;
}

.eyebrow {
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--color-terra-500);
}

.latin-name {
  font-family: var(--font-serif);
  font-style: italic;
  font-weight: 400;
  color: var(--color-clay-800);
}
```

- [ ] **Step 3: Verifizieren**

Test-File temporär in eine bestehende Page einfügen (z.B. in `src/app/page.tsx` ans Ende):
```html
<p className="eyebrow">Test eyebrow</p>
<p className="pull-quote">Test pull quote.</p>
<p className="latin-name">Phytophthora infestans</p>
```
Im Browser sehen, dass die Styles greifen. Dann wieder entfernen — wird in späteren Tasks echt eingesetzt.

- [ ] **Step 4: Commit**

```bash
git add src/app/globals.css
git commit -m "feat(design): add editorial typography utility classes"
```

---

### Task 3: Motion-Keyframes (Bloom, Write, Tap)

**Files:**
- Modify: `src/app/globals.css:132-162` (Motion section)

- [ ] **Step 1: Bestehende Motion-Section lesen**

```bash
sed -n '132,162p' src/app/globals.css
```
Expected: `.anim-breath`, `.anim-pulse-ring`, `.shimmer`.

- [ ] **Step 2: Neue Motion-Klassen nach `.shimmer`-Block einfügen**

In `src/app/globals.css` direkt nach dem `@keyframes shimmer`-Block (nach Zeile 162) einfügen:

```css

/* ===== Editorial Motion Vocabulary (2026-04 Overhaul) ===== */
.anim-bloom {
  animation: bloom 600ms cubic-bezier(0.2, 0.8, 0.2, 1) both;
}
@keyframes bloom {
  0% { transform: scale(0.92); opacity: 0; }
  60% { transform: scale(1.04); opacity: 1; }
  100% { transform: scale(1); opacity: 1; }
}

.anim-write {
  stroke-dasharray: 600;
  stroke-dashoffset: 600;
  animation: write 1800ms ease-out forwards;
}
@keyframes write {
  to { stroke-dashoffset: 0; }
}

.tap-press {
  transition: transform 120ms cubic-bezier(0.2, 0.8, 0.2, 1);
}
.tap-press:active {
  transform: scale(0.96);
}

@media (prefers-reduced-motion: reduce) {
  .anim-bloom,
  .anim-write,
  .anim-breath,
  .anim-pulse-ring,
  .shimmer {
    animation: none !important;
  }
  .anim-write { stroke-dashoffset: 0; }
}
```

- [ ] **Step 3: Verifizieren via DevTools**

In Browser-Console:
```js
const el = document.createElement('div');
el.className = 'anim-bloom';
el.style.cssText = 'width:50px;height:50px;background:red;position:fixed;top:50%;left:50%';
document.body.appendChild(el);
setTimeout(() => el.remove(), 1500);
```
Expected: rotes Quadrat erscheint mit Bloom-Animation.

- [ ] **Step 4: Commit**

```bash
git add src/app/globals.css
git commit -m "feat(design): add bloom/write/tap motion vocabulary with reduced-motion respect"
```

---

## Phase 2 · Component Library

### Task 4: PhotoFrame-Komponente (Foto-Grading)

**Files:**
- Create: `src/components/ui/PhotoFrame.tsx`

- [ ] **Step 1: Komponente schreiben**

```tsx
// src/components/ui/PhotoFrame.tsx
import * as React from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

type AspectRatio = "square" | "portrait" | "wide" | "hero";

const ratioClasses: Record<AspectRatio, string> = {
  square: "aspect-square",
  portrait: "aspect-[3/4]",
  wide: "aspect-[16/9]",
  hero: "aspect-[5/4]",
};

interface PhotoFrameProps {
  src: string;
  alt: string;
  ratio?: AspectRatio;
  grade?: boolean;
  vignette?: boolean;
  rounded?: string;
  priority?: boolean;
  sizes?: string;
  className?: string;
}

/**
 * Konsistenter Foto-Container mit Editorial-Grading-Layer.
 * Default: warm Sepia, weiches Kontrast-Roll-off, sanftes Vignette.
 */
export function PhotoFrame({
  src,
  alt,
  ratio = "square",
  grade = true,
  vignette = true,
  rounded = "rounded-2xl",
  priority,
  sizes = "(max-width: 768px) 100vw, 500px",
  className,
}: PhotoFrameProps) {
  return (
    <div
      className={cn(
        "relative w-full overflow-hidden",
        ratioClasses[ratio],
        rounded,
        className
      )}
    >
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        priority={priority}
        className={cn(
          "object-cover",
          grade && "[filter:contrast(0.92)_saturate(0.85)_sepia(0.12)_brightness(1.02)]"
        )}
      />
      {vignette && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 [background:radial-gradient(ellipse_at_center,transparent_50%,rgba(58,37,21,0.18)_100%)]"
        />
      )}
    </div>
  );
}
```

- [ ] **Step 2: Smoke-Test in Landing-Page**

Temporär in `src/app/page.tsx` ans Ende der Hero-Section (etwa Zeile 175) einfügen:
```tsx
<div className="mt-8 max-w-xs mx-auto">
  <PhotoFrame
    src="https://upload.wikimedia.org/wikipedia/commons/f/f3/Tomatoes-on-the-bush.jpg"
    alt="Test"
    ratio="square"
  />
</div>
```
Plus Import oben:
```tsx
import { PhotoFrame } from "@/components/ui/PhotoFrame";
```
Browser auf `/`, sehen: Tomaten-Foto mit warmem Sepia-Look + Vignette.

- [ ] **Step 3: Smoke-Test entfernen, Komponente bleibt**

Die zwei Test-Lines aus `src/app/page.tsx` wieder entfernen. Import-Zeile auch entfernen.

- [ ] **Step 4: Commit**

```bash
git add src/components/ui/PhotoFrame.tsx
git commit -m "feat(ui): add PhotoFrame with editorial grading"
```

---

### Task 5: BotanicalIcon-System + erste 5 Marks

**Files:**
- Create: `src/components/ui/BotanicalIcon.tsx`
- Create: `src/components/icons/botanical/index.ts`
- Create: `src/components/icons/botanical/Tomato.tsx`
- Create: `src/components/icons/botanical/Fern.tsx`
- Create: `src/components/icons/botanical/Mushroom.tsx`
- Create: `src/components/icons/botanical/Leaf.tsx`
- Create: `src/components/icons/botanical/Sun.tsx`

- [ ] **Step 1: Wrapper-Komponente schreiben**

```tsx
// src/components/ui/BotanicalIcon.tsx
import * as React from "react";
import { cn } from "@/lib/utils";
import { botanicalRegistry, type BotanicalName } from "@/components/icons/botanical";

interface BotanicalIconProps {
  name: BotanicalName;
  size?: number;
  framed?: boolean;
  animate?: boolean;
  className?: string;
  ariaLabel?: string;
}

export function BotanicalIcon({
  name,
  size = 48,
  framed = true,
  animate = false,
  className,
  ariaLabel,
}: BotanicalIconProps) {
  const Mark = botanicalRegistry[name];
  if (!Mark) return null;

  const inner = (
    <Mark
      className={cn(
        "h-[70%] w-[70%]",
        animate && "[&_path]:anim-write [&_circle]:anim-bloom [&_ellipse]:anim-bloom"
      )}
    />
  );

  if (!framed) {
    return (
      <span
        className={cn("inline-flex items-center justify-center", className)}
        style={{ width: size, height: size }}
        role={ariaLabel ? "img" : undefined}
        aria-label={ariaLabel}
      >
        {inner}
      </span>
    );
  }

  return (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded-full bg-cream border-[1.5px] border-terra-500/70",
        className
      )}
      style={{ width: size, height: size }}
      role={ariaLabel ? "img" : undefined}
      aria-label={ariaLabel}
    >
      {inner}
    </span>
  );
}
```

- [ ] **Step 2: Registry-Index schreiben**

```ts
// src/components/icons/botanical/index.ts
import { Tomato } from "./Tomato";
import { Fern } from "./Fern";
import { Mushroom } from "./Mushroom";
import { Leaf } from "./Leaf";
import { Sun } from "./Sun";

export const botanicalRegistry = {
  tomato: Tomato,
  fern: Fern,
  mushroom: Mushroom,
  leaf: Leaf,
  sun: Sun,
} as const;

export type BotanicalName = keyof typeof botanicalRegistry;
```

- [ ] **Step 3: Fünf Mark-Komponenten schreiben**

Alle nutzen denselben Stroke-Stil (2.5px, bark-900, round caps, no fill).

```tsx
// src/components/icons/botanical/Tomato.tsx
import * as React from "react";

export function Tomato({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      stroke="#3a2515"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M50 90 Q50 60 35 40 Q40 30 50 30 Q60 30 65 40 Q50 60 50 90" />
      <path d="M50 70 L40 50 M50 70 L60 50 M50 50 L42 35 M50 50 L58 35" />
      <circle cx="50" cy="22" r="4" fill="#a04030" stroke="none" />
    </svg>
  );
}
```

```tsx
// src/components/icons/botanical/Fern.tsx
import * as React from "react";

export function Fern({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" fill="none" stroke="#3a2515" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M50 90 L50 30" />
      <path d="M50 55 Q30 45 18 25" />
      <path d="M50 55 Q70 45 82 25" />
      <path d="M50 35 Q35 28 25 12" />
      <path d="M50 35 Q65 28 75 12" />
    </svg>
  );
}
```

```tsx
// src/components/icons/botanical/Mushroom.tsx
import * as React from "react";

export function Mushroom({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" fill="none" stroke="#3a2515" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M20 50 Q20 25 50 25 Q80 25 80 50 Q80 55 75 55 L25 55 Q20 55 20 50 Z" />
      <path d="M40 55 L40 80 Q40 88 50 88 Q60 88 60 80 L60 55" />
      <circle cx="40" cy="40" r="2.5" fill="#3a2515" stroke="none" />
      <circle cx="55" cy="35" r="2" fill="#3a2515" stroke="none" />
      <circle cx="65" cy="44" r="1.8" fill="#3a2515" stroke="none" />
    </svg>
  );
}
```

```tsx
// src/components/icons/botanical/Leaf.tsx
import * as React from "react";

export function Leaf({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" fill="none" stroke="#3a2515" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M25 75 Q15 40 50 15 Q85 40 75 75 Q50 88 25 75 Z" />
      <path d="M50 18 L50 80" />
      <path d="M50 35 L35 45 M50 50 L30 60 M50 65 L38 73" />
      <path d="M50 35 L65 45 M50 50 L70 60 M50 65 L62 73" />
    </svg>
  );
}
```

```tsx
// src/components/icons/botanical/Sun.tsx
import * as React from "react";

export function Sun({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" fill="none" stroke="#3a2515" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="50" cy="50" r="18" />
      <path d="M50 25 L50 12 M50 75 L50 88 M25 50 L12 50 M75 50 L88 50 M33 33 L23 23 M67 67 L77 77 M67 33 L77 23 M33 67 L23 77" />
    </svg>
  );
}
```

- [ ] **Step 4: Smoke-Test in Landing-Page**

Temporär in `src/app/page.tsx` ans Ende der Hero-Section einfügen:
```tsx
import { BotanicalIcon } from "@/components/ui/BotanicalIcon";
// ...
<div className="mt-8 flex gap-4 justify-center">
  <BotanicalIcon name="tomato" size={64} />
  <BotanicalIcon name="fern" size={64} />
  <BotanicalIcon name="mushroom" size={64} />
  <BotanicalIcon name="leaf" size={64} />
  <BotanicalIcon name="sun" size={64} />
</div>
```
Browser auf `/`, alle 5 Marks erscheinen in Cream-Kreisen mit Terra-Border. Dann Test-Code wieder entfernen.

- [ ] **Step 5: Commit**

```bash
git add src/components/ui/BotanicalIcon.tsx src/components/icons/botanical/
git commit -m "feat(ui): add BotanicalIcon system with first 5 botanical marks"
```

---

### Task 6: 18 weitere Botanical-Marks

**Files:**
- Create: `src/components/icons/botanical/Insect.tsx`
- Create: `src/components/icons/botanical/Snail.tsx`
- Create: `src/components/icons/botanical/Aphid.tsx`
- Create: `src/components/icons/botanical/Worm.tsx`
- Create: `src/components/icons/botanical/Rain.tsx`
- Create: `src/components/icons/botanical/Shovel.tsx`
- Create: `src/components/icons/botanical/Scissors.tsx`
- Create: `src/components/icons/botanical/WateringCan.tsx`
- Create: `src/components/icons/botanical/Root.tsx`
- Create: `src/components/icons/botanical/Fruit.tsx`
- Create: `src/components/icons/botanical/Flower.tsx`
- Create: `src/components/icons/botanical/Mildew.tsx`
- Create: `src/components/icons/botanical/Pest.tsx`
- Create: `src/components/icons/botanical/Compost.tsx`
- Create: `src/components/icons/botanical/Pot.tsx`
- Create: `src/components/icons/botanical/RaisedBed.tsx`
- Create: `src/components/icons/botanical/Seedling.tsx`
- Create: `src/components/icons/botanical/Journal.tsx`
- Create: `src/components/icons/botanical/Compass.tsx`
- Modify: `src/components/icons/botanical/index.ts`

- [ ] **Step 1: 18 Mark-Komponenten in einem Rutsch erstellen**

Jede Datei nutzt das gleiche Pattern: SVG 100×100 viewBox, stroke `#3a2515`, strokeWidth `2.5`, no fill.

`Insect.tsx`:
```tsx
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
```

`Snail.tsx`:
```tsx
import * as React from "react";
export function Snail({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" fill="none" stroke="#3a2515" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M15 75 Q40 75 50 65 L70 50" />
      <circle cx="50" cy="55" r="22" />
      <circle cx="50" cy="55" r="14" />
      <circle cx="50" cy="55" r="6" />
      <path d="M70 50 L78 40 M68 45 L75 35" />
    </svg>
  );
}
```

`Aphid.tsx`:
```tsx
import * as React from "react";
export function Aphid({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" fill="none" stroke="#3a2515" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <ellipse cx="35" cy="55" rx="14" ry="11" />
      <ellipse cx="58" cy="48" rx="11" ry="9" />
      <ellipse cx="75" cy="42" rx="8" ry="7" />
      <path d="M30 65 L25 75 M40 65 L40 76 M50 60 L52 72" />
    </svg>
  );
}
```

`Worm.tsx`:
```tsx
import * as React from "react";
export function Worm({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" fill="none" stroke="#3a2515" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M15 70 Q30 50 45 70 Q60 90 75 70 Q85 60 85 55" />
      <circle cx="86" cy="52" r="3" />
    </svg>
  );
}
```

`Rain.tsx`:
```tsx
import * as React from "react";
export function Rain({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" fill="none" stroke="#3a2515" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M25 35 Q15 35 15 25 Q15 15 25 15 Q30 5 45 12 Q60 5 70 18 Q85 18 85 33 Q85 42 75 42 L25 42 Q15 42 15 35 Z" />
      <path d="M30 58 L25 72 M50 58 L45 72 M70 58 L65 72 M40 65 L35 80 M60 65 L55 80" />
    </svg>
  );
}
```

`Shovel.tsx`:
```tsx
import * as React from "react";
export function Shovel({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" fill="none" stroke="#3a2515" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M50 10 L50 55" />
      <rect x="44" y="10" width="12" height="8" rx="2" />
      <path d="M30 55 L50 80 L70 55 Q70 50 50 50 Q30 50 30 55 Z" />
    </svg>
  );
}
```

`Scissors.tsx`:
```tsx
import * as React from "react";
export function Scissors({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" fill="none" stroke="#3a2515" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="30" cy="72" r="10" />
      <circle cx="70" cy="72" r="10" />
      <path d="M37 65 L88 14 M63 65 L12 14" />
    </svg>
  );
}
```

`WateringCan.tsx`:
```tsx
import * as React from "react";
export function WateringCan({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" fill="none" stroke="#3a2515" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M25 40 L25 75 Q25 85 35 85 L65 85 Q75 85 75 75 L75 40 Z" />
      <path d="M75 50 L92 35 L92 28" />
      <path d="M88 22 L92 28 L96 22 M88 32 L92 28 L96 32" />
      <path d="M30 30 L70 30 Q72 35 70 40 L30 40 Q28 35 30 30 Z" />
      <path d="M40 25 L60 25" />
    </svg>
  );
}
```

`Root.tsx`:
```tsx
import * as React from "react";
export function Root({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" fill="none" stroke="#3a2515" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M50 10 L50 50" />
      <path d="M50 50 Q35 60 30 80 M50 50 Q65 60 70 80" />
      <path d="M50 55 Q40 70 45 88 M50 55 Q60 70 55 88" />
      <path d="M50 60 Q50 75 50 90" />
    </svg>
  );
}
```

`Fruit.tsx`:
```tsx
import * as React from "react";
export function Fruit({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" fill="none" stroke="#3a2515" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M50 25 Q25 25 25 55 Q25 85 50 85 Q75 85 75 55 Q75 25 50 25" />
      <path d="M50 25 Q50 18 55 12 Q60 8 65 12" />
      <path d="M50 25 L45 12" />
    </svg>
  );
}
```

`Flower.tsx`:
```tsx
import * as React from "react";
export function Flower({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" fill="none" stroke="#3a2515" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="50" cy="35" r="6" />
      <ellipse cx="50" cy="20" rx="6" ry="10" />
      <ellipse cx="65" cy="30" rx="10" ry="6" />
      <ellipse cx="65" cy="45" rx="6" ry="10" transform="rotate(45 65 45)" />
      <ellipse cx="50" cy="50" rx="10" ry="6" />
      <ellipse cx="35" cy="45" rx="6" ry="10" transform="rotate(-45 35 45)" />
      <ellipse cx="35" cy="30" rx="10" ry="6" />
      <path d="M50 42 L50 90" />
      <path d="M50 70 L62 60 M50 78 L38 68" />
    </svg>
  );
}
```

`Mildew.tsx`:
```tsx
import * as React from "react";
export function Mildew({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" fill="none" stroke="#3a2515" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M25 75 Q15 40 50 15 Q85 40 75 75 Q50 88 25 75 Z" />
      <path d="M50 18 L50 80" />
      <circle cx="35" cy="40" r="3" />
      <circle cx="60" cy="35" r="2.5" />
      <circle cx="42" cy="55" r="3.5" />
      <circle cx="65" cy="55" r="2" />
      <circle cx="38" cy="68" r="2.5" />
      <circle cx="58" cy="70" r="3" />
    </svg>
  );
}
```

`Pest.tsx`:
```tsx
import * as React from "react";
export function Pest({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" fill="none" stroke="#3a2515" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <ellipse cx="50" cy="55" rx="22" ry="15" />
      <circle cx="42" cy="50" r="2" fill="#3a2515" stroke="none" />
      <circle cx="58" cy="50" r="2" fill="#3a2515" stroke="none" />
      <path d="M28 50 L18 42 M28 60 L18 65 M72 50 L82 42 M72 60 L82 65" />
      <path d="M40 38 L36 28 M50 35 L50 25 M60 38 L64 28" />
    </svg>
  );
}
```

`Compost.tsx`:
```tsx
import * as React from "react";
export function Compost({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" fill="none" stroke="#3a2515" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M20 80 L80 80 L75 35 L25 35 Z" />
      <path d="M30 35 L30 80 M50 35 L50 80 M70 35 L70 80" />
      <path d="M35 25 Q40 15 50 18 Q55 22 50 28" />
      <path d="M55 22 Q65 18 68 28" />
    </svg>
  );
}
```

`Pot.tsx`:
```tsx
import * as React from "react";
export function Pot({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" fill="none" stroke="#3a2515" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M25 45 L75 45 L70 88 L30 88 Z" />
      <path d="M22 45 L78 45 Q82 45 82 41 L82 38 Q82 35 78 35 L22 35 Q18 35 18 38 L18 41 Q18 45 22 45" />
      <path d="M50 35 L50 18 Q50 10 55 10" />
      <path d="M44 25 Q40 18 50 18 Q60 18 56 25" />
    </svg>
  );
}
```

`RaisedBed.tsx`:
```tsx
import * as React from "react";
export function RaisedBed({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" fill="none" stroke="#3a2515" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect x="10" y="50" width="80" height="35" rx="2" />
      <path d="M10 60 L90 60" />
      <path d="M25 50 L25 38 Q25 30 35 32" />
      <path d="M25 38 L20 30 M25 38 L30 30" />
      <path d="M50 50 L50 25 Q50 15 60 18" />
      <path d="M50 25 L43 15 M50 25 L57 15" />
      <path d="M75 50 L75 35 Q75 28 82 30" />
      <path d="M75 35 L70 27 M75 35 L80 27" />
    </svg>
  );
}
```

`Seedling.tsx`:
```tsx
import * as React from "react";
export function Seedling({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" fill="none" stroke="#3a2515" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M50 88 L50 50" />
      <path d="M50 55 Q35 50 28 35 Q42 32 50 55 Z" />
      <path d="M50 55 Q65 50 72 35 Q58 32 50 55 Z" />
      <path d="M30 88 L70 88" />
    </svg>
  );
}
```

`Journal.tsx`:
```tsx
import * as React from "react";
export function Journal({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" fill="none" stroke="#3a2515" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M22 15 L78 15 Q82 15 82 19 L82 85 Q82 89 78 89 L22 89 Q18 89 18 85 L18 19 Q18 15 22 15 Z" />
      <path d="M30 15 L30 89" />
      <path d="M40 30 L70 30 M40 42 L70 42 M40 54 L70 54 M40 66 L60 66" />
    </svg>
  );
}
```

`Compass.tsx`:
```tsx
import * as React from "react";
export function Compass({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" fill="none" stroke="#3a2515" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="50" cy="50" r="35" />
      <path d="M50 25 L60 50 L50 75 L40 50 Z" fill="#a04030" stroke="#3a2515" />
      <circle cx="50" cy="50" r="3" fill="#3a2515" stroke="none" />
    </svg>
  );
}
```

- [ ] **Step 2: Registry-Index aktualisieren**

Komplettes Ersetzen von `src/components/icons/botanical/index.ts`:

```ts
import { Tomato } from "./Tomato";
import { Fern } from "./Fern";
import { Mushroom } from "./Mushroom";
import { Leaf } from "./Leaf";
import { Sun } from "./Sun";
import { Insect } from "./Insect";
import { Snail } from "./Snail";
import { Aphid } from "./Aphid";
import { Worm } from "./Worm";
import { Rain } from "./Rain";
import { Shovel } from "./Shovel";
import { Scissors } from "./Scissors";
import { WateringCan } from "./WateringCan";
import { Root } from "./Root";
import { Fruit } from "./Fruit";
import { Flower } from "./Flower";
import { Mildew } from "./Mildew";
import { Pest } from "./Pest";
import { Compost } from "./Compost";
import { Pot } from "./Pot";
import { RaisedBed } from "./RaisedBed";
import { Seedling } from "./Seedling";
import { Journal } from "./Journal";
import { Compass } from "./Compass";

export const botanicalRegistry = {
  tomato: Tomato,
  fern: Fern,
  mushroom: Mushroom,
  leaf: Leaf,
  sun: Sun,
  insect: Insect,
  snail: Snail,
  aphid: Aphid,
  worm: Worm,
  rain: Rain,
  shovel: Shovel,
  scissors: Scissors,
  wateringCan: WateringCan,
  root: Root,
  fruit: Fruit,
  flower: Flower,
  mildew: Mildew,
  pest: Pest,
  compost: Compost,
  pot: Pot,
  raisedBed: RaisedBed,
  seedling: Seedling,
  journal: Journal,
  compass: Compass,
} as const;

export type BotanicalName = keyof typeof botanicalRegistry;
```

- [ ] **Step 3: Visuell verifizieren**

Temporär in `src/app/page.tsx` (Hero-Section) ein Grid einfügen:
```tsx
<div className="mt-8 grid grid-cols-6 gap-3 max-w-md mx-auto">
  {(["tomato","fern","mushroom","leaf","sun","insect","snail","aphid","worm","rain","shovel","scissors","wateringCan","root","fruit","flower","mildew","pest","compost","pot","raisedBed","seedling","journal","compass"] as const).map(n => (
    <BotanicalIcon key={n} name={n} size={56} ariaLabel={n} />
  ))}
</div>
```
Browser auf `/`, alle 24 Marks erscheinen sauber gerendert. Dann Test-Code wieder entfernen.

- [ ] **Step 4: Commit**

```bash
git add src/components/icons/botanical/
git commit -m "feat(ui): add 18 more botanical marks (24 total)"
```

---

### Task 7: Button — Editorial-Variant + Tap-Motion

**Files:**
- Modify: `src/components/ui/Button.tsx:35-46` (variantClasses)
- Modify: `src/components/ui/Button.tsx:54-59` (baseClasses)

- [ ] **Step 1: Variant-Type erweitern (Zeile 7)**

In `src/components/ui/Button.tsx` Zeile 7 ändern:

```tsx
type Variant = "primary" | "secondary" | "tertiary" | "ghost" | "destructive" | "editorial";
```

- [ ] **Step 2: variantClasses-Map ergänzen (Zeile 35-46)**

Nach dem `destructive`-Eintrag in `variantClasses` (vor der schließenden `}`) einfügen:

```tsx
  editorial:
    "bg-bark-900 text-cream hover:bg-clay-800 shadow-[0_4px_14px_rgba(58,37,21,0.15)]",
```

- [ ] **Step 3: Tap-Motion uniform machen (Zeile 54-59)**

`baseClasses` komplett ersetzen:

```tsx
const baseClasses = cn(
  "inline-flex items-center justify-center gap-2 font-medium select-none",
  "transition-transform duration-150 ease-out active:scale-[0.96]",
  "transition-colors duration-200",
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest-700/30 focus-visible:ring-offset-2 focus-visible:ring-offset-cream",
  "disabled:opacity-30 disabled:cursor-not-allowed disabled:active:scale-100",
  "touch-manipulation"
);
```

Außerdem alle `active:scale-[0.98]` aus den existierenden variantClasses (primary, secondary, ghost, destructive) entfernen — die Tap-Motion ist jetzt Base.

Konkret:
- `primary`: `"bg-forest-700 text-paper hover:bg-forest-800 shadow-[0_4px_12px_rgba(28,42,33,0.08)]"`
- `secondary`: `"bg-transparent text-forest-700 border-[1.5px] border-forest-700 hover:bg-forest-700 hover:text-paper"`
- `ghost`: `"bg-sage-100 text-forest-800 hover:bg-sage-200"`
- `destructive`: `"bg-berry-500 text-paper hover:bg-berry-600"`
- `tertiary`: bleibt unverändert

- [ ] **Step 4: Verifizieren**

Temporär in `src/app/page.tsx` neben dem bestehenden CTA einfügen:
```tsx
<Button variant="editorial" size="lg">Editorial Button</Button>
```
Plus Import. Browser auf `/`, neuer Button mit Bark-BG und Cream-Text sichtbar. Tap-Effekt feiner. Dann Test wieder entfernen.

- [ ] **Step 5: Commit**

```bash
git add src/components/ui/Button.tsx
git commit -m "feat(ui): add editorial Button variant and unified tap motion"
```

---

### Task 8: Card — Cream-Surface + Editorial-Variant

**Files:**
- Modify: `src/components/ui/Card.tsx:5-15`

- [ ] **Step 1: Variant-Type erweitern**

In `src/components/ui/Card.tsx` Zeile 5 ändern:

```tsx
  variant?: "default" | "flat" | "outlined" | "premium" | "editorial";
```

- [ ] **Step 2: variantClasses anpassen**

Komplettes Ersetzen von Zeilen 9-15 (`variantClasses`-Object):

```tsx
const variantClasses = {
  default: "bg-cream shadow-[var(--shadow-editorial)]",
  flat: "bg-cream",
  outlined: "bg-cream border border-sage-200",
  premium:
    "bg-cream shadow-[var(--shadow-editorial-lg)] ring-[1.5px] ring-clay-500/30",
  editorial:
    "bg-linen border-l-[3px] border-clay-800 shadow-[var(--shadow-editorial)]",
};
```

- [ ] **Step 3: CardBody Padding erhöhen (Zeile 41-46)**

Komplettes Ersetzen:

```tsx
export function CardBody({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("p-[22px]", className)} {...props} />;
}
```

- [ ] **Step 4: Verifizieren**

Dev-Server: `/app` (Dashboard) öffnen. Cards (Today-Hero, TaskCard, PlantTile) zeigen jetzt warmen Cream-BG statt Paper. Visuell wärmer, kein Layout-Bruch.

- [ ] **Step 5: Commit**

```bash
git add src/components/ui/Card.tsx
git commit -m "feat(ui): switch Card to cream surface, add editorial variant, increase padding"
```

---

### Task 9: BottomNav — Cream-Tint + Active-Indicator

**Files:**
- Modify: `src/components/layout/BottomNav.tsx:42-72`

- [ ] **Step 1: Glass-Tint anpassen (Zeile 44)**

In `src/components/layout/BottomNav.tsx` die Klasse des inneren Containers (Zeile 44) ändern von:

```tsx
<div className="pointer-events-auto relative flex items-end justify-between rounded-[28px] bg-paper/95 backdrop-blur-xl px-3 py-2 shadow-[0_12px_40px_rgba(28,42,33,0.12)] border border-sage-200/60">
```

zu:

```tsx
<div className="pointer-events-auto relative flex items-end justify-between rounded-[28px] bg-cream/95 backdrop-blur-xl px-3 py-2 shadow-[0_12px_40px_rgba(58,37,21,0.12)] border border-terra-500/20">
```

- [ ] **Step 2: Center-Action Glow auf warmer Note (Zeile 57)**

Ändern von:
```tsx
<span className="absolute inset-0 rounded-full bg-forest-700/20 blur-xl group-hover:bg-forest-700/30 transition" />
```
zu:
```tsx
<span className="absolute inset-0 rounded-full bg-clay-500/30 blur-xl group-hover:bg-clay-500/40 transition" />
```

- [ ] **Step 3: Active-Indicator-Dot zur NavItem hinzufügen**

Komplettes Ersetzen der `NavItem`-Funktion (ab Zeile 75):

```tsx
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
```

- [ ] **Step 4: Verifizieren**

Dev-Server: `/app` öffnen. BottomNav hat warmen Cream-Tint, aktiver Tab hat dunklen Bark-Indicator-Dot, Center-Camera-Button hat warmen Clay-Glow.

- [ ] **Step 5: Commit**

```bash
git add src/components/layout/BottomNav.tsx
git commit -m "feat(ui): warm BottomNav tint with active indicator dot"
```

---

### Task 10: EmptyState-Komponente

**Files:**
- Create: `src/components/ui/EmptyState.tsx`

- [ ] **Step 1: Komponente schreiben**

```tsx
// src/components/ui/EmptyState.tsx
import * as React from "react";
import Link from "next/link";
import { BotanicalIcon } from "@/components/ui/BotanicalIcon";
import type { BotanicalName } from "@/components/icons/botanical";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  mark: BotanicalName;
  title: string;
  body: string;
  ctaLabel?: string;
  ctaHref?: string;
  onCta?: () => void;
  className?: string;
}

export function EmptyState({
  mark,
  title,
  body,
  ctaLabel,
  ctaHref,
  onCta,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center px-6 py-12 mx-auto max-w-sm",
        className
      )}
    >
      <BotanicalIcon name={mark} size={88} animate />
      <h3 className="display-m mt-6 mb-2 text-bark-900">{title}</h3>
      <p className="text-[14px] leading-relaxed text-ink-muted mb-6">{body}</p>
      {ctaLabel && ctaHref && (
        <Link
          href={ctaHref}
          className="tap-press inline-flex items-center justify-center rounded-[14px] bg-bark-900 px-6 h-12 text-cream text-[14px] font-medium hover:bg-clay-800 transition-colors"
        >
          {ctaLabel}
        </Link>
      )}
      {ctaLabel && onCta && !ctaHref && (
        <button
          type="button"
          onClick={onCta}
          className="tap-press inline-flex items-center justify-center rounded-[14px] bg-bark-900 px-6 h-12 text-cream text-[14px] font-medium hover:bg-clay-800 transition-colors"
        >
          {ctaLabel}
        </button>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Smoke-Test**

Temporär in `src/app/page.tsx` einfügen:
```tsx
<EmptyState
  mark="seedling"
  title="Dein Garten ist noch leer"
  body="Scanne deine erste Pflanze, um sie hier zu sehen."
  ctaLabel="Erste Pflanze scannen"
  ctaHref="/scan/new"
/>
```
Plus Import. Browser auf `/`, EmptyState mit Seedling-Mark + Editorial-CTA. Mark animiert beim ersten Mount (Write-Animation). Dann Test entfernen.

- [ ] **Step 3: Commit**

```bash
git add src/components/ui/EmptyState.tsx
git commit -m "feat(ui): add EmptyState component with botanical mark"
```

---

### Task 11: LoadingState-Komponente

**Files:**
- Create: `src/components/ui/LoadingState.tsx`

- [ ] **Step 1: Komponente schreiben**

```tsx
// src/components/ui/LoadingState.tsx
"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface LoadingStateProps {
  hint?: string;
  className?: string;
  /** Schwellwert in ms, ab dem ein „dauert länger"-Sub-Hint gezeigt wird. Default 2000. */
  longHintThresholdMs?: number;
}

export function LoadingState({
  hint = "Einen Moment …",
  className,
  longHintThresholdMs = 2000,
}: LoadingStateProps) {
  const [showLongHint, setShowLongHint] = React.useState(false);

  React.useEffect(() => {
    const t = setTimeout(() => setShowLongHint(true), longHintThresholdMs);
    return () => clearTimeout(t);
  }, [longHintThresholdMs]);

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center min-h-[40vh] gap-4 px-6",
        className
      )}
    >
      <span className="anim-breath inline-block h-3 w-3 rounded-full bg-bark-900" />
      <p className="font-serif italic text-[14px] text-ink-muted">{hint}</p>
      {showLongHint && (
        <p className="font-serif italic text-[12px] text-ink-soft opacity-60">
          Lädt etwas länger als sonst …
        </p>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Smoke-Test**

Temporär eine `loading.tsx` in irgendeiner Route erstellen (z.B. `src/app/garden/loading.tsx`):
```tsx
import { LoadingState } from "@/components/ui/LoadingState";
export default function Loading() { return <LoadingState hint="Lade deinen Garten …" />; }
```
Dev-Server: `/garden` aufrufen, Slow-Network-Throttling in DevTools. LoadingState erscheint kurz. Wenn das Laden ohnehin schnell ist, in Page-File künstlich `await new Promise(r => setTimeout(r, 3000))` einfügen, testen, dann entfernen.

- [ ] **Step 3: Test-loading.tsx behalten oder entfernen**

Wenn `/garden/loading.tsx` bereits existiert: zurücksetzen. Wenn nicht: kann bleiben — wird in Phase 4 ohnehin in alle Routes ergänzt.

- [ ] **Step 4: Commit**

```bash
git add src/components/ui/LoadingState.tsx
git commit -m "feat(ui): add LoadingState with breath-pulse and delayed long-hint"
```

---

### Task 12: ErrorState-Komponente

**Files:**
- Create: `src/components/ui/ErrorState.tsx`

- [ ] **Step 1: Komponente schreiben**

```tsx
// src/components/ui/ErrorState.tsx
"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface ErrorStateProps {
  title?: string;
  body?: string;
  detail?: string;
  onRetry?: () => void;
  className?: string;
}

/**
 * Fehler-Layout für error.tsx Boundaries und manuelle Fehler-States.
 * Mark in berry-Color als visueller Marker.
 */
export function ErrorState({
  title = "Etwas ist schiefgelaufen",
  body = "Wir konnten den Vorgang nicht abschließen. Versuche es bitte erneut.",
  detail,
  onRetry,
  className,
}: ErrorStateProps) {
  const [showDetail, setShowDetail] = React.useState(false);

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center px-6 py-12 mx-auto max-w-sm",
        className
      )}
    >
      <span className="inline-flex h-[88px] w-[88px] items-center justify-center rounded-full bg-cream border-[1.5px] border-berry-500/60">
        <svg viewBox="0 0 100 100" className="h-[60%] w-[60%]" fill="none" stroke="#7a2e2e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="50" cy="50" r="35" />
          <path d="M50 32 L50 56" />
          <circle cx="50" cy="68" r="2.5" fill="#7a2e2e" stroke="none" />
        </svg>
      </span>
      <h3 className="display-m mt-6 mb-2 text-bark-900">{title}</h3>
      <p className="text-[14px] leading-relaxed text-ink-muted mb-6">{body}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="tap-press inline-flex items-center justify-center rounded-[14px] bg-bark-900 px-6 h-12 text-cream text-[14px] font-medium hover:bg-clay-800 transition-colors mb-3"
        >
          Erneut versuchen
        </button>
      )}
      {detail && (
        <>
          <button
            type="button"
            onClick={() => setShowDetail((v) => !v)}
            className="text-[12px] text-ink-soft underline-offset-4 hover:underline"
          >
            {showDetail ? "Details ausblenden" : "Details anzeigen"}
          </button>
          {showDetail && (
            <pre className="mt-3 max-w-full overflow-x-auto rounded-md bg-linen p-3 text-left text-[11px] text-ink-muted whitespace-pre-wrap break-words">
              {detail}
            </pre>
          )}
        </>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Verifizieren via temporärer error.tsx**

Optional: `src/app/garden/error.tsx`:
```tsx
"use client";
import { ErrorState } from "@/components/ui/ErrorState";
export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  return <ErrorState title="Garten-Daten konnten nicht geladen werden" body="Vielleicht ist die Verbindung gerade unterbrochen." onRetry={reset} detail={error.message} />;
}
```
Künstlich Fehler in `/garden/page.tsx` erzeugen (`throw new Error("test")`), Browser zeigt ErrorState. Test wieder entfernen.

- [ ] **Step 3: Commit**

```bash
git add src/components/ui/ErrorState.tsx
git commit -m "feat(ui): add ErrorState component with optional detail toggle"
```

---

## Phase 3 · Signature Moments

### Task 13: OnboardingShell + ProgressDots — Editorial-Tint

**Files:**
- Modify: `src/components/features/onboarding/OnboardingShell.tsx:31`
- Modify: `src/components/features/onboarding/OnboardingShell.tsx:41,49` (Back-Button-Style)
- Modify: `src/components/features/onboarding/ProgressDots.tsx`

- [ ] **Step 1: Bestehende ProgressDots lesen**

```bash
cat src/components/features/onboarding/ProgressDots.tsx
```
Expected: Komponente mit aktiven/inaktiven Dots, vermutlich in forest/sage-Farben.

- [ ] **Step 2: Background der OnboardingShell auf Linen ändern**

In `src/components/features/onboarding/OnboardingShell.tsx` Zeile 30-32 ändern:

```tsx
    <div
      className={cn(
        "min-h-[100dvh] bg-linen flex flex-col safe-top",
        className
      )}
    >
```

- [ ] **Step 3: Back-Button Surface auf Cream umstellen**

In `src/components/features/onboarding/OnboardingShell.tsx` Zeile 41 und 49 die Klasse `bg-paper/80 hover:bg-paper` zu `bg-cream/80 hover:bg-cream` ändern. Beide Vorkommen.

- [ ] **Step 4: ProgressDots in Terra umfärben**

Öffne `src/components/features/onboarding/ProgressDots.tsx`. Ersetze alle Color-Klassen:
- aktiver Dot: `bg-bark-900`
- inaktiver Dot: `bg-terra-500/30`
- ggf. „abgeschlossener" Dot: `bg-terra-500`

(Exakte Klassen hängen vom Bestand ab — anpassen in dem Sinn, dass die neue Palette greift, ohne die Logik zu ändern.)

- [ ] **Step 5: Verifizieren**

Dev-Server: `/onboarding/welcome` öffnen. Background ist warm-linen, Back-Button (außer Welcome wo `hideBack`), ProgressDots in Terra-Tönen.

- [ ] **Step 6: Commit**

```bash
git add src/components/features/onboarding/OnboardingShell.tsx src/components/features/onboarding/ProgressDots.tsx
git commit -m "feat(onboarding): switch shell to linen background and editorial dot tones"
```

---

### Task 14: Onboarding Welcome — Live-drawn Mark + Editorial-Stack

**Files:**
- Modify: `src/app/onboarding/welcome/page.tsx`

- [ ] **Step 1: Komplettes Ersetzen der Datei**

`src/app/onboarding/welcome/page.tsx` mit folgendem Inhalt überschreiben:

```tsx
"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { OnboardingShell } from "@/components/features/onboarding/OnboardingShell";
import {
  trackOnboardingStarted,
  trackOnboardingStepViewed,
} from "@/domain/analytics/onboarding";

const STARTED_FLAG = "gartenscan:onboarding_started_flag";

export default function WelcomePage() {
  const startedRef = useRef(false);

  useEffect(() => {
    trackOnboardingStepViewed("WELCOME");
    if (!startedRef.current) {
      const alreadyStarted = sessionStorage.getItem(STARTED_FLAG);
      if (!alreadyStarted) {
        trackOnboardingStarted(
          document.referrer.includes(window.location.host)
            ? "landing"
            : "direct"
        );
        sessionStorage.setItem(STARTED_FLAG, "1");
      }
      startedRef.current = true;
    }
  }, []);

  return (
    <OnboardingShell step={1} hideBack>
      <div className="flex-1 flex flex-col items-center justify-center pb-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="relative mb-10"
        >
          <LiveDrawnMark />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2, ease: "easeOut" }}
          className="text-center max-w-md mx-auto"
        >
          <p className="eyebrow mb-3">Willkommen</p>
          <h1 className="font-serif text-[40px] leading-[1.05] text-bark-900 font-normal tracking-tight mb-4">
            Erkennen.{" "}
            <span className="italic text-clay-800">Verstehen.</span>{" "}
            Lösen.
          </h1>
          <p className="text-[15px] leading-relaxed text-ink-muted">
            Dein Garten in der Hosentasche — vom ersten Foto zur konkreten Antwort in 30 Sekunden.
          </p>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.35, ease: "easeOut" }}
        className="flex flex-col gap-3"
      >
        <Link
          href="/onboarding/use-cases"
          className="tap-press flex items-center justify-center rounded-[14px] bg-bark-900 hover:bg-clay-800 text-cream text-[15px] font-medium px-6 transition-colors"
          style={{ height: 52 }}
        >
          Los geht&apos;s
        </Link>
        <span className="text-center text-[12px] text-ink-muted/70 pt-1">
          Schon Konto? Später anmelden
        </span>
      </motion.div>
    </OnboardingShell>
  );
}

function LiveDrawnMark() {
  return (
    <div className="relative h-[200px] w-[200px] flex items-center justify-center">
      <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle,rgba(168,120,66,0.18)_0%,transparent_65%)] anim-breath" />
      <div className="relative h-[160px] w-[160px] rounded-full bg-cream border-[1.5px] border-terra-500/70 flex items-center justify-center">
        <svg
          viewBox="0 0 100 100"
          fill="none"
          stroke="#3a2515"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-[70%] w-[70%]"
        >
          <path className="anim-write" d="M50 90 Q50 60 35 40 Q40 30 50 30 Q60 30 65 40 Q50 60 50 90" />
          <path className="anim-write" style={{ animationDelay: "0.6s" }} d="M50 70 L40 50 M50 70 L60 50 M50 50 L42 35 M50 50 L58 35" />
          <circle className="anim-bloom" style={{ animationDelay: "2.2s" }} cx="50" cy="22" r="4" fill="#a04030" stroke="none" />
        </svg>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verifizieren**

Dev-Server: `/onboarding/welcome` öffnen (ggf. localStorage `gartenscan:onboarding:v1` löschen, damit Guard nicht zur App umleitet). Mockup zeigt:
- Linen-Background
- Editorial-Eyebrow „WILLKOMMEN" in Terra
- Display in Bark mit Italic-Akzent „Verstehen" in Clay
- Tomate-Mark zeichnet sich live (ca. 2.4s gesamt), rote Frucht erscheint zuletzt
- Editorial-CTA in Bark/Cream

Mobile-Viewport (390 × 844) prüfen.

- [ ] **Step 3: Commit**

```bash
git add src/app/onboarding/welcome/page.tsx
git commit -m "feat(onboarding): redesign welcome with live-drawn botanical mark and editorial stack"
```

---

### Task 15: Onboarding Trust — Pull-Quotes statt Bullet-Liste

**Files:**
- Modify: `src/app/onboarding/trust/page.tsx`

- [ ] **Step 1: Komplettes Ersetzen der Datei**

`src/app/onboarding/trust/page.tsx` mit folgendem Inhalt überschreiben:

```tsx
"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { OnboardingShell } from "@/components/features/onboarding/OnboardingShell";
import { OnboardingHeadline } from "@/components/features/onboarding/OnboardingHeadline";
import { useOnboarding } from "@/hooks/useOnboarding";
import { trackOnboardingStepViewed } from "@/domain/analytics/onboarding";

const QUOTES = [
  {
    eyebrow: "Datenschutz",
    quote:
      "Deine Fotos verlassen dein Gerät erst, wenn du auf „analysieren" tippst.",
    foot: "Speicherung lokal, keine Cloud-Synchronisation ohne Premium.",
  },
  {
    eyebrow: "Methode",
    quote:
      "Wir vergleichen dein Bild mit Tausenden kuratierter Beispiele — und sagen dir, wie sicher wir uns sind.",
    foot: "Konfidenzwert auf jedem Result, plus Alternativen bei Unsicherheit.",
  },
  {
    eyebrow: "Empfehlung",
    quote:
      "Jede Maßnahme passt zu deinem Garten — Standort, Bodenart, Saison, was du selbst zur Hand hast.",
    foot: "Drei Empfehlungstiefen: schnell · ausgewogen · gründlich.",
  },
];

export default function TrustPage() {
  const { advance } = useOnboarding();

  useEffect(() => {
    trackOnboardingStepViewed("TRUST");
  }, []);

  return (
    <OnboardingShell step={4}>
      <div className="pt-6 flex-1">
        <OnboardingHeadline
          title="Wie wir es ernst meinen."
          subtitle="Drei Versprechen, die du jederzeit einfordern kannst."
        />

        <motion.div
          className="space-y-4 mt-8"
          initial="hidden"
          animate="visible"
          variants={{
            visible: { transition: { staggerChildren: 0.15 } },
            hidden: {},
          }}
        >
          {QUOTES.map((q) => (
            <motion.div
              key={q.eyebrow}
              variants={{
                hidden: { opacity: 0, y: 12 },
                visible: { opacity: 1, y: 0 },
              }}
            >
              <article className="rounded-2xl bg-cream border border-terra-500/20 p-5 shadow-[var(--shadow-editorial)]">
                <p className="eyebrow mb-3">{q.eyebrow}</p>
                <p className="pull-quote">{q.quote}</p>
                <p className="text-[12px] text-ink-muted mt-3 leading-relaxed">
                  {q.foot}
                </p>
              </article>
            </motion.div>
          ))}
        </motion.div>
      </div>

      <div className="pt-8">
        <button
          type="button"
          onClick={() => advance("TRUST", {})}
          className="tap-press flex w-full items-center justify-center rounded-[14px] bg-bark-900 hover:bg-clay-800 text-cream text-[15px] font-medium transition-colors"
          style={{ height: 52 }}
        >
          Probier&apos;s aus
        </button>
      </div>
    </OnboardingShell>
  );
}
```

- [ ] **Step 2: Verifizieren**

Dev-Server: durch Onboarding klicken bis `/onboarding/trust`. Drei Editorial-Karten mit Pull-Quotes, gestaffeltem Fade-In, Foot-Note unter dem Quote, Editorial-CTA. Mobile-Viewport prüfen.

- [ ] **Step 3: Commit**

```bash
git add src/app/onboarding/trust/page.tsx
git commit -m "feat(onboarding): replace trust steps with editorial pull-quote cards"
```

---

### Task 16: Scan Capture — Asymmetrische Eckmarker + Italic-Tooltip

**Files:**
- Modify: `src/app/scan/new/page.tsx`

- [ ] **Step 1: DemoPickerMode komplett ersetzen (Zeile 59-210)**

Ersetze die Funktion `DemoPickerMode` (von Zeile 59 bis 210, also bis vor dem `// ====...`-Trenner) mit:

```tsx
function DemoPickerMode() {
  const router = useRouter();
  const [selected, setSelected] = useState<string | null>(null);

  useEffect(() => {
    if (!selected) return;
    const t = setTimeout(() => {
      router.push(`/scan/${selected}`);
    }, 2800);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected]);

  return (
    <main className="min-h-screen bg-linen safe-top">
      <header className="flex items-center justify-between gap-3 px-4 h-14">
        <Link
          href="/app"
          className="tap-press flex h-10 w-10 items-center justify-center rounded-full bg-cream/80 hover:bg-cream transition"
        >
          <ArrowLeft className="h-5 w-5 text-bark-900" />
        </Link>
        <BetaBadge />
        <div className="h-10 w-10" />
      </header>

      <div className="mx-auto max-w-lg px-5 pt-4 pb-12">
        <p className="eyebrow mb-3">Beispiel-Scan</p>
        <h1 className="font-serif text-[28px] leading-tight text-bark-900 mb-2 font-normal tracking-tight">
          Wähle ein Beispiel
        </h1>
        <p className="text-[13px] text-ink-muted mb-7 leading-relaxed">
          Echte Bilderkennung folgt in Kürze. Für jetzt drei typische Fälle, damit du siehst, wie gartenscan funktioniert.
        </p>

        <div className="flex flex-col gap-3">
          {demoEntries.map((entry) => (
            <button
              key={entry.id}
              onClick={() => setSelected(entry.id)}
              disabled={selected !== null}
              className={cn(
                "tap-press group relative flex items-center gap-4 rounded-2xl bg-cream p-3 text-left shadow-[var(--shadow-editorial)] transition",
                selected === entry.id
                  ? "ring-2 ring-bark-900"
                  : "hover:shadow-[0_10px_28px_rgba(58,37,21,0.1)]",
                selected !== null && selected !== entry.id && "opacity-50"
              )}
            >
              <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl">
                <Image
                  src={entry.image}
                  alt={entry.label}
                  fill
                  sizes="64px"
                  className="object-cover [filter:contrast(0.92)_saturate(0.85)_sepia(0.12)_brightness(1.02)]"
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[15px] font-semibold text-bark-900 truncate">
                  {entry.label}
                </p>
                <p className="text-[12px] text-ink-muted truncate">
                  {entry.hint}
                </p>
              </div>
              <ArrowRight className="h-4 w-4 text-bark-900 opacity-60 group-hover:opacity-100 transition" />
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {selected && (
          <AnalyzingOverlay onComplete={() => router.push(`/scan/${selected}`)} />
        )}
      </AnimatePresence>
    </main>
  );
}
```

Dazu Imports am Anfang der Datei ergänzen:
```tsx
import { AnalyzingOverlay } from "@/components/features/onboarding/AnalyzingOverlay";
```

Und die `Sparkles`, `Camera` aus dem Lucide-Import entfernen, falls nur in der ersetzten Funktion benutzt. **Achtung:** Diese Imports werden weiter unten in `PhotoCaptureMode` noch gebraucht — also dranlassen.

- [ ] **Step 2: PhotoCaptureMode aktualisieren (CornerBrackets asymmetrisch + Italic-Tooltip)**

Ersetze die Funktion `CornerBrackets` (Zeile 445-466) komplett:

```tsx
function CornerBrackets() {
  return (
    <>
      {/* Top-right L (rotate 90) */}
      <div className="absolute top-0 right-0 h-8 w-8 border-t-[3px] border-r-[3px] border-sun-500 rounded-tr-[14px]" />
      {/* Bottom-left L (rotate 270) */}
      <div className="absolute bottom-0 left-0 h-8 w-8 border-b-[3px] border-l-[3px] border-sun-500 rounded-bl-[14px]" />
      {/* Outline frame for whole area */}
      <div className="absolute inset-0 border-2 border-cream/70 rounded-[14px]" />
    </>
  );
}
```

Im Capture-View (innerhalb `PhotoCaptureMode`) den „Pflanze erkannt"-Hint (Zeile 303-309) ersetzen mit Italic-Serif:

```tsx
<div className="absolute inset-0 flex items-center justify-center">
  <span className="rounded-full bg-bark-900/65 backdrop-blur-xl px-3 py-1.5 text-[12px] italic font-serif text-cream">
    Ein Blatt mittig im Rahmen
  </span>
</div>
```

Und den unteren Caption (Zeile 314-318) ersetzen:

```tsx
{phase === "capture" && (
  <p className="relative z-10 text-center text-[12px] italic font-serif text-cream/75 mt-6">
    Tipp: Sonne im Rücken für klare Farben
  </p>
)}
```

- [ ] **Step 3: Verifizieren**

Dev-Server: `/scan/new` öffnen.

DemoPicker-Mode (Default, da `ENABLE_PHOTO_UPLOAD = false`):
- Linen-Background, Cream-Cards mit warmem Grading auf Thumbnails
- Editorial-Eyebrow „BEISPIEL-SCAN"
- Tap auf Card → AnalyzingOverlay erscheint, redirected nach 2.8s

PhotoCaptureMode (zum Testen `ENABLE_PHOTO_UPLOAD = true` temporär setzen):
- Asymmetrische Eckmarker (nur top-right + bottom-left in Sun-Color)
- Italic-Tooltip „Ein Blatt mittig im Rahmen"
- Italic-Tipp unten „Sonne im Rücken …"
- Nach Test wieder auf `false`.

- [ ] **Step 4: Commit**

```bash
git add src/app/scan/new/page.tsx
git commit -m "feat(scan): redesign capture with editorial demo picker and asymmetric markers"
```

---

### Task 17: AnalyzingOverlay — Spinner-Ring + Italic-Status

**Files:**
- Modify: `src/components/features/onboarding/AnalyzingOverlay.tsx`

- [ ] **Step 1: Komplettes Ersetzen der Datei**

`src/components/features/onboarding/AnalyzingOverlay.tsx` mit folgendem Inhalt überschreiben:

```tsx
"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

const STEPS = [
  "Blatt erkannt",
  "Muster vergleichen",
  "Diagnose erstellen",
];

interface Props {
  onComplete: () => void;
  /** Gesamtdauer in ms. Default 2800. */
  totalDurationMs?: number;
}

export function AnalyzingOverlay({
  onComplete,
  totalDurationMs = 2800,
}: Props) {
  const [activeStep, setActiveStep] = useState(0);
  const stepDuration = Math.floor(totalDurationMs / (STEPS.length + 1));

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];
    STEPS.forEach((_, i) => {
      timers.push(setTimeout(() => setActiveStep(i), (i + 1) * stepDuration));
    });
    timers.push(setTimeout(onComplete, totalDurationMs));
    return () => timers.forEach(clearTimeout);
  }, [onComplete, stepDuration, totalDurationMs]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-bark-900/92 backdrop-blur-xl px-8"
    >
      <div className="relative flex h-[110px] w-[110px] items-center justify-center mb-8">
        <div className="absolute inset-0 rounded-full border-2 border-cream/15" />
        <motion.div
          className="absolute inset-0 rounded-full border-2 border-t-sun-500 border-r-sun-500/40 border-b-transparent border-l-transparent"
          animate={{ rotate: 360 }}
          transition={{ duration: 1.6, repeat: Infinity, ease: "linear" }}
        />
      </div>

      <p className="eyebrow text-sun-500 mb-3">
        Schritt {activeStep + 1} / {STEPS.length}
      </p>

      <div className="relative h-[40px] w-full max-w-xs overflow-hidden">
        {STEPS.map((s, i) => (
          <motion.p
            key={s}
            initial={{ opacity: 0, y: 8 }}
            animate={{
              opacity: activeStep === i ? 1 : 0,
              y: activeStep === i ? 0 : -8,
            }}
            transition={{ duration: 0.4 }}
            className="absolute inset-0 font-serif italic text-[18px] text-cream text-center"
          >
            {s}
          </motion.p>
        ))}
      </div>
    </motion.div>
  );
}
```

- [ ] **Step 2: Backwards-Compat im OnboardingScan-Demo prüfen**

`src/app/onboarding/scan/page.tsx` öffnen und prüfen, ob `stepDurationMs` Prop noch übergeben wird. Falls ja, ersetzen durch `totalDurationMs={2800}` oder Default belassen (die alte Prop-Signatur wurde geändert).

```bash
grep -rn "AnalyzingOverlay" src/
```
Alle Vorkommen prüfen und Props anpassen, falls nötig.

- [ ] **Step 3: Verifizieren**

Dev-Server: `/scan/new` → Card antippen → AnalyzingOverlay zeigt:
- Bark-Background mit Backdrop-Blur
- Spinner-Ring oben (Sun-500-Top-Color, 1.6s rotation)
- Eyebrow „SCHRITT 1 / 3" in Sun-Color
- Italic-Serif-Status, wechselt durch 3 Steps
- Nach 2.8s redirect zur Result-Page

Auch `/onboarding/scan` durchspielen, AnalyzingOverlay erscheint identisch.

- [ ] **Step 4: Commit**

```bash
git add src/components/features/onboarding/AnalyzingOverlay.tsx src/app/onboarding/scan/page.tsx
git commit -m "feat(scan): redesign analyzing overlay with spinner ring and italic 3-step status"
```

---

### Task 18: Scan Result — Hero + Cream-Sheet + Pull-Quote + Action-Card

**Files:**
- Modify: `src/app/scan/[id]/page.tsx`

- [ ] **Step 1: Bestehende Datei vollständig lesen**

```bash
cat src/app/scan/[id]/page.tsx
```
Verschaffe dir Überblick über alle bestehenden Sections (Hero, Confidence, Recommendation, Methods, Safety, etc.). Die Logik (Daten-Fetch, Personalisierung) bleibt — nur die Hero/Title/Quote-Section am Anfang wird neu strukturiert.

- [ ] **Step 2: Hero-Section + Title-Block redesignen**

Im File `src/app/scan/[id]/page.tsx`:

A) **Hero-Container** (aktuell ab `<div className="relative h-[55vh] min-h-[400px]...`) ersetzen mit:

```tsx
{/* Hero with graded photo */}
<div className="relative h-[280px] overflow-hidden">
  <Image
    src={entry.imageUrl}
    alt={entry.name}
    fill
    priority
    sizes="(max-width: 768px) 100vw, 500px"
    className="object-cover [filter:contrast(0.92)_saturate(0.85)_sepia(0.12)_brightness(1.02)]"
  />
  <div className="absolute inset-0 [background:radial-gradient(ellipse_at_center,transparent_50%,rgba(58,37,21,0.25)_100%)]" />
  <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-b from-transparent to-bark-900/40" />

  {/* Top bar */}
  <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-4 pt-[max(env(safe-area-inset-top),1rem)] pb-3">
    <Link
      href="/app"
      className="tap-press flex h-10 w-10 items-center justify-center rounded-full bg-cream/92 backdrop-blur-md transition"
    >
      <ArrowLeft className="h-5 w-5 text-bark-900" />
    </Link>
    <button className="tap-press flex h-10 w-10 items-center justify-center rounded-full bg-cream/92 backdrop-blur-md transition">
      <Share2 className="h-4.5 w-4.5 text-bark-900" strokeWidth={1.75} />
    </button>
  </div>

  {/* Confidence pill (top-left under back button) */}
  <div className="absolute top-[calc(max(env(safe-area-inset-top),1rem)+52px)] left-4 anim-bloom" style={{ animationDelay: "200ms" }}>
    <span className="inline-flex items-center gap-2 rounded-full bg-cream/92 backdrop-blur-md px-3 py-1 text-[10px] font-bold text-bark-900">
      <span className={cn(
        "h-1.5 w-1.5 rounded-full",
        confidence >= 0.8 ? "bg-moss-500" : confidence >= 0.5 ? "bg-sun-500" : "bg-berry-500"
      )} />
      {Math.round(confidence * 100)} % sicher
    </span>
  </div>
</div>
```

Dazu am Anfang der Datei `cn` importieren falls noch nicht vorhanden:
```tsx
import { cn } from "@/lib/utils";
```

B) **Cream-Sheet + Title-Block** (was vorher im Hero-Bottom-Overlay war) als separate Section direkt nach dem Hero einfügen:

```tsx
{/* Editorial sheet sliding over hero */}
<div className="relative -mt-7 rounded-t-[28px] bg-cream pt-6 pb-6 px-5 shadow-[0_-8px_24px_rgba(58,37,21,0.06)] anim-bloom" style={{ animationDelay: "400ms" }}>
  <p className="eyebrow mb-2">
    <CategoryLabel category={entry.category} />
  </p>
  <h1 className="font-serif text-[28px] leading-tight text-bark-900 font-normal tracking-tight mb-1">
    {entry.name}
  </h1>
  {entry.latinName && (
    <p className="latin-name text-[13px] mb-4">{entry.latinName}</p>
  )}
  {entry.editorialQuote && (
    <p className="pull-quote mt-4 mb-2">{entry.editorialQuote}</p>
  )}
  <div className="flex items-center gap-2 mt-3 flex-wrap">
    {entry.safety.toxicToChildren && (
      <Badge tone="danger" icon={<AlertTriangle className="h-3 w-3" />}>
        Giftig
      </Badge>
    )}
    <UrgencyIndicator urgency={entry.urgency} />
  </div>
</div>
```

**Anmerkung:** Falls `entry.latinName` und `entry.editorialQuote` im Content-Schema noch nicht existieren — dieser Code degradiert sauber (zeigt nichts), Felder sind optional. Schema-Erweiterung in Task 22 (Content-Phase).

C) Den Rest der bestehenden Page (Recommendation, Methods, Safety etc.) UNVERÄNDERT lassen — nur sicherstellen, dass das Outer-Wrapper jetzt `bg-linen` statt `bg-sage-50` ist:

Im Outer-`<div>` (vermutlich Zeile ~40):
```tsx
<div className="min-h-screen bg-linen pb-28">
```

- [ ] **Step 3: Verifizieren**

Dev-Server: `/scan/weed_loewenzahn` (oder eine andere Demo-ID) öffnen:
- Hero (280px, graded Foto, Vignette)
- Confidence-Pill mit moss-500 Dot bloomt nach 200ms
- Cream-Sheet schiebt sich über Hero (-28px Round-Top), bloomt nach 400ms
- Eyebrow „UNKRAUT" in Terra
- Display-Name in Bark
- Latin-Name (falls vorhanden) in Italic Clay
- Pull-Quote (falls vorhanden) in Linen-Box mit Clay-Border
- Restliche Page (Methods, Safety) unverändert sichtbar darunter

Mobile-Viewport prüfen, scroll-Verhalten testen.

- [ ] **Step 4: Commit**

```bash
git add src/app/scan/[id]/page.tsx
git commit -m "feat(scan): redesign result reveal with editorial hero, cream sheet, pull-quote"
```

---

### Task 19: CompactResultView — Konsistente Reveal-Optik

**Files:**
- Modify: `src/components/features/onboarding/CompactResultView.tsx`

- [ ] **Step 1: Komplettes Ersetzen der Datei**

`src/components/features/onboarding/CompactResultView.tsx` mit folgendem Inhalt überschreiben:

```tsx
"use client";

import Image from "next/image";
import { Lock, ArrowRight } from "lucide-react";
import type { ContentEntry, TreatmentMethod } from "@/domain/types";

interface Props {
  entry: ContentEntry;
  metaBadge: string;
  summary: string;
  onPrimaryCta: () => void;
  onSkip: () => void;
}

export function CompactResultView({
  entry,
  metaBadge,
  summary,
  onPrimaryCta,
  onSkip,
}: Props) {
  const recommended =
    entry.methods.find((m) => m.style.includes("BALANCED")) ??
    entry.methods[0];
  const others = entry.methods
    .filter((m) => m.id !== recommended?.id)
    .slice(0, 2);

  return (
    <div className="flex flex-col pt-4 pb-6">
      <div className="relative h-48 w-full overflow-hidden rounded-2xl mb-4">
        <Image
          src={entry.imageUrl}
          alt={entry.name}
          fill
          sizes="(max-width: 640px) 100vw, 512px"
          className="object-cover [filter:contrast(0.92)_saturate(0.85)_sepia(0.12)_brightness(1.02)]"
        />
        <div className="absolute inset-0 [background:radial-gradient(ellipse_at_center,transparent_50%,rgba(58,37,21,0.18)_100%)]" />
      </div>

      <p className="eyebrow self-start mb-2">{metaBadge}</p>
      <h1 className="font-serif text-[28px] leading-tight text-bark-900 mb-2 font-normal tracking-tight">
        {entry.name}
      </h1>
      <p className="text-[14px] leading-relaxed text-ink-muted mb-6">
        {summary}
      </p>

      <p className="eyebrow mb-3">Das kannst du jetzt tun</p>
      <div className="space-y-3 mb-8">
        {recommended && <RecommendedCard method={recommended} />}
        {others.map((m) => (
          <BlurredTeaserCard key={m.id} method={m} />
        ))}
      </div>

      <button
        type="button"
        onClick={onPrimaryCta}
        className="tap-press flex w-full items-center justify-center rounded-[14px] bg-bark-900 hover:bg-clay-800 text-cream text-[15px] font-medium transition-colors"
        style={{ height: 52 }}
      >
        Alle Maßnahmen ansehen
      </button>
      <button
        type="button"
        onClick={onSkip}
        className="mt-3 w-full py-2 text-[13px] text-ink-muted hover:text-bark-900 transition"
      >
        Später, danke
      </button>
    </div>
  );
}

function RecommendedCard({ method }: { method: TreatmentMethod }) {
  return (
    <div className="rounded-2xl bg-gradient-to-br from-bark-900 to-clay-800 p-4 shadow-[var(--shadow-editorial)]">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-sun-500">
          Empfohlen für dich
        </span>
        <ArrowRight className="h-4 w-4 text-cream" />
      </div>
      <h3 className="font-serif text-[16px] font-bold text-cream mb-1">
        {method.title}
      </h3>
      <p className="text-[13px] leading-relaxed text-cream/75 line-clamp-2">
        {method.description}
      </p>
    </div>
  );
}

function BlurredTeaserCard({ method }: { method: TreatmentMethod }) {
  return (
    <div className="relative rounded-2xl bg-linen p-4 overflow-hidden">
      <div className="opacity-50">
        <h3 className="font-serif text-[15px] font-semibold text-bark-900 mb-1">
          {method.title}
        </h3>
        <p className="text-[13px] leading-relaxed text-ink-muted line-clamp-2">
          {method.description}
        </p>
      </div>
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-linen/40 to-linen/95 backdrop-blur-[1.5px]" />
      <div className="absolute bottom-3 right-3">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-sun-500 px-2.5 py-1 text-[10px] font-bold text-bark-900">
          <Lock className="h-3 w-3" strokeWidth={2.5} />
          Premium
        </span>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verifizieren**

Dev-Server: durchs Onboarding klicken bis `/onboarding/scan`, eine Demo wählen, AnalyzingOverlay durchlaufen — Compact-Result zeigt:
- Hero-Bild graded
- Editorial-Eyebrow
- Display-Name in Bark
- RecommendedCard mit Bark-Clay-Gradient (Premium-Action-Style)
- BlurredTeaserCard mit Soft-Linen-Blur statt scharfem Lock

- [ ] **Step 3: Commit**

```bash
git add src/components/features/onboarding/CompactResultView.tsx
git commit -m "feat(onboarding): align CompactResultView with editorial reveal language"
```

---

## Phase 4 · Roll-out auf Rest-App

### Task 20: Dashboard — graded PhotoFrames + warmer Tint

**Files:**
- Modify: `src/app/app/page.tsx`

- [ ] **Step 1: Outer-Wrapper auf Linen-Background**

In `src/app/app/page.tsx` den Outer-Container (ggf. via `AppShell`-Klasse) sicherstellen, dass der Background warm ist. Im File selbst die `safe-top`-Wrapper-Section auf `bg-linen` setzen, falls nicht durch AppShell abgedeckt. (`AppShell` nicht in dieser Iteration ändern — Linen-Background nur über Page-spezifische Wrapper.)

In Zeile 32 (`<div className="px-5 pt-6 pb-2 safe-top">`) keine Änderung nötig — der Hintergrund kommt von AppShell.

Stattdessen: prüfe `src/components/layout/AppShell.tsx`. Falls dort `bg-sage-50` o.ä. gesetzt ist, ändere auf `bg-linen`:

```bash
grep -n "bg-" src/components/layout/AppShell.tsx
```
Wenn `bg-sage-50` gefunden, ersetzen durch `bg-linen`.

- [ ] **Step 2: PlantTile-Komponente upgraden**

Öffne `src/components/features/garden/PlantTile.tsx` (Pfad ggf. via `grep -rn "PlantTile" src/`).

Innerhalb der Komponente das `<Image>` durch `<PhotoFrame>` ersetzen oder das Image mit dem Filter-Klassen-String ergänzen:

```tsx
className="object-cover [filter:contrast(0.92)_saturate(0.85)_sepia(0.12)_brightness(1.02)]"
```

Außerdem die Card-BG von `bg-paper` auf `bg-cream` ändern, falls vorhanden.

- [ ] **Step 3: Premium-CTA-Card im Dashboard updaten (Zeile 162-180)**

In `src/app/app/page.tsx` den Premium-Link-Block ersetzen mit warmem Cream-Surface:

```tsx
<section className="mt-8 px-5">
  <Link
    href="/premium"
    className="tap-press group flex items-center gap-4 rounded-[18px] bg-cream border border-clay-500/30 p-4 hover:border-clay-500/50 transition"
  >
    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-clay-800 to-clay-500 text-cream">
      <Sparkles className="h-5 w-5" strokeWidth={1.75} />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-[14px] font-semibold text-bark-900">
        Premium 7 Tage kostenlos
      </p>
      <p className="text-[12px] text-ink-muted">
        Unbegrenzte Scans · Wetterwarnungen · Expertenchat
      </p>
    </div>
    <ArrowRight className="h-5 w-5 text-clay-800 group-hover:translate-x-0.5 transition" />
  </Link>
</section>
```

- [ ] **Step 4: April-im-Garten-Card ebenfalls warmer Editorial-Style (Zeile 131-160)**

Die Klasse `bg-gradient-to-br from-moss-500 to-forest-700` ersetzen durch `bg-gradient-to-br from-bark-900 to-clay-800`. Eyebrow-Klassen wie `text-sage-200/90` ersetzen durch `text-sun-500/90`.

- [ ] **Step 5: Verifizieren**

Dev-Server: `/app` öffnen. Dashboard zeigt warmen Linen-BG, Cream-Cards, Plant-Photos sind graded, Premium-CTA in warmer Editorial-Optik.

- [ ] **Step 6: Commit**

```bash
git add src/app/app/page.tsx src/components/layout/AppShell.tsx src/components/features/garden/PlantTile.tsx
git commit -m "feat(app): apply editorial palette and grading to dashboard"
```

---

### Task 21: EmptyStates für garden, history, coach

**Files:**
- Modify: `src/app/garden/page.tsx`
- Modify: `src/app/history/page.tsx`
- Modify: `src/app/coach/page.tsx`

- [ ] **Step 1: Garden-EmptyState einbauen**

In `src/app/garden/page.tsx` finde den Bereich, der leere Plant-Listen behandelt (oder die Mock-Daten sind leer). Füge oben ein:

```tsx
import { EmptyState } from "@/components/ui/EmptyState";
```

Wo der leere Zustand gerendert wird (oder als Conditional über einer leeren Liste):

```tsx
{plants.length === 0 ? (
  <EmptyState
    mark="seedling"
    title="Dein Garten ist noch leer"
    body="Scanne deine erste Pflanze, um sie hier zu sehen."
    ctaLabel="Erste Pflanze scannen"
    ctaHref="/scan/new"
  />
) : (
  // bestehende Plant-Liste
)}
```

Falls die Page aktuell hardcoded MOCK_PLANTS rendert ohne Empty-Check: Conditional einführen.

- [ ] **Step 2: History-EmptyState einbauen**

Analog in `src/app/history/page.tsx`:

```tsx
import { EmptyState } from "@/components/ui/EmptyState";

// ...
{scans.length === 0 ? (
  <EmptyState
    mark="journal"
    title="Noch keine Scans"
    body="Hier siehst du, was du erkannt hast — und wann."
    ctaLabel="Jetzt scannen"
    ctaHref="/scan/new"
  />
) : (
  // bestehende Liste
)}
```

- [ ] **Step 3: Coach-EmptyState einbauen**

Analog in `src/app/coach/page.tsx`. Der Coach hat ggf. keine echte „leere" Variante — falls nicht zutreffend, diesen Schritt überspringen. Sonst:

```tsx
import { EmptyState } from "@/components/ui/EmptyState";

// als Fallback wenn keine Tasks/Pläne vorhanden
{noPlan ? (
  <EmptyState
    mark="compass"
    title="Kein Plan für heute"
    body="Schau morgen wieder vorbei oder lies den Monatsbrief."
    ctaLabel="April-Brief lesen"
    ctaHref="/coach/april"
  />
) : (
  // bestehende Plan-Anzeige
)}
```

- [ ] **Step 4: Verifizieren**

Dev-Server: jede Route öffnen, MOCK-Daten temporär leeren (z.B. `MOCK_PLANTS = []` setzen), EmptyState erscheint mit Botanical-Mark + animated Write-Curve. Mock-Daten danach zurücksetzen.

- [ ] **Step 5: Commit**

```bash
git add src/app/garden/page.tsx src/app/history/page.tsx src/app/coach/page.tsx
git commit -m "feat(app): add EmptyState fallbacks for garden, history, coach"
```

---

### Task 22: Premium-Screen — Editorial Pull-Quotes

**Files:**
- Modify: `src/app/premium/page.tsx`

- [ ] **Step 1: Bestehenden Premium-Screen lesen**

```bash
cat src/app/premium/page.tsx
```
Identifiziere die „Promises"/Feature-Liste (vermutlich Bullet-Points).

- [ ] **Step 2: Promises in Editorial-Pull-Quote-Cards umwandeln**

Ersetze die Promises-Liste mit dem Editorial-Pattern (analog Task 15 Trust):

```tsx
const PROMISES = [
  {
    eyebrow: "Versprechen 1",
    quote: "Unbegrenzte Scans — schick los, was immer dir im Garten begegnet.",
    foot: "Inklusive aller Detail-Empfehlungen, ohne Soft-Locks.",
  },
  {
    eyebrow: "Versprechen 2",
    quote: "Wetter, das mitdenkt — Frost, Sturm, Hitze direkt für dein Beet.",
    foot: "Auf Basis deiner PLZ und der für dich relevanten Pflanzen.",
  },
  {
    eyebrow: "Versprechen 3",
    quote: "Eine Stimme, die dir antwortet — Gartencoach mit Kontext deines Beets.",
    foot: "Persönliche Antworten innerhalb 24 Stunden, sieben Tage die Woche.",
  },
];
```

Im JSX:

```tsx
<div className="space-y-4 my-8">
  {PROMISES.map((p) => (
    <article key={p.eyebrow} className="rounded-2xl bg-cream border border-terra-500/20 p-5 shadow-[var(--shadow-editorial)]">
      <p className="eyebrow mb-3">{p.eyebrow}</p>
      <p className="pull-quote">{p.quote}</p>
      <p className="text-[12px] text-ink-muted mt-3 leading-relaxed">{p.foot}</p>
    </article>
  ))}
</div>
```

Outer-Container von `bg-sage-50` auf `bg-linen`. CTA-Buttons auf `bg-bark-900` Editorial-Style.

- [ ] **Step 3: Verifizieren**

Dev-Server: `/premium` öffnen. Premium-Promises zeigen Editorial-Karten mit Pull-Quotes. CTA in Bark/Cream.

- [ ] **Step 4: Commit**

```bash
git add src/app/premium/page.tsx
git commit -m "feat(premium): redesign promises as editorial pull-quote cards"
```

---

### Task 23: Final Visual Smoke-Test + Pipeline-Update

**Files:** keine Code-Änderungen, nur Verifikation und Pipeline-Sync.

- [ ] **Step 1: Manueller Smoke-Test aller Routes (Mobile-Viewport 390 × 844)**

Routes durchgehen und gegen die Spec prüfen:

- `/` (Landing) — bewusst unverändert in dieser Iteration; wirkt im Vergleich „älter", das ist OK.
- `/onboarding/welcome` — Live-drawn Mark, Editorial-Stack ✓
- `/onboarding/use-cases` — bekommt Linen-BG durch Shell ✓
- `/onboarding/garden` — bekommt Linen-BG durch Shell ✓
- `/onboarding/trust` — Pull-Quote-Cards ✓
- `/onboarding/scan` — Demo-Picker, AnalyzingOverlay neu, CompactResult neu ✓
- `/onboarding/premium` — Linen-BG ✓
- `/app` — Cream-Cards, Bark-Premium-CTA, graded Plant-Photos ✓
- `/scan/new` — Linen-BG, Cream-Cards mit gradedThumbnails ✓
- `/scan/weed_loewenzahn` (Result) — Hero + Cream-Sheet + Pull-Quote ✓
- `/garden` — EmptyState (mit Mock leerer Liste) ✓
- `/history` — EmptyState ✓
- `/coach` — EmptyState (sofern leer) ✓
- `/premium` — Pull-Quote-Cards ✓

Bei jedem Punkt: Screenshot machen, sichtbare Defekte notieren, in Follow-up-PRs adressieren.

- [ ] **Step 2: Lighthouse-Check Mobile**

Chrome DevTools → Lighthouse → Mobile, Performance + Accessibility. Beide ≥ 90 erwartet (war vorher). Bei Regressions notieren.

- [ ] **Step 3: TypeScript-Check und Build**

```bash
npm run build
```
Expected: erfolgreicher Build ohne Type-Errors.

- [ ] **Step 4: Pipeline-Update**

Im PowerShell-Profil:
```powershell
pipeline-update -Slug gartenscanner `
  -Stage testing `
  -Progress 85 `
  -Summary "Design-Overhaul Phase 1-4 fertig: Warm Botanical Studio, Hybrid-Bildwelt, 3 Signature Moments, BotanicalIcon-Library, EmptyStates auf allen Routes" `
  -Todos @("Echter Vision-Provider (Pl@ntNet/Claude Vision)", "Content-Set 12 → 50 Einträge", "editorialQuote-Feld zu ContentEntry-Schema hinzufügen", "Coach-LLM-Integration", "Stripe + echte Paywall", "Impressum HRB/USt-IdNr ergänzen")
```

- [ ] **Step 5: Final Commit & Push**

```bash
git push origin main
```

Vercel deployt automatisch. Live-URL prüfen: https://gartenscan.de — alle Signature Moments live.

---

## Anhang A · Optionale Schema-Erweiterung

Die in Task 18 verwendeten Felder `entry.latinName` und `entry.editorialQuote` sind aktuell **optional** im Code (degradieren still, wenn nicht vorhanden). Damit sie wirklich angezeigt werden, muss das Content-Schema in `src/domain/types.ts` und das Content-Set in `src/content/` ergänzt werden:

```ts
// src/domain/types.ts (ergänzen in ContentEntry)
export interface ContentEntry {
  // ... bestehende Felder
  latinName?: string;
  editorialQuote?: string;
}
```

Dann im Content-Set (`src/content/*.ts`) für die 12 bestehenden Einträge die zwei neuen Felder pflegen. Dies ist **außerhalb dieses Plans** — sollte ein separater PR sein, weil es Content-Arbeit ist, kein Design.

---

## Anhang B · Spec-Coverage-Check

| Spec-Sektion | Plan-Task |
|---|---|
| §2.1 Farben (5 Tokens) | Task 1 |
| §2.2 Typografie-Klassen | Task 2 |
| §2.3 Motion-Vocabulary | Task 3 |
| §2.4 Foto-Grading-Recipe | Task 4 (PhotoFrame) + inline filter classes |
| §2.5 Botanical-Linework-Library (~20 Marks) | Tasks 5+6 (24 Marks) |
| §2.6 Density & Spacing | Tasks 8 (Card-Padding) + 14/15 (Section-Gaps) |
| §3.1 Button editorial | Task 7 |
| §3.2 Card editorial | Task 8 |
| §3.3 BottomNav warm tint | Task 9 |
| §3.4 PhotoFrame | Task 4 |
| §3.5 BotanicalIcon | Task 5 |
| §3.6 EmptyState | Task 10 |
| §3.7 LoadingState | Task 11 |
| §3.8 ErrorState (impliziert) | Task 12 |
| §4 Onboarding Welcome | Task 14 |
| §4 Onboarding Trust | Task 15 |
| §4 OnboardingShell update | Task 13 |
| §4 Onboarding Scan-Demo | Task 16 (DemoPicker) + Task 17 (Overlay) + Task 19 (CompactResult) |
| §5 Scan Capture | Task 16 (PhotoCapture) |
| §5 Analyzing Overlay | Task 17 |
| §6 Result Reveal | Task 18 |
| §7 Empty/Loading/Error Rollout | Tasks 21 (Empty), 11 (Loading), 12 (Error) |
| §8 Phase 1 (Foundation) | Tasks 1-3 |
| §8 Phase 2 (Components) | Tasks 4-12 |
| §8 Phase 3 (Signature Moments) | Tasks 13-19 |
| §8 Phase 4 (Roll-out) | Tasks 20-23 |
| §9 Erfolgskriterien (Smoke-Test, Lighthouse) | Task 23 |

Alle Spec-Anforderungen sind durch Tasks abgedeckt.
