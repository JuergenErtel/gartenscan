# gartenscan.de Launch Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** gartenscan-Prototype unter `https://gartenscan.de` live stellen — Landing auf `/`, App unter `/app`, auf Vercel gehostet, mit Impressum/Datenschutz, cookielosem Analytics, Beta-Framing und vollständiger SEO-Config.

**Architecture:** Next.js 16 App (SSR/RSC) bleibt strukturell wie sie ist. Dazu kommen: Impressum/Datenschutz als neue statische Routen, Footer mit Links, Beta-Badge im App-Shell, Scan-Route mit Feature-Flag-Demo-Modus, Next.js-native `icon.tsx` / `opengraph-image.tsx` für Assets, `robots.ts` / `sitemap.ts` für SEO, `@vercel/analytics` für Tracking. Deployment via GitHub → Vercel, Domain bleibt bei Strato (DNS zeigt auf Vercel).

**Tech Stack:** Next.js 16, React 19, Tailwind 4, TypeScript, Vercel (Hosting), `@vercel/analytics`, Next.js `ImageResponse` für dynamische OG-/Icon-Generierung.

**Spec reference:** `docs/superpowers/specs/2026-04-20-gartenscan-de-launch-design.md`

**Vorgeschlagene Texte (abweichend vom Spec auszufüllen):**
- **Title:** `gartenscan – Pflanzen, Unkraut & Krankheiten erkennen`
- **Description:** `Scanne Pflanzen, Unkraut, Schädlinge und Krankheiten im Garten – und wisse sofort, was zu tun ist.`
- **OG-Claim (auf dem 1200×630-Bild):** `Dein Garten, einfach verstanden.`
- **Demo-Content-IDs:** `plant_tomate`, `weed_loewenzahn`, `disease_echter_mehltau` (verifiziert in `src/content/index.ts`)

---

## File Structure

### Neu zu erstellen

| Pfad | Verantwortung |
|------|---------------|
| `src/app/impressum/page.tsx` | Statische Impressum-Seite mit Platzhaltern |
| `src/app/datenschutz/page.tsx` | DSGVO-Datenschutzerklärung mit eingesetzten Diensten |
| `src/app/robots.ts` | Robots-Config (erlaubt Crawling, verweist auf Sitemap) |
| `src/app/sitemap.ts` | Sitemap mit statischen Routen |
| `src/app/icon.tsx` | Dynamisches Favicon via `ImageResponse` |
| `src/app/apple-icon.tsx` | Apple-Touch-Icon 180×180 |
| `src/app/opengraph-image.tsx` | OG-Bild 1200×630 mit Logo + Claim |
| `src/components/layout/Footer.tsx` | Footer mit Impressum- und Datenschutz-Links |
| `src/components/ui/BetaBadge.tsx` | „Beta"-Pill für App-Header |
| `public/.gitkeep` | Stellt sicher, dass `public/` im Repo landet |

### Zu ändern

| Pfad | Grund |
|------|-------|
| `src/app/layout.tsx` | Erweiterte Metadata, `<Analytics />`, `<Footer />` einbinden |
| `src/app/scan/new/page.tsx` | `ENABLE_PHOTO_UPLOAD`-Flag + Demo-Karten-Branch |
| `src/components/layout/AppShell.tsx` | Beta-Badge fixed positioniert einbinden |
| `package.json` | `@vercel/analytics`-Dependency (durch `npm install`) |
| `.gitignore` | Vercel-spezifische Ignores ergänzen |

---

## Task 1: Git-Repo initialisieren und Baseline-Commit

**Files:**
- Modify: `C:\users\juerg\gartenscanner\.gitignore`
- Create: Git-Repo in `C:\users\juerg\gartenscanner\`

- [ ] **Step 1: Git-Repo initialisieren**

Run (im Projekt-Root):
```bash
git init
git branch -M main
```
Expected: `Initialized empty Git repository in C:/users/juerg/gartenscanner/.git/`

- [ ] **Step 2: .gitignore erweitern**

Bestehenden `.gitignore` komplett ersetzen mit:

```gitignore
# deps
node_modules
.pnp
.pnp.*

# next
.next
out

# production
build
dist

# env
.env
.env.local
.env*.local

# vercel
.vercel

# os
.DS_Store
Thumbs.db

# logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# typescript
*.tsbuildinfo
next-env.d.ts
```

- [ ] **Step 3: Alle Files staging und Baseline-Commit**

Run:
```bash
git add .
git status
```
Expected: Liste aller Projekt-Files (ohne `node_modules`, ohne `.next`).

Run:
```bash
git commit -m "chore: baseline commit before gartenscan.de launch"
```
Expected: Commit erstellt mit mehreren hundert Files.

---

## Task 2: Baseline Build-Check

**Files:** keine Änderung, reine Verifikation.

- [ ] **Step 1: Production-Build ausführen**

Run:
```bash
npm run build
```
Expected: `✓ Compiled successfully` am Ende, keine TypeScript-Fehler, keine Lint-Fehler. Dauert ~30–90 s.

Wenn Fehler: Diese **erst fixen und committen**, bevor es weitergeht — der Launch-Plan geht von grünem Baseline-Build aus.

- [ ] **Step 2: Production-Start smoketest (optional lokal)**

Run:
```bash
npm run start
```
Expected: Server startet auf `http://localhost:3000`. Browser öffnen, `/` und `/app` prüfen (Status 200, kein Fehler).

Danach Server mit `Ctrl+C` stoppen.

---

## Task 3: `@vercel/analytics` installieren

**Files:**
- Modify: `package.json`, `package-lock.json` (durch npm)

