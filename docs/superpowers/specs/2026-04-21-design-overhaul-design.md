# gartenscan — High-End Design-Overhaul

**Datum:** 2026-04-21
**Stand der App:** Live auf https://gartenscan.de, 6-Screen-Onboarding-Flow aktiv, Pipeline `testing`/75 %.
**Ziel:** Visuelles Niveau von „solide Plant-App" auf „premium magazine-style product" anheben — ohne den bestehenden Funktionsumfang zu touchieren.

---

## 1. Strategische Entscheidungen (Brainstorming)

| Frage | Entscheidung |
|---|---|
| Richtung | **B · Eigene Signatur entwickeln** — Bestehende Foundation bleibt, eigene visuelle Identität wird hinzugefügt. |
| Mood | **A · Warm Botanical Studio** (Kinfolk × Apartment Therapy). Magazin-Wärme, Terrakotta, handwerklich. |
| Bildwelt | **C · Hybrid** — Echte Fotos mit konsistentem Grading für Scan/Pflanzen, hand-anmutende Linien-Illustrationen für Kategorien/Empty States/Decorations. |
| Signature Moments | **B + C + D** — Onboarding-Flow, Scan-Capture & Analyze, Scan-Result-Reveal. Diese drei bekommen extra cinematische Investition; alle anderen Screens kriegen das uniform aktualisierte Design-System. |

### Was *nicht* gemacht wird

- Kein neues Logo, keine Renamings.
- Keine Funktionalitäts-Änderungen (Scan-Pipeline, Onboarding-State-Machine, Auth, Routing bleiben unverändert).
- Kein Maskott / Charakter — die „Stimme" der App entsteht über Typografie + Pull-Quotes, nicht über einen anthropomorphen Helfer.
- Keine globale Dark-Mode-Einführung in dieser Iteration (nur Scan-Capture nutzt dunkle Surface).

---

## 2. Foundation

### 2.1 Farben — erweiterte Tokens

Bestehende Tokens (`forest`, `moss`, `sage`, `clay`, `sun`, `berry`, `sky`) bleiben unverändert. Fünf neue Tokens werden ergänzt:

| Token | Hex | Verwendung |
|---|---|---|
| `--color-bark-900` | `#3a2515` | Display-Headlines (Editorial), Scan-Capture-Backdrop, Premium-Gradient Start |
| `--color-clay-800` | `#6b3a1f` | Premium-Akzente, Pull-Quote-Border, Italic-Serif-Akzent |
| `--color-terra-500` | `#a87842` | Eyebrow-Tags, Editorial-Caps, Illustration-Border |
| `--color-cream` | `#fefaf2` | Surface (Cards, Sheets, Phone-Screen) — wärmer als bisheriges `paper` |
| `--color-linen` | `#f4ead8` | Page-Background warm, Quote-Background, Illustration-Backdrop |

**Migration:** `bg-paper` (`#faf8f3`) bleibt für bestehende Komponenten. Neue Surfaces nutzen `bg-cream`. Page-Backgrounds wechseln graduell von `bg-sage-50` zu `bg-linen` (Phase-Plan in §8).

### 2.2 Typografie

Schriften unverändert: **Fraunces** (Serif, opsz axis), **Inter** (Sans). Die Verwendung wird präziser definiert:

