import type { StoredScan } from "@/domain/scan/ScanOutcome";
import { getOrCreateAiFallback } from "@/lib/services/aiFallbackService";
import { AiFallbackPanel } from "./AiFallbackPanel";

/** Statischer Platzhalter, wenn kein KI-Inhalt erzeugt werden konnte. */
export function AiFallbackPlaceholder() {
  return (
    <div className="px-5 pt-6">
      <div className="rounded-md bg-cream p-5 text-[13px] text-bark-900/75">
        Wir haben diese Art erkannt, aber noch keine belastbare
        Handlungsempfehlung hinterlegt. In diesem Zustand wirkt die App wie ein
        Scanner. Genau das bauen wir gerade aus.
      </div>
    </div>
  );
}

export function AiFallbackSkeleton() {
  return (
    <div className="px-5 pt-6">
      <div className="rounded-lg border border-sun-400/30 bg-paper p-5">
        <div className="h-5 w-56 animate-pulse rounded-full bg-sage-100" />
        <div className="mt-4 h-4 w-full animate-pulse rounded bg-sage-100" />
        <div className="mt-2 h-4 w-2/3 animate-pulse rounded bg-sage-100" />
        <div className="mt-5 space-y-2.5">
          <div className="h-16 animate-pulse rounded-md bg-sage-50" />
          <div className="h-16 animate-pulse rounded-md bg-sage-50" />
        </div>
      </div>
    </div>
  );
}

export async function AiFallbackSection({
  scan,
  userId,
}: {
  scan: StoredScan;
  userId: string;
}) {
  const content = await getOrCreateAiFallback(scan, userId);
  if (!content) return <AiFallbackPlaceholder />;
  return <AiFallbackPanel content={content} />;
}
