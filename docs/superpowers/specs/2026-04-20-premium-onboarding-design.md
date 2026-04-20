# Premium Onboarding Redesign — Design Spec

**Datum:** 2026-04-20
**Status:** Approved (Brainstorming abgeschlossen, bereit für Implementierungsplan)
**Slug:** `gartenscanner` (Pipeline-Tracking)

## Ziel

Den existierenden 6-Screen-Onboarding-Flow (`/onboarding/{welcome,use-cases,garden,style,trust,first-scan}`) durch ein hochwertiges, mobile-first 6-Routen-/8-Brief-Screen-Erlebnis ersetzen. Premium-Tonalität, kuratierter Aha-Moment durch Demo-First-Scan, Soft-Waitlist-Paywall am Ende. Kein Stripe, keine echte Email-Kollektion — alles Frontend-only-Fake mit Analytics-Events für späteres Messen.

**Eingebettet in bestehenden Beta-Status:** die App ist live auf https://gartenscan.de mit `ENABLE_PHOTO_UPLOAD = false`, MockVisionProvider, 12 Content-Einträgen. Das neue Onboarding respektiert diesen Zustand, framed explizit Early-Access-Demo.

## Nicht-Ziele (YAGNI)

- Keine echte Email-Kollektion (kein Vercel KV, kein Resend, kein Webhook — ConsoleTracker reicht)
- Keine Stripe-Integration
- Keine Multi-Tab-Sync-Magie
- Kein Test-Framework (kein Jest, kein Playwright — manueller Mobile-Smoke-Test)
- Kein Real-Vision-Provider-Hookup in diesem Scope
- Kein SSR-Guard-Cookie-System — localStorage-Checks client-side genügen
- Kein Multi-Language-Support
- Keine Personalisierung der Demo-Scans (alle User sehen dieselben 3 Beispiele)

## Routen-Map

6 Routen statt 8 Brief-Screens — Scan-Phase (Brief-Screens 5 + 6 + 7) wird zu einer Route mit 3 Phasen.

| # | Route | Bestand | Brief-Screen | Inhalt |
|---|---|---|---|---|
| 1 | `/onboarding/welcome` | rebuild | Hero / Welcome | Headline, Subline, CTA |
| 2 | `/onboarding/use-cases` | rebuild | Problem-Auswahl | 6 Multi-Select-Karten |
| 3 | `/onboarding/garden` | rebuild + konsolidiert | Gartenprofil | 5 Felder in 2 Sektionen |
| 4 | `/onboarding/trust` | rebuild | So funktioniert's | 3-Schritt-Erklärung |
| 5 | `/onboarding/scan` | **NEU** | Scan-CTA + Analyse + Ergebnis | Phase-State: `picker` → `analyzing` → `result` |
| 6 | `/onboarding/premium` | **NEU** | Soft Paywall | Benefits, Waitlist-CTA, Danke-State |

**Gelöschte Routen:** `/onboarding/style`, `/onboarding/first-scan`. Diese werden in `next.config.mjs` als `redirects` auf `/onboarding/garden` bzw. `/onboarding/scan` umgebogen (falls Bookmarks existieren).

**Flow-Logik:**
- Entry: Landing `/` CTA „Jetzt starten" → `/onboarding/welcome` (bzw. auf letzten gespeicherten Step bei Resume)
- Navigation: linear per Next-CTA, Back via kleiner Pfeil oben links oder Router-Back
- Completion: `/onboarding/premium` Submit / Skip → `markComplete()` → Redirect `/app`
- Skip-Links: `/onboarding/scan` (Skip-Text unten, klein) und `/onboarding/premium` (Skip-Text unten, klein). Beide führen zu `markComplete()` mit minimal-defaults und Redirect `/app`.

## Guard-Verhalten

Client-side only, keine SSR-Cookies (Profile ist in localStorage).

| Nutzer kommt auf … | Zustand | Verhalten |
|---|---|---|
| `/` | egal | bleibt auf Landing (kein Redirect) |
| `/onboarding/*` | completed = true | Redirect `/app` |
| `/onboarding/*` | completed = false | rendert |
| `/app` oder `/app/*` | completed = false | Redirect `/onboarding/welcome` |
| `/app` oder `/app/*` | completed = true | rendert |
| `/scan/*`, `/coach`, `/garden/*`, `/history`, `/premium` | completed = false | Redirect `/onboarding/welcome` |
| Legal-Seiten `/impressum`, `/datenschutz` | egal | rendert immer |

