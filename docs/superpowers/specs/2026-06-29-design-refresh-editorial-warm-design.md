# Design Refresh — Editorial Warm konsolidieren

**Datum:** 2026-06-29
**Typ:** Politur-Refresh (keine neue visuelle Richtung)
**Status:** Design abgestimmt, bereit für Implementierungsplan

## Kontext

gartenscan hat seit dem Overhaul vom April 2026 ein durchdachtes „Editorial
Warm"-Designsystem: Serif-Display (*Fraunces*), warme Erd-/Moos-Palette,
Körnung, Foto-Grading, eigenes Motion-Vokabular, definierte Radius-/Shadow-/
Farb-Tokens in `src/app/globals.css`.

Ein Audit aller Screens (mobile-first) zeigt: Das System ist gut, aber die
**Migration ist halb fertig** und **fertige Tokens/Primitives werden vielerorts
umgangen**. Dadurch wirkt die App stellenweise uneinheitlich und „nicht ganz
fertig", obwohl die Designsprache steht.

## Ziel

Reine **Politur**: Die bestehende Editorial-Warm-Richtung bleibt. Wir machen sie
konsistent durchgesetzt, behebbare Bugs raus, ein Guss. **Keine** neue Palette,
**keine** neue Typo, **kein** Neudesign von Screens.

## Leitprinzipien

1. **Token-First.** Kein hardcodierter Hex/px-Wert, wo ein Token existiert.
   Fehlt ein Token, wird es ergänzt — nicht umgangen.
2. **Editorial Warm als einzige Palette.** Die alte forest/sage-Palette wird auf
   den betroffenen Screens durch linen/bark/clay/cream/terra ersetzt.
3. **Primitives sind Single Source.** `Button`, `Badge`, `.eyebrow`, Card etc.
   werden genutzt statt nachgebaut. Duplikate werden konsolidiert.
4. **Mobile-first & a11y.** Alle interaktiven Elemente ≥ 44px Touch-Target,
   `focus-visible` durchgängig.
5. **Ehrliches UI.** Keine toten/Fake-Controls. Was keine Daten/Funktion hat,
   wird zurückgenommen statt vorgetäuscht.

---

## Welle 1 — Fundament: Tokens & Bugs

Klein, risikoarm, behebt echte Render-Bugs und stoppt weiteres Driften.

### 1.1 Fehlende Tokens ergänzen (`globals.css`)

- `--color-berry-700` ergänzen (aktuell genutzt, aber undefiniert → Text rendert
  farblos). Wert dunkler als `berry-600` (#7a2e2e), z.B. `#6a2727`.
- `--color-clay-700` ergänzen (in `BetaBadge` genutzt, undefiniert) — oder
  BetaBadge auf vorhandenes `clay-600`/`clay-800` umstellen.
- Token für „ink-on-amber" / dunkles Sun ergänzen (ersetzt den dreifach
  hardcodierten Hex `#8a6a14`), z.B. `--color-sun-800: #8a6a14`.
- Token für Info-Text ergänzen (ersetzt `#3d5565` in `Badge` info-tone),
  z.B. an `sky`-Skala anlehnen (`--color-sky-700`).

### 1.2 Bug-Farben fixen (Token statt Literal/undefiniert)

- `text-berry-700` → definierter Token, an 5 Stellen: `ScanFooterActions.tsx:19`,
  `PlantActions.tsx:37`, `UncertainMatchState.tsx:172`, `DeleteScanSheet.tsx:117`,
  `DeletePlantSheet.tsx:93`.
- `text-clay-700` in `BetaBadge.tsx:5` → definierter Token; zugleich
  String-Konkatenation auf `cn()` umstellen (einzige Komponente, die nicht `cn()`
  nutzt).
- `text-[#8a6a14]` → `text-sun-800` (neuer Token): `Badge.tsx:21`,
  `UrgencyIndicator.tsx:18`, `AiFallbackPanel.tsx:42,45`,
  `PhoneMockup.tsx:128`.
- `text-[#3d5565]` → Info-Token: `Badge.tsx:23`.
- `ErrorState.tsx:35,38` SVG `stroke/fill="#7a2e2e"` → `currentColor` +
  `text-berry-600`.

### 1.3 Radien auf Token-Skala snappen

Skala: `xs:6 / sm:10 / md:14 / lg:20 / xl:28 / pill`. Alle `rounded-[Npx]`-Literale
(12/16/18/21/22/24/26px) auf die nächste Token-Stufe abbilden:

- Cards → `rounded-lg` (20) bzw. `rounded-xl` (28).
- Buttons → `rounded-md` (14); `Button.tsx` sm/md/lg auf Skala ausrichten
  (aktuell 12/14/16).
- Bottom-Sheets → `rounded-t-xl`.
- Banner/kleine Pills → `rounded-md` bzw. `rounded-pill`.

