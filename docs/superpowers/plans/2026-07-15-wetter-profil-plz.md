# Wetter aus Profil-PLZ — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Das Dashboard-Wetter richtet sich nach einer nutzergesetzten PLZ (am Dashboard erfassbar), statt hartcodiert auf München (`80331`).

**Architecture:** DB-Spalte `profiles.postal_code` (nullable). Repository liest/schreibt sie. Ein tippbarer WeatherChip öffnet ein Bottom-Sheet mit PLZ-Feld; eine Server-Action validiert (5 Ziffern + `geocodePLZ`-Existenzprüfung) und speichert, dann `revalidatePath('/app')`. Ohne PLZ zeigt der Chip einen „Standort setzen"-Leerzustand statt falschem Wetter.

**Tech Stack:** Next.js 16 (App Router, Server Components + Server Actions), React 19, Supabase, TypeScript, Vitest, `Button` aus `@/components/ui/Button`.

## Global Constraints

- **Mobile-first, Pflicht:** interaktive Elemente ≥ 44px Touch-Target; auf ~390px prüfen.
- **Sprache:** alle UI-Texte und Commit-Messages auf Deutsch. Commit-Message endet mit `Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>`.
- **Kein hartcodiertes `80331`** mehr im Produktionscode nach Abschluss.
- **Regression-Gate:** `npx vitest run` bleibt grün (aktuell 78 Tests).
- **Deutsche PLZ:** genau 5 Ziffern, führende Nullen erlaubt (Regex `^\d{5}$`).

---

## File Structure

- Neu `supabase/migrations/20260715120000_profiles_postal_code.sql` — Spalte.
- Neu `src/lib/weather/plz.ts` — `isValidPLZ`-Validierung (pure).
- Neu `src/lib/weather/plz.test.ts` — Validierungs-Tests.
- Neu `src/app/app/actions.ts` — Server-Action `updateLocation`.
- Neu `src/components/features/dashboard/LocationSheet.tsx` — Client-Sheet mit PLZ-Feld.
- Neu `src/components/features/dashboard/LocationWeather.tsx` — Client-Wrapper (Sheet-State + Empty-Zustand).
- Ändern `src/lib/services/profileRepository.ts` — `ProfileRow.postal_code` + `updateProfile`-Mapping.
- Ändern `src/lib/services/profileRepository.test.ts` (oder neu, falls nicht vorhanden) — Mapping-Test.
- Ändern `src/app/app/page.tsx` — PLZ statt `80331`, `LocationWeather` einsetzen.

---

## Task 1: DB-Migration — `postal_code`-Spalte

**Files:**
- Create: `supabase/migrations/20260715120000_profiles_postal_code.sql`

**Interfaces:**
- Produces: Spalte `profiles.postal_code text` (nullable), von Task 3 gelesen/geschrieben.

- [ ] **Step 1: Migration schreiben**

```sql
-- Fügt eine optionale deutsche PLZ zum Nutzerprofil hinzu (für standortbasiertes Wetter).
alter table profiles add column postal_code text;
```

- [ ] **Step 2: Auf die DB anwenden**

Run: `npx supabase db push` (oder das im Projekt übliche Migrations-Kommando — prüfe `package.json`-Scripts; falls Supabase-CLI nicht verfügbar, Migration manuell im Supabase-SQL-Editor ausführen).
Expected: Migration läuft ohne Fehler; `profiles` hat jetzt `postal_code`.

- [ ] **Step 3: Commit**

```bash
git add supabase/migrations/20260715120000_profiles_postal_code.sql
git commit -m "$(printf 'feat(db): postal_code-Spalte fuer profiles\n\nCo-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>')"
```

---

## Task 2: PLZ-Validierung (pure util, TDD)

**Files:**
- Create: `src/lib/weather/plz.ts`
- Test: `src/lib/weather/plz.test.ts`

**Interfaces:**
- Produces: `isValidPLZ(plz: string): boolean` — genutzt von Task 4 (Server-Action) und Task 5 (Client-Sheet).

- [ ] **Step 1: Failing test schreiben**

