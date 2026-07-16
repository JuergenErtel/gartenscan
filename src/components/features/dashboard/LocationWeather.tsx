'use client';

import { useState } from 'react';
import { MapPin } from 'lucide-react';
import type { WeatherSnapshot } from '@/lib/types';
import { WeatherChip } from './WeatherChip';
import { LocationSheet } from './LocationSheet';

export function LocationWeather({
  weather,
  postalCode,
}: {
  weather: WeatherSnapshot | null;
  postalCode: string | null;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {weather ? (
        <WeatherChip weather={weather} onClick={() => setOpen(true)} />
      ) : (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="tap-press inline-flex min-h-[44px] items-center gap-2 rounded-full border border-sage-200/60 bg-paper/70 px-3.5 py-2 text-[13px] text-ink-muted backdrop-blur focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest-700/30"
        >
          <MapPin className="h-4 w-4" strokeWidth={1.75} />
          Standort setzen
        </button>
      )}
      <LocationSheet open={open} initialPlz={postalCode} onClose={() => setOpen(false)} />
    </>
  );
}
