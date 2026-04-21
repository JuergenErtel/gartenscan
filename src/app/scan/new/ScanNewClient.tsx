"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Camera, ImageIcon, Loader2 } from "lucide-react";
import { compressImageFile } from "@/lib/image/compress";
import { Button } from "@/components/ui/Button";

type Phase = "pick" | "uploading" | "analyzing" | "error";

export default function ScanNewClient() {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("pick");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  async function handleFile(file: File) {
    if (!file.type.startsWith("image/")) {
      setPhase("error");
      setErrorMsg("Bitte wähle ein Bild.");
      return;
    }
    if (file.size > 20 * 1024 * 1024) {
      setPhase("error");
      setErrorMsg("Das Bild ist zu groß (max. 20 MB).");
      return;
    }

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
      setErrorMsg(err instanceof Error ? err.message : "Unbekannter Fehler.");
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

        <div className="px-5 pt-8">
          <p className="eyebrow mb-2">Neuer Scan</p>
          <h1 className="font-serif text-[28px] leading-tight text-bark-900">
            Was soll ich mir ansehen?
          </h1>
          <p className="pull-quote mt-4">
            Ein klares Foto von Blatt, Blüte oder Frucht funktioniert am besten.
          </p>
        </div>

        {phase === "pick" && (
          <div className="px-5 pt-8 space-y-3">
            <label className="block">
              <input
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) void handleFile(f);
                }}
              />
              <div className="tap-press flex items-center gap-3 rounded-[18px] bg-bark-900 text-cream px-5 py-4 cursor-pointer">
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
                  const f = e.target.files?.[0];
                  if (f) void handleFile(f);
                }}
              />
              <div className="tap-press flex items-center gap-3 rounded-[18px] bg-cream text-bark-900 border border-clay-800/20 px-5 py-4 cursor-pointer">
                <ImageIcon className="h-5 w-5" />
                <span className="text-[15px] font-semibold">Aus Mediathek wählen</span>
              </div>
            </label>
          </div>
        )}

        {(phase === "uploading" || phase === "analyzing") && (
          <div className="px-5 pt-16 flex flex-col items-center">
            <Loader2 className="h-8 w-8 text-clay-800 animate-spin" />
            <p className="mt-4 font-serif italic text-[16px] text-bark-900">
              {phase === "uploading" ? "Bild wird hochgeladen …" : "Analyse läuft …"}
            </p>
          </div>
        )}

        {phase === "error" && (
          <div className="px-5 pt-10">
            <div className="rounded-[20px] bg-cream border border-berry-500/40 p-5">
              <p className="eyebrow mb-2 text-berry-500">Hat nicht geklappt</p>
              <p className="text-[14px] text-bark-900 mb-4">
                {errorMsg ?? "Bitte versuch es erneut."}
              </p>
              <Button onClick={() => { setPhase("pick"); setErrorMsg(null); }}>
                Erneut versuchen
              </Button>
            </div>
          </div>
        )}
    </div>
  );
}
