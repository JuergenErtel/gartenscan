import Link from "next/link";
import Image from "next/image";
import type { Plant } from "@/lib/types";
import { cn } from "@/lib/utils";

const statusDot = {
  HEALTHY: "bg-moss-500",
  ATTENTION: "bg-sun-500",
  CRITICAL: "bg-berry-500 anim-breath",
  RECOVERING: "bg-sky-300",
};

const statusLabel = {
  HEALTHY: "Gesund",
  ATTENTION: "Beobachten",
  CRITICAL: "Kritisch",
  RECOVERING: "Erholt sich",
};

export function PlantTile({ plant }: { plant: Plant }) {
  return (
    <Link
      href={`/garden/${plant.id}`}
      className="group block overflow-hidden rounded-[18px] bg-paper shadow-[0_2px_12px_rgba(28,42,33,0.05)] hover:shadow-[0_6px_24px_rgba(28,42,33,0.08)] transition-all duration-300"
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <Image
          src={plant.photoUrl}
          alt={plant.nickname}
          fill
          sizes="(max-width: 768px) 50vw, 240px"
          className="object-cover transition-transform duration-500 group-hover:scale-105 photo-graded"
        />
        <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5 rounded-full bg-paper/90 backdrop-blur-sm px-2 py-1">
          <span
            className={cn(
              "inline-block h-1.5 w-1.5 rounded-full",
              statusDot[plant.healthStatus]
            )}
          />
          <span className="text-[10px] font-semibold uppercase tracking-wide text-forest-800">
            {statusLabel[plant.healthStatus]}
          </span>
        </div>
      </div>
      <div className="p-3">
        <p className="text-[11px] uppercase tracking-wider text-ink-soft mb-0.5">
          {plant.zoneLabel}
        </p>
        <h3 className="font-semibold text-[14px] text-forest-900 leading-tight line-clamp-1">
          {plant.nickname}
        </h3>
      </div>
    </Link>
  );
}
