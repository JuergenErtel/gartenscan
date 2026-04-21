import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { BotanicalIcon } from "@/components/ui/BotanicalIcon";

export function LowQualityState({ reason }: { reason?: string }) {
  return (
    <GenericErrorFrame
      eyebrow="Bild nicht klar genug"
      title="Magst du es nochmal versuchen?"
      body={reason ?? "Eine Nahaufnahme von Blatt, Blüte oder Frucht funktioniert am besten."}
      mark="compass"
    />
  );
}

export function CategoryUnsupportedState({ category }: { category?: string }) {
  const label =
    category === "insect" ? "Insekt"
    : category === "disease" ? "Schadbild"
    : "Das";
  return (
    <GenericErrorFrame
      eyebrow="Noch nicht erkannt"
      title={`${label} erkennen wir bald.`}
      body="Wir starten mit Pflanzen. Insekten- und Krankheits-Erkennung folgen als nächstes."
      mark="insect"
    />
  );
}

export function NoMatchState() {
  return (
    <GenericErrorFrame
      eyebrow="Unsicher"
      title="Wir konnten diese Pflanze nicht sicher zuordnen."
      body="Ein zweites Foto aus näherer Perspektive hilft oft — besonders von Blatt oder Blüte."
      mark="leaf"
    />
  );
}

export function ProviderErrorState({ reason }: { reason?: string }) {
  return (
    <GenericErrorFrame
      eyebrow="Erkennung pausiert"
      title="Gerade nicht verfügbar."
      body="Bitte versuche es in ein paar Minuten nochmal. Falls das wiederholt passiert, melde dich."
      mark="shovel"
      detail={reason}
    />
  );
}

function GenericErrorFrame({
  eyebrow,
  title,
  body,
  mark,
  detail,
}: {
  eyebrow: string;
  title: string;
  body: string;
  mark: Parameters<typeof BotanicalIcon>[0]["name"];
  detail?: string;
}) {
  return (
    <div className="min-h-screen bg-linen pb-28">
      <div className="px-5 pt-[max(env(safe-area-inset-top),3rem)]">
        <div className="flex justify-center mt-8 mb-8">
          <BotanicalIcon name={mark} framed size={72} />
        </div>
        <p className="eyebrow text-center mb-2">{eyebrow}</p>
        <h1 className="font-serif italic text-[26px] leading-tight text-bark-900 text-center mb-4">
          {title}
        </h1>
        <p className="text-[15px] text-bark-900/75 leading-relaxed text-center max-w-sm mx-auto">
          {body}
        </p>

        {detail && process.env.NODE_ENV === "development" && (
          <pre className="mt-6 mx-auto max-w-sm rounded-[12px] bg-cream border border-clay-800/15 p-3 text-[11px] text-bark-900/70 whitespace-pre-wrap">
            {detail}
          </pre>
        )}

        <div className="mt-10 flex flex-col gap-3 max-w-sm mx-auto">
          <Button href="/scan/new" fullWidth>Erneut versuchen</Button>
          <Link href="/app" className="text-center text-[13px] text-ink-muted py-2">
            Zurück zum Garten
          </Link>
        </div>
      </div>
    </div>
  );
}
