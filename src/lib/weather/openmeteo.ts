import type { WeatherSnapshot } from "@/lib/types";

type IconKey = WeatherSnapshot["icon"];

interface GeocodeResult {
  latitude: number;
  longitude: number;
  name: string;
  admin1?: string;
}

interface ForecastResponse {
  current: {
    temperature_2m: number;
    weather_code: number;
    wind_speed_10m: number;
  };
  hourly: {
    time: string[];
    temperature_2m: number[];
    precipitation: number[];
    wind_speed_10m: number[];
    weather_code: number[];
  };
}

const GEOCODE_URL = "https://geocoding-api.open-meteo.com/v1/search";
const FORECAST_URL = "https://api.open-meteo.com/v1/forecast";

/**
 * Geocodes a German postal code to lat/lng + city name via Open-Meteo.
 * Returns null on failure (no exceptions for flow control).
 */
export async function geocodePLZ(plz: string): Promise<GeocodeResult | null> {
  const url = `${GEOCODE_URL}?name=${encodeURIComponent(plz)}&country=DE&count=1&language=de&format=json`;
  try {
    const res = await fetch(url, { next: { revalidate: 60 * 60 * 24 } });
    if (!res.ok) return null;
    const data = (await res.json()) as { results?: GeocodeResult[] };
    return data.results?.[0] ?? null;
  } catch {
    return null;
  }
}

/**
 * Fetches current weather + 3-day forecast for a German postal code.
 * Returns null if anything fails – UI should show a graceful fallback.
 */
export async function fetchWeatherForPLZ(
  plz: string
): Promise<WeatherSnapshot | null> {
  const geo = await geocodePLZ(plz);
  if (!geo) return null;

  const params = new URLSearchParams({
    latitude: String(geo.latitude),
    longitude: String(geo.longitude),
    current: "temperature_2m,weather_code,wind_speed_10m",
    hourly:
      "temperature_2m,precipitation,wind_speed_10m,weather_code",
    forecast_days: "3",
    timezone: "Europe/Berlin",
    wind_speed_unit: "kmh",
  });

  try {
    const res = await fetch(`${FORECAST_URL}?${params}`, {
      next: { revalidate: 60 * 30 },
    });
    if (!res.ok) return null;
    const data = (await res.json()) as ForecastResponse;

    return {
      tempC: Math.round(data.current.temperature_2m),
      condition: weatherCodeToLabel(data.current.weather_code),
      icon: weatherCodeToIcon(
        data.current.weather_code,
        data.current.wind_speed_10m
      ),
      location: geo.name,
      updatedAt: new Date(),
      alert: deriveAlert(data.hourly),
    };
  } catch {
    return null;
  }
}

/**
 * Derives the most relevant alert from the hourly forecast.
 * Priority order: frost > storm > heat > heavy rain.
 */
function deriveAlert(hourly: ForecastResponse["hourly"]):
  | WeatherSnapshot["alert"]
  | undefined {
  const now = Date.now();
  const horizon = 48;

  const upcoming = hourly.time
    .map((t, i) => ({
      date: new Date(t),
      tempC: hourly.temperature_2m[i],
      precip: hourly.precipitation[i],
      wind: hourly.wind_speed_10m[i],
    }))
    .filter((h) => {
      const diffHours = (h.date.getTime() - now) / (1000 * 60 * 60);
      return diffHours >= 0 && diffHours <= horizon;
    });

  if (upcoming.length === 0) return undefined;

  const frost = upcoming.find((h) => h.tempC < 2);
  if (frost) {
    const hours = Math.max(
      1,
      Math.round((frost.date.getTime() - now) / (1000 * 60 * 60))
    );
    const temp = Math.round(frost.tempC);
    return {
      type: "frost",
      message:
        temp < 0
          ? `Nachtfrost bis ${temp}°C – empfindliche Pflanzen abdecken`
          : `Bodennah kritisch kalt (${temp}°C) – Frostschutz empfohlen`,
      inHours: hours,
    };
  }

  const storm = upcoming.find((h) => h.wind > 60);
  if (storm) {
    const hours = Math.max(
      1,
      Math.round((storm.date.getTime() - now) / (1000 * 60 * 60))
    );
    return {
      type: "storm",
      message: `Sturm mit bis zu ${Math.round(storm.wind)} km/h – Kübel sichern`,
      inHours: hours,
    };
  }

  const heat = upcoming.find((h) => h.tempC > 30);
  if (heat) {
    const hours = Math.max(
      1,
      Math.round((heat.date.getTime() - now) / (1000 * 60 * 60))
    );
    return {
      type: "heat",
      message: `Hitze bis ${Math.round(heat.tempC)}°C – früh morgens wässern`,
      inHours: hours,
    };
  }

  const heavyRain = upcoming.find((h) => h.precip > 15);
  if (heavyRain) {
    const hours = Math.max(
      1,
      Math.round((heavyRain.date.getTime() - now) / (1000 * 60 * 60))
    );
    return {
      type: "heavy_rain",
      message: `Starkregen erwartet – Staunässe prüfen, Aussaat verschieben`,
      inHours: hours,
    };
  }

  return undefined;
}

/** WMO weather code → German condition label. */
function weatherCodeToLabel(code: number): string {
  if (code === 0) return "Klar";
  if (code === 1) return "Überwiegend klar";
  if (code === 2) return "Leicht bewölkt";
  if (code === 3) return "Bewölkt";
  if (code === 45 || code === 48) return "Nebel";
  if (code >= 51 && code <= 57) return "Nieselregen";
  if (code >= 61 && code <= 67) return "Regen";
  if (code >= 71 && code <= 77) return "Schneefall";
  if (code >= 80 && code <= 82) return "Regenschauer";
  if (code === 85 || code === 86) return "Schneeschauer";
  if (code >= 95) return "Gewitter";
  return "Wechselhaft";
}

/** WMO code + wind → UI icon key. */
function weatherCodeToIcon(code: number, windKmh: number): IconKey {
  if (windKmh > 40) return "wind";
  if (code >= 71 && code <= 77) return "snow";
  if (code === 85 || code === 86) return "snow";
  if (code >= 51 && code <= 67) return "rain";
  if (code >= 80 && code <= 82) return "rain";
  if (code >= 95) return "rain";
  if (code === 0 || code === 1) return "sun";
  return "cloud";
}