Betroffen u.a.: `Card.tsx:28`, `Button.tsx:52-54`, `BottomNav.tsx:44`,
`UrgencyIndicator.tsx:71`, `ErrorState.tsx:47`, `app/page.tsx` (mehrere),
`scan/[id]/page.tsx`, `ActionDecisionPanel.tsx`, `FollowUpActions.tsx`,
`PlantTile.tsx`, Delete-Sheets.

### 1.4 Schatten auf Token-Skala

Wörtliche Schatten-Kopien durch den passenden Token ersetzen
(`--shadow-soft/card/float/editorial/editorial-lg`):

- `BottomNav.tsx:44` → `shadow-editorial-lg` (Wert ist exakt der Token).
- `PersonalizedPrimaryAction.tsx:39` → `shadow-soft`.
- `app/page.tsx:69,192` → `shadow-float`.
- Die beiden Bottom-Sheets vereinheitlichen (aktuell `-8px_32px` vs `-8px_24px`).
- Flache Cards ohne Tiefe (Coach/Premium/Empty-States im Dashboard) bekommen
  `shadow-soft`, damit die Tiefen-Sprache einheitlich ist.

### 1.5 CardBody-Padding & Spacing

- `Card.tsx:47` `p-[22px]` → `p-5`/`p-6` (Spacing-Raster).

---

## Welle 2 — Primitives durchsetzen & Touch-Targets

Entfernt den Großteil der Inkonsistenz und bringt a11y-Gewinn.

### 2.1 Eyebrow vereinheitlichen

Eine einzige Eyebrow-Sprache: die `.eyebrow`-Utility (terra-500, 10px/700/0.16em)
durchgängig nutzen. Alle handgebauten Varianten ersetzen:
`text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-muted`,
`text-[10px] …`, `text-[11px] font-bold tracking-[0.14em] text-forest-700` etc.

Betroffen u.a.: `app/page.tsx` (mehrere), `page.tsx:232,287,313`,
`ActionDecisionPanel.tsx:61,130`, `FollowUpActions.tsx:122`, `garden/page.tsx:38`,
`garden/[plantId]/page.tsx:95`. Falls eine On-Dark-Variante nötig ist (Eyebrow auf
dunklem Hero), eine `.eyebrow-on-dark`-Variante definieren statt ad-hoc Farben.

### 2.2 Button-Duplikate konsolidieren

- `ErrorState.tsx:47` (handgebauter bark-900-Button) → `<Button variant="editorial">`.
- Delete-Sheets (`DeleteScanSheet.tsx:98-113`, `DeletePlantSheet.tsx:74-89`):
  rohe Buttons → `<Button variant="destructive">` / `<Button variant="ghost">`.
  Hinweis: `destructive`-Token ist `bg-berry-500`, Sheets nutzen `bg-berry-600` —
  auf den Variant-Wert vereinheitlichen.
- `app/page.tsx:120,129` `!important`-Overrides der ghost-Variante → die schon
  definierte `editorial`-Variante bzw. eine neue On-Dark-Variante nutzen.

### 2.3 Badge-Duplikate konsolidieren

- `UrgencyIndicator.tsx:87` chip-Variante (pixelgleich zu `Badge.tsx:39`) →
  `<Badge>` rendern.
- „X Min"-Pill (dreifach verschieden: `ActionDecisionPanel.tsx:140,251`,
  Actions-StatBlock) → ein `<Badge>`-basiertes Pill.
- Confidence-Pill (`scan/[id]/page.tsx:145`, `UncertainMatchState.tsx:88`) und
  Coach „Beta"/„Kontext"-Chips → `<Badge>`.

### 2.4 State-Panels & StatRow extrahieren

- `EmptyState` und `ErrorState` teilen identischen Wrapper + Heading/Body-Muster
  → gemeinsame `StatePanel`-Hülle.
- Drei „3-up Stat-Reihen" (`actions`, `garden/[plantId]`, `history`) mit leicht
  verschiedenen Radien/Schriftgrößen → ein `StatRow`-Primitive.
- Heading-Farbe vereinheitlichen: ein Token für Titel (`bark-900`) statt Mischung
  `bark-900`/`forest-900`; `ScreenHeader.tsx:59` auf Display-Klasse umstellen.

### 2.5 Touch-Targets ≥ 44px & focus-visible

Interaktive Kreise/Buttons auf `h-11 w-11` (44px) anheben:

- `app/page.tsx:69` (Bell, 40px), `ScreenHeader.tsx:45,52` (Back, 40px),
  `Chip.tsx` (~34px), `Button.tsx` size `sm` (40px),
  `scan/[id]/page.tsx:132,136`, `scan/[id]/actions/page.tsx:43` (36px),
  `UncertainMatchState.tsx:81`, `garden/[plantId]/page.tsx:64`,
  `coach/page.tsx:220,230,237`.
