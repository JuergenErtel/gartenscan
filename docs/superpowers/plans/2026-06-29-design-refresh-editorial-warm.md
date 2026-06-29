# Design Refresh — Editorial Warm konsolidieren — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Die bestehende „Editorial Warm"-Designsprache konsistent durchsetzen — Render-Bugs beheben, Tokens/Primitives als Single Source erzwingen, Restpalette (Garden/Actions/Coach) migrieren und Fake-UI zurücknehmen.

**Architecture:** Reine Politur ohne neue visuelle Richtung. Drei Wellen, jede macht die nächste einfacher: (1) Fundament — Tokens in `globals.css` ergänzen, Bug-Farben und Radius-/Schatten-Literale auf die Token-Skala bringen; (2) Primitives — `Button`/`Badge`/`.eyebrow`/State-Panels als Single Source, 44px-Touch-Targets, `focus-visible`; (3) Screens — Restpalette migrieren, Hero-Gradienten angleichen, tote/Fake-UI entfernen.

**Tech Stack:** Next.js 16, React 19, Tailwind CSS 4 (`@theme`-Tokens), TypeScript, Vitest, `cn()`-Helper aus `@/lib/utils`, `clsx` + `tailwind-merge`.

## Global Constraints

- **Mobile-first, Pflicht:** alle interaktiven Elemente ≥ 44px Touch-Target; vor Desktop auf Phone-Viewport (~390px) prüfen.
- **Sprache:** alle UI-Texte und Commit-Messages auf Deutsch.
- **Token-First:** kein neuer hardcodierter Hex/px-Wert, wo ein Token existiert oder ergänzt wird. Fehlt ein Token, wird er in `@theme` ergänzt — nie umgangen.
- **Keine neue Designsprache:** Editorial Warm bleibt (Palette: `linen/bark-900/clay-800/cream/terra-500`, Serif `Fraunces`). Keine neuen Farben/Typo außer den unten definierten Bug-Fix-Tokens.
- **Keine neue Logik:** zurückgenommene Features (Health-Status, Web-Share, Folgebehandlung) werden entfernt/ausgeblendet, nicht implementiert.
- **Regression-Gate:** `npx vitest run` muss grün bleiben (aktuell 38 Tests). Tailwind-4-`@theme`: jede `--color-*`-Variable erzeugt automatisch `bg-/text-/border-`-Utilities.
- **Commits:** häufig, ein Commit pro Task; Message endet mit `Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>`.

---

## File Structure

**Welle 1 (Fundament)**
- Modify `src/app/globals.css` — neue Farb-Tokens (`berry-700`, `clay-700`, `sun-800`, `sky-700`).
- Modify Primitives für Bug-/Token-Fixes: `Badge.tsx`, `BetaBadge.tsx`, `ErrorState.tsx`, `UrgencyIndicator.tsx`, `Card.tsx`, `Button.tsx`.
- Modify verstreute Bug-Stellen: `ScanFooterActions.tsx`, `PlantActions.tsx`, `UncertainMatchState.tsx`, `DeleteScanSheet.tsx`, `DeletePlantSheet.tsx`, `AiFallbackPanel.tsx`, `PhoneMockup.tsx`.
- Radius-/Schatten-Snapping breit über `src/components` + `src/app`.

**Welle 2 (Primitives)**
- Create `src/components/ui/StatePanel.tsx` — gemeinsame Hülle für Empty/Error.
- Create `src/components/ui/StatRow.tsx` — 3-up-Stat-Reihe.
- Modify `globals.css` — `.eyebrow-on-dark`-Variante.
- Modify Primitives + Consumer für Eyebrow/Button/Badge-Konsolidierung und Touch-Targets.

**Welle 3 (Screens)**
- Modify `garden/page.tsx`, `garden/[plantId]/page.tsx`, `scan/[id]/actions/page.tsx`, `coach/page.tsx`, `ActionDecisionPanel.tsx` — Palette + Hero-Gradient.
- Modify `PlantTile.tsx`, `AiFallbackSection.tsx`, `scan/[id]/page.tsx` — Fake-UI-Rücknahme.

---

## Welle 1 — Fundament: Tokens & Bugs

### Task 1: Fehlende Farb-Tokens ergänzen

**Files:**
- Modify: `src/app/globals.css:27-32` (Accent-Block) und `:34-39` (Editorial-Block)

**Interfaces:**
- Produces: Utilities `text-berry-700`, `bg-clay-700`/`text-clay-700`, `text-sun-800`, `text-sky-700` (über `@theme`-Vars), genutzt in Tasks 2-4.

- [ ] **Step 1: Tokens ergänzen**

In `src/app/globals.css` im `@theme`-Block ergänzen. Beim `berry`-Block:

```css
  --color-berry-700: #6a2727;
  --color-berry-600: #7a2e2e;
  --color-berry-500: #8a3a3a;
  --color-berry-100: #efd6d6;
```

