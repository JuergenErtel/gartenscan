import type { ContentEntry } from "@/domain/types";
import { CONTENT_VERSION, SOURCES } from "../_shared";

export const apfel: ContentEntry = {
  id: "plant_apfel",
  category: "PLANT",
  name: "Apfel",
  scientificName: "Malus domestica",
  aliases: ["Kulturapfel", "Apfelbaum", "Apple"],
  description:
    "Der beliebteste Obstbaum in deutschen Gärten – vom Spalier am Balkon bis zum großen Streuobstbaum. Braucht in der Regel einen zweiten, gleichzeitig blühenden Apfel in der Nähe zur Befruchtung. Wichtigste Themen: Erziehungsschnitt, Schorf und Fruchtausdünnung.",
  traits: [
    "Sommergrüner Baum mit rundlicher, breiter Krone",
    "Weiß-rosa Blüten im April/Mai, insektenbestäubt",
    "Ovale, gezähnte Blätter",
    "Früchte je nach Sorte grün, gelb, rot – Reife Juli bis Oktober",
    "Als Busch, Spindel, Spalier oder Hochstamm erziehbar",
  ],
  significance: "BENEFIT",
  defaultUrgency: "GONE",
  habitat: "Sonnig, tiefgründiger, nährstoffreicher, nicht staunasser Boden",
  seasons: ["SPRING", "SUMMER", "AUTUMN"],
  areas: ["GARDEN", "BED"],
  confusionRisk: [
    {
      name: "Zierapfel (Malus-Zierformen)",
      note: "Botanisch nah verwandt, aber viel kleinere, oft nur dekorative Früchte.",
    },
    {
      name: "Birne (Pyrus communis)",
      note: "Ähnlicher Wuchs und Blüte; Blätter glänzender und Früchte länglich.",
    },
  ],
  safety: {
    toxicToChildren: false,
    toxicToPets: [],
    allergyRisk: true,
    invasive: false,
    notes:
      "Das Fruchtfleisch ist unbedenklich. Die Kerne enthalten Amygdalin (Blausäure) – in kleinen Mengen harmlos, größere Mengen zerkauter Kerne meiden. Äpfel können bei Birkenpollenallergikern eine Kreuzallergie auslösen.",
  },
  methods: [
    {
      id: "m_apfel_winterschnitt",
      type: "CULTURAL",
      style: ["ORGANIC", "BALANCED", "EFFECTIVE"],
      title: "Erziehungs- und Winterschnitt",
      description:
        "Ein luftiger, gut belichteter Kronenaufbau bringt mehr Ertrag und weniger Pilzbefall. Der Schnitt lenkt Wuchs und Fruchtholz.",
      steps: [
        "Hauptschnitt im Winter bei frostfreiem Wetter (Januar bis März)",
        "Totes, krankes und sich kreuzendes Holz entfernen",
        "Nach innen wachsende und steil aufrechte Wassertriebe herausnehmen",
        "Krone licht halten – der berühmte Hut soll hindurchpassen",
      ],
      effort: "MEDIUM",
      durationMin: 60,
      timeframe: "SEASONAL",
      ecoScore: 5,
      successRate: "HIGH",
      minExperience: "INTERMEDIATE",
      safeForChildren: true,
      safeForPets: true,
      costEur: "€",
    },
    {
      id: "m_apfel_ausduennen",
      type: "CULTURAL",
      style: ["ORGANIC", "BALANCED"],
      title: "Früchte ausdünnen",
      description:
        "Hängt zu viel Obst am Baum, bleiben die Äpfel klein und der Baum trägt im Folgejahr kaum (Alternanz). Ausdünnen bringt größere, gesündere Früchte.",
      steps: [
        "Im Juni nach dem natürlichen Fruchtfall überzählige Früchte entfernen",
        "Pro Fruchtbüschel nur die ein bis zwei kräftigsten Äpfel stehen lassen",
        "Beschädigte und einseitige Früchte zuerst herausbrechen",
        "Handbreit Abstand zwischen den verbleibenden Früchten anstreben",
      ],
      effort: "EASY",
      durationMin: 30,
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
    "Schorf-tolerante Sorten wählen (z. B. 'Topaz', 'Rewena', 'Florina').",
    "Krone luftig halten – trockenes Laub erkrankt seltener an Schorf und Mehltau.",
    "Fallobst und Falllaub aufsammeln, um Krankheits- und Schädlingskreisläufe zu unterbrechen.",
    "Für Ertrag eine zweite, gleichzeitig blühende Apfelsorte als Befruchter einplanen.",
  ],
  sources: [SOURCES.JKI, SOURCES.GPP, SOURCES.LFL],
  contentConfidence: "HIGH",
  version: CONTENT_VERSION,
  imageUrl:
    "https://upload.wikimedia.org/wikipedia/commons/1/15/Red_Apple.jpg",
};
