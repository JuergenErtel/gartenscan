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
            Coding Brothers UG (haftungsbeschränkt)
            <br />
            Ottstr. 9
            <br />
            76744 Wörth
            <br />
            Deutschland
          </p>
        </section>

        <section>
          <h2 className="font-semibold text-forest-900 text-[15px] mb-1">
            Vertreten durch
          </h2>
          <p>Geschäftsführer: Carsten Hater, Jürgen Ertel</p>
        </section>

        <section>
          <h2 className="font-semibold text-forest-900 text-[15px] mb-1">
            Kontakt
          </h2>
          <p>
            E-Mail: info@codingbrothers.de
            <br />
            Web: www.codingbrothers.de
          </p>
        </section>

        <section>
          <h2 className="font-semibold text-forest-900 text-[15px] mb-1">
            Registereintrag
          </h2>
          <p>
            Handelsregister: [HRB-NUMMER]
            <br />
            Registergericht: [REGISTERGERICHT]
          </p>
        </section>

        <section>
          <h2 className="font-semibold text-forest-900 text-[15px] mb-1">
            Umsatzsteuer-ID
          </h2>
          <p>
            Umsatzsteuer-Identifikationsnummer gemäß § 27 a UStG:
            [DE… – oder diesen Abschnitt löschen, falls nicht vorhanden]
          </p>
        </section>

        <section>
          <h2 className="font-semibold text-forest-900 text-[15px] mb-1">
            Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV
          </h2>
          <p>
            Carsten Hater, Jürgen Ertel
            <br />
            c/o Coding Brothers UG (haftungsbeschränkt)
            <br />
            Ottstr. 9, 76744 Wörth
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