Beim `clay`-Block (`clay-700` zwischen 600 `#9f5230` und 800 `#6b3a1f`):

```css
  --color-clay-700: #834326;
```

Beim `sun`-Block ergänzen (dunkles Sun für Text-auf-Amber):

```css
  --color-sun-800: #8a6a14;
```

Beim `sky`-Block ergänzen (Info-Text):

```css
  --color-sky-700: #3d5565;
```

- [ ] **Step 2: Verifizieren, dass Tokens definiert sind**

Run: `grep -nE "color-(berry-700|clay-700|sun-800|sky-700)" src/app/globals.css`
Expected: vier Treffer.

- [ ] **Step 3: Build-/Test-Gate**

Run: `npx vitest run`
Expected: PASS (38 Tests), keine Regression durch reine CSS-Ergänzung.

- [ ] **Step 4: Commit**

```bash
git add src/app/globals.css
git commit -m "$(printf 'style(tokens): berry-700, clay-700, sun-800, sky-700 ergaenzen\n\nCo-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>')"
```

---

### Task 2: `berry-700`-Render-Bug fixen (5 Stellen)

**Files:**
- Modify: `src/components/features/scan/ScanFooterActions.tsx:19`
- Modify: `src/components/features/garden/PlantActions.tsx:37`
- Modify: `src/components/features/scan/UncertainMatchState.tsx:172`
- Modify: `src/components/features/scan/DeleteScanSheet.tsx:117`
- Modify: `src/components/features/garden/DeletePlantSheet.tsx:93`

**Interfaces:**
- Consumes: `text-berry-700`-Token aus Task 1.

- [ ] **Step 1: Vorkommen finden**

Run: `grep -rn "berry-700" src/components src/app`
Expected: genau die 5 oben gelisteten Stellen (ggf. mehr — alle behandeln).

- [ ] **Step 2: Ersetzen**

Keine Textänderung nötig — der Klassenname `text-berry-700` bleibt, er rendert jetzt korrekt, da das Token existiert. Falls eine Stelle eine andere Schreibweise nutzt (z.B. `berry-700/80`), unverändert lassen — sie greift jetzt ebenfalls.

Bestätigen, dass keine Stelle ein *undefiniertes* berry-Token nutzt:

Run: `grep -rnE "berry-(200|300|400|700|800|900)" src/components src/app`
Expected: nur `berry-700` (jetzt definiert); falls andere undefinierte Stufen auftauchen, auf nächstliegende definierte Stufe (`berry-600`) ändern.

- [ ] **Step 3: Test-Gate**

Run: `npx vitest run`
Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "$(printf 'fix(ui): berry-700 Loesch-/Fehlertexte rendern jetzt rot\n\nCo-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>')"
```

---

### Task 3: BetaBadge — `clay-700` fixen + `cn()`

**Files:**
- Modify: `src/components/ui/BetaBadge.tsx` (komplette Datei)

**Interfaces:**
- Consumes: `text-clay-700`-Token aus Task 1, `cn` aus `@/lib/utils`.

- [ ] **Step 1: Datei umschreiben (String-Konkat → `cn()`)**

```tsx
import { cn } from "@/lib/utils";

export function BetaBadge({ className = "" }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full bg-clay-500/10 text-clay-700 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide border border-clay-500/20",
        className
      )}
      aria-label="Beta-Version"
    >
      Beta
    </span>
  );
}
```

- [ ] **Step 2: Test-Gate**

Run: `npx vitest run`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add src/components/ui/BetaBadge.tsx
git commit -m "$(printf 'fix(ui): BetaBadge clay-700 Token + cn()\n\nCo-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>')"
```

---

### Task 4: Hardcodierte Hex-Farben → Tokens

**Files:**
- Modify: `src/components/ui/Badge.tsx:21,23`
- Modify: `src/components/ui/UrgencyIndicator.tsx:18`
- Modify: `src/components/features/scan/AiFallbackPanel.tsx:42,45`
- Modify: `src/components/features/landing/PhoneMockup.tsx:128`
- Modify: `src/components/ui/ErrorState.tsx:35,38`

**Interfaces:**
- Consumes: `sun-800`, `sky-700`, `berry-600` aus Task 1 / vorhandene Tokens.

- [ ] **Step 1: Badge.tsx — `toneClasses` warning/info**

`Badge.tsx:21` und `:23` ersetzen:

```tsx
  warning: "bg-sun-100 text-sun-800 border border-sun-400/50",
  danger: "bg-berry-500 text-paper",
  info: "bg-sky-100 text-sky-700",
```

- [ ] **Step 2: UrgencyIndicator.tsx — THIS_WEEK text**

`UrgencyIndicator.tsx:18` ersetzen: `text: "text-[#8a6a14]"` → `text: "text-sun-800"`.

- [ ] **Step 3: AiFallbackPanel.tsx — Icon + Caution**

