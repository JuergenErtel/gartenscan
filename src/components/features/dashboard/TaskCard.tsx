import { UrgencyIndicator } from "@/components/ui/UrgencyIndicator";
import { EffortBadge } from "@/components/ui/EffortBadge";
import { Card, CardBody } from "@/components/ui/Card";
import type { DailyTask } from "@/lib/types";
import { Cloud, Bug, Leaf, User } from "lucide-react";

const sourceIcons = {
  SCAN: Bug,
  WEATHER: Cloud,
  SEASONAL: Leaf,
  USER: User,
};

export function TaskCard({ task }: { task: DailyTask }) {
  const Icon = sourceIcons[task.source];

  return (
    <Card interactive className="min-w-[260px] max-w-[260px]">
      <CardBody>
        <div className="flex items-start justify-between mb-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-sage-100">
            <Icon className="h-4 w-4 text-moss-600" strokeWidth={1.75} />
          </div>
          <UrgencyIndicator urgency={task.urgency} variant="dot" />
        </div>
        <h3 className="font-semibold text-[15px] text-forest-900 mb-1.5 line-clamp-2">
          {task.title}
        </h3>
        {task.plantName && (
          <p className="text-[12px] text-ink-muted mb-3">{task.plantName}</p>
        )}
        <EffortBadge effort={task.effort} durationMin={task.durationMin} />
      </CardBody>
    </Card>
  );
}
