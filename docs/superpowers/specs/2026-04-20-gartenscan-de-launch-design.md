# gartenscan.de — Launch Design

**Datum:** 2026-04-20
**Status:** Approved (Brainstorming-Phase abgeschlossen, bereit für Implementierungsplan)
**Slug:** `gartenscanner` (Pipeline-Tracking)

## Ziel

`gartenscan.de` als öffentliche Next.js-Web-App live stellen: Landingpage auf `/`, App unter `/app` (und den bestehenden Unterrouten). Hosting auf Vercel, Domain bleibt bei Strato. DSGVO-konform mit Impressum, Datenschutzerklärung und cookieloser Analyse. Als „Early Access"-Beta gerahmt, damit der Prototype-Zustand (MockVisionProvider, gemockter Coach, 12 Content-Einträge) nicht enttäuscht.

**Kein Teil dieses Launches:** echter Vision-Provider, Stripe, Auth, LLM-Coach, Content-Erweiterung, PostHog, Session-Recording. Diese bleiben im Backlog und sind im Snapshot-Memory dokumentiert.

## Nicht-Ziele (YAGNI)

- Kein Cookie-Consent-Banner (weil keine Tracking-Cookies gesetzt werden)
- Kein Login / Waitlist-Gate vor der App
- Keine eigene Error-Reporting-Pipeline (Vercel-Logs reichen)
- Kein Multi-Environment-Setup (Preview-Deploys von Vercel genügen)
- Keine eigene CI/CD-Pipeline (Vercels Git-Integration ersetzt das)

## Architektur-Überblick

```
┌─────────────────────┐         ┌──────────────────────┐
│   gartenscan.de     │  DNS    │       Vercel         │
│  (Strato Registrar) │ ──────> │  (Hosting + HTTPS)   │
└─────────────────────┘         └──────────┬───────────┘
                                           │
                                           ▼
                              ┌────────────────────────┐
                              │   Next.js 16 App       │
                              │  (SSR + RSC + Routes)  │
                              ├────────────────────────┤
                              │ /            Landing   │
                              │ /app         App Home  │
                              │ /scan/new    Demo      │
                              │ /impressum   NEU       │
                              │ /datenschutz NEU       │
                              │ /robots.txt  NEU       │
                              │ /sitemap.xml NEU       │
                              └────────────┬───────────┘
                                           │
                         ┌─────────────────┼─────────────────┐
                         ▼                 ▼                 ▼
                  Open-Meteo API    Wikimedia CDN    Vercel Analytics
                  (Wetter, no key)  (Bilder)         (cookielos)
```

## Komponenten & Änderungen

### 1. Hosting- und Domain-Setup

**Vercel-Projekt:**
- Neues Vercel-Projekt, verbunden mit GitHub-Repo (Repo muss ggf. erst angelegt werden — s. Implementierungsplan)
- Automatisches Deploy auf `main`-Push
- Custom Domains: `gartenscan.de` (primary) und `www.gartenscan.de` (redirect auf Apex)
- Automatisches HTTPS via Let's Encrypt durch Vercel

**Strato-DNS (manueller Schritt durch User):**
- `@` (Apex) → **A-Record** auf `76.76.21.21` (Vercels statische IP; aktueller Wert wird im Vercel-Dashboard beim Hinzufügen der Domain angezeigt — dieser gilt)
- `www` → **CNAME** auf `cname.vercel-dns.com`
- Etwaige alte A-/MX-/TXT-Records prüfen und ggf. entfernen (nicht ungefragt!). E-Mail-Records (MX) unberührt lassen.

**Propagation:** 5 Minuten bis 24 Stunden. Vercel-Dashboard zeigt Status live.

### 2. Rechtliche Seiten (`/impressum`, `/datenschutz`)

Neue statische Routen als Next.js-Pages. Mobile-first-Layout, Design konsistent mit Landing (gleicher Footer, gleiche Typografie, `max-w-prose`-Container).