`AiFallbackPanel.tsx:42,45`: `text-[#8a6a14]` → `text-sun-800` (beide Vorkommen).

- [ ] **Step 4: PhoneMockup.tsx**

`PhoneMockup.tsx:128`: `text-[#8a6a14]` → `text-sun-800`.

- [ ] **Step 5: ErrorState.tsx — SVG auf currentColor**

`ErrorState.tsx:34-39` ersetzen (Wrapper bekommt `text-berry-600`, SVG nutzt `currentColor`):

```tsx
      <span className="inline-flex h-[88px] w-[88px] items-center justify-center rounded-full bg-cream border-[1.5px] border-berry-500/60 text-berry-600">
        <svg viewBox="0 0 100 100" className="h-[60%] w-[60%]" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="50" cy="50" r="35" />
          <path d="M50 32 L50 56" />
          <circle cx="50" cy="68" r="2.5" fill="currentColor" stroke="none" />
        </svg>
      </span>
```

- [ ] **Step 6: Verifizieren — keine Ziel-Hex mehr**

Run: `grep -rnE "#8a6a14|#3d5565|#7a2e2e" src/components src/app`
Expected: keine Treffer.

- [ ] **Step 7: Test-Gate**

Run: `npx vitest run`
Expected: PASS.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "$(printf 'style(ui): hardcodierte Hex-Farben durch Tokens ersetzen\n\nCo-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>')"
```

---

### Task 5: Radien auf Token-Skala snappen

**Files:**
- Modify: `src/components/ui/Button.tsx:51-54`
- Modify: `src/components/ui/Card.tsx:28`
- Modify: `src/components/ui/UrgencyIndicator.tsx:71`
- Modify: `src/components/ui/ErrorState.tsx:47`
- Modify: `src/components/layout/BottomNav.tsx:44`
- Modify: verstreute Screen-Dateien (`app/page.tsx`, `scan/[id]/page.tsx`, `ActionDecisionPanel.tsx`, `FollowUpActions.tsx`, `PlantTile.tsx`, `DeleteScanSheet.tsx`, `DeletePlantSheet.tsx`)

**Mapping (px → Utility):** 6→`rounded-xs`, 10→`rounded-sm`, 12→`rounded-sm`, 14→`rounded-md`, 16→`rounded-md`, 18→`rounded-lg`, 20→`rounded-lg`, 21→`rounded-lg`, 22→`rounded-lg`, 24→`rounded-lg`, 26→`rounded-xl`, 28→`rounded-xl`. Bottom-Sheets `rounded-t-[24px]` → `rounded-t-xl`.

- [ ] **Step 1: Button-Size-Radien**

`Button.tsx:51-54`:

```tsx
const sizeClasses: Record<Size, string> = {
  sm: "h-10 px-4 text-sm rounded-sm",
  md: "h-12 px-6 text-[15px] rounded-md",
  lg: "h-14 px-7 text-base rounded-lg",
};
```

- [ ] **Step 2: Card-Radius**

`Card.tsx:28`: `"rounded-[20px] overflow-hidden ..."` → `"rounded-lg overflow-hidden ..."`.

- [ ] **Step 3: UrgencyIndicator banner + ErrorState retry**

`UrgencyIndicator.tsx:71`: `rounded-[14px]` → `rounded-md`.
`ErrorState.tsx:47`: `rounded-[14px]` → `rounded-md`.

- [ ] **Step 4: BottomNav**

`BottomNav.tsx:44`: `rounded-[28px]` → `rounded-xl`.

- [ ] **Step 5: Verstreute Screen-Radien per Mapping**

Run: `grep -rnoE "rounded(-t)?-\[[0-9]+px\]" src/components src/app`
Jede Fundstelle nach Mapping oben ersetzen. Danach erneut greppen:

Run: `grep -rnE "rounded(-t)?-\[[0-9]+px\]" src/components src/app`
Expected: keine Treffer (bewusste Ausnahmen im Plan nicht vorgesehen).

- [ ] **Step 6: Test-Gate**

Run: `npx vitest run`
Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "$(printf 'style(ui): Radien auf Token-Skala (sm/md/lg/xl) snappen\n\nCo-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>')"
```

---

### Task 6: Schatten auf Token-Skala + CardBody-Padding

**Files:**
- Modify: `src/components/layout/BottomNav.tsx:44`
- Modify: `src/components/features/diagnosis/PersonalizedPrimaryAction.tsx:39`
- Modify: `src/components/ui/Card.tsx:31,47`
- Modify: `src/components/ui/Button.tsx:37,47`
- Modify: `src/app/app/page.tsx:69,192` und weitere literale Schatten
- Modify: `src/components/features/scan/DeleteScanSheet.tsx`, `garden/DeletePlantSheet.tsx`, `scan/[id]/page.tsx` (Sheet-Top-Schatten)

