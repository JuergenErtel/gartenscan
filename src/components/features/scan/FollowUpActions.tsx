"use client";

import { startTransition, useEffectEvent, useState, type ElementType } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, CheckCircle2, Eye, Loader2, RotateCcw } from "lucide-react";
import type { FollowUpStatus, ScanFollowUp } from "@/domain/scan/ScanOutcome";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

const OPTIONS: Array<{
  status: FollowUpStatus;
  label: string;
  text: string;
  icon: ElementType;
}> = [
  {
    status: "OPEN",
    label: "Offen",
    text: "Noch nicht abgeschlossen",
    icon: RotateCcw,
  },
  {
    status: "MONITORING",
    label: "Beobachten",
    text: "Erst verfolgen, dann entscheiden",
    icon: Eye,
  },
  {
    status: "DONE",
    label: "Erledigt",
    text: "Fall ist fuer mich abgeschlossen",
    icon: CheckCircle2,
  },
  {
    status: "ESCALATED",
    label: "Eskaliert",
    text: "Braucht jetzt mehr Aufmerksamkeit",
    icon: AlertTriangle,
  },
] as const;

export function FollowUpActions({
  scanId,
  initialFollowUp,
}: {
  scanId: string;
  initialFollowUp?: ScanFollowUp;
}) {
  const router = useRouter();
  const [status, setStatus] = useState<FollowUpStatus>(initialFollowUp?.status ?? "OPEN");
  const [nextCheckMode, setNextCheckMode] = useState<"3" | "7" | "none">(
    initialFollowUp?.status === "MONITORING"
      ? nextCheckModeFromDate(initialFollowUp.nextCheckAt)
      : "none"
  );
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const persist = useEffectEvent(async (nextStatus: FollowUpStatus, nextMode: "3" | "7" | "none") => {
    setPending(true);
    setError(null);
    try {
      const nextCheckAt =
        nextStatus === "MONITORING"
          ? nextMode === "3"
            ? addDays(3)
            : nextMode === "7"
              ? addDays(7)
              : null
          : null;

      const res = await fetch(`/api/scans/${scanId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          followUp: {
            status: nextStatus,
            nextCheckAt: nextCheckAt?.toISOString() ?? null,
          },
        }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(
          body?.error === "follow-up feature not ready"
            ? "Fallstatus ist erst verfuegbar, sobald die Datenbankmigration aktiv ist"
            : "Status konnte nicht gespeichert werden"
        );
      }

      startTransition(() => {
        router.refresh();
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Status konnte nicht gespeichert werden");
    } finally {
      setPending(false);
    }
  });

  function handleStatusChange(nextStatus: FollowUpStatus) {
    setStatus(nextStatus);
    const nextMode = nextStatus === "MONITORING" ? nextCheckMode : "none";
    if (nextStatus !== "MONITORING") {
      setNextCheckMode("none");
    } else if (nextCheckMode === "none") {
      setNextCheckMode("3");
    }
    void persist(nextStatus, nextStatus === "MONITORING" ? (nextCheckMode === "none" ? "3" : nextCheckMode) : "none");
  }

  function handleMonitoringWindow(mode: "3" | "7") {
    setNextCheckMode(mode);
    setStatus("MONITORING");
    void persist("MONITORING", mode);
  }

  return (
    <section className="px-5 pt-6">
      <div className="rounded-[22px] border border-sage-200/70 bg-paper p-5">
        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-muted">
          Fallstatus
        </p>
        <h2 className="mt-2 font-serif text-[24px] leading-tight text-bark-900">
          Diesen Fall aktiv fuehren
        </h2>
        <p className="mt-2 text-[14px] leading-relaxed text-ink-muted">
          Genau hier wird aus einer Erkennung ein Werkzeug: offen lassen,
          beobachten, erledigen oder bewusst eskalieren.
        </p>

        <div className="mt-5 grid grid-cols-2 gap-3">
          {OPTIONS.map((option) => {
            const Icon = option.icon;
            const active = status === option.status;
            return (
              <button
                key={option.status}
                type="button"
                disabled={pending}
                onClick={() => handleStatusChange(option.status)}
                className={cn(
                  "rounded-[18px] border p-4 text-left transition",
                  active
                    ? "border-forest-700 bg-sage-50"
                    : "border-sage-200 hover:border-forest-700/30"
                )}
              >
                <div className="flex items-start gap-3">
                  <div className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-full",
                    active ? "bg-forest-700 text-paper" : "bg-sage-100 text-forest-700"
                  )}>
                    <Icon className="h-4.5 w-4.5" strokeWidth={1.75} />
                  </div>
                  <div>
                    <p className="text-[14px] font-semibold text-bark-900">{option.label}</p>
                    <p className="mt-1 text-[12px] leading-relaxed text-ink-muted">
                      {option.text}
                    </p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {status === "MONITORING" && (
          <div className="mt-5 rounded-[18px] bg-sage-50 p-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-muted">
              Wiedervorlage
            </p>
            <div className="mt-3 flex gap-2">
              {([
                ["3", "in 3 Tagen"],
                ["7", "in 7 Tagen"],
              ] as const).map(([value, label]) => (
                <Button
                  key={value}
                  variant={nextCheckMode === value ? "primary" : "secondary"}
                  size="sm"
                  onClick={() => handleMonitoringWindow(value)}
                  disabled={pending}
                >
                  {label}
                </Button>
              ))}
            </div>
          </div>
        )}

        {error && (
          <p className="mt-4 text-[12px] text-berry-600">{error}</p>
        )}

        {pending && (
          <div className="mt-4 inline-flex items-center gap-2 text-[12px] text-ink-muted">
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            Speichert Fallstatus...
          </div>
        )}
      </div>
    </section>
  );
}

function addDays(days: number) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date;
}

function nextCheckModeFromDate(date?: Date) {
  if (!date) return "3";
  const diff = Math.round((date.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  return diff > 4 ? "7" : "3";
}
