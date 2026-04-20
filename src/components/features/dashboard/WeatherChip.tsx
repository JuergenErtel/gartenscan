import { Cloud, CloudRain, Snowflake, Sun, Wind, AlertTriangle, MapPin } from "lucide-react";
import type { WeatherSnapshot } from "@/lib/types";

const icons = {
  sun: Sun,
  cloud: Cloud,
  rain: CloudRain,
  snow: Snowflake,
  wind: Wind,
} as const;

const alertLabel = {
  frost: "Frost",
  storm: "Sturm",
  heat: "Hitze",
  heavy_rain: "Starkregen",
} as const;

export function WeatherChip({ weather }: { weather: WeatherSnapshot }) {
  const Icon = icons[weather.icon];

  return (
    <div className="inline-flex items-center gap-3 rounded-full bg-paper/70 backdrop-blur px-3.5 py-2 border border-sage-200/60">
      <Icon className="h-4 w-4 text-sky-400" strokeWidth={1.75} />
      <span className="text-sm font-medium text-forest-800 tabular-nums">
        {weather.tempC}°
      </span>
      <span className="text-[13px] text-ink-muted">{weather.condition}</span>
      {weather.location && (
        <span className="flex items-center gap-1 border-l border-sage-200 pl-3 text-[12px] text-ink-muted">
          <MapPin className="h-3 w-3" strokeWidth={1.75} />
          {weather.location}
        </span>
      )}
      {weather.alert && (
        <span className="flex items-center gap-1 border-l border-sage-200 pl-3 text-[12px] font-medium text-sun-500">
          <AlertTriangle className="h-3.5 w-3.5" />
          {alertLabel[weather.alert.type]}
        </span>
      )}
    </div>
  );
}
