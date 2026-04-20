import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { UrgencyIndicator } from "@/components/ui/UrgencyIndicator";
import { EffortBadge } from "@/components/ui/EffortBadge";
import type { DailyTask, Plant } from "@/lib/types";

interface TodayHeroProps {
  task: DailyTask;
  plant?: Plant;
}

export function TodayHero({ task, plant }: TodayHeroProps) {
  return (
    <Link
      href={`/garden/${task.plantId ?? ""}`}
      className="group block overflow-hidden rounded-[24px] bg-forest-900 text-paper shadow-[0_12px_40px_rgba(28,42,33,0.2)]"
    >
      <div className="relative h-56 w-full overflow-hidden">
        {plant && (
          <Image
            src={plant.photoUrl}
            alt={plant.nickname}
            fill
            sizes="(max-width: 768px) 100vw, 500px"
            className="object-cover transition-transform duration-700 group-hover:scale-105"
            priority
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-forest-900 via-forest-900/60 to-transparent" />
        <div className="absolute top-4 left-4">
          <UrgencyIndicator urgency={task.urgency} />
        </div>
      </div>
      <div className="relative -mt-12 px-6 pb-6 pt-2">
        <p className="text-[11px] uppercase tracking-[0.12em] font-semibold text-sage-200/90 mb-2">
          Heute wichtig
        </p>
        <h2 className="font-serif text-[26px] leading-[1.15] tracking-tight mb-3 font-normal">
          {task.title}
        </h2>
        <p className="text-[14px] leading-relaxed text-sage-200/80 mb-5 line-clamp-2">
          {task.description}
        </p>
        <div className="flex items-center justify-between">
          <EffortBadge
            effort={task.effort}
            durationMin={task.durationMin}
            className="!text-sage-200/70"
          />
          <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-paper">
            Erledigen
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </span>
        </div>
      </div>
    </Link>
  );
}
