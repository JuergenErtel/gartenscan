# Onboarding: Erklärseite statt Musterfall

**Datum:** 2026-06-14
**Status:** Genehmigt

## Problem

Schritt 5 des Onboardings (`SCAN`) ist aktuell ein Demo-„Musterfall": Der Nutzer
wählt ein Beispiel (Tomate / Löwenzahn / Echter Mehltau), sieht einen
Fake-„Analyzing"-Overlay und ein Fake-Ergebnis. Das wirkt langweilig und
hinhaltend, statt schnell zu vermitteln, wie die App funktioniert.

## Ziel

Eine kurze, visuelle Erklärseite, die in ~5 Sekunden verständlich macht, wie
gartenscan funktioniert – danach geht es per CTA weiter.

## Umfang

- **Geändert:** `src/app/onboarding/scan/page.tsx` wird komplett ersetzt.
- **Unverändert:** Route `/onboarding/scan`, Schrittreihenfolge in
  `useOnboarding` (`SCAN` bleibt Schritt 5 von 6), `OnboardingShell`,
  `OnboardingHeadline`, `useOnboarding`.
- **Gelöscht:** `src/components/features/onboarding/DemoScanCard.tsx`,
  `AnalyzingOverlay.tsx`, `CompactResultView.tsx` (werden ausschließlich von der
  Scan-Seite verwendet – per Grep verifiziert).

## Aufbau der neuen Seite

Gerendert in `OnboardingShell` mit `step={5}`, Progress-Dots sichtbar,
Zurück-Button aktiv (Standardverhalten der Shell).

- **Headline** (`OnboardingHeadline`):
  - Titel: „So einfach geht's"
  - Subtitle: „In drei Schritten vom Foto zur Pflege-Empfehlung."
- **Drei Schritt-Zeilen**, je Icon-Kachel + Titel + kurze Erklärung:
  1. 📷 **Foto machen** — „Pflanze, Unkraut oder Blatt"
  2. 🔍 **KI erkennt sofort** — „Art, Krankheit & Schädling"
  3. 🌱 **Pflegetipps erhalten** — „konkret & saisonal"
  - Optional dezenter vertikaler Connector zwischen den Kacheln.
- **Primär-Button** „Los geht's" → `advance("SCAN", {})` (führt wie bisher zu
  PREMIUM).
- **Kein** separater „Überspringen"-Link. Der Skip-Pfad bleibt über die
  PREMIUM-Seite erhalten.

## Verhalten & Interaktion

- Beim Mount: `trackOnboardingStepViewed("SCAN")` (unverändert beibehalten).
- Button-Klick: `advance("SCAN", {})`.
- Keine Demo-Auswahl, kein Analyse-Overlay, kein Ergebnis-State mehr. Die
  Phasen-State-Maschine (`picker` / `analyzing` / `result`) entfällt komplett.

## Animation

- Gestaffeltes Einblenden mit framer-motion: Container mit `staggerChildren`,
  Schritt-Zeilen erscheinen nacheinander (Fade + leichter Y-Versatz),
  Icon-Kacheln mit dezentem Scale-Pop.
- `prefers-reduced-motion` respektieren: bei reduzierter Bewegung ohne
  Versatz/Scale sofort sichtbar.

## Styling

- Echte Design-Tokens des Projekts verwenden: `linen`, `cream`, `forest`,
  `bark`, `ink-muted` (analog zu bestehenden Onboarding-Seiten). Keine
  Hardcoded-Hex-Werte.
- Mobile-first; auf Telefon-Viewports verifizieren.

## Analytics

- Beibehalten: `trackOnboardingStepViewed("SCAN")`.
- Nicht mehr aufgerufen: `trackFirstScanCtaClicked`, `trackFirstScanStarted`,
  `trackFirstScanCompleted`. Die Funktionsdefinitionen bleiben in der
  Analytics-Datei bestehen (kein Entfernen nötig), werden aber nicht mehr
  importiert.

## Nicht im Umfang (YAGNI)

- Kein Swipe-Karussell, keine Mehrfach-Slides.
- Keine echte Scan-Demo / kein echter API-Call.
- Keine Änderung an `useOnboarding`, Routen oder Schrittanzahl.

## Verifikation

- Build/Typecheck grün (keine ungenutzten Imports nach Cleanup).
- Manuell: Onboarding bis Schritt 5 durchklicken, neue Erklärseite prüfen,
  „Los geht's" führt zu PREMIUM, Zurück-Button funktioniert.
- Mobile-Viewport: Layout passt ohne Scrollen-Zwang, Animation läuft dezent.