**Mapping (Literal → Token-Klasse):**
- `0_2px_16px rgba(28,42,33,0.06)` → `shadow-soft`
- `0_6px_28px rgba(28,42,33,0.08)` → `shadow-card`
- `0_12px_40px rgba(...)` → `shadow-float`
- `0_12px_40px rgba(58,37,21,0.12)` → `shadow-editorial-lg`
- Sheet-Top-Schatten vereinheitlichen auf `shadow-[0_-8px_32px_rgba(58,37,21,0.12)]` (ein Wert für beide Sheets).

- [ ] **Step 1: BottomNav-Schatten**

`BottomNav.tsx:44`: `shadow-[0_12px_40px_rgba(58,37,21,0.12)]` → `shadow-editorial-lg`.

- [ ] **Step 2: PersonalizedPrimaryAction**

`PersonalizedPrimaryAction.tsx:39`: `shadow-[0_2px_16px_rgba(28,42,33,0.06)]` → `shadow-soft`.

- [ ] **Step 3: Card interaktiver Hover + Padding**

`Card.tsx:31`: `hover:shadow-[0_10px_36px_rgba(28,42,33,0.1)]` → `hover:shadow-float`.
`Card.tsx:47`: `p-[22px]` → `p-6`.

- [ ] **Step 4: Button-Schatten auf Token**

`Button.tsx:37` (primary): `shadow-[0_4px_12px_rgba(28,42,33,0.08)]` → `shadow-soft`.
`Button.tsx:47` (editorial): `shadow-[0_4px_14px_rgba(58,37,21,0.15)]` → `shadow-editorial`.

- [ ] **Step 5: Dashboard + Sheet-Schatten**

In `app/page.tsx` literale Schatten per Mapping ersetzen (`:69,192` → `shadow-float`). Flache Cards (Coach/Premium/Empty-States) erhalten `shadow-soft`.
Sheet-Top-Schatten in `DeleteScanSheet.tsx`, `DeletePlantSheet.tsx`, `scan/[id]/page.tsx:162` auf den einheitlichen Wert bringen.

- [ ] **Step 6: Verifizieren**

Run: `grep -rnoE "shadow-\[0_[0-9]" src/components src/app`
Expected: nur noch der bewusst beibehaltene einheitliche Sheet-Top-Schatten (`0_-8px_32px`); alle anderen literalen Schatten ersetzt.

- [ ] **Step 7: Test-Gate**

Run: `npx vitest run`
Expected: PASS.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "$(printf 'style(ui): Schatten-Literale auf Token-Skala, CardBody p-6\n\nCo-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>')"
```

---

## Welle 2 — Primitives durchsetzen & Touch-Targets

### Task 7: Eyebrow vereinheitlichen

**Files:**
- Modify: `src/app/globals.css` (nach `.eyebrow`, ~`:141`) — On-Dark-Variante
- Modify: Consumer mit handgebauten Eyebrows: `app/page.tsx`, `page.tsx`, `ActionDecisionPanel.tsx`, `FollowUpActions.tsx`, `garden/page.tsx`, `garden/[plantId]/page.tsx`

**Interfaces:**
- Produces: CSS-Klassen `.eyebrow` (vorhanden) und neu `.eyebrow-on-dark` für Eyebrows auf dunklem Hero.

- [ ] **Step 1: On-Dark-Variante ergänzen (`globals.css`)**

Nach dem `.eyebrow`-Block einfügen:

```css
.eyebrow-on-dark {
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--color-cream);
  opacity: 0.85;
}
```

- [ ] **Step 2: Handgebaute Eyebrows finden**

Run: `grep -rnE "text-\[1[01]px\] font-(semibold|bold) (uppercase )?tracking-\[0\.1" src/components src/app`
Liste alle Treffer.

- [ ] **Step 3: Ersetzen**

Jeden handgebauten Eyebrow-Block durch `className="eyebrow"` ersetzen (On-Light) bzw. `className="eyebrow-on-dark"` wenn auf dunklem Hintergrund (z.B. Hero-Gradient, Bottom-Bar). Vorhandene Layout-Klassen (z.B. `mb-2`, `block`) beibehalten: `className="eyebrow mb-2"`.

- [ ] **Step 4: Verifizieren**

Run: `grep -rnE "tracking-\[0\.1[246]em\]" src/components src/app`
Expected: keine handgebauten Eyebrow-Tracking-Werte mehr (nur noch via Utility).

- [ ] **Step 5: Test-Gate**

Run: `npx vitest run`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "$(printf 'style(ui): Eyebrow auf .eyebrow/.eyebrow-on-dark vereinheitlichen\n\nCo-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>')"
```

---

### Task 8: Button-Duplikate konsolidieren

**Files:**
- Modify: `src/components/ui/ErrorState.tsx:43-51`
- Modify: `src/components/features/scan/DeleteScanSheet.tsx:98-113`
- Modify: `src/components/features/garden/DeletePlantSheet.tsx:74-89`
- Modify: `src/app/app/page.tsx:120,129`

