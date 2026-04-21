"use client";

import { useState, useMemo } from "react";
import { Search, Filter } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { HistoryEntry } from "@/components/features/history/HistoryEntry";
import { Chip } from "@/components/ui/Chip";
import { EmptyState } from "@/components/ui/EmptyState";
import { MOCK_SCANS } from "@/lib/mock/scans";
import type { Category } from "@/domain/types";
import { OnboardingGuard } from "@/components/features/onboarding/OnboardingGuard";

type FilterType = "ALL" | Category | "URGENT";

const filters: { id: FilterType; label: string }[] = [
  { id: "ALL", label: "Alle" },
  { id: "URGENT", label: "Dringend" },
  { id: "DISEASE", label: "Krankheiten" },
  { id: "PEST", label: "Schädlinge" },
  { id: "WEED", label: "Unkraut" },
  { id: "PLANT", label: "Pflanzen" },
  { id: "BENEFICIAL", label: "Nützlinge" },
];

export default function HistoryPage() {
  const [filter, setFilter] = useState<FilterType>("ALL");
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    return MOCK_SCANS.filter((s) => {
      const e = s.contentEntry;
      if (query) {
        const q = query.toLowerCase();
        if (
          !e.name.toLowerCase().includes(q) &&
          !e.scientificName.toLowerCase().includes(q) &&
          !e.aliases.some((a) => a.toLowerCase().includes(q))
        ) {
          return false;
        }
      }
      if (filter === "ALL") return true;
      if (filter === "URGENT")
        return s.urgency === "IMMEDIATE" || s.urgency === "THIS_WEEK";
      return e.category === filter;
    });
  }, [filter, query]);

  const grouped = useMemo(() => {
    const map = new Map<string, typeof MOCK_SCANS>();
    filtered.forEach((s) => {
      const key = s.capturedAt.toLocaleDateString("de-DE", {
        month: "long",
        year: "numeric",
      });
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(s);
    });
    return Array.from(map.entries());
  }, [filtered]);

  return (
    <OnboardingGuard>
      <AppShell>
      <div className="px-5 pt-8 safe-top">
        <p className="text-[11px] uppercase tracking-[0.12em] font-semibold text-ink-muted mb-2">
          Mein Verlauf
        </p>
        <h1 className="font-serif text-[32px] leading-tight tracking-tight text-forest-900 font-normal">
          {MOCK_SCANS.length} Scans, {MOCK_SCANS.length} Momente
        </h1>
        <p className="text-[14px] text-ink-muted mt-2">
          Dein Gartenjahr in Fotos und Entscheidungen
        </p>
      </div>

      {MOCK_SCANS.length === 0 ? (
        <section className="px-5 pt-8">
          <EmptyState
            mark="journal"
            title="Noch keine Scans"
            body="Hier siehst du, was du erkannt hast — und wann."
            ctaLabel="Jetzt scannen"
            ctaHref="/scan/new"
          />
        </section>
      ) : (
        <>
          <div className="px-5 pt-6">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-soft" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Suche nach Pflanze, Problem..."
                className="w-full h-12 pl-11 pr-4 rounded-[14px] bg-paper border border-sage-200 text-[14px] text-forest-900 placeholder:text-ink-soft focus:outline-none focus:border-forest-700/40 focus:ring-2 focus:ring-forest-700/10"
              />
            </div>
          </div>

          <div className="overflow-x-auto scroll-hidden pt-4">
            <div className="flex gap-2 px-5 w-max">
              {filters.map((f) => (
                <Chip
                  key={f.id}
                  active={filter === f.id}
                  onClick={() => setFilter(f.id)}
                  icon={
                    f.id === "ALL" ? <Filter className="h-3.5 w-3.5" /> : undefined
                  }
                >
                  {f.label}
                </Chip>
              ))}
            </div>
          </div>

          <section className="px-5 pt-8 space-y-8">
            {grouped.length === 0 ? (
              <div className="rounded-[20px] bg-paper p-8 text-center">
                <p className="font-serif text-[18px] text-forest-900 mb-1">
                  Nichts gefunden
                </p>
                <p className="text-[13px] text-ink-muted">
                  Anderer Filter oder Suchbegriff?
                </p>
              </div>
            ) : (
              grouped.map(([month, scans]) => (
                <div key={month}>
                  <h2 className="font-serif text-[20px] leading-tight text-forest-900 font-normal mb-3 capitalize">
                    {month}
                  </h2>
                  <div className="space-y-2.5">
                    {scans.map((s) => (
                      <HistoryEntry key={s.id} scan={s} />
                    ))}
                  </div>
                </div>
              ))
            )}
          </section>
        </>
      )}

      <section className="px-5 pt-10">
        <div className="relative overflow-hidden rounded-[20px] bg-gradient-to-br from-clay-500 to-clay-600 p-6 text-paper">
          <div className="absolute -right-4 -top-4 font-serif text-[120px] leading-none text-paper/10 select-none">
            2026
          </div>
          <div className="relative">
            <p className="text-[11px] uppercase tracking-[0.12em] font-semibold mb-3 opacity-80">
              Premium Feature
            </p>
            <h3 className="font-serif text-[24px] leading-tight font-normal mb-2">
              Dein Gartenjahrbuch
            </h3>
            <p className="text-[13px] leading-relaxed opacity-90 max-w-[80%]">
              Alle Erfolge, Fortschritte und die Entwicklung deines Gartens auf
              einen Blick.
            </p>
          </div>
        </div>
      </section>
    </AppShell>
    </OnboardingGuard>
  );
}
