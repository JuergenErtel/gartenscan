import type { ContentEntry } from "@/domain/types";
import { CONTENT_VERSION, SOURCES } from "../_shared";

export const giersch: ContentEntry = {
  id: "weed_giersch",
  category: "WEED",
  name: "Giersch",
  scientificName: "Aegopodium podagraria",
  aliases: ["Geißfuß", "Zipperleinskraut", "Dreiblatt"],
  description:
    "Der wohl gefürchtetste Unkraut-Gegner im Hausgarten. Treibt aus tiefen, verzweigten Ausläufern immer wieder aus und ist nur mit konsequenter Arbeit zurückzudrängen. Gleichzeitig: essbar, vitaminreich, historisch als Heilpflanze geschätzt.",
  traits: [
    "Dreigeteilte, wiederum dreigeteilte Blätter (9 Blattteile)",
    "Weiße Doldenblüten im Juni–Juli (ähnlich Wilde Möhre)",
    "Stängel dreikantig im Querschnitt (eindeutiges Erkennungsmerkmal)",
    "Ausläufer (Rhizome) bis 40 cm tief",
    "Explosive Ausbreitung über Wurzelstücke",
  ],
  significance: "HARMFUL",
  defaultUrgency: "THIS_WEEK",
  habitat:
    "Halbschattige Gärten, unter Sträuchern, an Zäunen – nährstoffreiche, leicht feuchte Böden",
  seasons: ["SPRING", "SUMMER", "AUTUMN"],
  areas: ["GARDEN", "BED"],
  confusionRisk: [
    {
      name: "Hundspetersilie (Aethusa cynapium)",
      note: "GIFTIG. Runder Stängel, unangenehmer Geruch beim Zerreiben – Giersch riecht möhrenartig.",
    },
    {
      name: "Wiesenkerbel (Anthriscus sylvestris)",
      note: "Fein gefiederte Blätter, wird höher, blüht früher.",
    },
  ],
  safety: {
    toxicToChildren: false,
    toxicToPets: [],
    allergyRisk: false,
    invasive: true,
    notes:
      "Junge Blätter sind essbar und werden wie Spinat verwendet. Wichtig: Verwechslung mit giftiger Hundspetersilie ausschließen – bei Unsicherheit nicht verzehren.",
  },
  methods: [
    {
      id: "m_ausgraben",
      type: "MECHANICAL",
      style: ["ORGANIC", "BALANCED", "EFFECTIVE"],
      title: "Konsequent ausgraben – Wurzeln komplett entfernen",
      description:
        "Die einzige nachhaltige Methode. Jedes zurückbleibende Rhizomstück von 1 cm treibt neu aus. Braucht Geduld über 2–3 Saisons.",
      steps: [
        "Boden großflächig anfeuchten und lockern (Grabegabel)",
        "Mit Gartenhandschuhen und Gabel alle sichtbaren Wurzelstränge freilegen",
        "Rhizome langsam und komplett aus dem Boden ziehen – nicht abreißen",
        "Boden sieben oder Wurzelreste gezielt absuchen",
        "Alle 3–4 Wochen wiederholen, bis keine Neuaustriebe mehr kommen",
        "Entfernte Wurzeln NICHT kompostieren – in Restmüll oder trocknen lassen",
      ],
      effort: "HARD",
      durationMin: 120,
      timeframe: "NOW",
      ecoScore: 5,
      successRate: "MEDIUM",
      minExperience: "INTERMEDIATE",
      safeForChildren: true,
      safeForPets: true,
      costEur: "€",
    },
    {
      id: "m_lichtabschluss",
      type: "CULTURAL",
      style: ["ORGANIC", "BALANCED"],
      title: "Lichtabschluss mit schwarzer Folie",
      description:
        "Großflächigen Giersch-Befall durch komplette Verdunkelung über 1–2 Jahre zurückdrängen. Für Beete, die sowieso neu angelegt werden.",
      steps: [
        "Betroffene Fläche oberirdisch abmähen",
        "Mit schwarzer Mulchfolie oder Pappe flächig abdecken",
        "Mit Erde, Mulch oder Steinen beschweren, Licht komplett ausschließen",
        "Mindestens 12 Monate, besser 18–24 Monate abdecken",
        "Beim Abnehmen Boden prüfen und Restwurzeln entfernen",
      ],
      effort: "MEDIUM",
      durationMin: 180,
      timeframe: "SEASONAL",
      ecoScore: 3,
      successRate: "HIGH",
      minExperience: "BEGINNER",
      safeForChildren: true,
      safeForPets: true,
      costEur: "€€",
      ingredients: ["Schwarze Mulchfolie oder dicke Pappe (unbedruckt)"],
    },
    {
      id: "m_essen",
      type: "CULTURAL",
      style: ["ORGANIC"],
      title: "Giersch nutzen statt bekämpfen",
      description:
        "Junge Blätter im Frühjahr sind vitamin-C-reich, schmecken wie milde Petersilie. Regelmäßige Ernte schwächt die Pflanze ebenfalls.",
      steps: [
        "Ab März junge, hellgrüne Blätter sammeln",
        "Stängel und ältere Blätter vermeiden",
        "In Salaten, Smoothies, Pesto oder wie Spinat verwenden",
        "Vor dem Verzehr sicher identifizieren (dreikantiger Stängel!)",
      ],
      effort: "EASY",
      durationMin: 15,
      timeframe: "SEASONAL",
      ecoScore: 5,
      successRate: "LOW",
      minExperience: "INTERMEDIATE",
      safeForChildren: true,
      safeForPets: true,
      costEur: "€",
    },
  ],
  prevention: [
    "Bei Neupflanzungen Wurzelsperren (30 cm tief) setzen, um Einwandern zu verhindern.",
    "Angrenzende Bereiche regelmäßig kontrollieren – Giersch wandert unterirdisch.",
    "Neue Erde und Substrate auf Wurzelstücke prüfen, bevor sie eingebracht werden.",
    "Kleine Herde sofort ausgraben – je früher, desto besser.",
  ],
  sources: [SOURCES.JKI, SOURCES.GPP],
  contentConfidence: "HIGH",
  version: CONTENT_VERSION,
  imageUrl:
    "https://upload.wikimedia.org/wikipedia/commons/2/20/Naat.IMG_4264.JPG",
};
