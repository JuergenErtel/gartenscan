import { Tomato } from "./Tomato";
import { Fern } from "./Fern";
import { Mushroom } from "./Mushroom";
import { Leaf } from "./Leaf";
import { Sun } from "./Sun";

export const botanicalRegistry = {
  tomato: Tomato,
  fern: Fern,
  mushroom: Mushroom,
  leaf: Leaf,
  sun: Sun,
} as const;

export type BotanicalName = keyof typeof botanicalRegistry;
