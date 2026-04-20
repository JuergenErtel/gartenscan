import type { Source } from "@/domain/types";

export const CONTENT_VERSION = "2026-04-20";

/**
 * Primary sources referenced across multiple content entries.
 * Each entry picks a subset relevant to its topic.
 */
export const SOURCES = {
  BZL: {
    title: "Bundeszentrum für Ernährung (BZfE) – Gartenthemen",
    url: "https://www.bzfe.de",
    type: "official" as const,
  },
  JKI: {
    title: "Julius Kühn-Institut – Pflanzenschutz im Hausgarten",
    url: "https://www.julius-kuehn.de",
    type: "scientific" as const,
  },
  DWD: {
    title: "Deutscher Wetterdienst – Agrarmeteorologie",
    url: "https://www.dwd.de",
    type: "official" as const,
  },
  NABU: {
    title: "NABU – Naturschutz im Garten",
    url: "https://www.nabu.de",
    type: "expert" as const,
  },
  GPP: {
    title: "Gartenakademie Rheinland-Pfalz",
    url: "https://www.gartenakademie.rlp.de",
    type: "official" as const,
  },
  UBA: {
    title: "Umweltbundesamt – Pflanzenschutz",
    url: "https://www.umweltbundesamt.de",
    type: "official" as const,
  },
  LFL: {
    title: "Bayerische Landesanstalt für Landwirtschaft",
    url: "https://www.lfl.bayern.de",
    type: "official" as const,
  },
} satisfies Record<string, Source>;