| Style | Font | Größe / Weight | Verwendung |
|---|---|---|---|
| `display-xl` | Fraunces 400 | 40px / 1.05 / -0.02em | Hero-Headlines (Onboarding Welcome, Result-Name) |
| `display-l` | Fraunces 400 | 30px / 1.1 / -0.01em | Section-Titles, Premium-Module |
| `display-m` | Fraunces 400 | 22px / 1.15 | Card-Titles, Modal-Headers |
| `pull-quote` | Fraunces 500 italic | 18px / 1.5 | Diagnose-Stimme, Editorial-Akzent |
| `body-lg` | Inter 400 | 15px / 1.55 | Default Body Copy |
| `body` | Inter 400 | 13px / 1.55 | Standard UI Text |
| `eyebrow` | Inter 700 caps | 10px / 0.16em letter-spacing | Section-Tags („Diagnose · Krankheit") |
| `latin-name` | Fraunces 400 italic | 13px | Wissenschaftliche Pflanzennamen |

Klassen werden in `globals.css` erweitert (Pull-Quote, Eyebrow neu).

### 2.3 Motion — vier Charaktere

Aktuell ein einziger uniformer `active:scale-[0.98]`. Wird ersetzt durch ein bewusst eingesetztes Vokabular:

| Name | Curve & Dauer | Verwendung |
|---|---|---|
| **Breath** | `2400ms ease-in-out infinite` (Scale 1 → 1.08) | Loading-States, Scan-Pulse, Ambient-Backdrops |
| **Bloom** | `600ms cubic-bezier(0.2, 0.8, 0.2, 1)` (Scale 0.9 → 1.05 → 1, Opacity 0 → 1) | Result-Reveal, Toast-Erscheinen, neue Cards |
| **Write** | `1800ms ease-out` (stroke-dashoffset 600 → 0) | SVG-Illustrationen die sich „selbst zeichnen" beim ersten Render |
| **Tap** | `120ms ease-out` (Scale 1 → 0.96 → 1) | Buttons, Cards, alle interaktiven Elemente |

Definiert als CSS-Keyframes in `globals.css`, optional mit `prefers-reduced-motion` Override.

### 2.4 Bildlogik — Foto-Grading-Recipe

Alle Fotos durchlaufen einen einheitlichen CSS-Filter-Layer (keine Bildbearbeitung nötig):

```css
.photo-graded {
  filter: contrast(0.92) saturate(0.85) sepia(0.12) brightness(1.02);
  position: relative;
}
.photo-graded::after {
  content: '';
  position: absolute; inset: 0;
  background: radial-gradient(ellipse at center, transparent 50%, rgba(58, 37, 21, 0.18) 100%);
  pointer-events: none;
}
```

Optional zusätzlich: Paper-Grain-Overlay (existiert bereits in `globals.css` als `.grain`).

**Komponente:** `<PhotoFrame src=... ratio="square|portrait" grade={true} />` — wrappt `next/image` und appliziert das Recipe.

### 2.5 Illustration — Botanical-Linework-Library

- **Stil:** Hand-anmutende Linien-Illustrationen im Stil alter botanischer Stiche.
- **Spezifikation:** Stroke `2.5px`, single color (`--color-bark-900`), `stroke-linecap: round`, `stroke-linejoin: round`, `fill: none`.
- **Container:** Kreis-Frame in `--color-cream` mit `1.5px solid --color-terra-500` Border.
- **Library-Scope für Phase 1:** ~20 essentielle Marks (Tomate, Farn, Pilz, Insekt, Sonne, Regen, Schaufel, Schere, Gießkanne, Blatt, Wurzel, Frucht, Blüte, Mehltau, Schädling, Schnecke, Blattlaus, Komposthaufen, Hochbeet, Topfpflanze).
- **Format:** Inline-SVG-Komponenten unter `src/components/icons/botanical/<Name>.tsx`.
- **Erweiterung:** Library wächst organisch mit Content-Set (Ziel 50–80 langfristig).

### 2.6 Density & Spacing

- Section-Gap: `32px → 48px` zwischen Hauptbereichen.
- Card-Padding: `16px → 22px`.
- Tap-Targets bleiben `≥44px`.
- Hero-Areas bekommen `+50%` vertikalen Raum (Onboarding-Welcome, Result-Hero).

---

## 3. Komponenten-Upgrades

Diese Komponenten werden bestehend angepasst, **nicht ersetzt**. APIs bleiben rückwärtskompatibel.

### 3.1 `Button` (`src/components/ui/Button.tsx`)

- Neuer Variant: `editorial` — `bg-bark-900 text-cream`, Inter-Medium, `rounded-[14px]`.
- Hover-Motion: nicht mehr `scale-[0.98]`, sondern `Tap`-Curve (siehe §2.3).
- Loading-State: integriert (Prop `loading={true}` zeigt Breath-Pulse-Dot statt Text).

### 3.2 `Card` (`src/components/ui/Card.tsx`)

- Default-Surface: `bg-cream` statt `bg-paper`.
- Padding: `22px`.
- Shadow neu: `--shadow-editorial: 0 8px 28px rgba(58, 37, 21, 0.08)`.
- Variant `editorial`: warmer Linen-BG, stärkere Pull-Quote-Linie links.

### 3.3 `BottomNav` (`src/components/layout/BottomNav.tsx`)

- Surface bleibt Glass, aber wärmerer Tint: `bg-cream/95`.
- Center-Action (Camera-Button): Gradient von `forest-700 → moss-500` bleibt, aber neuer Glow-Ring nutzt `clay-500/30` für warme Note.
- Active-State der Tab-Items: zusätzlich zum Color-Switch ein 3px-Indikator-Punkt unter dem Icon (`bg-bark-900`).

### 3.4 `PhotoFrame` (neu, `src/components/ui/PhotoFrame.tsx`)

- Wrappt `next/image` und appliziert Foto-Grading-Recipe (§2.4).
- Props: `src`, `alt`, `ratio` (`square` | `portrait` | `wide`), `grade` (default `true`), `vignette` (default `true`), `priority`.

### 3.5 `BotanicalIcon` (neu, `src/components/ui/BotanicalIcon.tsx`)

- Generische Wrapper-Komponente, die SVG-Marks aus `src/components/icons/botanical/` rendert.
- Props: `name` (z.B. `"tomato"`), `size` (default `48px`), `framed` (default `true` — Kreis-Container), `animate` (default `false` — wenn `true`, läuft `Write`-Animation einmalig).

### 3.6 `EmptyState` (neu, `src/components/ui/EmptyState.tsx`)

- Bisher fehlend. Wird auf allen leeren Listen verwendet (kein Garten, kein Verlauf, keine Tasks).
- Layout: Botanical-Mark zentriert (animated `Write`), Title in `display-m`, Body in `body`, optionaler CTA-Button.

### 3.7 `LoadingState` (neu, `src/components/ui/LoadingState.tsx`)

- Konsistenter Loader für Suspense-Boundaries und Server-Component-Wartezeit.
- Layout: zentrierter Breath-Pulse-Dot (Bark-Color), darunter optionaler Italic-Serif-Hint („Lade Pflanzen …").

---

## 4. Signature Moment 1 · Onboarding

### Scope
Alle 6 Onboarding-Routen (`/onboarding/{welcome,use-cases,garden,trust,scan,premium}`) bekommen das neue Foundation-System. Drei dieser Screens werden zusätzlich cinematisch aufgewertet:

#### 4.1 Welcome (`/onboarding/welcome`)

- Hintergrund: Linen-Gradient (`#f4ead8 → #fefaf2`).
- Hero-Bereich (oben, ~50 % Viewport): zentrierte Botanical-Illustration (160 × 160) im Cream-Kreis-Frame, dahinter ein `Ambient`-Pulse (radial gradient `terra-500 / 0.18`, Breath-Animation).
- Illustration animiert auf Mount: `Write`-Curve, gestaffelt für Stengel → Blätter → Frucht (2.4s gesamt).
- Editorial-Stack:
  - Eyebrow: `WILLKOMMEN` (terra-500, caps, 0.18em letter-spacing).
  - Display: „Erkennen. *Verstehen.* Lösen." — Italic-Akzent auf „Verstehen" in `clay-800`.
  - Body: ein Satz in `body-lg`, max 2 Zeilen.
- CTA: `editorial` Variant, `Los geht's`.
- Skip-Link unter CTA: kleines Inter-Medium 11px, `Schon Konto? Anmelden`.

#### 4.2 Use-Cases (`/onboarding/use-cases`)

- 3-Column-Grid für Auswahl-Karten (Pflanzen / Unkraut / Krankheiten).
- Jede Karte enthält Botanical-Mark (animated on hover), Display-M-Titel, Body-Subtitle.
- Selektion: `Tap`-Motion, Border `2px solid bark-900`.

#### 4.3 Trust (`/onboarding/trust`)

- 3 Editorial-Karten gestapelt mit Pull-Quotes (echte Sätze in Italic-Serif), nicht generische „KI-Power"-Bullets.
- Beispiel: „Die App schickt keine Fotos in die Cloud, bevor du nicht zustimmst." statt „Datenschutz".

#### 4.4 Scan-Demo (`/onboarding/scan`)

- 3 Demo-Karten bleiben (Tomate / Löwenzahn / Mehltau), aber jede mit dem neuen `PhotoFrame` (graded).
- Analyzing-Phase nutzt das neue `Scan-Analyzing`-Sub-State (siehe §5.2).
- Compact-Result nutzt das neue `Result-Reveal`-Layout in komprimierter Form (siehe §6).

### Implementierungs-Hinweise
- Bestehende `useOnboarding`-State-Machine und Routing bleiben unverändert.
- `OnboardingShell` wird angepasst (neuer Header-Style, Progress-Dots in `terra-500`).
- Cross-Fade-Transition zwischen Steps: 400ms `ease-out`.

---

## 5. Signature Moment 2 · Scan Capture & Analyze

### Scope
`/scan/new` (Capture) und der Analyzing-Sub-State (aktuell ein Overlay).

### 5.1 Capture (`/scan/new`)

- Vollflächige dunkle Surface (`bg-bark-900`) — einer der wenigen dunklen Screens.
- Camera-Preview füllt Viewport (bei aktivem Vision-Provider; aktuell mit Fallback-Placeholder).
- **Editorial Tooltip oben:** Pill-shaped, `bg-bark-900/65 backdrop-blur-xl`, Italic-Serif-Text in Cream, kontextueller Hinweis: „*Ein Blatt mittig im Rahmen*".
- **Asymmetrische Frame-Eckmarker:** Nur zwei Diagonalecken (`top-right`, `bottom-left`) in `sun-500` (3px Border, 22 × 22). Der Frame selbst ist 2px in `cream`. Visuelle Signatur, nicht kitschiges Vier-Ecken-Crosshair.
- **Bottom-Bar:**
  - Italic-Serif-Tip darüber: „*Tipp: Sonne im Rücken für klare Farben*".
  - Großer Shutter-Button (70 × 70, Cream, doppelter Ring).
  - Glass-Utility-Icons (Flash, Library) in `cream/12 backdrop-blur` Pills.

### 5.2 Analyzing-Overlay

- Bild bleibt als gedimmter Hintergrund sichtbar (`bark-900/85 backdrop-blur(8px)`).
- Spinner-Ring (90 × 90, 2px, `rgba(254,250,242,0.2)` mit `sun-500`-Top-Color, 1.6s linear rotation).
- Status-Text in Italic-Serif, wechselt durch 3 Steps mit Cross-Fade (jeweils ~900ms):
  1. „*Blatt erkannt*"
  2. „*Muster vergleichen*"
  3. „*Diagnose erstellen*"
- Kleine Eyebrow „SCHRITT 2 / 3" in `sun-500` darüber.
- Dauer aktuell hartcodiert auf 2.8s (Demo) — bleibt so, später dynamisch.

### Implementierungs-Hinweise
- BottomNav wird auf `/scan/new` weiterhin ausgeblendet (existiert in `BottomNav.tsx`).
- Neue Komponenten: `ScanFrame`, `ScanTooltip`, `AnalyzingOverlay` (existiert, wird redesignt).

---

## 6. Signature Moment 3 · Result Reveal

### Scope
`/scan/[id]` (alle Scan-Detail-Routen), inklusive der Compact-Variante im Onboarding-Demo.

### 6.1 Layout

```
┌─────────────────────────┐
│   PhotoFrame (Hero)      │  ← 240px, graded, vignetted
│   ┌─Confidence-Pill      │  ← 94% sicher (oben links, glass)
│   └─Share-Button         │  ← oben rechts (glass circle)
├─────────────────────────┤
│  ╭── (28px Round-Top) ──╮│  ← Cream-Sheet, schiebt sich -28px über Hero
│  │ EYEBROW              ││  ← Diagnose · Krankheit
│  │ Display-Name         ││  ← „Kraut- und Braunfäule"
│  │ italic latin-name    ││  ← Phytophthora infestans
│  │                       ││
│  │ ┌─ Pull-Quote ─────┐ ││  ← „Ein klassischer Fall …"
│  │ │ Italic-Serif      │ ││
│  │ └───────────────────┘ ││
│  │                       ││
│  │ ┌─ Action-Card ────┐ ││  ← Premium-Gradient (bark→clay), die EINE Aktion
│  │ │ EMPFEHLUNG · S.2 │ ││
│  │ │ Befallene Blätter│ ││
│  │ │ entfernen         │ ││
│  │ │ 15 Min · Schere   │ ││
│  │ └───────────────────┘ ││
│  │                       ││
│  │ ┌─ Locked-Card ───┐ ││  ← Soft-blur, 3 weitere Schritte (Premium)
│  │ │ blurred preview │ ││
│  │ │ [Premium]       │ ││
│  │ └───────────────────┘ ││
│  ╰───────────────────────╯│
└─────────────────────────┘
```

### 6.2 Reveal-Choreographie

Beim Mount staffelt sich die Animation (jeweils `Bloom`-Curve):

1. `t=0ms`: Hero-Foto fade-in (Opacity 0 → 1, 600ms).
2. `t=200ms`: Confidence-Pill bloomt von oben links.
3. `t=400ms`: Cream-Sheet schiebt sich von unten hoch (Translate Y +60 → 0, 600ms).
4. `t=600ms`: Eyebrow + Display-Name + Latin-Name fade-in (gestaffelt 100ms).
5. `t=900ms`: Pull-Quote fade-in mit `Write`-Akzent auf der Quote-Border-Linie.
6. `t=1100ms`: Action-Card bloomt.
7. `t=1300ms`: Locked-Card fade-in subtil (lower opacity).

Gesamtdauer: ~1.9s. `prefers-reduced-motion`: alle Animationen werden zu sofortigen Fade-ins (200ms).

### 6.3 Confidence-Pill

- Glass: `bg-cream/92 backdrop-blur(8px)`.
- Status-Dot in `moss-500` (>80%), `sun-500` (50–80%), `berry-500` (<50%).
- Text: `Inter 700 10px`, „94 % sicher".

### 6.4 Pull-Quote

- BG `linen`, Border-Left `3px clay-800`, Padding `11px 13px`, Border-Radius `0 8px 8px 0`.
- Inhalt: ein redaktionell verfasster Diagnose-Satz pro Krankheit/Pflanze (kommt aus dem Content-Set, ergänzendes Feld).
- Wenn kein Quote im Content-Set: fallback auf strukturiertes Body-Layout.

### 6.5 Action-Card

- Gradient: `linear-gradient(135deg, bark-900 0%, clay-800 100%)`.
- Eyebrow: `EMPFEHLUNG · STUFE X` in `sun-500`.
- Title: `Display-M` in Cream.
- Meta: `body 11px` mit Cream/75 % Opacity.
- Tap-Behavior: navigiert zu Schritt-Detail-Sheet (in dieser Phase nicht neu — bleibt auf `/coach`-Route).

### 6.6 Locked-Card (Soft-Paywall)

- BG `linen`, kein scharfer Cut-off.
- Blur-Gradient over content (`backdrop-blur(2px)` + linear-gradient overlay).
- Premium-Badge in `sun-500` rechts unten.
- Kein hartes Locking — Tap öffnet `/premium`-Sheet (bestehend).

---

## 7. Empty / Loading / Error States

### 7.1 EmptyState (neue Komponente, §3.6)

| Screen | Mark | Title | Body | CTA |
|---|---|---|---|---|
| `/garden` (leer) | `seedling` | „Dein Garten ist noch leer" | „Scanne deine erste Pflanze, um sie hier zu sehen." | „Erste Pflanze scannen" |
| `/history` (leer) | `journal` | „Noch keine Scans" | „Hier siehst du, was du erkannt hast — und wann." | „Jetzt scannen" |
| `/coach` (kein Plan) | `compass` | „Kein Plan für heute" | „Schau morgen wieder vorbei oder lies den Monatsbrief." | „April-Brief lesen" |

### 7.2 LoadingState (§3.7)

- Verwendung in allen `loading.tsx` von Next.js Server Components.
- Dauer-Hint nach >2s: „Lädt etwas länger als sonst …" (Italic-Serif-Body 12px, opacity 0.6).

### 7.3 ErrorState (neu)

- Layout wie EmptyState, aber Mark-Color in `berry-500`.
- Title: kontextabhängig („Konnte deine Pflanzen nicht laden", „Scan fehlgeschlagen").
- Sekundärer Text: technische Info versteckt hinter „Details anzeigen"-Toggle.
- CTA: „Erneut versuchen".

---

## 8. Implementations-Phasen

Die Arbeit wird in 4 Phasen aufgeteilt. Jede Phase ist deploybar (kein Breaking Change).

### Phase 1 · Foundation (Tokens, Styles, Utility-Klassen)

- Erweiterte CSS-Tokens in `globals.css` (Bark, Clay-800, Terra, Cream, Linen, neue Shadows).
- Neue Typo-Klassen (`pull-quote`, `eyebrow`, `latin-name`).
- Neue Motion-Keyframes (`bloom`, `write`).
- Foto-Grading-Utility-Klasse (`.photo-graded`).

**Risiko:** sehr niedrig. **Sichtbarkeit:** keine, bis Komponenten umgestellt sind.

### Phase 2 · Komponenten-Library (Patterns)

- `PhotoFrame` (neu).
- `BotanicalIcon` + erste 20 Marks unter `src/components/icons/botanical/`.
- `EmptyState`, `LoadingState`, `ErrorState` (neu).
- `Button` Variant `editorial`, neue Tap-Motion.
- `Card` Default-Surface auf Cream, neuer Variant `editorial`.
- `BottomNav` Tint-Update.

**Risiko:** niedrig (rückwärtskompatibel). **Sichtbarkeit:** subtil — Cards/Buttons fühlen sich wärmer an.

### Phase 3 · Signature Moments

- **Onboarding-Welcome:** Live-drawn Mark, Editorial-Stack, neue Hero-Höhe.
- **Onboarding-Trust:** Pull-Quotes statt Bullet-Liste.
- **Scan-Capture:** dunkle Surface, asymmetrische Eckmarker, Italic-Tooltip, Glass-Bar.
- **Analyzing-Overlay:** Spinner-Ring, 3-Step Italic-Status.
- **Result-Reveal:** Hero + Cream-Sheet + Pull-Quote + Action-Card + Locked-Card mit gestaffelter Bloom-Choreographie.

**Risiko:** mittel (visueller Bruch im positiven Sinn, sollte vorher User-Sampling). **Sichtbarkeit:** maximal.

### Phase 4 · Roll-out auf Rest-App

- `/app` (Dashboard): Today-Hero mit neuem PhotoFrame, Mein-Garten-Tiles mit graded Photos.
- `/garden`, `/history`, `/coach`: EmptyStates eingebaut, neue Section-Density.
- `/premium`: Editorial-Style Pull-Quotes für Premium-Promises.
- Landing-Page: bleibt bewusst zuletzt — wenn App-Side glänzt, kann Landing parallelisiert werden.

**Risiko:** niedrig. **Sichtbarkeit:** hoch.

---

## 9. Erfolgskriterien

| Kriterium | Messung |
|---|---|
| Visuelle Konsistenz | Alle Surfaces nutzen Cream/Linen, alle Fotos graded, alle Empty-States vorhanden. Manueller Smoke-Test pro Route. |
| Onboarding-Activation-Rate | Funnel `welcome → premium-screen` aus PostHog/Console-Tracker, Vergleich Pre/Post. Ziel: ≥ +10 %. |
| Scan-Wiederkehr | Anzahl User mit ≥2 Scans innerhalb 7 Tagen, Vergleich Pre/Post. Ziel: ≥ +15 %. |
| Subjective Quality | 5 User-Tests (Mobile, iPhone/Android), Frage „Wirkt diese App auf dich premium?" auf Skala 1–10. Ziel: Mittelwert ≥ 8. |
| Performance | Lighthouse-Score Mobile bleibt ≥ 90 (Performance, Accessibility). |

---

## 10. Out of Scope

- Keine Re-Architektur des State-Managements oder Routings.
- Keine Änderungen an Vision-Provider, Analytics-Pipeline, Stripe-Vorbereitung.
- Keine i18n / Multi-Language (bleibt deutsch).
- Keine A/B-Testing-Infrastruktur (das Redesign wird hart geshippt).
- Kein Dark-Mode (außer dem singulären Scan-Capture-Screen).

---

## 11. Offene Fragen für Implementation

- Welcher konkrete Vision-Provider wird mittelfristig integriert? (Beeinflusst, ob Capture-Preview echte Camera-Pipeline oder Static-Placeholder bleibt.)
- Sollen die 20 ersten Botanical-Marks vom Designer extern erstellt oder per AI-Generation (z.B. Claude mit SVG-Output) bootstrappt werden?
- Ist ein Mini-Brand-Guidelines-PDF gewünscht für externe Mitarbeit (Designer, Copywriter)?

Diese Fragen werden im Implementations-Plan beantwortet, nicht in dieser Spec.