```ts
import { describe, it, expect } from "vitest";
import { isValidPLZ } from "./plz";

describe("isValidPLZ", () => {
  it("akzeptiert genau 5 Ziffern", () => {
    expect(isValidPLZ("80331")).toBe(true);
  });
  it("akzeptiert fuehrende Nullen", () => {
    expect(isValidPLZ("01067")).toBe(true);
  });
  it("lehnt zu kurze/lange PLZ ab", () => {
    expect(isValidPLZ("8033")).toBe(false);
    expect(isValidPLZ("803312")).toBe(false);
  });
  it("lehnt nicht-numerische Eingaben ab", () => {
    expect(isValidPLZ("8033a")).toBe(false);
    expect(isValidPLZ("")).toBe(false);
  });
  it("ignoriert umgebende Leerzeichen nicht (Aufrufer trimmt)", () => {
    expect(isValidPLZ(" 80331")).toBe(false);
  });
});
```

- [ ] **Step 2: Test laufen lassen — muss fehlschlagen**

Run: `npx vitest run src/lib/weather/plz.test.ts`
Expected: FAIL (`isValidPLZ` nicht definiert).

- [ ] **Step 3: Implementierung**

```ts
/** Deutsche PLZ: genau 5 Ziffern, fuehrende Nullen erlaubt. Aufrufer sollte vorher trimmen. */
export function isValidPLZ(plz: string): boolean {
  return /^\d{5}$/.test(plz);
}
```

- [ ] **Step 4: Test laufen lassen — muss bestehen**

Run: `npx vitest run src/lib/weather/plz.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/weather/plz.ts src/lib/weather/plz.test.ts
git commit -m "$(printf 'feat(weather): isValidPLZ-Validierung\n\nCo-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>')"
```

---

## Task 3: Repository — `postal_code` lesen/schreiben (TDD)

**Files:**
- Modify: `src/lib/services/profileRepository.ts`
- Test: `src/lib/services/profileRepository.test.ts` (falls nicht vorhanden, neu anlegen)

**Interfaces:**
- Consumes: Spalte `profiles.postal_code` (Task 1).
- Produces: `ProfileRow.postal_code: string | null`; `updateProfile` akzeptiert `patch.postalCode`. Von Task 4 (Action) und Task 7 (Dashboard) genutzt.

Hinweis: `updateProfile` baut ein `row`-Objekt und ruft Supabase. Der Test sollte den Supabase-Client mocken (prüfe, ob es bereits einen Mock-Stil im Projekt für Repository-Tests gibt; falls ja, diesem folgen). Falls Repository-Tests bislang fehlen und ein DB-Mock zu aufwendig ist, extrahiere die reine Mapping-Logik in eine testbare Funktion `mapPatchToRow(patch): Partial<ProfileRow>` und teste diese.

- [ ] **Step 1: `ProfileRow` erweitern**

In `profileRepository.ts` den `ProfileRow`-Typ ergänzen:
```ts
  completed_onboarding_at: string | null;
  postal_code: string | null;
```

- [ ] **Step 2: Mapping-Logik extrahieren + Test schreiben**

`updateProfile`'s Row-Aufbau in eine exportierte pure Funktion ziehen:
```ts
export function mapPatchToRow(patch: Partial<GardenProfile>): Partial<ProfileRow> {
  const row: Partial<ProfileRow> = {};
  if (patch.experience) row.experience = patch.experience;
  if (patch.solutionStyle) {
    row.solution_preference =
      patch.solutionStyle === 'ORGANIC' ? 'organic'
      : patch.solutionStyle === 'BALANCED' ? 'mixed'
      : 'fast_acting';
  }
  if (patch.useCases) row.interests = patch.useCases.map((u) => u.toLowerCase());
  if (patch.areas) row.garden_type = patch.areas[0]?.toLowerCase() ?? null;
  const pets: string[] = [];
  if (patch.hasChildren) pets.push('children');
  if (patch.hasPets) pets.push('pets');
  if (pets.length > 0 || patch.hasChildren === false || patch.hasPets === false) {
    row.pets_children = pets;
  }
  if (patch.onboardingCompletedAt) row.completed_onboarding_at = patch.onboardingCompletedAt.toISOString();
  if (patch.postalCode !== undefined) row.postal_code = patch.postalCode;
  return row;
}
```
Und `updateProfile` nutzt `const row = mapPatchToRow(patch);`.

