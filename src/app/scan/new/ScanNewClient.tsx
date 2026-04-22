"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Camera,
  CheckCircle2,
  ImageIcon,
  Loader2,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { compressImageFile } from "@/lib/image/compress";

type Phase = "pick" | "uploading" | "analyzing" | "error";

const ANALYSIS_STEPS = [
  {
    title: "Foto wird geprueft",
    text: "Schaerfe, Motiv und Licht muessen fuer eine belastbare Einschaetzung reichen.",
  },
  {
    title: "Kategorie wird eingeordnet",
    text: "Wir pruefen, ob es Pflanze, Schadbild oder etwas anderes ist.",
  },
  {
    title: "Wissensbasis wird abgeglichen",
    text: "Treffer, Relevanz und die passende erste Massnahme werden vorbereitet.",
  },
] as const;

export default function ScanNewClient() {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("pick");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [analysisStep, setAnalysisStep] = useState(0);
  const [selectedPreview, setSelectedPreview] = useState<string | null>(null);

  useEffect(() => {
    if (phase !== "uploading" && phase !== "analyzing") return;
    const timer = window.setInterval(() => {
      setAnalysisStep((current) =>
        current === ANALYSIS_STEPS.length - 1 ? current : current + 1
      );
    }, 1300);
    return () => window.clearInterval(timer);
  }, [phase]);

  useEffect(() => {
    return () => {
      if (selectedPreview) URL.revokeObjectURL(selectedPreview);
    };
  }, [selectedPreview]);

  const currentStep = useMemo(() => {
    if (phase === "uploading") return ANALYSIS_STEPS[0];
    return ANALYSIS_STEPS[analysisStep] ?? ANALYSIS_STEPS[ANALYSIS_STEPS.length - 1];
  }, [analysisStep, phase]);

  async function handleFile(file: File) {
    if (!file.type.startsWith("image/")) {
      setPhase("error");
      setErrorMsg("Bitte waehle ein Foto oder Bild aus.");
      return;
    }
    if (file.size > 20 * 1024 * 1024) {
      setPhase("error");
      setErrorMsg("Das Bild ist zu gross. Maximal 20 MB funktionieren stabil.");
      return;
    }

    if (selectedPreview) URL.revokeObjectURL(selectedPreview);
    setSelectedPreview(URL.createObjectURL(file));
    setAnalysisStep(0);

    try {
      setPhase("uploading");
      const compressed = await compressImageFile(file);

      const form = new FormData();
      form.append("image", compressed, "scan.jpg");

      setPhase("analyzing");
      const res = await fetch("/api/scans", { method: "POST", body: form });
      if (!res.ok) {
        const body = await res.json().catch(() => ({ error: "unknown" }));
        throw new Error(body.error ?? `http ${res.status}`);
      }

      const { scanId } = (await res.json()) as { scanId: string };
      router.push(`/scan/${scanId}`);
    } catch (err) {
      setPhase("error");
      setErrorMsg(
        err instanceof Error
          ? err.message
          : "Der Scan konnte gerade nicht verarbeitet werden."
      );
    }
  }

  return (
    <div className="min-h-screen bg-linen">
      <div className="px-5 pt-[max(env(safe-area-inset-top),1rem)] pb-3">
        <Link
          href="/app"
          className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-cream shadow-[0_2px_10px_rgba(58,37,21,0.05)]"
        >
          <ArrowLeft className="h-5 w-5 text-bark-900" />
        </Link>
      </div>

      <div className="px-5 pt-6">
        <p className="eyebrow mb-2">Neuer Scan</p>
        <h1 className="font-serif text-[30px] leading-tight text-bark-900">
          Foto rein. Antwort raus.
        </h1>
        <p className="mt-4 text-[15px] leading-relaxed text-ink-muted">
          Du bekommst nicht nur einen Namen, sondern auch Relevanz,
          Handlungsbedarf und den sinnvollsten ersten Schritt.
        </p>
      </div>

      {phase === "pick" && (
        <>
          <div className="px-5 pt-6">
            <div className="rounded-[24px] bg-gradient-to-br from-bark-900 to-clay-800 p-5 text-cream">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-paper/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.12em]">
                <Sparkles className="h-3 w-3" />
                Soforthilfe statt Pflanzenlexikon
              </div>
              <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
                <ValueChip title="Was ist das?" text="Erkennung mit Sicherheit" />
                <ValueChip title="Ist es schlimm?" text="Dringlichkeit sofort klar" />
                <ValueChip title="Was jetzt?" text="Erste Massnahme priorisiert" />
              </div>
            </div>
          </div>

          <div className="px-5 pt-6 space-y-3">
            <label className="block">
              <input
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) void handleFile(file);
                }}
              />
              <div className="tap-press flex items-center gap-3 rounded-[18px] bg-bark-900 px-5 py-4 text-cream cursor-pointer">
                <Camera className="h-5 w-5" />
                <span className="text-[15px] font-semibold">Foto aufnehmen</span>
              </div>
            </label>

            <label className="block">
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) void handleFile(file);
                }}
              />
              <div className="tap-press flex items-center gap-3 rounded-[18px] border border-clay-800/20 bg-cream px-5 py-4 text-bark-900 cursor-pointer">
                <ImageIcon className="h-5 w-5" />
                <span className="text-[15px] font-semibold">
                  Aus Mediathek waehlen
                </span>
              </div>
            </label>
          </div>

          <div className="px-5 pt-6 space-y-3">
            <div className="rounded-[20px] bg-paper p-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-muted">
                Gute Fotos sparen Zeit
              </p>
              <div className="mt-3 space-y-2.5">
                <PhotoTip text="Nah ran: Blatt, Trieb, Bluete oder Schaden sollten klar im Mittelpunkt stehen." />
                <PhotoTip text="Ruhiger Hintergrund hilft, vor allem bei Unkraut oder kleinen Schadbildern." />
                <PhotoTip text="Tageslicht ist besser als Blitz. Unscharf kostet Vertrauen und Ergebnisqualitaet." />
              </div>
            </div>

            <div className="rounded-[20px] border border-sage-200/70 bg-sage-50 p-5">
              <div className="flex items-start gap-3">
                <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-moss-600" />
                <div>
                  <p className="text-[13px] font-semibold text-bark-900">
                    Ehrlicher Rahmen
                  </p>
                  <p className="mt-1 text-[13px] leading-relaxed text-ink-muted">
                    Die aktuelle Live-Erkennung ist stark bei Pflanzen. Insekten,
                    Spinnen und viele Schadbilder werden produktseitig noch nicht
                    komplett getragen.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {(phase === "uploading" || phase === "analyzing") && (
        <div className="px-5 pt-8">
          {selectedPreview && (
            <div className="overflow-hidden rounded-[24px] border border-clay-800/10 bg-paper shadow-[var(--shadow-editorial)]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={selectedPreview}
                alt="Ausgewaehltes Scanbild"
                className="h-56 w-full object-cover photo-graded"
              />
            </div>
          )}

          <div className="mt-5 rounded-[24px] bg-paper p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-sage-100">
                <Loader2 className="h-5 w-5 animate-spin text-clay-800" />
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-muted">
                  Analyse laeuft
                </p>
                <h2 className="font-serif text-[22px] leading-tight text-bark-900">
                  {currentStep.title}
                </h2>
              </div>
            </div>

            <p className="mt-3 text-[14px] leading-relaxed text-ink-muted">
              {currentStep.text}
            </p>

            <div className="mt-5 space-y-3">
              {ANALYSIS_STEPS.map((step, index) => {
                const active = index <= analysisStep || phase === "uploading" && index === 0;
                return (
                  <div key={step.title} className="flex items-center gap-3">
                    <span
                      className={`flex h-7 w-7 items-center justify-center rounded-full text-[12px] font-semibold ${
                        active
                          ? "bg-forest-700 text-paper"
                          : "bg-sage-100 text-ink-soft"
                      }`}
                    >
                      {active ? <CheckCircle2 className="h-4 w-4" /> : index + 1}
                    </span>
                    <div className="flex-1">
                      <p
                        className={`text-[13px] font-semibold ${
                          active ? "text-bark-900" : "text-ink-soft"
                        }`}
                      >
                        {step.title}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {phase === "error" && (
        <div className="px-5 pt-10">
          <div className="rounded-[20px] border border-berry-500/40 bg-cream p-5">
            <p className="eyebrow mb-2 text-berry-500">Hat nicht geklappt</p>
            <h2 className="font-serif text-[24px] leading-tight text-bark-900">
              Noch kein belastbarer Scan
            </h2>
            <p className="mt-3 text-[14px] leading-relaxed text-bark-900">
              {errorMsg ?? "Bitte versuch es mit einem schaerferen Foto erneut."}
            </p>
            <div className="mt-5">
              <Button
                onClick={() => {
                  setPhase("pick");
                  setErrorMsg(null);
                  setAnalysisStep(0);
                }}
              >
                Erneut versuchen
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function PhotoTip({ text }: { text: string }) {
  return (
    <div className="flex gap-3">
      <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-moss-500" />
      <p className="text-[13px] leading-relaxed text-bark-900">{text}</p>
    </div>
  );
}

function ValueChip({
  title,
  text,
}: {
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-[18px] bg-paper/10 p-4">
      <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-sage-100/70">
        {title}
      </p>
      <p className="mt-1 text-[14px] leading-snug text-paper">{text}</p>
    </div>
  );
}