**Interfaces:**
- Consumes: `Button` aus `@/components/ui/Button` (Varianten `editorial`, `destructive`, `ghost`).

- [ ] **Step 1: ErrorState Retry → `<Button>`**

In `ErrorState.tsx` `import { Button } from "@/components/ui/Button";` ergänzen und `:43-51` ersetzen:

```tsx
      {onRetry && (
        <Button onClick={onRetry} variant="editorial" size="md" className="mb-3">
          Erneut versuchen
        </Button>
      )}
```

- [ ] **Step 2: Delete-Sheets → `<Button>`**

In `DeleteScanSheet.tsx:98-113` und `DeletePlantSheet.tsx:74-89` die rohen `<button>`-Paare ersetzen: Bestätigen-Button → `<Button variant="destructive" fullWidth>` (nutzt Token `bg-berry-500`), Abbrechen → `<Button variant="ghost" fullWidth>`. Vorhandene `onClick`/`disabled`-Handler 1:1 übernehmen.

- [ ] **Step 3: Dashboard `!important`-Overrides entfernen**

`app/page.tsx:120,129`: die `!bg-paper !text-bark-900` / `!bg-paper/10 !text-paper` ghost-Overrides entfernen und durch `<Button variant="editorial">` (heller CTA auf dunklem Hero) bzw. eine passende vorhandene Variante ersetzen. Keine `!important`-Klassen mehr.

- [ ] **Step 4: Verifizieren — keine handgebauten Buttons/Overrides**

Run: `grep -rnE "!bg-|!text-" src/app/app/page.tsx`
Expected: keine Treffer.
Run: `grep -rn "bg-berry-600" src/components/features/scan/DeleteScanSheet.tsx src/components/features/garden/DeletePlantSheet.tsx`
Expected: keine Treffer (Variante nutzt berry-500).

- [ ] **Step 5: Test-Gate**

Run: `npx vitest run`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "$(printf 'refactor(ui): handgebaute Buttons durch Button-Komponente ersetzen\n\nCo-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>')"
```

---

### Task 9: Badge-Duplikate konsolidieren

**Files:**
- Modify: `src/components/ui/UrgencyIndicator.tsx:84-96` (chip-Variante)
- Modify: `src/components/features/diagnosis/ActionDecisionPanel.tsx:140,251` („X Min"-Pill)
- Modify: `src/components/features/scan/UncertainMatchState.tsx:88`, `scan/[id]/page.tsx:145` (Confidence-Pill)
- Modify: `src/app/coach/page.tsx:136,143` (Beta/Kontext-Chips)

**Interfaces:**
- Consumes: `Badge` aus `@/components/ui/Badge` (tones `neutral`, `warning`, `info`, `outline`).

- [ ] **Step 1: UrgencyIndicator chip → `<Badge>`**

`UrgencyIndicator.tsx`: `import { Badge } from "@/components/ui/Badge";` ergänzen; den `chip`-Default-Return (`:84-96`) ersetzen durch ein `<Badge>` mit `icon={<Icon className="h-3 w-3" />}`, Tone passend zur Urgency (`IMMEDIATE`→`danger`-artig via `className={cn(c.bg, c.text)}` falls keine Tone passt). Label als Children. Pixel-Styling (`px-2.5 py-1 text-[11px] …`) entfällt, da Badge es liefert.

- [ ] **Step 2: „X Min"-Pill → `<Badge tone="neutral">`**

`ActionDecisionPanel.tsx:140,251`: beide unterschiedlichen Pills durch `<Badge tone="neutral">{minutes} Min</Badge>` ersetzen.

- [ ] **Step 3: Confidence-Pill → `<Badge>`**

`scan/[id]/page.tsx:145` und `UncertainMatchState.tsx:88`: ad-hoc Confidence-Pill durch `<Badge tone="outline">` ersetzen (Text/Prozent als Children).

- [ ] **Step 4: Coach-Chips → `<Badge>`**

`coach/page.tsx:136,143`: „Beta"/„Kontext"-Chips durch `<Badge tone="neutral">` bzw. `<BetaBadge />` (für Beta) ersetzen.

- [ ] **Step 5: Test-Gate**

Run: `npx vitest run`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "$(printf 'refactor(ui): ad-hoc Pills durch Badge-Komponente ersetzen\n\nCo-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>')"
```

---

### Task 10: StatePanel extrahieren (Empty/Error)

**Files:**
- Create: `src/components/ui/StatePanel.tsx`
- Modify: `src/components/ui/EmptyState.tsx`, `src/components/ui/ErrorState.tsx`

**Interfaces:**
- Produces: `StatePanel` — `{ mark: React.ReactNode; title: string; body: string; children?: React.ReactNode; className?: string }`. Rendert den gemeinsamen Wrapper + Heading/Body; `mark` ist die visuelle Marke (Icon/SVG), `children` die Aktionszone.
- Consumes: `cn` aus `@/lib/utils`.