- Kleine Top-Right-Textlinks (`app/page.tsx:160,180,259`) mit `-m-2 p-2` o.
  `min-h` für komfortable Tap-Fläche.
- `focus-visible`-Ring (wie in `Button.tsx`) auf alle interaktiven Nicht-Button-
  Elemente: `Chip`, `ScreenHeader`-Back, `BottomNav`, `ErrorState`-Retry.
- `Button`-Link-Pfad (`<a>`) bekommt `aria-disabled`/Pointer-Block für den
  disabled-Zustand.

### 2.6 Press-Mechanik vereinheitlichen

Eine Press-Mechanik durchziehen (`.tap-press`-Utility) statt Mischung aus
`active:scale-[0.96]`, `active:scale-[0.99]`, `group-active:scale-95`.

---

## Welle 3 — Palette vereinheitlichen & Fake-UI zurücknehmen

Die sichtbarste Welle: macht die App „aus einem Guss".

### 3.1 Editorial-Warm-Migration abschließen

Garden + Actions + Coach von der Legacy-Palette (forest/sage/paper) auf Editorial
Warm (linen/bark/clay/cream/terra) umstellen, passend zum Scan-/History-Flow, aus
dem sie erreicht werden:

- `garden/page.tsx` (h1 `forest-900` → `bark-900`, `bg-sage-50` → `bg-linen` etc.).
- `garden/[plantId]/page.tsx`.
- `scan/[id]/actions/page.tsx` (`bg-sage-50` + `forest-900` → Editorial Warm).
- `coach/page.tsx` re-skin auf Editorial Warm (Logik bleibt Stub, nur Optik);
  Header „Beta"/Kontext-Chips → `<Badge>`.

### 3.2 Hero-Gradienten angleichen

Ein Hero-Gradient für denselben Zweck: `from-bark-900 to-clay-800`
(`ActionDecisionPanel.tsx:66`). Den grünen Actions-Hero
(`scan/[id]/actions/page.tsx:71` `from-forest-900 …`) darauf umstellen.

### 3.3 Fake-/tote UI zurücknehmen (keine neue Logik)

- **Garden-Status:** Hardcoded `healthStatus: 'HEALTHY'` (`garden/page.tsx:28`)
  und Status-Dot/Label in `PlantTile.tsx:18-30` entfernen/ausblenden, solange
  keine echten Daten existieren. Kein dauergrünes „Gesund" mehr.
- **„Zone 8a · mittlere Feuchtigkeit"** (`garden/page.tsx:51`): statische
  Fake-Zeile entfernen (oder durch echte Profildaten ersetzen, falls vorhanden).
- **Fake Share-Buttons** ohne Handler (`scan/[id]/page.tsx:136`,
  `scan/[id]/actions/page.tsx:43`): entfernen.
- **Fake-Toggle** „Folgebehandlung merken" (`scan/[id]/actions/page.tsx:124-141`,
  nur `group-hover`, ohne State): entfernen.
- **Dev-Copy** im `AiFallbackPlaceholder` (`AiFallbackSection.tsx:6-16`,
  „…Genau das bauen wir gerade aus."): durch user-tauglichen Empty-State ersetzen.

---

## Verifikation

- `npx vitest run` muss grün bleiben (aktuell 38 Tests). Reine
  Styling-/Markup-Politur sollte keine Logik-Tests brechen.
- Visuelle Stichprobe mobil (Viewport ~390px) über jeden migrierten Screen:
  Landing, Dashboard, Scan-Result, Uncertain-Match, AI-Fallback, Actions,
  Garden-Liste, Garden-Detail, History, Coach.
- Token-Grep als Regressionsschutz: kein `text-[#`, kein `rounded-[`, kein
  `shadow-[0_` mehr in `src/components` und `src/app` (Ausnahmen bewusst
  dokumentieren).
- a11y-Stichprobe: Tab-Fokus sichtbar auf allen interaktiven Elementen;
  Touch-Targets ≥ 44px.

## Nicht im Scope (YAGNI)

- Neue Designsprache, neue Farben/Typo, Screen-Neudesign.
- Echte Implementierung der zurückgenommenen Features (Health-Status-Logik,
  Web-Share, Folgebehandlungs-Persistenz) — das ist Feature-Arbeit, kein Refresh.
- Coach-LLM-Anbindung (separater Track), Stripe/Premium, Impressum-Daten.
- Das hardcodierte Wetter (PLZ 80331) — Datenquelle, nicht Design.

## Reihenfolge

Welle 1 → 2 → 3. Jede Welle macht die nächste einfacher: erst die Tokens richtig,
dann die Primitives, die diese Tokens nutzen, dann die Screens, die diese
Primitives nutzen.
