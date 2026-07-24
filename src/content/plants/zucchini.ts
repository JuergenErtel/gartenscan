import type { ContentEntry } from "@/domain/types";
import { CONTENT_VERSION, SOURCES } from "../_shared";

export const zucchini: ContentEntry = {
  id: "plant_zucchini",
  category: "PLANT",
  name: "Zucchini",
  scientificName: "Cucurbita pepo",
  aliases: ["Gartenkürbis", "Courgette", "Zucchino"],
  description:
    "Anfängerfreundliches Fruchtgemüse mit riesigem Ertrag – eine einzige Pflanze versorgt oft eine ganze Familie. Braucht Sonne, Nährstoffe und viel Wasser. Wichtige Themen: regelmäßig ernten, Echten Mehltau vorbeugen und niemals bitter schmeckende Früchte essen.",
  traits: [
    "Kräftige, buschige oder rankende Pflanze mit großen, rauen Blättern",
    "Große gelbe, essbare Trichterblüten (getrennt männlich/weiblich)",
    "Längliche grüne, gelbe oder gestreifte Früchte",
    "Schnellwüchsig, Früchte in wenigen Tagen erntereif",
    "Hohler, kantiger Stängel",
  ],
  significance: "BENEFIT",
  defaultUrgency: "GONE",
  habitat: "Vollsonnig, humusreich, nährstoffreich, gleichmäßig feucht",
  seasons: ["SPRING", "SUMMER", "AUTUMN"],
  areas: ["GARDEN", "BED", "POTS"],
  confusionRisk: [
    {
      name: "Zierkürbis (Cucurbita pepo, Zierformen)",
      note: "Sieht der Zucchini ähnlich, enthält aber bittere, GIFTIGE Cucurbitacine. Niemals zusammen aussäen – Rückkreuzung möglich.",
    },
    {
      name: "Gurke (Cucumis sativus)",
      note: "Junge Pflanzen ähneln sich; Gurkenblätter kleiner, Früchte mit typischer Gurkenschale.",
    },
  ],
  safety: {
    toxicToChildren: false,
    toxicToPets: [],
    allergyRisk: false,
    invasive: false,
    notes:
      "Normale Zucchini sind unbedenklich. WICHTIG: Bitter schmeckende Früchte enthalten giftige Cucurbitacine und dürfen nicht gegessen werden – schon ein Bissen kann Erbrechen und Durchfall auslösen. Bitterkeit tritt vor allem bei selbst gewonnenem Saatgut und Hitzestress auf.",
  },
  methods: [
    {
      id: "m_zucchini_ernte",
      type: "CULTURAL",
      style: ["ORGANIC", "BALANCED", "EFFECTIVE"],
      title: "Jung und regelmäßig ernten",
      description:
        "Je öfter geerntet wird, desto mehr Früchte bildet die Pflanze. Riesenzucchini schmecken fade und bremsen den Nachschub.",
      steps: [
        "Früchte bei 15–20 cm Länge mit dem Messer abschneiden",
        "Alle 2–3 Tage kontrollieren – Zucchini wachsen extrem schnell",
        "Auch die essbaren Blüten können geerntet werden",
        "Überreife Früchte entfernen, damit die Pflanze weiterträgt",
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
    {
      id: "m_zucchini_mehltau",
      type: "CULTURAL",
      style: ["ORGANIC", "BALANCED"],
      title: "Echten Mehltau vorbeugen",
      description:
        "Der weiße, mehlige Belag auf den Blättern kommt fast jedes Jahr im Spätsommer. Standort und Gießtechnik verzögern ihn deutlich.",
      steps: [
        "Ausreichend Abstand (mind. 1 m) für Luftzirkulation halten",
        "Immer bodennah gießen, nie über die Blätter",
        "Morgens gießen, damit Laub tagsüber abtrocknet",
        "Erste stark befallene Blätter entfernen; die Pflanze trägt trotzdem weiter",
      ],
      effort: "EASY",
      durationMin: 15,
      timeframe: "SEASONAL",
      ecoScore: 5,
      successRate: "MEDIUM",
      minExperience: "BEGINNER",
      safeForChildren: true,
      safeForPets: true,
      costEur: "€",
    },
  ],
  prevention: [
    "Nur gekauftes Saatgut verwenden oder selbst gewonnene Samen konsequent bitter-prüfen.",
    "Nie neben Zierkürbissen anbauen – Rückkreuzung kann bittere, giftige Früchte erzeugen.",
    "Bodennah und morgens gießen; das beugt Echtem Mehltau vor.",
    "Vor der Zubereitung immer ein rohes Stück probieren – bei Bitterkeit ganze Frucht entsorgen.",
  ],
  sources: [SOURCES.BZL, SOURCES.JKI, SOURCES.GPP],
  contentConfidence: "HIGH",
  version: CONTENT_VERSION,
  imageUrl:
    "https://upload.wikimedia.org/wikipedia/commons/9/9d/Calabac%C3%ADn%2C_M%C3%BAnich%2C_Alemania%2C_2013-03-30%2C_DD_01.JPG",
};
