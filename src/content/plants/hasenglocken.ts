import type { ContentEntry } from "@/domain/types";
import { CONTENT_VERSION, SOURCES } from "../_shared";

export const hasenglocken: ContentEntry = {
  id: "plant_hasenglocken",
  category: "PLANT",
  name: "Hasenglöckchen",
  scientificName: "Hyacinthoides non-scripta",
  aliases: ["Englisches Hasenglöckchen", "Spanisches Hasenglöckchen", "Bluebell"],
  description:
    "Frühlingsblüher mit nickenden blauvioletten Glockenblüten. Beliebt für naturnahe Gärten und schattige Beete unter Laubgehölzen. Stark wuchernd – wenn er sich einmal etabliert hat, verbreitet er sich über Tochterzwiebeln und Samen.",
  traits: [
    "Schmale, grasartige Grundblätter",
    "Blütentrieb 20–40 cm, mit 6–12 nickenden Blüten",
    "Blütenfarbe meist tiefblau bis violett, selten weiß oder rosa",
    "Blütezeit April bis Mai",
    "Bildet nach der Blüte unauffällige Samenkapseln",
  ],
  significance: "BENEFIT",
  defaultUrgency: "GONE",
  habitat: "Halbschatten unter Laubgehölzen, humoser frischer Boden",
  seasons: ["SPRING"],
  areas: ["GARDEN", "BED"],
  confusionRisk: [
    {
      name: "Spanisches Hasenglöckchen (Hyacinthoides hispanica)",
      note: "Aufrechtere Blütenrispe, kräftigere Pflanze. Hybridisiert leicht mit der englischen Form (Bastard-Hasenglöckchen).",
    },
    {
      name: "Traubenhyazinthe (Muscari)",
      note: "Dichtere Blütenrispe, kleinere kugelige Einzelblüten – Hasenglöckchen sind glockig und lockerer.",
    },
  ],
  safety: {
    toxicToChildren: true,
    toxicToPets: ["DOG", "CAT"],
    allergyRisk: false,
    invasive: true,
    notes:
      "Alle Pflanzenteile sind giftig (Glykoside). Vor allem Zwiebeln werden manchmal mit Speisezwiebeln verwechselt. Verzehr führt zu Übelkeit und Herz-Rhythmus-Störungen.",
  },
  methods: [
    {
      id: "m_hasenglocken_pflege",
      type: "CULTURAL",
      style: ["ORGANIC", "BALANCED"],
      title: "Verblühtes stehen lassen",
      description:
        "Damit die Zwiebel sich für nächstes Jahr stärken kann, dürfen die Blätter erst nach dem Vergilben entfernt werden.",
      steps: [
        "Verblühte Blütenstände abschneiden, um Selbstaussaat zu verhindern",
        "Laub stehenlassen, bis es vollständig gelb und trocken ist (Juni)",
        "Nicht abrasenmähen, solange Blätter grün sind",
        "Bei Bedarf nach Vergilben mulchen",
      ],
      effort: "EASY",
      durationMin: 10,
      timeframe: "SEASONAL",
      ecoScore: 5,
      successRate: "HIGH",
      minExperience: "BEGINNER",
      safeForChildren: false,
      safeForPets: true,
      costEur: "€",
    },
    {
      id: "m_hasenglocken_eindaemmen",
      type: "MECHANICAL",
      style: ["ORGANIC", "EFFECTIVE"],
      title: "Ausbreitung eindämmen",
      description:
        "Wenn der Bestand zu dicht wird, hilft nur Ausgraben einzelner Horste. Ausstechen reicht meist nicht.",
      steps: [
        "Spätsommer/Herbst, wenn das Laub eingezogen ist",
        "Mit Grabegabel Zwiebeln großzügig ausstechen",
        "Boden sieben – auch kleine Tochterzwiebeln gehen sonst wieder an",
        "Aushub in den Restmüll, nicht auf den Kompost",
      ],
      effort: "HARD",
      durationMin: 90,
      timeframe: "SEASONAL",
      ecoScore: 4,
      successRate: "MEDIUM",
      minExperience: "INTERMEDIATE",
      safeForChildren: false,
      safeForPets: true,
      costEur: "€",
    },
  ],
  prevention: [
    "Standort bewusst wählen: schwer zurückzudrängen, wenn er sich etabliert hat.",
    "Zwiebeln deutlich getrennt von Speisepflanzen kennzeichnen oder pflanzen.",
    "Verblühtes konsequent abschneiden, wenn Selbstaussaat nicht erwünscht ist.",
    "Bei Spanischem Hasenglöckchen oder Hybriden: Ausbreitung früh überwachen.",
  ],
  sources: [SOURCES.NABU, SOURCES.GPP],
  contentConfidence: "MEDIUM",
  version: CONTENT_VERSION,
  imageUrl:
    "https://upload.wikimedia.org/wikipedia/commons/1/1b/Hyacinthoides_non-scripta_002.jpg",
};
