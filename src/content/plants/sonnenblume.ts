import type { ContentEntry } from "@/domain/types";
import { CONTENT_VERSION, SOURCES } from "../_shared";

export const sonnenblume: ContentEntry = {
  id: "plant_sonnenblume",
  category: "PLANT",
  name: "Sonnenblume",
  scientificName: "Helianthus annuus",
  aliases: ["Gewöhnliche Sonnenblume", "Common sunflower"],
  description:
    "Der Klassiker für Kinder und Einsteiger: aus einem Korn wird in wenigen Monaten eine bis zu drei Meter hohe Pflanze. Einjährig, blüht von Juli bis September und ist Nahrungsquelle für Bienen sowie – über die Samen – für Vögel. Junge Pflanzen sind bei Schnecken sehr beliebt.",
  traits: [
    "Hoher, aufrechter, rauhaariger Stängel, je nach Sorte 0,5–3 m",
    "Große, herzförmige, raue Blätter",
    "Großer gelber Blütenkorb aus vielen Einzelblüten",
    "Junge Blütenköpfe folgen dem Sonnenstand (Heliotropismus)",
    "Reife Körbe voller nahrhafter Kerne",
  ],
  significance: "BENEFIT",
  defaultUrgency: "GONE",
  habitat: "Vollsonnig, windgeschützt, nährstoffreicher tiefgründiger Boden",
  seasons: ["SUMMER", "AUTUMN"],
  areas: ["GARDEN", "BED", "POTS"],
  confusionRisk: [
    {
      name: "Topinambur (Helianthus tuberosus)",
      note: "Naher Verwandter, aber mehrjährig mit kleineren Blüten und essbaren Knollen – breitet sich stark aus.",
    },
    {
      name: "Stauden-Sonnenblume (Helianthus decapetalus)",
      note: "Mehrjährig und deutlich kleinblütiger; kommt jedes Jahr wieder, statt neu ausgesät zu werden.",
    },
  ],
  safety: {
    toxicToChildren: false,
    toxicToPets: [],
    allergyRisk: true,
    invasive: false,
    notes:
      "Ungiftig und kinderfreundlich; die Kerne sind essbar. Der reichlich produzierte Pollen kann bei Pollenallergikern Beschwerden auslösen; einige Menschen reagieren empfindlich auf die rauen Blatthaare.",
  },
  methods: [
    {
      id: "m_sonnenblume_aussaat",
      type: "CULTURAL",
      style: ["ORGANIC", "BALANCED", "EFFECTIVE"],
      title: "Direkt aussäen und Schnecken abwehren",
      description:
        "Sonnenblumen keimen schnell und zuverlässig direkt im Beet. Die zarten Keimlinge sind aber ein Lieblingsfraß von Schnecken.",
      steps: [
        "Ab Ende April/Mai 2–3 cm tief direkt an den endgültigen Standort säen",
        "Junge Keimlinge mit Schneckenkragen oder Absammeln schützen",
        "Auf 40–60 cm Abstand vereinzeln",
        "Hohe Sorten frühzeitig an einem Stab anbinden",
      ],
      effort: "EASY",
      durationMin: 20,
      timeframe: "SEASONAL",
      ecoScore: 5,
      successRate: "HIGH",
      minExperience: "BEGINNER",
      safeForChildren: true,
      safeForPets: true,
      costEur: "€",
    },
    {
      id: "m_sonnenblume_vogelfutter",
      type: "CULTURAL",
      style: ["ORGANIC"],
      title: "Samen für Vögel stehen lassen",
      description:
        "Statt die verblühten Köpfe abzuschneiden, kann man sie als natürliches Vogelfutter über den Herbst und Winter stehen lassen.",
      steps: [
        "Blütenköpfe nach der Blüte an der Pflanze ausreifen lassen",
        "Für die eigene Ernte reife Köpfe abschneiden und trocken aufhängen",
        "Einzelne Köpfe im Beet als Winterfutter für Meisen und Finken belassen",
        "Umgefallene reife Samen im Frühjahr entfernen, wenn keine Selbstaussaat gewünscht ist",
      ],
      effort: "EASY",
      durationMin: 10,
      timeframe: "SEASONAL",
      ecoScore: 5,
      successRate: "HIGH",
      minExperience: "BEGINNER",
      safeForChildren: true,
      safeForPets: true,
      costEur: "€",
    },
  ],
  prevention: [
    "Keimlinge konsequent vor Schnecken schützen – das ist die kritische Phase.",
    "Hohe Sorten windgeschützt pflanzen und rechtzeitig anbinden.",
    "Fruchtfolge beachten: nicht jedes Jahr an dieselbe Stelle säen.",
    "Verblühte Köpfe als Vogelfutter nutzen statt entsorgen.",
  ],
  sources: [SOURCES.NABU, SOURCES.GPP, SOURCES.BZL],
  contentConfidence: "HIGH",
  version: CONTENT_VERSION,
  imageUrl:
    "https://upload.wikimedia.org/wikipedia/commons/d/d7/Sunflower_macro_wide.jpg",
};