- [ ] **Step 1: StatePanel schreiben**

```tsx
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
```

- [ ] **Step 2: EmptyState auf StatePanel umstellen**

`EmptyState.tsx` rendert `<StatePanel mark={<BotanicalIcon name={mark} size={88} animate />} title={title} body={body} className={className}>` mit den CTA-Buttons als Children. Wrapper/Heading/Body-Markup entfällt.

- [ ] **Step 3: ErrorState auf StatePanel umstellen**

`ErrorState.tsx` rendert `<StatePanel mark={<span …berry-SVG…/>} title={title} body={body} className={className}>` mit Retry-`<Button>` (aus Task 8) und Detail-Toggle als Children.

- [ ] **Step 4: Test-Gate**

Run: `npx vitest run`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "$(printf 'refactor(ui): StatePanel-Huelle fuer Empty/Error extrahieren\n\nCo-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>')"
```

---

### Task 11: StatRow extrahieren (3-up Stat-Reihe)

**Files:**
- Create: `src/components/ui/StatRow.tsx`
- Modify: `src/app/scan/[id]/actions/page.tsx` (StatBlock), `src/app/garden/[plantId]/page.tsx` (Stat), `src/app/history/page.tsx` (JournalStat)

**Interfaces:**
- Produces: `StatRow` — `{ items: Array<{ value: React.ReactNode; label: string }>; className?: string }`. Outer-Wrapper `rounded-lg`, Inner-Zellen `rounded-md`, Wert `text-[16px] font-semibold text-bark-900`, Label `eyebrow`.

- [ ] **Step 1: StatRow schreiben**

```tsx
import * as React from "react";
import { cn } from "@/lib/utils";

interface StatItem {
  value: React.ReactNode;
  label: string;
}

export function StatRow({ items, className }: { items: StatItem[]; className?: string }) {
  return (
    <div className={cn("grid grid-cols-3 gap-2 rounded-lg bg-cream p-2", className)}>
      {items.map((item, i) => (
        <div key={i} className="flex flex-col items-center gap-1 rounded-md bg-linen px-2 py-3 text-center">
          <span className="text-[16px] font-semibold text-bark-900">{item.value}</span>
          <span className="eyebrow">{item.label}</span>
        </div>
      ))}
    </div>
  );
}
```

- [ ] **Step 2: Drei Consumer umstellen**

In `actions/page.tsx`, `garden/[plantId]/page.tsx`, `history/page.tsx` die jeweils handgebaute 3-up-Reihe durch `<StatRow items={[…]} />` ersetzen (Werte/Labels 1:1 übernehmen).

- [ ] **Step 3: Test-Gate**

Run: `npx vitest run`
Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "$(printf 'refactor(ui): StatRow-Primitive fuer 3-up Stat-Reihen\n\nCo-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>')"
```

---

### Task 12: Touch-Targets ≥ 44px + focus-visible + Press-Mechanik

**Files:**
- Modify: `src/components/ui/Button.tsx:51` (sm), `src/components/ui/Chip.tsx:21`
- Modify: `src/components/layout/ScreenHeader.tsx:45,52`
- Modify: `src/app/app/page.tsx:69` (Bell) + Top-Right-Links `:160,180,259`
- Modify: `src/app/scan/[id]/page.tsx:132,136`, `scan/[id]/actions/page.tsx:43`, `UncertainMatchState.tsx:81`, `garden/[plantId]/page.tsx:64`, `coach/page.tsx:220,230,237`
- Modify: `src/components/layout/BottomNav.tsx`, `src/components/ui/ErrorState.tsx`

**Standard:** interaktive Kreise `h-11 w-11` (44px); `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest-700/30 focus-visible:ring-offset-2 focus-visible:ring-offset-cream` (wie `Button.tsx:59`); Press-Utility `.tap-press`.

- [ ] **Step 1: Button sm + Chip Höhe**

`Button.tsx:51`: `sm: "h-10 …"` → `sm: "h-11 …"` (44px).
`Chip.tsx:21`: `px-3.5 py-2` → `min-h-[44px] px-4 py-2.5` und `.tap-press` + den focus-visible-Block ergänzen; aktiver/inaktiver Zustand unverändert.

- [ ] **Step 2: 40/36/32px-Kreise auf 44px**

Alle gelisteten `h-10 w-10` / `h-9 w-9` / `h-8 w-8` interaktiven Buttons auf `h-11 w-11` anheben. (Reine dekorative Icons ohne Handler nicht — die werden in Task 14/15 entfernt.)

Run zum Auffinden: `grep -rnE "h-(8|9|10) w-(8|9|10)" src/components src/app`

- [ ] **Step 3: focus-visible auf Nicht-Button-Interaktive**