- [ ] **Step 1: Paket installieren**

Run:
```bash
npm install @vercel/analytics
```
Expected: `added 1 package` o. ä. in der Ausgabe. `package.json` hat neuen Eintrag unter `dependencies`: `"@vercel/analytics": "^1.x.x"`.

- [ ] **Step 2: Committen**

Run:
```bash
git add package.json package-lock.json
git commit -m "chore: install @vercel/analytics"
```

---

## Task 4: Root-Layout mit erweiterten Metadata + Analytics

**Files:**
- Modify: `src/app/layout.tsx`

- [ ] **Step 1: Layout komplett ersetzen**

Ersetze den kompletten Inhalt von `src/app/layout.tsx` durch:

```tsx
import type { Metadata, Viewport } from "next";
import { Inter, Fraunces } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { Footer } from "@/components/layout/Footer";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
  axes: ["opsz"],
});

const SITE_URL = "https://gartenscan.de";
const SITE_TITLE = "gartenscan – Pflanzen, Unkraut & Krankheiten erkennen";
const SITE_DESCRIPTION =
  "Scanne Pflanzen, Unkraut, Schädlinge und Krankheiten im Garten – und wisse sofort, was zu tun ist.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_TITLE,
    template: "%s · gartenscan",
  },
  description: SITE_DESCRIPTION,
  applicationName: "gartenscan",
  keywords: [
    "Garten",
    "Pflanzenerkennung",
    "Unkraut",
    "Schädlinge",
    "Krankheiten",
    "Pflanzen-App",
    "Pflanzenpflege",
  ],
  authors: [{ name: "gartenscan" }],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "de_DE",
    url: SITE_URL,
    siteName: "gartenscan",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  themeColor: "#F3F1EA",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="de" className={`${inter.variable} ${fraunces.variable}`}>
      <body
        style={
          {
            "--font-sans": "var(--font-inter)",
            "--font-serif": "var(--font-fraunces)",
          } as React.CSSProperties
        }
      >
        {children}
        <Footer />
        <Analytics />
      </body>
    </html>
  );
}
```

Beachte: `Footer` und `Analytics` werden importiert, obwohl `Footer` erst in Task 5 erstellt wird. Der Build schlägt bis dahin fehl — das ist ok, wird in Task 5 aufgelöst.

- [ ] **Step 2: NICHT committen**

Wegen Import-Lücke (Footer fehlt) noch kein Commit. Commit erfolgt am Ende von Task 5 zusammen mit Footer.

---

## Task 5: Footer-Komponente erstellen

**Files:**
- Create: `src/components/layout/Footer.tsx`

- [ ] **Step 1: Footer-Komponente schreiben**

Neue Datei `src/components/layout/Footer.tsx`:

```tsx
import Link from "next/link";

export function Footer() {
  return (
    <footer className="mx-auto w-full max-w-lg border-t border-sage-200/60 px-5 py-8 text-[12px] text-ink-muted">
      <nav className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
        <Link
          href="/impressum"
          className="hover:text-forest-700 transition"
        >
          Impressum
        </Link>
        <span className="text-sage-300">·</span>
        <Link
          href="/datenschutz"
          className="hover:text-forest-700 transition"
        >
          Datenschutz
        </Link>
      </nav>
      <p className="mt-3 text-center text-ink-muted/80">
        © {new Date().getFullYear()} gartenscan
      </p>
    </footer>
  );
}
```

- [ ] **Step 2: Build-Check**

Run:
```bash
npm run build
```
Expected: Build erfolgreich. (Impressum/Datenschutz-Seiten fehlen noch, aber Links auf nicht existierende Routen sind im Build kein Fehler — sie zeigen zur Laufzeit 404.)

- [ ] **Step 3: Committen**

Run:
```bash
git add src/components/layout/Footer.tsx src/app/layout.tsx
git commit -m "feat: add footer and extended site metadata + vercel analytics"
```

---

## Task 6: Impressum-Seite

**Files:**
- Create: `src/app/impressum/page.tsx`

- [ ] **Step 1: Impressum-Seite schreiben**

Neue Datei `src/app/impressum/page.tsx`:

```tsx
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Impressum",
  description: "Impressum und rechtliche Angaben zu gartenscan.",
  alternates: { canonical: "/impressum" },
  robots: { index: true, follow: true },
};

export default function ImpressumPage() {
  return (
    <main className="mx-auto max-w-lg px-5 pt-8 pb-12 safe-top">
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-[13px] text-ink-muted hover:text-forest-700 transition mb-6"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Zurück
      </Link>

      <h1 className="font-serif text-[32px] leading-tight text-forest-900 mb-6">
        Impressum
      </h1>

      <div className="prose prose-sm max-w-none text-forest-900/90 space-y-5 text-[14px] leading-relaxed">
        <section>
          <h2 className="font-semibold text-forest-900 text-[15px] mb-1">
            Angaben gemäß § 5 TMG
          </h2>
          <p>
            [DEIN VOLLSTÄNDIGER NAME]
            <br />
            [STRASSE UND HAUSNUMMER]
            <br />
            [PLZ ORT]
            <br />
            Deutschland
          </p>
        </section>

        <section>
          <h2 className="font-semibold text-forest-900 text-[15px] mb-1">
            Kontakt
          </h2>
          <p>
            E-Mail: [EMAIL-ADRESSE]
            <br />
            Telefon: [TELEFON – optional, sonst Zeile löschen]
          </p>
        </section>

        <section>
          <h2 className="font-semibold text-forest-900 text-[15px] mb-1">
            Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV
          </h2>
          <p>
            [DEIN VOLLSTÄNDIGER NAME]
            <br />
            [STRASSE UND HAUSNUMMER]
            <br />
            [PLZ ORT]
          </p>
        </section>

        <section>
          <h2 className="font-semibold text-forest-900 text-[15px] mb-1">
            Haftung für Inhalte
          </h2>
          <p>
            Als Diensteanbieter sind wir gemäß § 7 Abs. 1 TMG für eigene Inhalte auf
            diesen Seiten nach den allgemeinen Gesetzen verantwortlich. Nach §§ 8 bis
            10 TMG sind wir als Diensteanbieter jedoch nicht verpflichtet, übermittelte
            oder gespeicherte fremde Informationen zu überwachen oder nach Umständen zu
            forschen, die auf eine rechtswidrige Tätigkeit hinweisen.
          </p>
          <p>
            Verpflichtungen zur Entfernung oder Sperrung der Nutzung von Informationen
            nach den allgemeinen Gesetzen bleiben hiervon unberührt. Eine diesbezügliche
            Haftung ist jedoch erst ab dem Zeitpunkt der Kenntnis einer konkreten
            Rechtsverletzung möglich.
          </p>
        </section>

        <section>
          <h2 className="font-semibold text-forest-900 text-[15px] mb-1">
            Haftung für Links
          </h2>
          <p>
            Unser Angebot enthält Links zu externen Websites Dritter, auf deren Inhalte
            wir keinen Einfluss haben. Deshalb können wir für diese fremden Inhalte auch
            keine Gewähr übernehmen. Für die Inhalte der verlinkten Seiten ist stets der
            jeweilige Anbieter oder Betreiber der Seiten verantwortlich.
          </p>
        </section>

        <section>
          <h2 className="font-semibold text-forest-900 text-[15px] mb-1">
            Urheberrecht
          </h2>
          <p>
            Die durch die Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten
            unterliegen dem deutschen Urheberrecht. Beiträge Dritter sind als solche
            gekennzeichnet. Pflanzenfotos auf dieser Seite stammen teilweise von
            Wikimedia Commons und stehen unter den dort angegebenen Lizenzen.
          </p>
        </section>
      </div>
    </main>
  );
}
```

- [ ] **Step 2: Lokal verifizieren**

Run:
```bash
npm run dev
```
Browser: `http://localhost:3000/impressum` — Seite lädt, Footer sichtbar, Link „Zurück" funktioniert.

Server mit `Ctrl+C` stoppen.

- [ ] **Step 3: Committen**

Run:
```bash
git add src/app/impressum/page.tsx
git commit -m "feat: add impressum page with placeholder contact fields"
```

---

## Task 7: Datenschutz-Seite

**Files:**
- Create: `src/app/datenschutz/page.tsx`

- [ ] **Step 1: Datenschutz-Seite schreiben**

Neue Datei `src/app/datenschutz/page.tsx`:

```tsx
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Datenschutzerklärung",
  description:
    "Informationen zur Verarbeitung personenbezogener Daten bei Nutzung von gartenscan.",
  alternates: { canonical: "/datenschutz" },
  robots: { index: true, follow: true },
};

export default function DatenschutzPage() {
  return (
    <main className="mx-auto max-w-lg px-5 pt-8 pb-12 safe-top">
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-[13px] text-ink-muted hover:text-forest-700 transition mb-6"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Zurück
      </Link>

      <h1 className="font-serif text-[32px] leading-tight text-forest-900 mb-6">
        Datenschutzerklärung
      </h1>

      <div className="prose prose-sm max-w-none text-forest-900/90 space-y-5 text-[14px] leading-relaxed">
        <section>
          <h2 className="font-semibold text-forest-900 text-[15px] mb-1">
            1. Verantwortlicher
          </h2>
          <p>
            Verantwortlicher im Sinne der DSGVO ist:
            <br />
            [DEIN VOLLSTÄNDIGER NAME]
            <br />
            [STRASSE UND HAUSNUMMER]
            <br />
            [PLZ ORT]
            <br />
            E-Mail: [EMAIL-ADRESSE]
          </p>
        </section>

        <section>
          <h2 className="font-semibold text-forest-900 text-[15px] mb-1">
            2. Server-Logs (Hosting bei Vercel)
          </h2>
          <p>
            Diese Website wird bei Vercel Inc. gehostet. Beim Aufruf einer Seite werden
            automatisch Daten in Server-Logs gespeichert, die der Browser übermittelt:
            IP-Adresse (gekürzt/anonymisiert), Datum und Uhrzeit, Browser-Typ,
            User-Agent, Referrer. Die Verarbeitung erfolgt auf Grundlage von Art. 6
            Abs. 1 lit. f DSGVO (berechtigtes Interesse an Betriebssicherheit und
            Fehlerdiagnose). Die Logs werden kurzfristig gespeichert und nicht mit
            anderen Daten zusammengeführt.
          </p>
        </section>

        <section>
          <h2 className="font-semibold text-forest-900 text-[15px] mb-1">
            3. Reichweitenmessung mit Vercel Analytics
          </h2>
          <p>
            Wir verwenden Vercel Analytics zur anonymen Reichweitenmessung. Dabei werden
            keine Cookies gesetzt und keine personenbezogenen Profile gebildet. Erfasst
            werden aggregierte Seitenaufrufe und technische Web-Vitals. IP-Adressen
            werden nicht gespeichert. Rechtsgrundlage ist Art. 6 Abs. 1 lit. f DSGVO
            (berechtigtes Interesse an der Optimierung unseres Angebots).
          </p>
        </section>

        <section>
          <h2 className="font-semibold text-forest-900 text-[15px] mb-1">
            4. Wetterdaten (Open-Meteo)
          </h2>
          <p>
            Zur Anzeige lokaler Wetterdaten rufen wir die API von Open-Meteo
            (open-meteo.com) auf. Dabei wird deine IP-Adresse an Open-Meteo übertragen.
            Open-Meteo ist ein Non-Profit-Dienst mit Sitz in der Schweiz. Rechtsgrundlage
            ist Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse, dir kontextabhängige
            Empfehlungen zu zeigen).
          </p>
        </section>

        <section>
          <h2 className="font-semibold text-forest-900 text-[15px] mb-1">
            5. Bilder von Wikimedia Commons
          </h2>
          <p>
            Pflanzenfotos werden von Wikimedia Commons (upload.wikimedia.org)
            eingebunden. Beim Laden eines solchen Bildes wird deine IP-Adresse an die
            Wikimedia Foundation in den USA übertragen. Rechtsgrundlage ist Art. 6
            Abs. 1 lit. f DSGVO (berechtigtes Interesse an der bildlichen Darstellung
            der Inhalte).
          </p>
        </section>

        <section>
          <h2 className="font-semibold text-forest-900 text-[15px] mb-1">
            6. Lokale Speicherung (LocalStorage)
          </h2>
          <p>
            Nach Abschluss des Onboardings speichern wir dein Nutzerprofil (PLZ,
            Garten-Parameter, Präferenzen) ausschließlich lokal in deinem Browser im
            sogenannten LocalStorage. Diese Daten verlassen dein Gerät nicht und werden
            nicht an uns übertragen. Du kannst sie jederzeit über die
            Browser-Einstellungen löschen.
          </p>
        </section>

        <section>
          <h2 className="font-semibold text-forest-900 text-[15px] mb-1">
            7. Deine Rechte
          </h2>
          <p>
            Du hast jederzeit das Recht auf Auskunft, Berichtigung, Löschung,
            Einschränkung der Verarbeitung, Datenübertragbarkeit und Widerspruch gegen
            die Verarbeitung (Art. 15–21 DSGVO). Zudem steht dir ein
            Beschwerderecht bei einer Datenschutz-Aufsichtsbehörde zu. Für Anfragen
            wende dich an: [EMAIL-ADRESSE]
          </p>
        </section>

        <section>
          <h2 className="font-semibold text-forest-900 text-[15px] mb-1">
            8. Änderungen
          </h2>
          <p>
            Wir passen diese Datenschutzerklärung an, wenn sich rechtliche oder
            technische Gegebenheiten ändern. Die jeweils aktuelle Fassung ist immer
            unter dieser URL abrufbar.
          </p>
        </section>
      </div>
    </main>
  );
}
```