**`/impressum`** — Text nach §5 TMG + §18 MStV mit Platzhaltern:
- `[DEIN VOLLSTÄNDIGER NAME]`
- `[STRASSE UND HAUSNUMMER]`
- `[PLZ ORT]`
- `[EMAIL-ADRESSE]`
- `[TELEFON optional]`
- Haftungsausschluss Links/Inhalte

**`/datenschutz`** — DSGVO-Text mit konkreten Abschnitten für tatsächlich eingesetzte Dienste:
- Verantwortlicher: Platzhalter wie Impressum
- Server-Logs (Vercel): IP, User-Agent, Timestamp
- Vercel Analytics (cookielos, anonymisiert)
- Open-Meteo (IP-Übertragung beim Wetter-Abruf)
- Wikimedia (IP-Übertragung beim Bild-Laden)
- Rechte der Nutzer (Auskunft, Löschung, Widerspruch)
- Kontakt für Datenschutzanfragen

**Footer-Komponente:** Neuer `<Footer />` in `src/components/layout/Footer.tsx` mit Links zu Impressum + Datenschutz + kurzer Copyright-Zeile. Eingebunden in `src/app/layout.tsx`, sodass er auf allen Seiten (Landing + App + Unterrouten) erscheint.

**Warnung im Spec:** Die generierten Texte sind Vorlagen, kein Anwaltsersatz. User sollte sie vor Launch durchlesen und ggf. von einem Anwalt prüfen lassen.

### 3. Early-Access-Framing

