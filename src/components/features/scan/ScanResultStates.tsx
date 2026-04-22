import Link from "next/link";
import { ArrowRight, Info, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { BotanicalIcon } from "@/components/ui/BotanicalIcon";

export function LowQualityState({ reason }: { reason?: string }) {
  return (
    <GenericErrorFrame
      eyebrow="Bild nicht klar genug"
      title="So wird aus dem naechsten Versuch eher ein brauchbares Ergebnis."
      body={
        reason ??
        "Nahaufnahme von Blatt, Bluete, Trieb oder Schaden funktioniert am besten. Unschaerfe kostet direkt Vertrauen und Nutzwert."
      }
      mark="compass"
      tips={[
        "Ein Motiv pro Foto. Kein ganzer Beet-Ueberblick, wenn du ein konkretes Problem klaeren willst.",
        "Tageslicht statt Blitz. Blattunterseiten oder Schadstellen ruhig gezielt fotografieren.",
      ]}
      quickPlan={{
        title: "Schnelle Rettung fuer den naechsten Versuch",
        steps: [
          "Naehere Teilansicht machen statt Komplettfoto.",
          "Motiv mittig halten und den Hintergrund ruhig machen.",
          "Schadstelle oder Blattunterseite gezielt mitfotografieren.",
        ],
      }}
    />
  );
}

export function CategoryUnsupportedState({ category }: { category?: string }) {
  const label =
    category === "insect"
      ? "Dieses Insekt"
      : category === "disease"
        ? "Dieses Schadbild"
        : "Dieses Motiv";

  const coachPrompt =
    category === "insect"
      ? "Ich habe ein Insekt oder Tier im Garten fotografiert. Hilf mir bei Einordnung, Risiko und naechstem Schritt."
      : category === "disease"
        ? "Ich habe ein Schadbild an einer Pflanze fotografiert. Hilf mir bei Ursache, Dringlichkeit und erster Massnahme."
        : "Ich habe einen unklaren Gartenfall fotografiert. Hilf mir bei Einordnung und naechstem sinnvollen Schritt.";

  return (
    <GenericErrorFrame
      eyebrow="Noch nicht stark genug"
      title={`${label} tragen wir im Live-Scan noch nicht sauber genug.`}
      body="Heute ist die App im Live-Scan am staerksten bei Pflanzen. Genau solche Grenzfaelle muessen trotzdem mit einer brauchbaren Zwischenhilfe enden, nicht in einer Sackgasse."
      mark="insect"
      tips={[
        "Wenn du ein Blatt oder die betroffene Pflanze isoliert fotografierst, steigt die Chance auf eine brauchbare Einordnung.",
        "Wenn du vor allem eine Entscheidung brauchst, nutze den Coach statt auf perfekte Erkennung zu warten.",
      ]}
      quickPlan={{
        title:
          category === "insect"
            ? "Was du jetzt trotzdem sofort tun kannst"
            : "Vorlaeufig sinnvoller Plan",
        steps:
          category === "insect"
            ? [
                "Einzelfoto plus Foto der betroffenen Pflanze machen.",
                "Pruefen, ob Schaden sichtbar ist oder es auch ein Nuetzling sein koennte.",
                "Bis zur Klaerung keine pauschalen Mittel einsetzen.",
              ]
            : [
                "Befallene oder auffaellige Stellen lokal begrenzen und beobachten.",
                "Nicht mehrere Mittel gleichzeitig ausprobieren.",
                "Mit Coach oder zweitem Foto Ursache eingrenzen.",
              ],
      }}
      secondaryCta={{
        href: `/coach?q=${encodeURIComponent(coachPrompt)}`,
        label: "Coach mit Kontext oeffnen",
      }}
      supportNote="Live stark bei Pflanzen. Weitere Problemklassen werden noch ausgebaut."
    />
  );
}

export function NoMatchState() {
  return (
    <GenericErrorFrame
      eyebrow="Zu unsicher"
      title="Wir konnten diese Pflanze nicht sauber genug zuordnen."
      body="Unsichere Erkennung ist nur dann akzeptabel, wenn der naechste Versuch besser gefuehrt wird. Sonst bleibt es ein Demo-Gefuehl."
      mark="leaf"
      tips={[
        "Nochmal naeher ran, besonders an Blatt, Bluete oder markante Schadstelle.",
        "Hintergrund ruhig halten und lieber eine klare Teilansicht als ein komplettes Beet fotografieren.",
      ]}
      quickPlan={{
        title: "So kommst du eher zum Aha-Moment",
        steps: [
          "Eine markante Stelle gezielt neu fotografieren.",
          "Falls moeglich Bluete, Frucht oder Blattunterseite mitnehmen.",
          "Wenn du Zeitdruck hast: Coach fragen, statt auf perfekten Match zu warten.",
        ],
      }}
      secondaryCta={{
        href: `/coach?q=${encodeURIComponent(
          "Ich konnte meine Pflanze nicht sauber scannen. Hilf mir mit den wahrscheinlichsten Optionen und worauf ich als Naechstes achten soll."
        )}`,
        label: "Mit Coach weiter"
      }}
    />
  );
}

export function ProviderErrorState({ reason }: { reason?: string }) {
  return (
    <GenericErrorFrame
      eyebrow="Erkennung pausiert"
      title="Gerade nicht verfuegbar."
      body="Wenn das wiederholt passiert, wirkt das Produkt unzuverlaessig. Kurz warten und neu versuchen ist hier die ehrlichste Antwort."
      mark="shovel"
      detail={reason}
      secondaryCta={{
        href: "/app",
        label: "Zur Startuebersicht",
      }}
    />
  );
}

function GenericErrorFrame({
  eyebrow,
  title,
  body,
  mark,
  detail,
  tips,
  quickPlan,
  secondaryCta,
  supportNote,
}: {
  eyebrow: string;
  title: string;
  body: string;
  mark: Parameters<typeof BotanicalIcon>[0]["name"];
  detail?: string;
  tips?: string[];
  quickPlan?: { title: string; steps: string[] };
  secondaryCta?: { href: string; label: string };
  supportNote?: string;
}) {
  return (
    <div className="min-h-screen bg-linen pb-28">
      <div className="px-5 pt-[max(env(safe-area-inset-top),3rem)]">
        <div className="mt-8 mb-8 flex justify-center">
          <BotanicalIcon name={mark} framed size={72} />
        </div>
        <p className="eyebrow mb-2 text-center">{eyebrow}</p>
        <h1 className="text-center font-serif italic text-[26px] leading-tight text-bark-900 mb-4">
          {title}
        </h1>
        <p className="mx-auto max-w-sm text-center text-[15px] leading-relaxed text-bark-900/75">
          {body}
        </p>

        {supportNote && (
          <div className="mx-auto mt-6 flex max-w-sm gap-3 rounded-[16px] border border-sage-200/80 bg-paper p-4">
            <ShieldCheck
              className="mt-0.5 h-5 w-5 shrink-0 text-moss-600"
              strokeWidth={1.75}
            />
            <div>
              <p className="text-[12px] font-semibold uppercase tracking-[0.12em] text-ink-muted">
                Aktueller Scope
              </p>
              <p className="mt-1 text-[13px] leading-relaxed text-bark-900">
                {supportNote}
              </p>
            </div>
          </div>
        )}

        {tips && tips.length > 0 && (
          <div className="mx-auto mt-6 max-w-sm rounded-[16px] bg-paper p-5">
            <div className="mb-3 flex items-center gap-2">
              <Info className="h-4 w-4 text-clay-800" strokeWidth={1.75} />
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-muted">
                So wirst du eher erfolgreich
              </p>
            </div>
            <div className="space-y-2.5">
              {tips.map((tip, index) => (
                <div key={`${tip}-${index}`} className="flex gap-2">
                  <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-moss-500" />
                  <p className="text-[13px] leading-relaxed text-bark-900">
                    {tip}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {quickPlan && (
          <div className="mx-auto mt-6 max-w-sm rounded-[18px] bg-gradient-to-br from-bark-900 to-clay-800 p-5 text-cream shadow-[var(--shadow-editorial)]">
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-sun-500/90">
              Zwischenhilfe
            </p>
            <h2 className="mt-2 font-serif text-[22px] leading-tight">
              {quickPlan.title}
            </h2>
            <ol className="mt-4 space-y-3">
              {quickPlan.steps.map((step, index) => (
                <li key={`${step}-${index}`} className="flex gap-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-paper/12 text-[12px] font-semibold text-paper">
                    {index + 1}
                  </span>
                  <p className="pt-1 text-[13px] leading-relaxed text-cream/88">
                    {step}
                  </p>
                </li>
              ))}
            </ol>
          </div>
        )}

        {detail && process.env.NODE_ENV === "development" && (
          <pre className="mx-auto mt-6 max-w-sm whitespace-pre-wrap rounded-[12px] border border-clay-800/15 bg-cream p-3 text-[11px] text-bark-900/70">
            {detail}
          </pre>
        )}

        <div className="mx-auto mt-10 flex max-w-sm flex-col gap-3">
          <Button
            href="/scan/new"
            fullWidth
            iconRight={<ArrowRight className="h-4 w-4" />}
          >
            Nochmal mit besserem Foto
          </Button>
          {secondaryCta ? (
            <Button href={secondaryCta.href} variant="secondary" fullWidth>
              {secondaryCta.label}
            </Button>
          ) : (
            <Link href="/app" className="py-2 text-center text-[13px] text-ink-muted">
              Zurueck zum Garten
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
