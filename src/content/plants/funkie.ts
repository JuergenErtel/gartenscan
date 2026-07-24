import type { ContentEntry } from "@/domain/types";
import { CONTENT_VERSION, SOURCES } from "../_shared";

export const funkie: ContentEntry = {
  id: "plant_funkie",
  category: "PLANT",
  name: "Funkie",
  scientificName: "Hosta",
  aliases: ["Herzblattlilie", "Hosta", "Plantain lily"],
  description:
    "Die Blattschmuck-Staude für den Schatten: prägt mit üppigen, oft panaschierten Blattpolstern schattige Beete unter Gehölzen. Pflegeleicht und langlebig – der einzige echte Gegner ist die Schnecke, die frische Austriebe regelrecht durchlöchert.",
  traits: [
    "Horstige Staude mit großen, herzförmigen bis lanzettlichen Blättern",
    "Blattfarben von blaugrün über gelb bis weiß-grün panaschiert",
    "Trichterförmige weiße oder violette Blüten an hohen Stielen im Sommer",
    "Zieht im Herbst ein und treibt im Frühjahr neu aus",
    "Wird mit den Jahren zu breiten, dichten Horsten",
  ],
  significance: "BENEFIT",
  defaultUrgency: "GONE",
  habitat: "Halbschatten bis Schatten, humoser, frischer, nährstoffreicher Boden",
  seasons: ["SPRING", "SUMMER"],
  areas: ["GARDEN", "BED", "POTS"],
  confusionRisk: [
    {
      name: "Bergenie (Bergenia)",
      note: "Ebenfalls große Blätter für schattige Beete, aber immergrün und lederartig statt sommergrün.",
    },
    {
      name: "Wegerich (Plantago)",
      note: "Rosettige Blätter ähneln jungen Funkien; Wegerich wächst jedoch wild und flacher.",
    },
  ],
  safety: {
    toxicToChildren: false,
    toxicToPets: ["DOG", "CAT"],
    allergyRisk: false,
    invasive: false,
    notes:
      "Für Menschen ungiftig. Funkien enthalten Saponine und gelten als giftig für Hunde und Katzen – Verzehr kann Erbrechen und Durchfall auslösen.",
  },
  methods: [
    {
      id: "m_funkie_schnecken",
      type: "MECHANICAL",
      style: ["ORGANIC", "EFFECTIVE"],
      title: "Schnecken vom Austrieb fernhalten",
      description:
        "Funkien sind der Lieblingsfraß von Schnecken. Wer die frischen Triebe im Frühjahr schützt, hat den ganzen Sommer schöne Blätter.",
      steps: [
        "Ab dem ersten Austrieb im Frühjahr täglich auf Fraßspuren kontrollieren",
        "Schnecken morgens und abends absammeln",
        "Barriere aus Schneckenkorn (Eisen-III-Phosphat), Schafwolle oder Schneckenkragen anlegen",
        "Blaulaubige und dickblättrige Sorten wählen – sie werden weniger befressen",
      ],
      effort: "MEDIUM",
      durationMin: 15,
      timeframe: "THIS_WEEK",
      ecoScore: 4,
      successRate: "MEDIUM",
      minExperience: "BEGINNER",
      safeForChildren: true,
      safeForPets: true,
      costEur: "€",
    },
    {
      id: "m_funkie_teilen",
      type: "CULTURAL",
      style: ["ORGANIC", "BALANCED"],
      title: "Horste teilen und vermehren",
      description:
        "Alle paar Jahre lassen sich große Horste teilen – das verjüngt die Pflanze und liefert kostenlose neue Funkien.",
      steps: [
        "Im Frühjahr beim Austrieb oder im Herbst nach dem Einziehen teilen",
        "Horst mit dem Spaten ausstechen und in Stücke mit je mehreren Austriebsknospen trennen",
        "Teilstücke sofort wieder in humose Erde setzen und gut angießen",
        "In den ersten Wochen gleichmäßig feucht halten",
      ],
      effort: "MEDIUM",
      durationMin: 40,
      timeframe: "SEASONAL",
      ecoScore: 5,
      successRate: "HIGH",
      minExperience: "INTERMEDIATE",
      safeForChildren: true,
      safeForPets: true,
      costEur: "€",
    },
  ],
  prevention: [
    "Frischen Austrieb im Frühjahr konsequent vor Schnecken schützen.",
    "Boden humos und gleichmäßig feucht halten – Funkien vertragen keine Dauertrockenheit.",
    "Schattigen bis halbschattigen Standort wählen; pralle Sonne verbrennt die Blätter.",
    "Dickblättrige, blaulaubige Sorten sind robuster gegen Schneckenfraß.",
  ],
  sources: [SOURCES.GPP, SOURCES.NABU],
  contentConfidence: "HIGH",
  version: CONTENT_VERSION,
  imageUrl:
    "https://upload.wikimedia.org/wikipedia/commons/f/f9/Hosta_plantaginea_cv_Royal_Standard_1.jpg",
};
