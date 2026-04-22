import type { CoachMessage } from "@/lib/types";

export const COACH_SUGGESTIONS = [
  "Stell mir einen 7-Tage-Plan fuer Rose und Hortensie zusammen",
  "Welche Loesung ist bio und haustierfreundlich?",
  "Was sollte ich heute sofort kontrollieren?",
  "Welche Massnahme ist am schnellsten wirksam?",
  "Woran erkenne ich, dass es schlimmer wird?",
  "Welche Fehler sollte ich jetzt vermeiden?",
];

export const COACH_INITIAL: CoachMessage[] = [
  {
    id: "m0",
    role: "assistant",
    content:
      "Ich sehe zwei offene Themen: Blattlaeuse an deiner Rose und erste Mehltau-Zeichen an der Hortensie. Wenn du willst, priorisiere ich dir jetzt die naechsten 7 Tage nach Wirkung, Aufwand und Haustierfreundlichkeit.",
    createdAt: new Date(),
    citations: ["plant_rose", "plant_hortensie"],
  },
];

export const COACH_RESPONSES: { keywords: string[]; response: string }[] = [
  {
    keywords: ["7-tage-plan", "7 tage", "plan", "priorisiere"],
    response:
      "So wuerde ich priorisieren: 1. Heute die Rose abspritzen und junge Triebe kontrollieren. 2. Morgen befallene Hortensienblaetter entfernen. 3. In 2 bis 3 Tagen beide Pflanzen nachkontrollieren. 4. Diese Woche nur eine Folgemassnahme nachlegen, nicht wahllos mischen. Wenn du willst, breche ich dir das noch auf Morgen, Wochenende und naechste Woche runter.",
  },
  {
    keywords: ["bio", "haustier", "haustierfreundlich", "kinder"],
    response:
      "Dann faellt alles raus, was fuer Tiere oder Kinder unruhig macht. Fuer Blattlaeuse zuerst Wasserstrahl, danach Schmierseife. Fuer Mehltau zuerst befallene Blaetter entfernen, danach Milch-Wasser-Loesung. Neem oder staerkere Mittel nur, wenn der Befall weiter steigt und der Bereich sicher abgesperrt werden kann.",
  },
  {
    keywords: ["heute", "sofort", "kontrollieren"],
    response:
      "Heute wuerde ich drei Dinge anschauen: 1. Blattunterseiten und Knospen an den Rosen. 2. Frische weisse Belaege an jungen Hortensienblaettern. 3. Wetter fuer die kommenden 48 Stunden, weil Feuchte und Temperatur entscheiden, ob du nur beobachtest oder sofort nachlegst.",
  },
  {
    keywords: ["schnell", "wirksam", "schnellsten"],
    response:
      "Die schnellste Wirkung bringt meist die mechanische Sofortmassnahme: Wasserstrahl bei Blattlaeusen, Entfernen befallener Blaetter bei Mehltau, Ausstechen bei Loewenzahn. Das wirkt nicht immer vollstaendig, aber es reduziert den Druck sofort. Danach entscheidest du erst, ob eine zweite Runde noetig ist.",
  },
  {
    keywords: ["schlimmer", "eskaliert", "warnzeichen"],
    response:
      "Warnzeichen fuer Eskalation sind: neuer Befall an frischen Trieben, klebriger Honigtau, ausbreitende Belaege, eingerollte Blaetter oder sichtbarer Schaden trotz erster Massnahme. Sobald du merkst, dass es in 2 bis 4 Tagen nicht stagniert, brauchst du Stufe zwei statt nur Beobachtung.",
  },
  {
    keywords: ["fehler", "vermeiden"],
    response:
      "Die typischen Fehler sind immer dieselben: zu spaet handeln, drei Mittel gleichzeitig mischen, in praller Sonne spruehen, Folgekontrolle vergessen und aus Bequemlichkeit zu aggressiv werden. Der beste Weg ist meistens: erst Druck rausnehmen, dann eine klare zweite Option waehlen.",
  },
];

export function findCoachResponse(query: string): string {
  const lower = query.toLowerCase();
  const match = COACH_RESPONSES.find((response) =>
    response.keywords.some((keyword) => lower.includes(keyword))
  );

  if (match) return match.response;

  return "Dafuer brauche ich etwas mehr Kontext. Sag mir, welche Pflanze betroffen ist, wie stark das Problem schon ist und ob du eher bio, schnell oder haustierfreundlich vorgehen willst. Dann antworte ich deutlich konkreter.";
}
