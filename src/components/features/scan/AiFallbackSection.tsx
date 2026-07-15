import type { StoredScan } from "@/domain/scan/ScanOutcome";
import { getOrCreateAiFallback } from "@/lib/services/aiFallbackService";
import { BotanicalIcon } from "@/components/ui/BotanicalIcon";
import { StatePanel } from "@/components/ui/StatePanel";
import { AiFallbackPanel } from "./AiFallbackPanel";

/** Empty-State, wenn (noch) keine Detailinfos zur Art vorliegen. */
export function AiFallbackPlaceholder() {
  return (
    <div className="px-5 pt-6">
      <StatePanel
        mark={<BotanicalIcon name="leaf" size={88} animate />}
        title="Noch keine Pflegehinweise"
        body="Fuer diese Art liegen noch keine Detailinfos vor - wir ergaenzen sie laufend."
      />
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