**Hydration-Schutz:** Während `loading=true` (Mount vor localStorage-Read) rendert der Guard nichts (oder ein Mini-Spinner). Kein Server-Markup-Flash.

## Screen-Specs

### 1. `/onboarding/welcome`

**Ziel:** Produktnutzen in 3 Sekunden.

**Layout:**
- Fullscreen-Container mit `sage-50` bg
- Oben viel Padding (pt-24 mobile)
- Produkt-Visual (stilisierte Kreis-Scan-Form + Blatt-Foto, kein Clipart)
- Text zentriert mittig
- CTA fixed am unteren Rand (mit safe-area-inset-bottom)

**Microcopy:**
- Headline: „Erkenne jedes Gartenproblem in Sekunden." (Fraunces, 36 px, lh 1.1)
- Subline: „Foto machen. Verstehen. Richtig lösen." (Inter 17, ink-muted)
- Primary CTA: „Los geht's" (clay-500, full-width, 52 px)
- Sekundär (klein): „Schon Nutzer? Später einloggen" (disabled-looking, no-op in Beta)

**Analytics:** `onboarding_started` (einmalig pro Session), `onboarding_step_viewed`.

---

### 2. `/onboarding/use-cases`

**Ziel:** Personalisierung via Problem-Bezug.

**Layout:**
- `<OnboardingShell>` mit Back-Pfeil
- Headline oben, dann 2-Spalten-Grid mit 6 `<SelectableCard>`-Elementen
- Primary CTA unten sticky

**Karten (Multi-Select):**

| ID | Label | Icon (lucide) |
|---|---|---|
| `IDENTIFY_PLANT` | Pflanzen erkennen | Leaf |
| `REMOVE_WEED` | Unkraut | Sprout |
| `FIGHT_PEST` | Schädlinge | Bug |
| `UNDERSTAND_DISEASE` | Krankheiten | Stethoscope |
| `GARDEN_IDEAS` | Gartenideen | Lightbulb |
| `ALL_OF_IT` | Alles davon | Sparkles |

**Logik:** `ALL_OF_IT` ist exklusiv (deselektiert andere, und umgekehrt wenn andere ausgewählt werden, wird `ALL_OF_IT` deselektiert).

**Microcopy:**
- Headline: „Wobei brauchst du Hilfe?"
- Sub: „Mehrfachauswahl möglich. Du kannst später alles ändern."
- CTA: „Weiter" (disabled bis mindestens 1 Auswahl; kein Toast, Button grayed)

**Analytics:** `onboarding_step_viewed`, `onboarding_goal_selected` (on Submit, `{ goals }`).

**Type-Mapping:** Die gewählten `useCases` landen direkt im `Partial<GardenProfile>.useCases`. Der existierende `UseCase`-Enum muss um `IDENTIFY_PLANT`, `REMOVE_WEED`, `FIGHT_PEST`, `UNDERSTAND_DISEASE`, `GARDEN_IDEAS`, `ALL_OF_IT` ergänzt werden (falls noch nicht vorhanden — im Plan prüfen).

---

### 3. `/onboarding/garden`

**Ziel:** Garten-Profil kompakt erfassen.

**Layout:**
- Scrollbarer Container, 2 Sektionen mit jeweils Mini-Hairline-Divider oben + Sektion-Titel
- CTA sticky unten

**Sektion A — „Dein Garten"**

| Feld | Typ | Optionen |
|---|---|---|
| Bereich | Chip-Multi-Select | Garten, Rasen, Beet, Balkon, Terrasse, Topfpflanzen |
| Kinder im Haushalt | Toggle (ja / nein) | — |
| Haustiere | Toggle (ja / nein) | — |

**Sektion B — „Deine Vorlieben"**

| Feld | Typ | Optionen |
|---|---|---|
| Lösungsart | Segmented-Control | Bio-natürlich, Ausgewogen, Schnell & effektiv |
| Erfahrung | Segmented-Control | Anfänger, Fortgeschritten |

**Mapping auf `GardenProfile`:**

| UI-Feld | Profile-Feld |
|---|---|
| Bereich | `areas: GardenArea[]` |
| Kinder | `hasChildren: boolean` |
| Haustiere (ja) | `pets: ['DOG']` als Default (später verfeinerbar); `pets: []` bei nein |
| Lösungsart | `solutionStyle: SolutionStyle` |
| Erfahrung | `experience: ExperienceLevel` |