Test `src/lib/services/profileRepository.test.ts`:
```ts
import { describe, it, expect } from "vitest";
import { mapPatchToRow } from "./profileRepository";

describe("mapPatchToRow", () => {
  it("mappt postalCode auf postal_code", () => {
    expect(mapPatchToRow({ postalCode: "10115" })).toEqual({ postal_code: "10115" });
  });
  it("setzt postal_code nur bei definiertem patch.postalCode", () => {
    expect(mapPatchToRow({}).postal_code).toBeUndefined();
  });
});
```
Prüfe, dass `GardenProfile` in `@/domain/types` ein optionales Feld `postalCode?: string` hat; falls nicht, ergänze es dort (die alte `src/lib/storage/profile.ts` nutzt bereits `partial.postalCode`, also existiert es vermutlich schon).

- [ ] **Step 3: Test laufen lassen (fail → implement → pass)**

Run: `npx vitest run src/lib/services/profileRepository.test.ts`
Expected: zunächst FAIL (falls Import/Export fehlt), nach Umbau PASS.

- [ ] **Step 4: Gesamt-Tests**

Run: `npx vitest run`
Expected: PASS (80 Tests: 78 + 2 neue) bzw. keine Regression.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "$(printf 'feat(profile): postal_code im Repository lesen/schreiben\n\nCo-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>')"
```

---

## Task 4: Server-Action `updateLocation`

**Files:**
- Create: `src/app/app/actions.ts`

**Interfaces:**
- Consumes: `isValidPLZ` (Task 2), `geocodePLZ` aus `@/lib/weather/openmeteo`, `updateProfile` (Task 3), Supabase-Auth.
- Produces: `updateLocation(plz: string): Promise<{ ok: true } | { ok: false; error: string }>` — genutzt von Task 5 (Sheet).

- [ ] **Step 1: Action schreiben**

```ts
"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { updateProfile } from "@/lib/services/profileRepository";
import { isValidPLZ } from "@/lib/weather/plz";
import { geocodePLZ } from "@/lib/weather/openmeteo";

export async function updateLocation(
  plz: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  const trimmed = plz.trim();
  if (!isValidPLZ(trimmed)) {
    return { ok: false, error: "Bitte eine 5-stellige PLZ eingeben." };
  }
  const geo = await geocodePLZ(trimmed);
  if (!geo) {
    return { ok: false, error: "PLZ nicht gefunden." };
  }
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { ok: false, error: "Nicht angemeldet." };
  }
  await updateProfile(user.id, { postalCode: trimmed });
  revalidatePath("/app");
  return { ok: true };
}
```

Prüfe die exakte Signatur von `geocodePLZ` (in `src/lib/weather/openmeteo.ts`) — sie gibt `GeocodeResult | null` zurück; `null` = nicht gefunden.

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: keine Fehler.

- [ ] **Step 3: Commit**

```bash
git add src/app/app/actions.ts
git commit -m "$(printf 'feat(app): updateLocation Server-Action mit PLZ-Validierung\n\nCo-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>')"
```

---

## Task 5: `LocationSheet` — Client-Bottom-Sheet

**Files:**
- Create: `src/components/features/dashboard/LocationSheet.tsx`

**Interfaces:**
- Consumes: `updateLocation` (Task 4), `isValidPLZ` (Task 2), `Button` aus `@/components/ui/Button`.
- Produces: `LocationSheet` — Props `{ open: boolean; initialPlz: string | null; onClose: () => void }`. Von Task 6 gerendert.

Orientiere Overlay/Slide-Animation am bestehenden Muster in `src/components/features/scan/DeleteScanSheet.tsx` (Overlay `bg-bark-900/40`, Sheet `bg-cream rounded-t-xl`, Safe-Area). Lies diese Datei zuerst und spiegle Struktur/Klassen.

- [ ] **Step 1: Komponente schreiben**

```tsx
"use client";

import * as React from "react";
import { Button } from "@/components/ui/Button";
import { isValidPLZ } from "@/lib/weather/plz";
import { updateLocation } from "@/app/app/actions";

interface LocationSheetProps {
  open: boolean;
  initialPlz: string | null;
  onClose: () => void;
}

