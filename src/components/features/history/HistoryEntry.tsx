import Link from "next/link";
import Image from "next/image";
import { ChevronRight } from "lucide-react";
import { UrgencyIndicator } from "@/components/ui/UrgencyIndicator";
import { Badge } from "@/components/ui/Badge";
import { CategoryLabel } from "@/components/ui/CategoryIcon";
import { ConfidenceBar } from "@/components/features/diagnosis/ConfidenceBar";
import type { ScanHistoryItem } from "@/lib/mock/scans";
import { formatRelativeDate } from "@/lib/utils";

export function HistoryEntry({ scan }: { scan: ScanHistoryItem }) {
  const { contentEntry: e } = scan;
  return (
    <Link
      href={`/scan/${e.id}`}
      className="group flex gap-4 rounded-[18px] bg-paper p-3 pr-4 shadow-[0_2px_12px_rgba(28,42,33,0.04)] hover:shadow-[0_4px_20px_rgba(28,42,33,0.08)] transition-all duration-300"
    >
      <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-[14px]">
        <Image
          src={e.imageUrl}
          alt={e.name}
          fill
          sizes="80px"
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </div>
      <div className="flex-1 min-w-0 py-1">
        <div className="flex items-center gap-2 mb-1.5">
          <Badge tone="outline" className="!py-0.5 !px-1.5 !text-[10px]">
            <CategoryLabel category={e.category} />
          </Badge>
          <span className="text-[11px] text-ink-muted">
            {formatRelativeDate(scan.capturedAt)}
          </span>
        </div>
        <h3 className="font-semibold text-[15px] text-forest-900 leading-tight line-clamp-1 mb-1.5">
          {e.name}
        </h3>
        <div className="flex items-center gap-3">
          <UrgencyIndicator urgency={scan.urgency} />
          <ConfidenceBar value={scan.confidence} />
        </div>
      </div>
      <ChevronRight className="h-5 w-5 shrink-0 self-center text-ink-soft group-hover:text-forest-700 group-hover:translate-x-0.5 transition" />
    </Link>
  );
}