**Microcopy:**
- Headline: „Erzähl uns kurz von dir."
- Sub: „Damit unsere Empfehlungen zu dir passen."
- Sektion A Titel: „Dein Garten"
- Sektion B Titel: „Deine Vorlieben"
- CTA: „Weiter" (mindestens 1 Bereich-Chip Pflicht; kein Toast, inline-micro-text unter Chips „Wähle mindestens einen Bereich")

**Analytics:** `onboarding_step_viewed`, `onboarding_profile_completed` (on Submit, mit allen Werten).

---

### 4. `/onboarding/trust`

**Ziel:** Vertrauen via klarer 3-Step-Mechanik.

**Layout:**
- Vertikal gestapelte Karten, keine Illustrationen
- Jede Karte: Mini-Icon (lucide), Nummer `1`/`2`/`3` groß links, Titel + Beschreibung rechts
- Auf Scroll: aktive Karte `opacity: 1`, andere `opacity: 0.5` (IntersectionObserver-basiert)

**Karten:**

| # | Icon | Titel | Text |
|---|---|---|---|
| 1 | Camera | Scannen | „Du machst ein Foto von deinem Problem." |
| 2 | Sparkles | Verstehen | „Wir erkennen Pflanze, Ursache und Dringlichkeit." |
| 3 | CheckCircle | Lösen | „Du bekommst konkrete Schritte — angepasst an deinen Garten." |

**Microcopy:**
- Headline: „Deine neue Garten-Superkraft."
- Sub: „In drei Schritten vom Foto zur Lösung."
- CTA: „Probier's aus"

**Kein Testimonial, keine Zahlen-Claims** (wäre unseriös solange Mock-Vision).

**Analytics:** `onboarding_step_viewed`.

---

### 5. `/onboarding/scan`

**Ziel:** Erster Aha-Moment.

**Drei Phasen in einer Route:**

#### Phase `picker`

**Layout:**
- Headline + Sub
- 3 große Karten vertikal, jede mit Hero-Bild (Wikimedia-URL aus bestehender Scan-Demo), Label, Einzeiler-Beschreibung
- Klein-Text unten: „Echte Foto-Erkennung startet in Kürze" (Beta-ehrlich)
- Skip-Link unten klein: „Überspringen" → `markComplete()` + `/app`

**Microcopy:**
- Headline: „Lass uns deinen ersten Scan machen"
- Sub: „Wir zeigen dir, wie's geht — such dir ein Beispiel aus."
- 3 Demo-Karten:
  1. Tomate → „Typische Problemstelle an einer Pflanze"
  2. Löwenzahn → „Typisches Unkraut im Rasen"
  3. Echter Mehltau → „Typische Pflanzenkrankheit"

**Analytics:** `first_scan_cta_clicked` bei Tap (`{ demoId }`).

#### Phase `analyzing`

**Overlay-Component (fullscreen), 2,8 s Dauer:**
- Dark-Green bg-Gradient
- Zentraler rotierender Ring + Sparkles-Icon
- Titel: „Ich analysiere dein Beispiel"
- Sub: „Das dauert nur einen Moment"
- 4 Status-Zeilen, sequenziell aktivierend (jeweils 650 ms):
  1. „Bildmerkmale erkennen"
  2. „Mit 12 000 Arten vergleichen"
  3. „Relevanz bewerten"
  4. „Passende Empfehlung vorbereiten"

**Analytics:** `first_scan_started` beim Enter.

#### Phase `result`

**Layout:**
- Compact-Result-View (nicht die volle `/scan/[id]`-Seite)
- Hero-Bild + Meta-Chip (`Unkraut · Mittlere Relevanz` etc.)
- 2-Zeilen-Einordnung aus `ContentEntry.summary`
- Abschnitt „Das kannst du jetzt tun":
  - Card 1: Primary action (`recommended: true` aus `entry.methods`)
  - Cards 2 + 3: Blurred-Teaser mit Schloss-Icon (Preview der weiteren Methoden, nicht klickbar)
- Primary CTA: „Alle Maßnahmen ansehen" → `/onboarding/premium`
- Sekundär (klein unten): „Später, danke" → `markComplete()` + `/app`

**Microcopy:**
- Bei Tomate (Demo-Content-Entry `plant_tomate`): Meta-Badge „Pflanze · Erkannt"
- Bei Löwenzahn (`weed_loewenzahn`): Meta-Badge „Unkraut · Mittlere Relevanz"
- Bei Mehltau (`disease_echter_mehltau`): Meta-Badge „Krankheit · Hohe Relevanz"

**Analytics:** `first_scan_completed` beim Phase-Enter (`{ demoId, durationMs }`).