export function LocationSheet({ open, initialPlz, onClose }: LocationSheetProps) {
  const [plz, setPlz] = React.useState(initialPlz ?? "");
  const [error, setError] = React.useState<string | null>(null);
  const [pending, setPending] = React.useState(false);

  React.useEffect(() => {
    if (open) {
      setPlz(initialPlz ?? "");
      setError(null);
    }
  }, [open, initialPlz]);

  if (!open) return null;

  const canSave = isValidPLZ(plz.trim()) && !pending;

  async function handleSave() {
    setPending(true);
    setError(null);
    const result = await updateLocation(plz.trim());
    setPending(false);
    if (result.ok) {
      onClose();
    } else {
      setError(result.error);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <button
        aria-label="Schliessen"
        className="absolute inset-0 bg-bark-900/40"
        onClick={onClose}
      />
      <div className="relative w-full max-w-lg rounded-t-xl bg-cream p-6 pb-[max(env(safe-area-inset-bottom),1.5rem)] shadow-editorial-lg">
        <h2 className="font-serif text-[22px] text-bark-900">Standort setzen</h2>
        <p className="mt-1 text-[14px] text-ink-muted">
          Deine PLZ bestimmt Wetter und Frost-/Hitze-Warnungen.
        </p>
        <input
          value={plz}
          onChange={(e) => setPlz(e.target.value.replace(/\D/g, "").slice(0, 5))}
          inputMode="numeric"
          maxLength={5}
          placeholder="z. B. 10115"
          className="mt-4 w-full rounded-md border border-sage-200 bg-paper px-4 py-3 text-[16px] tabular-nums text-bark-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest-700/30"
        />
        {error && <p className="mt-2 text-[13px] text-berry-500">{error}</p>}
        <div className="mt-5 flex flex-col gap-3">
          <Button onClick={handleSave} disabled={!canSave} variant="editorial" fullWidth>
            {pending ? "Speichere …" : "Speichern"}
          </Button>
          <Button onClick={onClose} variant="ghost" fullWidth>
            Abbrechen
          </Button>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: keine Fehler.

- [ ] **Step 3: Commit**

```bash
git add src/components/features/dashboard/LocationSheet.tsx
git commit -m "$(printf 'feat(dashboard): LocationSheet fuer PLZ-Eingabe\n\nCo-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>')"
```

---

## Task 6: `LocationWeather` — Client-Wrapper (Chip + Empty + Sheet-State)

**Files:**
- Create: `src/components/features/dashboard/LocationWeather.tsx`
- Modify: `src/components/features/dashboard/WeatherChip.tsx` (tippbar machen)

**Interfaces:**
- Consumes: `WeatherChip` (bestehend), `LocationSheet` (Task 5), `WeatherSnapshot` aus `@/lib/types`.
- Produces: `LocationWeather` — Props `{ weather: WeatherSnapshot | null; postalCode: string | null }`. Von Task 7 (Dashboard) gerendert.

- [ ] **Step 1: WeatherChip tippbar machen**

`WeatherChip` in einen `<button>`-Wrapper legen (oder `onClick`-Prop ergänzen), 44px-Touch-Target + `focus-visible`. Minimal-invasiv: `onClick?: () => void` ergänzen und das Root-`<div>` durch ein `<button type="button" onClick={onClick} className="… tap-press focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest-700/30">` ersetzen (bestehende Chip-Klassen behalten). Wenn kein `onClick`, bleibt es klickbar ohne Effekt — akzeptabel.

- [ ] **Step 2: Wrapper schreiben**

```tsx
"use client";

import * as React from "react";
import { MapPin } from "lucide-react";
import type { WeatherSnapshot } from "@/lib/types";
import { WeatherChip } from "./WeatherChip";
import { LocationSheet } from "./LocationSheet";

export function LocationWeather({
  weather,
  postalCode,
}: {
  weather: WeatherSnapshot | null;
  postalCode: string | null;
}) {
  const [open, setOpen] = React.useState(false);

  return (
    <>
      {weather ? (
        <WeatherChip weather={weather} onClick={() => setOpen(true)} />
      ) : (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="tap-press inline-flex min-h-[44px] items-center gap-2 rounded-full border border-sage-200/60 bg-paper/70 px-3.5 py-2 text-[13px] text-ink-muted backdrop-blur focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest-700/30"
        >
          <MapPin className="h-4 w-4" strokeWidth={1.75} />
          Standort setzen
        </button>
      )}
      <LocationSheet open={open} initialPlz={postalCode} onClose={() => setOpen(false)} />
    </>
  );
}
```

- [ ] **Step 3: Typecheck**

Run: `npx tsc --noEmit`
Expected: keine Fehler.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "$(printf 'feat(dashboard): LocationWeather-Wrapper mit Empty-Zustand\n\nCo-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>')"
```

---

## Task 7: Dashboard verdrahten (kein `80331` mehr)

**Files:**
- Modify: `src/app/app/page.tsx`

**Interfaces:**
- Consumes: `LocationWeather` (Task 6), `profileRow.postal_code` (Task 3).

- [ ] **Step 1: PLZ aus Profil, kein Hardcode**

In `page.tsx`:
- `const plz = profileRow?.postal_code ?? null;`
- Zeile `const weather = await fetchWeatherForPLZ("80331");` ersetzen durch:
  `const weather = plz ? await fetchWeatherForPLZ(plz) : null;`

- [ ] **Step 2: WeatherChip durch LocationWeather ersetzen**

Den bisherigen `{weather && (<div className="mt-3"><WeatherChip weather={weather} /></div>)}`-Block ersetzen durch:
```tsx
        <div className="mt-3">
          <LocationWeather weather={weather} postalCode={plz} />
        </div>
```
Import `WeatherChip` entfernen, `import { LocationWeather } from "@/components/features/dashboard/LocationWeather";` ergänzen. Der `weather?.alert`-Alertbanner-Block darunter bleibt (greift nur bei gesetztem Wetter).

- [ ] **Step 3: Verifizieren — kein Hardcode**

Run: `grep -rn "80331" src/app src/components`
Expected: keine Treffer im Produktionscode (Default in `src/lib/storage/profile.ts` ist Legacy-LocalStorage und darf bleiben, wird aber nicht mehr fürs Dashboard genutzt — im Bericht vermerken).

- [ ] **Step 4: Test-/Typecheck-Gate**

Run: `npx tsc --noEmit && npx vitest run`
Expected: keine TS-Fehler, Tests grün.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "$(printf 'feat(app): Dashboard-Wetter aus Profil-PLZ statt hardcoded 80331\n\nCo-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>')"
```

---

## Task 8: Abschluss-Gate + manuelle Prüfung

**Files:** keine Änderung.

- [ ] **Step 1: Voller Build**

Run: `npx tsc --noEmit && npx vitest run && npx next build`
Expected: kein TS-Fehler, Tests grün, Build erfolgreich.

- [ ] **Step 2: Mobile-Sichtprüfung**

`npm run dev`, ~390px. Prüfen:
- Ohne PLZ: „Standort setzen"-Chip erscheint statt Wetter.
- Tippen → Sheet öffnet, PLZ (z. B. eigene) eingeben → Speichern → Dashboard zeigt echtes Wetter + korrekten Ort.
- Ungültige PLZ (z. B. „00000"/„99999") → Fehlermeldung, kein Speichern.
- Gesetzten Chip erneut tippen → Sheet mit vorbelegter PLZ, änderbar.

- [ ] **Step 3: Pipeline-Update**

```powershell
pipeline-update -Slug gartenscanner -Summary "Wetter nutzt jetzt Profil-PLZ (Dashboard-Eingabe, kein hardcoded 80331)" -Todos @("Coach-LLM anbinden", "Impressum HRB-Daten", "Stripe/Premium (Phase E)")
```

---

## Self-Review

**Spec-Coverage:** Migration→T1, Repository→T3, Validierung→T2, Server-Action→T4, LocationSheet→T5, WeatherChip-Empty+Wrapper→T6, Dashboard-Verdrahtung→T7, Gate→T8. Alle Spec-Bausteine abgedeckt.

**Platzhalter:** keine TBD/TODO; jeder Code-Step zeigt vollständigen Code.

**Typ-Konsistenz:** `isValidPLZ(string): boolean` (T2) konsistent in T4/T5. `updateLocation(string): Promise<{ok:true}|{ok:false;error:string}>` (T4) konsistent in T5. `LocationSheet`-Props (`open/initialPlz/onClose`) und `LocationWeather`-Props (`weather/postalCode`) konsistent zwischen Definition (T5/T6) und Nutzung (T6/T7). `ProfileRow.postal_code`/`patch.postalCode` konsistent T3↔T4↔T7.

**Offene Annahme (in Steps als Prüfschritt markiert):** exakte `geocodePLZ`-Signatur (T4 Step 1), vorhandenes `GardenProfile.postalCode`-Feld (T3 Step 2), Migrations-Kommando des Projekts (T1 Step 2), bestehender Repository-Test-Mock-Stil (T3).