`Chip`, `ScreenHeader`-Back, `BottomNav`-Items, `ErrorState`-Detail-Toggle bekommen den focus-visible-Ring-Block.

- [ ] **Step 4: Top-Right-Textlinks Tap-Fläche**

`app/page.tsx:160,180,259`: jeweils `-m-2 p-2` ergänzen für ≥44px-Tap-Komfort.

- [ ] **Step 5: Press-Mechanik vereinheitlichen**

`active:scale-[0.99]` (Card) / `group-active:scale-95` (BottomNav) → einheitlich `.tap-press`-Utility bzw. `active:scale-[0.96]` wie Button. Eine Mechanik durchziehen.

- [ ] **Step 6: Test-Gate**

Run: `npx vitest run`
Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "$(printf 'a11y(ui): 44px Touch-Targets, focus-visible, einheitliche Press-Mechanik\n\nCo-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>')"
```

---

## Welle 3 — Palette vereinheitlichen & Fake-UI zurücknehmen

### Task 13: Editorial-Warm-Migration (Garden, Actions, Coach) + Hero-Gradient

**Files:**
- Modify: `src/app/garden/page.tsx`, `src/app/garden/[plantId]/page.tsx`
- Modify: `src/app/scan/[id]/actions/page.tsx`
- Modify: `src/app/coach/page.tsx`
- Modify: `src/components/features/diagnosis/ActionDecisionPanel.tsx:66` (Referenz-Gradient)

**Palette-Mapping (Legacy → Editorial Warm):**
- `bg-sage-50` → `bg-linen`
- `text-forest-900` (Überschriften) → `text-bark-900`
- `text-forest-700` (Body/Eyebrow) → `text-ink-muted` (Body) bzw. `.eyebrow` (Label)
- `bg-paper` (Cards) → `bg-cream`
- `border-sage-200` bleibt (in Editorial Warm gültig)
- Hero-Gradient `from-forest-900 via-forest-800 to-forest-700` → `from-bark-900 to-clay-800`

- [ ] **Step 1: Garden-Liste migrieren**

`garden/page.tsx`: h1 `text-forest-900` → `text-bark-900`; Container `bg-sage-50` → `bg-linen`; Labels auf `.eyebrow`. Body-Grautöne auf `text-ink-muted`.

- [ ] **Step 2: Garden-Detail migrieren**

`garden/[plantId]/page.tsx`: `bg-sage-50` → `bg-linen`, `forest-900/700` nach Mapping.

- [ ] **Step 3: Actions-Screen migrieren + Hero-Gradient**

`scan/[id]/actions/page.tsx`: `bg-sage-50`+`forest-900` nach Mapping; Hero-Gradient `:71` `from-forest-900 via-forest-800 to-forest-700` → `from-bark-900 to-clay-800` (gleich wie `ActionDecisionPanel.tsx:66`).

- [ ] **Step 4: Coach re-skin (nur Optik, Logik bleibt Stub)**

`coach/page.tsx`: `forest-900/700`, `sage-50/100/200`, `bg-paper` nach Mapping auf Editorial Warm. Header-Chips bereits in Task 9 auf Badge. Safe-Area-Input-Bar unverändert lassen.

- [ ] **Step 5: Verifizieren — keine Legacy-Palette mehr auf diesen Screens**

Run: `grep -rnE "bg-sage-50|from-forest-900" src/app/garden src/app/scan/\[id\]/actions src/app/coach`
Expected: keine Treffer.

- [ ] **Step 6: Test-Gate**

Run: `npx vitest run`
Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "$(printf 'style(screens): Garden/Actions/Coach auf Editorial Warm migrieren\n\nCo-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>')"
```

---

### Task 14: Fake-UI in Garden zurücknehmen

**Files:**
- Modify: `src/app/garden/page.tsx:28,51`
- Modify: `src/components/features/garden/PlantTile.tsx:18-30`

- [ ] **Step 1: Hardcodierten Health-Status entfernen**