---

### 6. `/onboarding/premium`

**Ziel:** Waitlist-Signal + sauberer Abschluss.

**Layout:**
- Fullscreen Gradient-Hintergrund `forest-900 → forest-800`
- Zentraler Content-Container mit abgerundeter Paper-Karte
- Skip-Link unten klein: „Später" → `markComplete()` + `/app`

**Microcopy:**
- Eyebrow-Label (klein): „Premium — in Kürze verfügbar"
- Headline: „Bekomme Lösungen für alles, was du scannst."
- Benefits (mit Checkmarks):
  1. „Alle Empfehlungen freischalten"
  2. „Verlauf deiner Scans"
  3. „Unbegrenzte Analysen"
  4. „Personalisierte Wochenplanung"
- Price-Teaser: „Early-Bird 29 €/Jahr · Regulär 49 €"
- Price-Sub: „Preis nur für die ersten 200 Nutzer"
- Primary CTA: „Ich will dabei sein"

**Email-Submit-Flow:**
1. Tap CTA → CTA slides-down, Email-Input slides-in, Submit-Button erscheint
2. Submit bei validem Email → `trackOnboardingEvent('trial_started', { emailDomain: '<domain>' })` — **NUR die Domain**, nicht die volle Email (Privacy)
3. Email landet in `localStorage['gartenscan.waitlist_emails']` als JSON-Array (nur zur Dev-Inspektion, keine Versendung)
4. UI wechselt zu Danke-State: „Wir melden uns, sobald Premium startet." + neue CTA „Weiter zur App"
5. Weiter-CTA → `markComplete()` + `/app`

**Validation:** Regex `/^[^\s@]+@[^\s@]+\.[^\s@]+$/` — simple RFC-5322-light. Inline-Fehler unter Input.

**Analytics:** `paywall_viewed_after_first_value` beim Mount; `trial_started` bei Submit; `onboarding_completed` bei Weiter-Tap oder Skip.

---

## Datenmodell

### Erweiterung in `src/domain/types.ts`

```ts
// Optionaler Abschluss-Marker im Profil
export interface GardenProfile {
  // ... bestehend
  completedAt?: Date;          // NEU
  onboardingCompleted?: boolean; // NEU
}

// UseCase-Enum erweitern falls nötig
export type UseCase =
  | "IDENTIFY_PLANT"
  | "REMOVE_WEED"
  | "FIGHT_PEST"
  | "UNDERSTAND_DISEASE"
  | "GARDEN_IDEAS"
  | "ALL_OF_IT";
```

**(Im Plan: den bestehenden Enum prüfen und nur ergänzen, nicht überschreiben.)**

### Storage-Keys

| Key | Was | Wann geschrieben | Wann gelesen |
|---|---|---|---|
| `gartenscan.onboarding_state` | `OnboardingState` mit `Partial<GardenProfile>` + `currentStep` | Nach jedem Screen-Submit | Onboarding-Screens (resume) |
| `gartenscan.profile` | Volles `GardenProfile` inkl. `onboardingCompleted: true` + `completedAt` | Beim `markComplete()` | Überall in der App |
| `gartenscan.waitlist_emails` | `string[]` — nur zur Dev-Inspektion | Beim Email-Submit auf Paywall | Nicht gelesen (nur für spätere Migration) |

### Hooks

- **`useOnboarding()`** (neu) — `src/hooks/useOnboarding.ts`
  - `{ state, advance, goBack, skipToComplete, submitPaywall }`
  - `advance(stepData: Partial<GardenProfile>)` merged, schreibt localStorage, navigiert zur nächsten Route
  - `skipToComplete()` baut minimal-valide Profile mit Defaults, schreibt `gartenscan.profile`, navigiert zu `/app`
  - `submitPaywall(email)` hängt email an `waitlist_emails`, triggert `trial_started`, ruft `markComplete()`

- **`useProfile()`** (erweitert — bereits existent) — zusätzlich `completed: boolean` aus `profile?.onboardingCompleted`

- **`useOnboardingGuard()`** (neu) — `src/hooks/useOnboardingGuard.ts`
  - Liest `useProfile()`, in `useEffect` Redirect-Logik entsprechend Guard-Tabelle
  - Gibt `ready: boolean` zurück — Komponenten rendern nur wenn `ready=true`

### Helper

- **`trackOnboardingEvent(event, payload)`** — `src/domain/analytics/onboarding.ts`
  - Wraps existing `ConsoleTracker`, fügt `category: 'onboarding'` + `timestamp` + `sessionId` hinzu
  - Bildet das Event-Payload korrekt (siehe Analytics-Tabelle)

