# Wetter aus Profil-PLZ — Design Spec

**Datum:** 2026-07-15
**Status:** Freigegeben (Design), bereit für Implementierungsplanung

## Problem

Das Dashboard (`src/app/app/page.tsx`) ruft `fetchWeatherForPLZ("80331")` mit einer
**hartcodierten München-PLZ** auf. Für jeden Nutzer außerhalb Münchens sind damit die
angezeigten Wetterdaten **und** die Frost-/Hitze-/Sturm-Alerts schlicht falsch — das
untergräbt den Kern-Nutzen der App („Muss ich heute handeln?").

Ursache: Die DB-Tabelle `profiles` hat keine PLZ-Spalte. `postalCode` existiert nur im
alten LocalStorage-`GardenProfile`-Typ (Default `80331`) und landet nie in der DB. Das
Onboarding erfasst nirgends eine PLZ.

## Ziel

Das Dashboard-Wetter richtet sich nach einer nutzergesetzten PLZ. Ist keine gesetzt, wird
**kein falsches Wetter** gezeigt, sondern ein tippbarer „Standort setzen"-Zustand. Die PLZ
ist am Dashboard erfass- und änderbar — funktioniert also auch für bereits onboardete
Nutzer (kein Onboarding-Flow-Umbau nötig).

## Getroffene Entscheidungen

- **Eingabeort:** WeatherChip am Dashboard wird tippbar und öffnet ein Bottom-Sheet mit
  5-stelligem PLZ-Feld. Kein neuer Onboarding-Schritt (YAGNI, und nutzlos für
  Bestandsnutzer).
- **Fallback ohne PLZ:** WeatherChip rendert einen „Standort setzen"-Leerzustand statt
  München-Default. Das hartcodierte `80331` entfällt vollständig.
- **Validierung:** genau 5 Ziffern (deutsche PLZ). `geocodePLZ` (existiert bereits) liefert
  `null` bei ungültiger/unbekannter PLZ → Fehlermeldung im Sheet, kein Speichern.

## Bewusst außerhalb des Scope (YAGNI)

GPS-Geolocation, Ortssuche per Name, mehrere Standorte, Onboarding-PLZ-Schritt.

## Architektur & Bausteine

### 1. DB-Migration
Neue Datei `supabase/migrations/20260715_profiles_postal_code.sql`:
```sql
alter table profiles add column postal_code text;
```
Nullable, keine Default. Bestehende Zeilen bleiben `null` → Fallback-Zustand greift.

### 2. Repository (`src/lib/services/profileRepository.ts`)
- `ProfileRow`-Typ um `postal_code: string | null` erweitern.
- `updateProfile`: Mapping `patch.postalCode → row.postal_code` ergänzen (der TODO-Kommentar
  auf Zeile 34 wird eingelöst). Wert nur setzen, wenn `patch.postalCode` definiert ist.
- `getProfile` braucht keine Änderung (`select('*')` liefert die neue Spalte automatisch).

### 3. Standort-Erfassung — `LocationSheet` + Server-Action
- **Server-Action** `updateLocation(plz: string)` (in `src/app/app/` als `actions.ts` oder
  co-lokiert): validiert 5-Ziffern-Format; ruft optional `geocodePLZ` zur Existenzprüfung;
  bei gültig → `updateProfile(userId, { postalCode: plz })` + `revalidatePath('/app')`;
  bei ungültig → strukturiertes Fehlerergebnis (kein Throw).
- **Client-Komponente** `LocationSheet`: Bottom-Sheet nach dem bestehenden Muster der
  Delete-Sheets (`DeleteScanSheet`/`DeletePlantSheet`) — Overlay, Slide-up, Safe-Area.
  Enthält ein `inputmode="numeric"`, `maxLength=5`-Feld, Speichern-`<Button>` (Komponente),
  Abbrechen-`<Button variant="ghost">`. Zeigt Validierungs-/Geocoding-Fehler inline.
  Optimistischer Close nach erfolgreichem Speichern.

### 4. Dashboard (`src/app/app/page.tsx`)
- `const plz = profileRow?.postal_code ?? null;`
- `const weather = plz ? await fetchWeatherForPLZ(plz) : null;` (kein `80331` mehr).
- WeatherChip erhält:
  - **gesetzten Zustand:** Wetter wie bisher, aber die Chip-Fläche ist tippbar (öffnet
    `LocationSheet` zum Ändern). Ort/PLZ sichtbar.
  - **Leerzustand (`plz === null`):** dezenter tippbarer „Standort setzen"-Chip statt Wetter.
- `WeatherChip` bekommt dafür ggf. einen `onEdit`/`href`-artigen Trigger und eine
  Empty-Variante. State (Sheet offen/zu) lebt in einem kleinen Client-Wrapper, da die Page
  eine Server-Component ist.

## Datenfluss

1. Server-Component `DashboardPage` liest `profileRow.postal_code`.
2. Wenn gesetzt: `fetchWeatherForPLZ(plz)` → WeatherChip zeigt Wetter + Alert.
3. Nutzer tippt Chip → Client-`LocationSheet` öffnet → PLZ eingeben → Server-Action
   `updateLocation` → `updateProfile` schreibt `postal_code` → `revalidatePath('/app')` →
   Page rendert neu mit echtem Wetter.
4. Wenn nicht gesetzt: WeatherChip zeigt „Standort setzen" → gleicher Sheet-Flow.

## Fehlerbehandlung

- Ungültige PLZ (nicht 5 Ziffern): Client-seitige Sofortvalidierung, Speichern deaktiviert.
- Unbekannte PLZ (`geocodePLZ` → `null`): Server-Action gibt Fehler zurück, Sheet zeigt
  „PLZ nicht gefunden", speichert nicht.
- `fetchWeatherForPLZ` schlägt fehl / liefert `null`: Dashboard zeigt Chip ohne Alert
  (bestehendes Verhalten, `weather &&`-Guards bleiben).

## Tests

- Unit: PLZ-Validierung (5 Ziffern, führende Nullen erlaubt, nicht-numerisch/zu-kurz/zu-lang
  abgelehnt).
- Unit: `updateProfile`-Mapping setzt `postal_code` nur bei definiertem `patch.postalCode`.
- Die bestehenden 78 Tests bleiben grün.
- `npx tsc --noEmit`, `npx vitest run`, `npx next build` als Abschluss-Gate.

## Betroffene/neue Dateien

- Neu: `supabase/migrations/20260715_profiles_postal_code.sql`
- Neu: `src/components/features/dashboard/LocationSheet.tsx`
- Neu: Server-Action (z.B. `src/app/app/actions.ts` oder co-lokiert)
- Ändern: `src/lib/services/profileRepository.ts` (ProfileRow + updateProfile-Mapping)
- Ändern: `src/app/app/page.tsx` (PLZ statt 80331, Empty-Zustand)
- Ändern: `src/components/features/dashboard/WeatherChip.tsx` (tippbar + Empty-Variante)
- Ggf. neu: kleiner Client-Wrapper für Sheet-State am Dashboard
