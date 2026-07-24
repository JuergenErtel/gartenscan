import type { ContentEntry } from "@/domain/types";
import { CONTENT_VERSION, SOURCES } from "../_shared";

export const erdbeere: ContentEntry = {
  id: "plant_erdbeere",
  category: "PLANT",
  name: "Erdbeere",
  scientificName: "Fragaria × ananassa",
  aliases: ["Gartenerdbeere", "Ananas-Erdbeere", "Garden strawberry"],
  description:
    "Die beliebteste Nasch-Frucht im Garten, im Beet, Hochbeet, Balkonkasten und in der Ampel. Mehrjährig, aber nach 3 Jahren nachlassend – deshalb regelmäßig über Ableger verjüngen. Reagiert empfindlich auf Grauschimmel bei feuchtem Wetter.",
  traits: [
    "Niedrige Staude mit dreiteiligen, gezähnten Blättern",
    "Weiße Blüten mit gelbem Zentrum",
    "Bildet lange Ausläufer mit Tochterpflanzen",
    "Rote Sammelnussfrüchte mit außen sitzenden Samen (Nüsschen)",
    "Einmaltragende und immertragende Sorten",
  ],
  significance: "BENEFIT",
  defaultUrgency: "GONE",
  habitat: "Sonnig, humoser, durchlässiger, gleichmäßig feuchter Boden",
  seasons: ["SPRING", "SUMMER"],
  areas: ["GARDEN", "BED", "BALCONY", "TERRACE", "POTS"],
  confusionRisk: [
    {
      name: "Indische Scheinerdbeere (Potentilla indica)",
      note: "Sehr ähnliche Frucht, aber gelbe Blüten und fade, aufrecht stehende Beeren – essbar, aber geschmacklos.",
    },
    {
      name: "Walderdbeere (Fragaria vesca)",
      note: "Kleinere, sehr aromatische Früchte; wächst wild und deutlich zierlicher.",
    },
  ],
  safety: {
    toxicToChildren: false,
    toxicToPets: [],
    allergyRisk: true,
    invasive: false,
    notes:
      "Früchte sind unbedenklich und für Kinder und Haustiere ungiftig. Erdbeeren zählen zu den häufigeren Auslösern pseudoallergischer Reaktionen (Ausschlag, Juckreiz) bei empfindlichen Personen.",
  },
  methods: [
    {
      id: "m_erdbeere_ableger",
      type: "CULTURAL",
      style: ["ORGANIC", "BALANCED", "EFFECTIVE"],
      title: "Über Ableger verjüngen",
      description:
        "Erdbeeren lassen im Ertrag ab dem dritten Jahr deutlich nach. Aus kräftigen Ausläufern zieht man kostenlos junge Pflanzen für ein neues Beet.",
      steps: [
        "Im Juni/Juli die ersten, kräftigsten Tochterpflanzen an den Ausläufern auswählen",
        "Tochterpflanze in einen eingegrabenen Topf mit Erde leiten und antönen lassen",
        "Nach der Bewurzelung (ca. 4 Wochen) von der Mutterpflanze trennen",
        "Ab August an neuen, nicht mit Erdbeeren vorbelasteten Standort setzen",
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
      id: "m_erdbeere_stroh",
      type: "CULTURAL",
      style: ["ORGANIC", "BALANCED", "EFFECTIVE"],
      title: "Mit Stroh gegen Fäulnis mulchen",
      description:
        "Liegen die Früchte auf feuchter Erde, faulen sie und werden von Grauschimmel befallen. Eine Strohunterlage hält sie sauber und trocken.",
      steps: [
        "Kurz vor dem Abreifen Stroh unter die Fruchtstände legen",
        "Für gute Luftzirkulation ausreichend Pflanzabstand (25–30 cm) halten",
        "Bodennah und morgens gießen, nie über Blätter und Früchte",
        "Faule oder befallene Früchte sofort entfernen",
      ],
      effort: "EASY",
      durationMin: 15,
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
    "Standort alle 3–4 Jahre wechseln (Fruchtwechsel gegen Bodenmüdigkeit und Pilze).",
    "Luftig pflanzen und morgens bodennah gießen – beugt Grauschimmel vor.",
    "Reife Früchte zügig ernten; Fäulnisherde sofort entfernen.",
    "Netz gegen Vögel und Barrieren gegen Schnecken einplanen.",
  ],
  sources: [SOURCES.BZL, SOURCES.GPP, SOURCES.LFL],
  contentConfidence: "HIGH",
  version: CONTENT_VERSION,
  imageUrl:
    "https://upload.wikimedia.org/wikipedia/commons/4/4c/Garden_strawberry_%28Fragaria_%C3%97_ananassa%29_single2.jpg",
};