- **`extractEmailDomain(email)`** — extrahiert nur die Domain (`user@example.com` → `example.com`), nicht die volle PII. Name bewusst „extract", nicht „hash", weil es keine Hash-Funktion ist — nur Substring.

## Komponenten-Struktur

Neu in `src/components/features/onboarding/`:

| File | Was |
|---|---|
| `OnboardingShell.tsx` | Layout-Wrapper mit Back-Pfeil + Progress-Dots + main-content-slot |
| `ProgressDots.tsx` | 6 Mini-Dots, `active` prop zeigt Position 1–6 |
| `OnboardingHeadline.tsx` | Serif-Titel + Sub-Zeile mit konsistenter Spacing |
| `SelectableCard.tsx` | Icon + Label Multi-Select Karte mit Check-Badge |
| `SegmentedControl.tsx` | Segmented-Button-Group für Single-Select |
| `ChipGroup.tsx` | Chip-Multi-Select für Garten-Bereiche |
| `YesNoToggle.tsx` | Horizontal-Pill-Toggle für Kinder/Pets |
| `TrustStepCard.tsx` | Eine der 3 Karten in Screen 4 |
| `DemoScanCard.tsx` | Karte für Picker-Phase in Screen 5 |
| `AnalyzingOverlay.tsx` | Fullscreen-Overlay mit Status-Zeilen (recycelt aus bestehendem `scan/new`) |
| `CompactResultView.tsx` | Result-Phase in Screen 5, mit blurred-teaser-Cards |
| `WaitlistCTA.tsx` | CTA + Email-Input-Slide + Danke-State auf Screen 6 |

Neu in `src/app/onboarding/`:

| File | Was |
|---|---|
| `layout.tsx` | Wrap with `OnboardingShell`, run `useOnboardingGuard`, apply route-transition |
| `welcome/page.tsx` | Screen 1 |
| `use-cases/page.tsx` | Screen 2 |
| `garden/page.tsx` | Screen 3 |
| `trust/page.tsx` | Screen 4 |
| `scan/page.tsx` | Screen 5 mit 3 Phasen |
| `premium/page.tsx` | Screen 6 |

**Gelöschte Routen:** `src/app/onboarding/style/` und `src/app/onboarding/first-scan/` (komplett entfernen + redirects in `next.config.mjs` auf Nachfolger).

## Routing-Guards

`src/app/onboarding/layout.tsx` — client-component:
```
wenn profile.completed → router.replace('/app')
sonst rendert children
```

`src/app/app/page.tsx` (Dashboard) — ergänzen um Guard-Check am Anfang:
```
wenn NICHT profile.completed → router.replace('/onboarding/welcome')
sonst rendert Dashboard
```

Analog für andere App-Routen (`/scan/*`, `/garden/*`, `/coach`, `/history`, `/premium`): ein reusable `<OnboardingGuard>`-Wrapper, der in `useOnboardingGuard()` checked, während `loading` rendert er nichts.

## Analytics-Events

| Event | Trigger | Payload |
|---|---|---|
| `onboarding_started` | `welcome` Mount (pro Session einmalig, Session-Flag in sessionStorage) | `{ source: 'landing' \| 'direct' }` |
| `onboarding_step_viewed` | Jeder Screen-Mount | `{ step: string, index: 1..6 }` |
| `onboarding_goal_selected` | `use-cases` Submit | `{ goals: UseCase[] }` |
| `onboarding_profile_completed` | `garden` Submit | `{ areas, hasChildren, hasPets, solutionStyle, experience }` |
| `first_scan_cta_clicked` | `scan`-picker Tap | `{ demoId: string }` |
| `first_scan_started` | `analyzing`-Phase-Enter | `{ demoId }` |
| `first_scan_completed` | `result`-Phase-Enter | `{ demoId, durationMs }` |
| `paywall_viewed_after_first_value` | `premium` Mount | — |
| `trial_started` | Paywall Email-Submit | `{ emailDomain: string }` (keine volle Email) |
| `onboarding_completed` | `markComplete()` | `{ pathTaken: 'full' \| 'skipped_paywall' \| 'skipped_scan' \| 'skipped_both' }` |
| `skip_clicked` (optional) | Skip-Link-Tap | `{ step: string }` |
| `back_clicked` (optional) | Back-Pfeil-Tap | `{ fromStep: string }` |