- [ ] **Step 2: Lokal verifizieren**

Run:
```bash
npm run dev
```
Browser: `http://localhost:3000/datenschutz` — Seite lädt, Struktur wirkt sinnvoll.

- [ ] **Step 3: Committen**

Run:
```bash
git add src/app/datenschutz/page.tsx
git commit -m "feat: add datenschutz page covering vercel/analytics/open-meteo/wikimedia"
```

---

## Task 8: Beta-Badge-Komponente

**Files:**
- Create: `src/components/ui/BetaBadge.tsx`

- [ ] **Step 1: BetaBadge schreiben**

Neue Datei `src/components/ui/BetaBadge.tsx`:

```tsx
export function BetaBadge({ className = "" }: { className?: string }) {
  return (
    <span
      className={
        "inline-flex items-center rounded-full bg-clay-500/10 text-clay-700 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide border border-clay-500/20 " +
        className
      }
      aria-label="Beta-Version"
    >
      Beta
    </span>
  );
}
```

---

## Task 9: BetaBadge in AppShell einbinden

**Files:**
- Modify: `src/components/layout/AppShell.tsx`

- [ ] **Step 1: AppShell anpassen**

Ersetze den Inhalt von `src/components/layout/AppShell.tsx`:

```tsx
import { BottomNav } from "./BottomNav";
import { BetaBadge } from "../ui/BetaBadge";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-sage-50">
      <div className="pointer-events-none fixed top-[max(env(safe-area-inset-top),0.75rem)] right-3 z-40">
        <BetaBadge />
      </div>
      <main className="mx-auto max-w-lg pb-32">{children}</main>
      <BottomNav />
    </div>
  );
}
```

- [ ] **Step 2: Lokal verifizieren**

Run:
```bash
npm run dev
```
Browser auf iPhone-Viewport (390×844):
- `/app` — Beta-Badge sichtbar oben rechts
- `/` — kein Badge sichtbar (Landing nutzt AppShell nicht)

- [ ] **Step 3: Committen**

Run:
```bash
git add src/components/ui/BetaBadge.tsx src/components/layout/AppShell.tsx
git commit -m "feat: add beta badge in app shell"
```

---

## Task 10: Scan-Route auf Demo-Modus umstellen

**Files:**
- Modify: `src/app/scan/new/page.tsx`

Diese Datei wird komplett neu geschrieben. Die alte Kamera-Simulation wird hinter einem Flag versteckt; Default-UI ist eine Demo-Auswahl mit 3 Karten.

- [ ] **Step 1: Ganze Datei ersetzen**

Ersetze den kompletten Inhalt von `src/app/scan/new/page.tsx` durch:

```tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  X,
  Zap,
  Image as ImageIcon,
  Sparkles,
  Camera,
  ArrowLeft,
  ArrowRight,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Chip } from "@/components/ui/Chip";
import { BetaBadge } from "@/components/ui/BetaBadge";
import type { Category } from "@/lib/types";
import { cn } from "@/lib/utils";

// Feature-Flag: Echte Kamera-/Foto-Upload-UI ist für den Beta-Launch deaktiviert.
// Wenn der echte Vision-Provider kommt, auf `true` setzen und die Demo-Auswahl entfernen.
const ENABLE_PHOTO_UPLOAD = false;

const demoEntries = [
  {
    id: "plant_tomate",
    label: "Tomate",
    hint: "Pflanze erkennen",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/8/89/Tomato_je.jpg/640px-Tomato_je.jpg",
  },
  {
    id: "weed_loewenzahn",
    label: "Löwenzahn",
    hint: "Unkraut bestimmen",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9e/Taraxacum_sect._Ruderalia_MHNT_Fleur.jpg/640px-Taraxacum_sect._Ruderalia_MHNT_Fleur.jpg",
  },
  {
    id: "disease_echter_mehltau",
    label: "Echter Mehltau",
    hint: "Krankheit diagnostizieren",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6a/Powdery_mildew_symptoms_wheat.jpg/640px-Powdery_mildew_symptoms_wheat.jpg",
  },
];

export default function ScanNewPage() {
  if (ENABLE_PHOTO_UPLOAD) {
    return <PhotoCaptureMode />;
  }
  return <DemoPickerMode />;
}

function DemoPickerMode() {
  const router = useRouter();
  const [selected, setSelected] = useState<string | null>(null);
  const [progressStep, setProgressStep] = useState(0);

  const steps = [
    "Bildstruktur einlesen",
    "Blattmuster analysieren",
    "Vergleich mit 12.000 Arten",
    "Kontext deines Gartens prüfen",
  ];

  useEffect(() => {
    if (!selected) return;
    const timeouts: ReturnType<typeof setTimeout>[] = [];
    steps.forEach((_, i) => {
      timeouts.push(
        setTimeout(() => setProgressStep(i + 1), (i + 1) * 650)
      );
    });
    timeouts.push(
      setTimeout(() => {
        router.push(`/scan/${selected}`);
      }, steps.length * 650 + 350)
    );
    return () => timeouts.forEach(clearTimeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected]);

  return (
    <main className="min-h-screen bg-sage-50 safe-top">
      <header className="flex items-center justify-between gap-3 px-4 h-14">
        <Link
          href="/app"
          className="flex h-10 w-10 items-center justify-center rounded-full bg-paper/80 hover:bg-paper active:scale-95 transition"
        >
          <ArrowLeft className="h-5 w-5 text-forest-700" />
        </Link>
        <BetaBadge />
        <div className="h-10 w-10" />
      </header>

      <div className="mx-auto max-w-lg px-5 pt-4 pb-12">
        <h1 className="font-serif text-[28px] leading-tight text-forest-900 mb-1">
          Wähle ein Beispiel
        </h1>
        <p className="text-[13px] text-ink-muted mb-6">
          Echte Bilderkennung folgt in Kürze. Für jetzt zeigen wir dir drei typische
          Fälle, damit du siehst, wie gartenscan funktioniert.
        </p>

        <div className="flex flex-col gap-3">
          {demoEntries.map((entry) => (
            <button
              key={entry.id}
              onClick={() => setSelected(entry.id)}
              disabled={selected !== null}
              className={cn(
                "group relative flex items-center gap-4 rounded-2xl bg-paper p-3 text-left shadow-[0_2px_12px_rgba(28,42,33,0.06)] transition",
                selected === entry.id
                  ? "ring-2 ring-forest-700"
                  : "hover:shadow-[0_4px_16px_rgba(28,42,33,0.08)] active:scale-[0.99]",
                selected !== null && selected !== entry.id && "opacity-50"
              )}
            >
              <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl">
                <Image
                  src={entry.image}
                  alt={entry.label}
                  fill
                  sizes="64px"
                  className="object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[15px] font-semibold text-forest-900 truncate">
                  {entry.label}
                </p>
                <p className="text-[12px] text-ink-muted truncate">
                  {entry.hint}
                </p>
              </div>
              <ArrowRight className="h-4 w-4 text-forest-700 opacity-60 group-hover:opacity-100 transition" />
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-forest-900/90 backdrop-blur-xl px-8"
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
              Ich analysiere dein Beispiel
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
                      <svg
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
                      </svg>
                    )}
                  </div>
                  <span className="text-paper/90">{s}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}

// ============================================================================
// Originales Foto-Capture-UI — hinter ENABLE_PHOTO_UPLOAD versteckt.
// Wird reaktiviert, sobald echter Vision-Provider angebunden ist.
// ============================================================================

function PhotoCaptureMode() {
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

  const categories: { id: "AUTO" | Category; label: string }[] = [
    { id: "AUTO", label: "Automatisch" },
    { id: "PLANT", label: "Pflanze" },
    { id: "WEED", label: "Unkraut" },
    { id: "PEST", label: "Insekt" },
    { id: "DISEASE", label: "Krankheit" },
  ];

  const sampleUrl =
    "https://images.unsplash.com/photo-1597848212624-a19eb35e2651?w=1200&q=80";

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

      {phase === "capture" && (
        <p className="relative z-10 text-center text-[13px] text-paper/80 mt-6 font-medium">
          Halte die Kamera ruhig auf das Objekt
        </p>
      )}

      {phase === "capture" && (
        <div className="absolute bottom-0 left-0 right-0 z-10 pb-[max(env(safe-area-inset-bottom),1.5rem)]">
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
```

- [ ] **Step 2: Lokal verifizieren**