**Scan-Route-Änderung (`src/app/scan/new/page.tsx`):**
- Foto-Upload-UI wird für Launch ersetzt durch **Demo-Auswahl**: 3 Buttons/Cards („Tomate", „Löwenzahn", „Echter Mehltau") die je einen bestehenden Content-Eintrag öffnen (`/scan/[id]` mit einer stabilen Demo-ID je Button).
- Oberhalb der Buttons: kurzer Hinweis-Text („In der Beta zeigen wir dir drei Beispiele — echte Foto-Erkennung folgt in Kürze.")
- Das alte Foto-Upload-UI wird **nicht gelöscht**, sondern hinter einer Konstanten `ENABLE_PHOTO_UPLOAD = false` im selben File versteckt. Wenn der echte Vision-Provider kommt, wird die Konstante auf `true` gesetzt und die Demo-Auswahl entfernt — kein Neu-Schreiben nötig.

**Beta-Badge:**
- Kleiner Pill-Badge „Beta" im App-Header, neben Logo
- Wird nur im App-Bereich (`/app/**`, `/scan/**`, `/coach`, `/garden/**`, etc.) gezeigt, nicht auf Landing
- Implementiert als kleine Komponente `src/components/ui/BetaBadge.tsx`

### 4. Analytics

**`@vercel/analytics` Paket:**
- `npm install @vercel/analytics`
- `<Analytics />` eingebunden in `src/app/layout.tsx` unterhalb der Kinder
- Kein Env-Var nötig; Vercel aktiviert es automatisch bei Deploy
- Dashboard unter `vercel.com/<account>/gartenscan/analytics`

**Keine Konsole-Tracker-Löschung:** Der bestehende `ConsoleTracker` in `src/domain/analytics/tracker.ts` bleibt für interne Events; Vercel Analytics läuft parallel auf Pageview-Ebene.

### 5. SEO & Statische Assets

**Favicon + OG-Bild (Generierung durch Implementierung):**
- Aus bestehendem `Logo`/`LogoMark` (`src/components/ui/Logo.tsx`) Favicon als `favicon.ico` (32×32, 16×16 Multi-Size) und als PNG (`icon-192.png`, `icon-512.png`) für PWA-Vorbereitung
- OG-Bild 1200×630 px mit Logo zentriert + Claim („Dein Garten, einfach verstanden" oder ähnliches aus Landing) auf Markenfarbton — als statisches `public/og-image.png`
- Apple-Touch-Icon (180×180 px)

**Meta-Tags (`src/app/layout.tsx` via `metadata`-Export):**
- Title: „gartenscan – Pflanzen, Schädlinge, Krankheiten erkennen"
- Description: 1 Satz, was die App kann (final zu formulieren im Plan)
- OpenGraph: `type=website`, `url=https://gartenscan.de`, `title`, `description`, `image=/og-image.png`
- Twitter: `card=summary_large_image`
- Canonical: `https://gartenscan.de`
- Robots: `index, follow`
- `viewport` + `themeColor` (Mobile)

**Robots + Sitemap:**
- `src/app/robots.ts` — erlaubt alle Crawler, verweist auf Sitemap
- `src/app/sitemap.ts` — listet:
  - `/` (Landing)
  - `/app`
  - `/impressum`
  - `/datenschutz`
  - Ggf. `/scan/new` (Demo-Einstieg)
  - KEINE dynamischen `/scan/[id]`-URLs (User-spezifisch)

### 6. Pre-Launch Checks

**Lokale Verifikation vor erstem Deploy:**
- `npm run build` läuft sauber durch (kein TS-Fehler, kein Lint-Fehler)
- `npm run start` startet lokal, alle Routen liefern 200
- Mobile-Viewport-Smoke-Test (iPhone 14, 390×844) auf Landing + `/app` + Scan-Demo
- Link-Check: Impressum + Datenschutz sind vom Footer erreichbar

**Post-Deploy-Checks:**
- `https://gartenscan.de` antwortet mit gültigem HTTPS-Zertifikat
- `https://www.gartenscan.de` redirected auf Apex
- OG-Preview via `opengraph.xyz` oder ähnlichem Tool
- Lighthouse (mobile): Scores > 80 Performance, > 90 SEO/Best Practices/A11y

### 7. `next.config.mjs` — keine Änderungen nötig

Die aktuelle Konfiguration bleibt:
- `allowedDevOrigins` ist nur dev-relevant, stört Production nicht
- `remotePatterns` für Wikimedia/Unsplash sind bereits korrekt

## Datenfluss-Diagramm

Keine neuen Datenflüsse — vorhandene bleiben. Einzige neue externe Kommunikation:
- **Vercel Analytics Beacon:** anonyme Pageview pro Navigation, kein User-ID-Cookie

## Fehlerbehandlung

- 404-Fallback: Next.js Default bleibt zunächst ausreichend (kann später mit `not-found.tsx` überschrieben werden)
- Error-Boundary: Next.js Default reicht für Launch
- DNS-Probleme sind User-sichtbar in Vercel-Dashboard

## Testing

- Kein automatisierter Test-Setup vorhanden; Launch ist reiner Smoke-Test
- Mobile-First-Verifikation: `npm run build && npm run start` lokal + Chrome-DevTools-Emulation
- Pre-Commit-Verifikation per `npm run build` (ersetzt Testlauf für diesen Launch-Scope)

## Nach dem Launch (nicht in diesem Scope, aber nächste Schritte)

- Dashboard-PLZ aus onboarding-gespeichertem Profil ziehen (statt hardcoded 80331)
- VisionProvider von Mock auf echten Anbieter umstellen → dann Foto-Upload-UI reaktivieren
- Content-Set auf 50–80 Einträge erweitern
- Coach-LLM-Integration

## Offene Punkte für Implementierungsphase

- Finaler Wortlaut von Title + Description + OG-Claim (wird im Plan / bei der Implementierung festgelegt)
- Welche 3 Demo-Content-IDs für `/scan/new` (Tomate, Löwenzahn, Mehltau — aber exakte IDs aus `src/content/index.ts` verifizieren)
- GitHub-Repo: existiert noch keines (der Projektkontext sagt `Is a git repository: false`). Im Implementierungsplan als erster Schritt: Repo initialisieren + auf GitHub pushen.