`garden/page.tsx:28`: das hardcodierte `healthStatus: 'HEALTHY'` aus dem Mapping entfernen. `PlantTile.tsx:18-30`: Status-Dot/Label-Block entfernen (keine echten Daten → kein dauergrünes „Gesund"). Falls `healthStatus` Prop dadurch ungenutzt wird, aus dem Interface entfernen.

- [ ] **Step 2: Statische „Zone 8a"-Zeile entfernen**

`garden/page.tsx:51`: die hardcodierte `"Zone 8a · mittlere Feuchtigkeit"`-Zeile entfernen.

- [ ] **Step 3: TypeScript-Check**

Run: `npx tsc --noEmit`
Expected: keine Fehler (ungenutzte Props/Imports entfernt).

- [ ] **Step 4: Test-Gate**

Run: `npx vitest run`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "$(printf 'fix(garden): totes Health-Status-UI und Fake-Zone-Zeile entfernen\n\nCo-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>')"
```

---

### Task 15: Fake-Controls & Dev-Copy entfernen

**Files:**
- Modify: `src/app/scan/[id]/page.tsx:136` (Share ohne Handler)
- Modify: `src/app/scan/[id]/actions/page.tsx:43` (Share) und `:124-141` (Fake-Toggle)
- Modify: `src/components/features/scan/AiFallbackSection.tsx:6-16` (Dev-Copy)

- [ ] **Step 1: Fake Share-Buttons entfernen**

`scan/[id]/page.tsx:136` und `scan/[id]/actions/page.tsx:43`: die Share-Buttons ohne `onClick`-Handler entfernen (kein Web-Share-Feature in Scope).

- [ ] **Step 2: Fake-Toggle entfernen**

`scan/[id]/actions/page.tsx:124-141`: den „Folgebehandlung merken"-Toggle (nur `group-hover`, ohne State) entfernen.

- [ ] **Step 3: Dev-Copy durch echten Empty-State ersetzen**

`AiFallbackSection.tsx:6-16` (`AiFallbackPlaceholder`): den Dev-Text („…Genau das bauen wir gerade aus.") durch user-tauglichen Empty-State ersetzen, idealerweise via `StatePanel` (Task 10) mit botanischer Marke und neutraler Copy, z.B. Titel „Noch keine Pflegehinweise", Body „Für diese Art liegen noch keine Detailinfos vor — wir ergänzen sie laufend."

- [ ] **Step 4: Verifizieren — keine Dev-Copy mehr**

Run: `grep -rn "bauen wir gerade aus" src/components src/app`
Expected: keine Treffer.

- [ ] **Step 5: TypeScript- + Test-Gate**

Run: `npx tsc --noEmit && npx vitest run`
Expected: keine TS-Fehler, Tests PASS.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "$(printf 'fix(scan): Fake-Share/Toggle entfernen, Dev-Copy durch Empty-State ersetzen\n\nCo-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>')"
```

---

### Task 16: Abschluss-Verifikation (gesamter Refresh)

**Files:** keine Änderung — reines Gate.

- [ ] **Step 1: Token-Regressionsschutz**

Run: `grep -rnE "text-\[#|rounded-\[[0-9]+px\]|shadow-\[0_[0-9]" src/components src/app`
Expected: nur bewusst dokumentierte Ausnahmen (einheitlicher Sheet-Top-Schatten). Sonst keine Treffer.

- [ ] **Step 2: Undefinierte Tokens prüfen**

Run: `grep -rnE "berry-(200|300|400|700|800|900)|clay-700|sun-(700|800)|sky-700" src/components src/app`
Expected: nur die in Task 1 definierten Stufen werden verwendet.

- [ ] **Step 3: Voller Build + Tests**

Run: `npx tsc --noEmit && npx vitest run && npx next build`
Expected: kein TS-Fehler, 38 Tests PASS, Build grün.

- [ ] **Step 4: Mobile-Sichtprüfung**

`npm run dev`, Viewport ~390px. Jeden Screen durchgehen: Landing, Dashboard, Scan-Result, Uncertain-Match, AI-Fallback, Actions, Garden-Liste, Garden-Detail, History, Coach. Prüfen: einheitliche Palette, Eyebrows, Card-Tiefe, keine toten Controls, Tab-Fokus sichtbar.

- [ ] **Step 5: Pipeline-Update**

```powershell
pipeline-update -Slug gartenscanner -Summary "Design-Refresh: Editorial Warm konsolidiert (Tokens, Primitives, Palette, Fake-UI entfernt)" -Todos @("Coach-LLM anbinden", "Impressum HRB-Daten", "Stripe/Premium (Phase E)")
```

---

## Self-Review

**Spec-Coverage:** Welle 1 (1.1 Tokens→T1, 1.2 Bugs→T2/T3/T4, 1.3 Radien→T5, 1.4 Schatten→T6, 1.5 Padding→T6). Welle 2 (2.1 Eyebrow→T7, 2.2 Button→T8, 2.3 Badge→T9, 2.4 StatePanel/StatRow/Heading→T10/T11, 2.5 Touch/focus→T12, 2.6 Press→T12). Welle 3 (3.1 Migration→T13, 3.2 Hero→T13, 3.3 Fake-UI→T14/T15). Verifikation→T16. Alle Spec-Punkte abgedeckt.

**Platzhalter:** keine TBD/TODO; Mapping-getriebene breite Edits sind durch konkrete Such-/Ersetz-Regeln + Grep-Gates spezifiziert.

**Typ-Konsistenz:** `StatePanel`-Props (`mark/title/body/children/className`) und `StatRow`-Props (`items: {value,label}[]`) konsistent zwischen Definition (T10/T11) und Nutzung (T15/T13). `Button`-Varianten (`editorial/destructive/ghost`) und `Badge`-Tones (`neutral/warning/info/outline`) entsprechen den gelesenen Primitive-Definitionen.
