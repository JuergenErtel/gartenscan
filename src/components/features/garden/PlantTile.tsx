import Link from "next/link";
import Image from "next/image";

interface Plant {
  id: string;
  nickname: string;
  species: string;
  latinName?: string;
  photoUrl: string;
  addedAt: Date;
  zoneLabel: string;
  lastScanAt?: Date;
  scanCount: number;
}

export function PlantTile({ plant }: { plant: Plant }) {
  return (
    <Link
      href={`/garden/${plant.id}`}
      className="group block overflow-hidden rounded-lg bg-paper shadow-[0_2px_12px_rgba(28,42,33,0.05)] hover:shadow-[0_6px_24px_rgba(28,42,33,0.08)] transition-all duration-300"
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <Image
          src={plant.photoUrl}
          alt={plant.nickname}
          fill
          sizes="(max-width: 768px) 50vw, 240px"
          className="object-cover transition-transform duration-500 group-hover:scale-105 photo-graded"
        />
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