Run:
```bash
npm run dev
```
Browser auf iPhone-Viewport (390×844):
- `/scan/new` — zeigt Demo-Auswahl mit 3 Karten (Tomate, Löwenzahn, Echter Mehltau)
- Tap auf z. B. „Löwenzahn" → Analyzing-Animation erscheint → Route auf `/scan/weed_loewenzahn`
- Jede der 3 Demos führt zu einem passenden Ergebnis (nicht mehr alle zum Mehltau)

- [ ] **Step 3: Wikimedia-Bilder verifizieren**

Falls eine der drei Wikimedia-URLs ein 404 liefert (Motive können gelöscht/umbenannt worden sein), durch ein verwandtes Bild aus dem jeweiligen `src/content/<category>/<name>.ts` ersetzen — dort sind bereits verifizierte Wikimedia-Bilder referenziert.

- [ ] **Step 4: Committen**

Run:
```bash
git add src/app/scan/new/page.tsx
git commit -m "feat: demo picker replaces fake camera in scan/new (feature-flagged)"
```

---

## Task 11: robots.ts

**Files:**
- Create: `src/app/robots.ts`

- [ ] **Step 1: robots.ts schreiben**

Neue Datei `src/app/robots.ts`:

```ts
import type { MetadataRoute } from "next";

const SITE_URL = "https://gartenscan.de";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
```

- [ ] **Step 2: Lokal verifizieren**

Run:
```bash
npm run dev
```
Browser: `http://localhost:3000/robots.txt` — zeigt valide robots.txt mit Sitemap-Referenz.

---

## Task 12: sitemap.ts

**Files:**
- Create: `src/app/sitemap.ts`

- [ ] **Step 1: sitemap.ts schreiben**

Neue Datei `src/app/sitemap.ts`:

```ts
import type { MetadataRoute } from "next";

const SITE_URL = "https://gartenscan.de";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    {
      url: `${SITE_URL}/`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: `${SITE_URL}/app`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/scan/new`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${SITE_URL}/impressum`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${SITE_URL}/datenschutz`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];
}
```

- [ ] **Step 2: Lokal verifizieren**

Run:
```bash
npm run dev
```
Browser: `http://localhost:3000/sitemap.xml` — zeigt valide XML mit 5 Einträgen.

- [ ] **Step 3: Committen**

Run:
```bash
git add src/app/robots.ts src/app/sitemap.ts
git commit -m "feat: add robots.txt and sitemap.xml"
```

---

## Task 13: Icon + Apple-Icon + OG-Image (Next.js Image-Convention)

Statt statischer Dateien nutzt Next.js die `icon.tsx` / `apple-icon.tsx` / `opengraph-image.tsx`-Conventions — dort wird JSX zurückgegeben, und Next.js rendert das zur Build-Zeit zu PNG/ICO. Kein externes Tool nötig.

**Files:**
- Create: `src/app/icon.tsx`
- Create: `src/app/apple-icon.tsx`
- Create: `src/app/opengraph-image.tsx`

- [ ] **Step 1: Favicon (32×32)**

Neue Datei `src/app/icon.tsx`:

```tsx
import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#1C2A21",
          color: "#F3F1EA",
          fontSize: 22,
          fontWeight: 700,
          fontFamily: "ui-sans-serif, system-ui, sans-serif",
          borderRadius: 6,
        }}
      >
        g
      </div>
    ),
    { ...size }
  );
}
```

- [ ] **Step 2: Apple-Touch-Icon (180×180)**

Neue Datei `src/app/apple-icon.tsx`:

```tsx
import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#1C2A21",
          color: "#F3F1EA",
          fontSize: 120,
          fontWeight: 700,
          fontFamily: "ui-sans-serif, system-ui, sans-serif",
          letterSpacing: "-0.05em",
        }}
      >
        g
      </div>
    ),
    { ...size }
  );
}
```

- [ ] **Step 3: Open-Graph-Bild (1200×630)**

Neue Datei `src/app/opengraph-image.tsx`:

```tsx
import { ImageResponse } from "next/og";

export const alt = "gartenscan – Dein Garten, einfach verstanden.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "flex-end",
          padding: 80,
          background:
            "linear-gradient(135deg, #1C2A21 0%, #2F4635 55%, #3F5B46 100%)",
          color: "#F3F1EA",
          fontFamily: "ui-sans-serif, system-ui, sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            marginBottom: 40,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 72,
              height: 72,
              background: "#F3F1EA",
              color: "#1C2A21",
              fontSize: 52,
              fontWeight: 700,
              borderRadius: 16,
              letterSpacing: "-0.05em",
            }}
          >
            g
          </div>
          <div style={{ fontSize: 40, fontWeight: 600, letterSpacing: "-0.02em" }}>
            gartenscan
          </div>
        </div>
        <div
          style={{
            fontSize: 72,
            fontWeight: 500,
            lineHeight: 1.05,
            letterSpacing: "-0.03em",
            maxWidth: 900,
          }}
        >
          Dein Garten, einfach verstanden.
        </div>
        <div
          style={{
            fontSize: 28,
            color: "#C7D1B9",
            marginTop: 24,
          }}
        >
          Pflanzen · Unkraut · Schädlinge · Krankheiten erkennen
        </div>
      </div>
    ),
    { ...size }
  );
}
```

- [ ] **Step 4: Lokal verifizieren**

Run:
```bash
npm run build
```
Expected: Build erfolgreich, Next.js meldet in der Output-Liste `icon`, `apple-icon`, `opengraph-image` als generierte Routen.

