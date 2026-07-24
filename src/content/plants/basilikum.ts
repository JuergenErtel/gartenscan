import type { ContentEntry } from "@/domain/types";
import { CONTENT_VERSION, SOURCES } from "../_shared";

export const basilikum: ContentEntry = {
  id: "plant_basilikum",
  category: "PLANT",
  name: "Basilikum",
  scientificName: "Ocimum basilicum",
  aliases: ["Königskraut", "Basilie", "Sweet basil"],
  description:
    "Das beliebteste Küchenkraut auf Fensterbank und Balkon. Wärmeliebend und frostempfindlich. Der gekaufte Supermarkt-Topf hält oft nur kurz – mit richtiger Erntetechnik und weniger Wasser wird daraus eine buschige Dauerpflanze.",
  traits: [
    "Buschige, aufrechte Pflanze, 20–50 cm hoch",
    "Glänzende, ovale, aromatisch duftende Blätter",
    "Weiße oder violette Lippenblüten in Ähren",
    "Vierkantiger Stängel (typisch für Lippenblütler)",
    "Sorten von grün-großblättrig bis rotlaubig und feinblättrig",
  ],
  significance: "BENEFIT",
  defaultUrgency: "GONE",
  habitat: "Warm, vollsonnig, windgeschützt, humoser durchlässiger Boden",
  seasons: ["SUMMER"],
  areas: ["BALCONY", "TERRACE", "POTS", "BED", "GARDEN"],
  confusionRisk: [
    {
      name: "Strauchbasilikum (Ocimum × africanum, z. B. 'African Blue')",
      note: "Mehrjährig und robuster, würziger Duft mit Kampfernote; als Zier- und Bienenpflanze beliebt.",
    },
    {
      name: "Minze (Mentha)",
      note: "Ebenfalls vierkantiger Stängel und aromatisch, aber kühl-minziger Duft statt süßlich.",
    },
  ],
  safety: {
    toxicToChildren: false,
    toxicToPets: [],
    allergyRisk: false,
    invasive: false,
    notes:
      "Als Küchenkraut völlig unbedenklich für Menschen und Haustiere. Reagiert selbst aber sehr empfindlich auf Frost und Zugluft.",
  },
  methods: [
    {
      id: "m_basilikum_ernte",
      type: "CULTURAL",
      style: ["ORGANIC", "BALANCED", "EFFECTIVE"],
      title: "Richtig ernten – ganze Triebe statt Einzelblätter",
      description:
        "Wer nur einzelne Blätter zupft, schwächt die Pflanze. Schneidet man ganze Triebspitzen über einem Blattpaar, verzweigt sich Basilikum buschig.",
      steps: [
        "Triebspitzen knapp über einem Blattpaar abschneiden, nicht einzelne Blätter",
        "Aus der Schnittstelle wachsen zwei neue Triebe – die Pflanze wird buschiger",
        "Blütenknospen früh ausbrechen, sonst werden die Blätter bitter",
        "Regelmäßig ernten hält die Pflanze jung und produktiv",
      ],
      effort: "EASY",
      durationMin: 5,
      timeframe: "THIS_WEEK",
      ecoScore: 5,
      successRate: "HIGH",
      minExperience: "BEGINNER",
      safeForChildren: true,
      safeForPets: true,
      costEur: "€",
    },
    {
      id: "m_basilikum_giessen",
      type: "CULTURAL",
      style: ["ORGANIC", "BALANCED"],
      title: "Von unten gießen, nicht ertränken",
      description:
        "Die häufigste Todesursache beim Supermarkt-Basilikum ist Staunässe. Zu enge, überwässerte Töpfe faulen an der Wurzel.",
      steps: [
        "Dicht gesäten Supermarkt-Topf teilen und in mehrere Töpfe umsetzen",
        "Von unten über den Untersetzer gießen, überschüssiges Wasser abgießen",
        "Erst gießen, wenn die obere Erdschicht angetrocknet ist",
        "Warmen, hellen Standort ohne kalte Zugluft wählen",
      ],
      effort: "EASY",
      durationMin: 10,
      timeframe: "THIS_WEEK",
      ecoScore: 5,
      successRate: "HIGH",
      minExperience: "BEGINNER",
      safeForChildren: true,
      safeForPets: true,
      costEur: "€",
    },
  ],
  prevention: [
    "Nicht überwässern – Staunässe und Zugluft sind die häufigsten Ursachen für Ausfälle.",
    "Blüten früh ausbrechen, damit die Blätter aromatisch und weich bleiben.",
    "Erst nach den Eisheiligen (Mitte Mai) nach draußen stellen – Basilikum verträgt keinen Frost.",
    "Feuchte, ungelüftete Anzuchttöpfe fördern Trauermücken; Erde antrocknen lassen.",
  ],
  sources: [SOURCES.BZL, SOURCES.GPP],
  contentConfidence: "HIGH",
  version: CONTENT_VERSION,
  imageUrl:
    "https://upload.wikimedia.org/wikipedia/commons/3/32/Ocimum_Basilicum_leaf_lighted_by_the_left.jpg",
};