Tracker-Target: `ConsoleTracker` (bereits vorhanden in `src/domain/analytics/tracker.ts`). Kein PostHog.

## Visuelle Sprache

**Farben (alle bestehend in Tailwind-Config):**
- Background base: `sage-50`
- Paper: `#F3F1EA` (Token `paper`)
- Primary text: `forest-900`
- Secondary text: `ink-muted`
- CTA accent: `clay-500` / hover `clay-600`
- Success / check: `forest-700`
- Dark overlay (analyze): `forest-900` Gradient

**Typografie:**
- Headlines: Fraunces, 28–36 px, font-normal, lh 1.1
- Sub: Inter, 15–17 px, 140 % lh, `text-ink-muted`
- CTAs: Inter, 15 px, font-semibold

**Motion (framer-motion bereits installiert):**
- Route-Transition: fade 250 ms + translateY(-8px → 0)
- Tap-Feedback: `scale(0.97)` on active
- Staggered-Fade bei Listen: 60 ms Delay zwischen Items
- Analyze-Ring: recycelt aus bestehendem `scan/new`
- Keine Bounces, kein Parallax, keine Shakes

## Edge-Cases

| Situation | Verhalten |
|---|---|
| Kein localStorage (erste Version / Private-Mode) | Fresh state, keine Errors |
| Refresh in `analyzing`-Phase | Reset zu `picker`-Phase |
| Direkter Aufruf `/onboarding/premium` ohne Scan | Rendert, Paywall ist dann psychologisch schwächer aber funktionsfähig |
| Direkter Aufruf gelöschter Route `/onboarding/style` | `next.config.mjs` redirect → `/onboarding/garden` |
| Direkter Aufruf `/onboarding/first-scan` | redirect → `/onboarding/scan` |
| Invalide Email auf Paywall | Inline-Fehlermeldung, kein Submit |
| User wechselt Tab während Onboarding | Nichts — state ist in localStorage, andere Tabs merken den Diff natürlich beim nächsten localStorage-Read |
| Abgeschlossenes Profil landet auf `/onboarding/welcome` | Guard redirect `/app` |
| Unvollständiges Profil landet auf `/app` | Guard redirect `/onboarding/welcome` (bzw. last pending step) |

## Verifikation

Kein Test-Framework. Verifikation pro Feature-Block:

1. `npm run build` nach jedem Task (keine TS/ESLint-Fehler)
2. Manueller Mobile-Smoke-Test (iPhone 14, 390×844):
   - Happy Path: Landing → alle 6 Screens → `/app`
   - Skip-Path: Landing → Welcome → jeweils Skip auf Scan und Premium → `/app`
   - Resume-Path: Tab mid-way schließen, reopen → landet auf letztem Screen
   - Guard-Path: Abgeschlossenes Profil auf `/onboarding/welcome` → Redirect `/app`
   - Guard-Path: Fresh localStorage auf `/app` → Redirect `/onboarding/welcome`
   - Back-Navigation: Auf jedem Screen Back-Pfeil testen, State bleibt erhalten

## Offene Punkte (im Plan zu klären)

- Exakter UseCase-Enum in `src/domain/types.ts` — prüfen und ergänzen
- Exakte `pets: PetType[]`-Behandlung: ein einfaches `hasPets: boolean` ist brief-konform, aber `pets`-Feld im GardenProfile ist Array. Plan-Entscheidung: `hasPets=true` → `pets: ['DOG']` als Default, oder neue `hasPets`-Boolean-Spalte neben `pets`? Ich schlage neues Boolean-Feld `hasPets` vor und lasse `pets: PetType[]` leer bis zu einem späteren Profil-Edit.
- Produkt-Visual für Welcome-Screen: stilisierte SVG-Komposition im Plan selbst designen oder ein vorbereitetes Asset einfügen? Ich schlage inline-SVG im Component-Code vor (kein neues Asset-File).
- Wikimedia-URLs für Demo-Karten: dieselben 3, die heute in `/scan/new` verwendet werden (`Tomatoes-on-the-bush.jpg`, `DandelionFlower.jpg`, `UncinulaTulasneiLeaf.jpg`) — im Plan verifizieren.

## Nach der Umsetzung (nicht in diesem Scope)

- Echten Vision-Provider anbinden und `ENABLE_PHOTO_UPLOAD` auf `true`
- Stripe-Integration für echte Paywall-Abos
- PostHog oder Plausible statt nur Console-Tracker
- AGB + Widerrufsbelehrung (braucht Stripe)
- Multi-Language (momentan nur DE)