Run:
```bash
npm run start
```
Browser:
- `http://localhost:3000/icon` — zeigt PNG mit „g"-Favicon
- `http://localhost:3000/apple-icon` — zeigt größeres PNG
- `http://localhost:3000/opengraph-image` — zeigt 1200×630-Bild mit Claim und Logo

Server mit `Ctrl+C` stoppen.

- [ ] **Step 5: Committen**

Run:
```bash
git add src/app/icon.tsx src/app/apple-icon.tsx src/app/opengraph-image.tsx
git commit -m "feat: add favicon, apple-touch-icon and og-image via next image-response"
```

---

## Task 14: Full Production Build & Mobile Smoke-Test

**Files:** keine Änderung, reine Verifikation.

- [ ] **Step 1: Clean Build**

Run:
```bash
rm -rf .next
npm run build
```
Expected: Sauberer Build ohne Warnings zu TypeScript/Lint. In der Build-Output-Tabelle sollten folgende Routen auftauchen:
- `/` (Landing, Static)
- `/app` (Dynamic/SSR)
- `/impressum` (Static)
- `/datenschutz` (Static)
- `/scan/new` (Client, Dynamic)
- `/scan/[id]` (Dynamic)
- `/robots.txt` (Static)
- `/sitemap.xml` (Static)
- `/icon` (Static)
- `/apple-icon` (Static)
- `/opengraph-image` (Static)

- [ ] **Step 2: Production-Server starten**

Run:
```bash
npm run start
```

- [ ] **Step 3: Smoke-Test auf Mobile-Viewport**

Browser auf iPhone-14-Viewport (390×844), DevTools-Console offen (keine Errors erwartet):

1. `http://localhost:3000/` — Landing lädt, PhoneMockup sichtbar, Footer unten mit Impressum/Datenschutz-Links
2. Klick auf „Impressum" im Footer — Seite lädt
3. Klick auf „Datenschutz" — Seite lädt
4. Zurück zu `/`, dann zu `/app` — Dashboard lädt, **Beta-Badge oben rechts sichtbar**
5. `/scan/new` — Demo-Picker mit 3 Karten
6. Klick auf „Tomate" — Analyzing-Overlay → Ergebnisseite `plant_tomate`
7. Dort zurück, Klick auf „Löwenzahn" — landet auf `weed_loewenzahn`
8. Klick auf „Echter Mehltau" — landet auf `disease_echter_mehltau`

Keine Console-Errors, keine Hydration-Warnings, keine 404-Bilder.

- [ ] **Step 4: OG-Preview lokal prüfen**

Browser: `http://localhost:3000/opengraph-image` — Bild lädt, Text lesbar, Farben stimmen.

Server mit `Ctrl+C` stoppen.

- [ ] **Step 5: Kein Commit nötig**

(Dieser Task ist reine Verifikation.)

---

## Task 15: GitHub-Repo anlegen und pushen

**Files:** kein Code, nur Deployment-Setup.

- [ ] **Step 1: GitHub-Repo anlegen**

