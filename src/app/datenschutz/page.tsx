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
            Coding Brothers UG (haftungsbeschränkt)
            <br />
            Ottstr. 9
            <br />
            76744 Wörth
            <br />
            Geschäftsführer: Carsten Hater, Jürgen Ertel
            <br />
            E-Mail: info@codingbrothers.de
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
            4. Nutzer-Konto und Datenbank (Supabase)
          </h2>
          <p>
            Damit du deine Scans, Pflanzen und deinen Verlauf wiederfindest, legen wir
            beim ersten Aufruf der App automatisch ein anonymes Konto bei Supabase Inc.
            an. Es enthält keine personenbezogenen Angaben von dir, sondern nur eine
            zufällige Konto-ID. In dieser Datenbank speichern wir deine Scan-Ergebnisse,
            angelegten Pflanzen und Verlaufseinträge. Supabase-Server stehen in der EU
            (Frankfurt). Verarbeiter ist Supabase Inc. (USA) auf Basis eines
            Auftragsverarbeitungsvertrags und EU-Standardvertragsklauseln. Rechtsgrundlage
            ist Art. 6 Abs. 1 lit. b DSGVO (Vertragserfüllung – die App funktioniert
            ohne dieses Konto nicht).
          </p>
        </section>

        <section>
          <h2 className="font-semibold text-forest-900 text-[15px] mb-1">
            5. Foto-Upload und Bildspeicherung
          </h2>
          <p>
            Wenn du ein Foto scannst, laden wir es in einen privaten Speicher
            (Supabase Storage) hoch und ordnen es deinem anonymen Konto zu. Das Bild
            ist nur über kurzlebige, signierte Links zugänglich. Wir speichern Fotos so
            lange, wie der zugehörige Scan in deinem Verlauf existiert. Wenn du einen
            Scan oder eine Pflanze löschst, werden auch die zugehörigen Bilder entfernt.
            Rechtsgrundlage: Art. 6 Abs. 1 lit. b DSGVO.
          </p>
        </section>

        <section>
          <h2 className="font-semibold text-forest-900 text-[15px] mb-1">
            6. Bild-Triage (Anthropic)
          </h2>
          <p>
            Zur Vorab-Einordnung deines Bildes (Pflanze vs. Sonstiges, Bildqualität)
            übermitteln wir den signierten Foto-Link an die API von Anthropic, PBC
            (USA). Anthropic verarbeitet das Bild für die Dauer der Anfrage und nutzt
            es laut Vertrag nicht zum Training. Übertragung in die USA auf Basis von
            EU-Standardvertragsklauseln. Rechtsgrundlage: Art. 6 Abs. 1 lit. b DSGVO
            (Erbringung der Scan-Funktion).
          </p>
        </section>

        <section>
          <h2 className="font-semibold text-forest-900 text-[15px] mb-1">
            7. Pflanzen-Identifikation (Pl@ntNet)
          </h2>
          <p>
            Zur Bestimmung der Pflanze übermitteln wir den signierten Foto-Link an die
            API von Pl@ntNet (Cirad / INRIA, Frankreich). Pl@ntNet verarbeitet das Bild
            zur Erkennung der Art und kann es laut Nutzungsbedingungen für die
            Verbesserung des öffentlichen Datenbestands nutzen. Wenn du das nicht
            möchtest, lade keine Fotos hoch, auf denen du persönlich identifizierbar
            bist. Rechtsgrundlage: Art. 6 Abs. 1 lit. b DSGVO.
          </p>
        </section>

        <section>
          <h2 className="font-semibold text-forest-900 text-[15px] mb-1">
            8. Wetterdaten (Open-Meteo)
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
            9. Bilder von Wikimedia Commons
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
            10. Lokale Speicherung (LocalStorage)
          </h2>
          <p>
            Zusätzlich speichern wir dein Onboarding-Profil (PLZ, Garten-Parameter,
            Präferenzen) lokal in deinem Browser im sogenannten LocalStorage. Diese
            Angaben verbleiben auf deinem Gerät und werden nicht an unsere Server
            übertragen. Du kannst sie jederzeit über die Browser-Einstellungen löschen.
          </p>
        </section>

        <section>
          <h2 className="font-semibold text-forest-900 text-[15px] mb-1">
            11. Speicherdauer und Löschung
          </h2>
          <p>
            Scans, Pflanzen und Bilder bleiben gespeichert, solange dein anonymes Konto
            besteht oder du sie nicht selbst löschst. Du kannst einzelne Scans und
            Pflanzen in der App löschen; zugehörige Bilder werden dabei mit entfernt.
            Auf Anfrage löschen wir auch das gesamte anonyme Konto inklusive aller
            zugehörigen Daten.
          </p>
        </section>

        <section>
          <h2 className="font-semibold text-forest-900 text-[15px] mb-1">
            12. Deine Rechte
          </h2>
          <p>
            Du hast jederzeit das Recht auf Auskunft, Berichtigung, Löschung,
            Einschränkung der Verarbeitung, Datenübertragbarkeit und Widerspruch gegen
            die Verarbeitung (Art. 15–21 DSGVO). Zudem steht dir ein
            Beschwerderecht bei einer Datenschutz-Aufsichtsbehörde zu. Für Anfragen
            wende dich an: info@codingbrothers.de
          </p>
        </section>

        <section>
          <h2 className="font-semibold text-forest-900 text-[15px] mb-1">
            13. Änderungen
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
