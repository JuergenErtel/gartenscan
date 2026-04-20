import type { Plant, DailyTask, WeatherSnapshot } from "@/lib/types";

const daysAgo = (d: number) => {
  const date = new Date();
  date.setDate(date.getDate() - d);
  return date;
};

export const MOCK_PLANTS: Plant[] = [
  {
    id: "plant_hortensie",
    nickname: "Hortensie am Zaun",
    species: "Bauernhortensie",
    latinName: "Hydrangea macrophylla",
    photoUrl:
      "https://upload.wikimedia.org/wikipedia/commons/7/7f/Hydrangea_macrophylla_01.jpg",
    addedAt: daysAgo(412),
    zoneLabel: "Vorgarten",
    healthStatus: "ATTENTION",
    lastScanAt: daysAgo(0),
    scanCount: 6,
  },
  {
    id: "plant_rose",
    nickname: "Rosenbeet",
    species: "Edelrose 'Nostalgie'",
    latinName: "Rosa hybrida",
    photoUrl:
      "https://upload.wikimedia.org/wikipedia/commons/4/47/Rosa_%27Mme_Caroline_Testout%27.jpg",
    addedAt: daysAgo(710),
    zoneLabel: "Terrasse",
    healthStatus: "CRITICAL",
    lastScanAt: daysAgo(1),
    scanCount: 9,
  },
  {
    id: "plant_tomate",
    nickname: "Tomaten Hochbeet",
    species: "Harzfeuer",
    latinName: "Solanum lycopersicum",
    photoUrl:
      "https://upload.wikimedia.org/wikipedia/commons/f/f3/Tomatoes-on-the-bush.jpg",
    addedAt: daysAgo(28),
    zoneLabel: "Hochbeet Nord",
    healthStatus: "HEALTHY",
    lastScanAt: daysAgo(5),
    scanCount: 3,
  },
  {
    id: "plant_lavendel",
    nickname: "Lavendelhecke",
    species: "Echter Lavendel",
    latinName: "Lavandula angustifolia",
    photoUrl:
      "https://upload.wikimedia.org/wikipedia/commons/7/7e/Single_lavender_flower02.jpg",
    addedAt: daysAgo(532),
    zoneLabel: "Südseite",
    healthStatus: "HEALTHY",
    lastScanAt: daysAgo(14),
    scanCount: 4,
  },
  {
    id: "plant_apfel",
    nickname: "Apfelbaum",
    species: "Boskoop",
    latinName: "Malus domestica",
    photoUrl:
      "https://upload.wikimedia.org/wikipedia/commons/1/18/12-28-2023_Schone_van_Boskoop_3.jpg",
    addedAt: daysAgo(2190),
    zoneLabel: "Hinterer Garten",
    healthStatus: "RECOVERING",
    lastScanAt: daysAgo(21),
    scanCount: 12,
  },
  {
    id: "plant_basilikum",
    nickname: "Basilikum Küche",
    species: "Genoveser Basilikum",
    latinName: "Ocimum basilicum",
    photoUrl:
      "https://upload.wikimedia.org/wikipedia/commons/a/ae/Ocimum_basilicum_001.JPG",
    addedAt: daysAgo(45),
    zoneLabel: "Küchenfenster",
    healthStatus: "HEALTHY",
    lastScanAt: daysAgo(3),
    scanCount: 2,
  },
];

export const MOCK_TASKS: DailyTask[] = [
  {
    id: "t1",
    title: "Rosenknospen auf Blattläuse prüfen",
    description:
      "Gestern starken Befall entdeckt – heute nachkontrollieren und erneut abspritzen.",
    plantId: "plant_rose",
    plantName: "Rosenbeet",
    effort: "EASY",
    durationMin: 10,
    urgency: "IMMEDIATE",
    source: "SCAN",
  },
  {
    id: "t2",
    title: "Tomaten ausgeizen",
    description: "Wöchentliche Routine für beste Fruchtentwicklung.",
    plantId: "plant_tomate",
    plantName: "Tomaten Hochbeet",
    effort: "EASY",
    durationMin: 15,
    urgency: "THIS_WEEK",
    source: "SCAN",
  },
  {
    id: "t3",
    title: "Frostschutz vorbereiten",
    description:
      "Nacht zum Dienstag: -2°C angekündigt. Empfindliche Pflanzen abdecken.",
    effort: "MEDIUM",
    durationMin: 45,
    urgency: "THIS_WEEK",
    source: "WEATHER",
  },
  {
    id: "t4",
    title: "Hortensie mit Milchlösung behandeln",
    description: "Zweite Anwendung gegen Mehltau (1:9 Milch-Wasser).",
    plantId: "plant_hortensie",
    plantName: "Hortensie am Zaun",
    effort: "EASY",
    durationMin: 20,
    urgency: "THIS_WEEK",
    source: "SCAN",
  },
  {
    id: "t5",
    title: "Lavendel zurückschneiden",
    description:
      "Frühjahrsschnitt: Ein Drittel ins mehrjährige Holz für dichten Wuchs.",
    plantId: "plant_lavendel",
    plantName: "Lavendelhecke",
    effort: "MEDIUM",
    durationMin: 30,
    urgency: "THIS_WEEK",
    source: "SEASONAL",
  },
];

export const MOCK_WEATHER: WeatherSnapshot = {
  tempC: 14,
  condition: "Leicht bewölkt",
  icon: "cloud",
  alert: {
    type: "frost",
    message: "Leichter Nachtfrost bis -2°C am Dienstag",
    inHours: 38,
  },
};
