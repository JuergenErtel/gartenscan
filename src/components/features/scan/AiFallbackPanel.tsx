import { AlertTriangle, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import type { AiFallbackContent } from "@/domain/scan/ScanOutcome";

export function AiFallbackPanel({ content }: { content: AiFallbackContent }) {
  return (
    <div className="px-5 pt-6">
      <div className="rounded-[20px] border border-sun-400/40 bg-paper p-5">
        <div className="mb-3">
          <Badge tone="warning" icon={<Sparkles className="h-3 w-3" />}>
            KI-generiert · nicht redaktionell geprüft
          </Badge>
        </div>

        <p className="text-[14px] leading-relaxed text-bark-900">
          {content.summary}
        </p>

        <p className="mt-5 mb-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-muted">
          Erste Maßnahmen
        </p>
        <div className="space-y-2.5">
          {content.tips.map((tip, index) => (
            <div
              key={`${tip.title}-${index}`}
              className="rounded-[16px] border border-clay-800/10 bg-sage-50 p-4"
            >
              <p className="text-[14px] font-semibold text-bark-900">
                {tip.title}
              </p>
              <p className="mt-1 text-[13px] leading-relaxed text-ink-muted">
                {tip.text}
              </p>
            </div>
          ))}
        </div>

        {content.caution && (
          <div className="mt-4 flex gap-2 rounded-[14px] bg-sun-100 p-3.5">
            <AlertTriangle
              className="h-4 w-4 shrink-0 text-[#8a6a14]"
              strokeWidth={2}
            />
            <p className="text-[13px] leading-relaxed text-[#8a6a14]">
              {content.caution}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