Im Browser: [github.com/new](https://github.com/new)
- Repository Name: `gartenscan`
- Visibility: **Private** (empfohlen) oder Public je nach Wunsch
- **KEINE** `README`, `.gitignore` oder License bei der Anlage anhaken (lokal schon vorhanden)
- Erstellen

GitHub zeigt danach Push-Anweisungen — wir nutzen davon nur die Remote-Add-Zeile.

- [ ] **Step 2: Remote verbinden und pushen**

Run (User-Name entsprechend anpassen):
```bash
git remote add origin https://github.com/<DEIN-USERNAME>/gartenscan.git
git push -u origin main
```
Expected: Push erfolgreich, Browser-Refresh auf dem Repo zeigt alle Files.

---

## Task 16: Vercel-Projekt anlegen und Custom Domain hinzufügen

**Files:** kein Code, nur Deployment-Setup.

- [ ] **Step 1: Vercel-Account einloggen**

Im Browser: [vercel.com](https://vercel.com) — mit GitHub-Account einloggen. Falls neu: kostenloser Hobby-Tarif reicht für diesen Launch.

- [ ] **Step 2: Projekt importieren**

Dashboard → „Add New…" → „Project" → GitHub-Repo `gartenscan` auswählen → „Import".

In den Import-Settings:
- Framework Preset: **Next.js** (sollte automatisch erkannt werden)
- Root Directory: `.` (Standard)
- Build Command: `npm run build` (Standard)
- Environment Variables: **keine** (für diesen Launch)

Klick auf „Deploy". Der erste Build dauert ~2–4 Min. Nach Erfolg ist die Seite unter `https://gartenscan-<hash>.vercel.app` erreichbar.

- [ ] **Step 3: Preview-URL testen**

Öffne die Preview-URL im Browser. Alle Smoke-Test-Schritte aus Task 14, Step 3 wiederholen (auf der Live-Preview-URL statt localhost).

- [ ] **Step 4: Custom Domain hinzufügen**

Vercel-Projekt → „Settings" → „Domains" → „Add":
1. Eingabe: `gartenscan.de` → Add → **Als primäre Domain markieren**
2. Eingabe: `www.gartenscan.de` → Add → Vercel schlägt automatisch vor, dies auf den Apex zu redirecten → **Akzeptieren**

Vercel zeigt nun DNS-Einstellungen an, die bei Strato gesetzt werden müssen. Das sind typischerweise:
- Apex `gartenscan.de` → **A-Record** auf `76.76.21.21` (oder den exakten Wert, den Vercel anzeigt — das gilt)
- `www.gartenscan.de` → **CNAME** auf `cname.vercel-dns.com`

**Werte aus dem Vercel-Dashboard notieren — die sind maßgeblich.**

---

## Task 17: Strato-DNS konfigurieren

**Files:** kein Code, manueller Schritt im Strato-Kundencenter.

- [ ] **Step 1: Strato-Kundencenter einloggen**

[strato.de](https://strato.de) → Login → Paket mit `gartenscan.de` wählen → „Domainverwaltung" → `gartenscan.de` → „Verwalten".

- [ ] **Step 2: Aktuelle DNS-Records notieren**

Vor Änderung **Screenshot** aller bestehenden Records machen (MX, TXT, CNAME, A). Falls E-Mail-Adressen unter der Domain laufen, MX-Records **nicht anfassen**.

- [ ] **Step 3: A-Record für Apex setzen**

Unter „DNS-Verwaltung" (bzw. „Einstellungen" → „Nameserver- und DNS-Einstellungen"):
- Eventuelle vorhandene A-Records für `@` (Apex) auf die von Strato parkenden IPs **löschen/überschreiben**
- Neuen Record anlegen:
  - Typ: `A`
  - Name/Host: `@` (oder leer, je nach Strato-UI)
  - Wert: **Die IP, die Vercel anzeigt** (typisch `76.76.21.21`)
  - TTL: Default

- [ ] **Step 4: CNAME für www setzen**

- Eventuellen bestehenden `www`-Record **überschreiben**
- Neuen Record anlegen:
  - Typ: `CNAME`
  - Name/Host: `www`
  - Wert: `cname.vercel-dns.com` (Punkt am Ende ist ok, je nach Strato-UI)
  - TTL: Default

- [ ] **Step 5: Speichern und auf Propagation warten**

Änderungen speichern. Propagation: 5 Min – 24 h. In Vercel-Dashboard unter „Domains" erscheint neben `gartenscan.de` erst ein Warnhinweis, dann grüner Haken.

Run (zum Selberchecken aus dem Terminal):
```bash
nslookup gartenscan.de
```
Expected: Antwortet mit `76.76.21.21` (oder der von Vercel gesetzten IP).

- [ ] **Step 6: HTTPS-Zertifikat prüfen**

Sobald Vercel grüne Haken zeigt: Browser auf `https://gartenscan.de` — gültiges Let's-Encrypt-Zertifikat, kein Mixed-Content, Landing lädt.

Auch: `https://www.gartenscan.de` → redirected automatisch auf Apex.

---

## Task 18: Post-Deploy-Verifikation und Pipeline-Update

**Files:** keine Änderung, Abschluss-Verifikation.

- [ ] **Step 1: Live-Smoke-Test**

Browser auf iPhone-14-Viewport (390×844), URL `https://gartenscan.de`:

1. Landing lädt, PhoneMockup und Footer sichtbar
2. Footer → Impressum öffnet sich, Platzhalter sind sichtbar (müssen später noch gefüllt werden)
3. Footer → Datenschutz öffnet sich
4. `/app` — Dashboard lädt, Beta-Badge sichtbar, Wetterdaten laden
5. `/scan/new` — Demo-Picker, alle drei Demos funktionieren
6. DevTools Console: keine Errors

- [ ] **Step 2: OG-Preview extern prüfen**

Öffne [opengraph.xyz](https://www.opengraph.xyz/url/https%3A%2F%2Fgartenscan.de) (oder [metatags.io](https://metatags.io)) — Preview zeigt das generierte OG-Bild mit Claim. Falls Preview noch alt ist: 1–2 Min warten, Page refreshen (Cache).

- [ ] **Step 3: Vercel Analytics prüfen**

Vercel-Dashboard → Projekt → „Analytics" — nach ein paar Seitenaufrufen (1–5 Min Delay) erscheinen erste Pageviews.

- [ ] **Step 4: Lighthouse-Quick-Check**

In Chrome DevTools → Lighthouse → Mobile → „Analyze page load" auf `https://gartenscan.de`.
Ziel:
- Performance > 80
- SEO > 90
- Best Practices > 90
- Accessibility > 85

Wenn weit darunter: Findings notieren, aber **nicht in diesem Launch-Scope fixen** — in ein Follow-up.

- [ ] **Step 5: Pipeline-Update**

Der Launch hebt den Projektstatus klar. Im PowerShell-Terminal (nicht im bash):

```powershell
pipeline-update -Slug gartenscanner `
  -Stage testing `
  -Progress 65 `
  -Status active `
  -Summary "gartenscan.de live als Early-Access-Beta: Landing + Demo-App + Impressum/Datenschutz, Vercel + Vercel Analytics" `
  -Todos @(
    "Impressum + Datenschutz Platzhalter ausfüllen",
    "Dashboard-PLZ aus Profil statt hardcoded 80331",
    "Echten Vision-Provider anbinden, ENABLE_PHOTO_UPLOAD auf true",
    "Content-Set auf 50-80 Einträge erweitern",
    "Coach-LLM-Integration"
  )
```
Expected: `pipeline-update` antwortet mit OK.

- [ ] **Step 6: Abschluss-Commit (Dokumentation)**

Falls der Launch-Prozess neue Erkenntnisse hervorbringt, die in Memory/Docs landen sollten (Stolperfallen bei Strato-DNS, Vercel-Eigenheit, etc.), diese in `docs/superpowers/specs/…-launch-design.md` oder als neue Memory ergänzen.

Ansonsten:
```bash
git log --oneline -15
```
Expected: Sauberer, lesbarer Commit-Verlauf des Launch-Plans.

---

## Done

gartenscan.de ist live. Offen bleiben alle im Spec als „Nach dem Launch" markierten Punkte — diese sind auch in der Pipeline-Todoliste aus Task 18.5 dokumentiert.
