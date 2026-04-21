import { Tomato } from "./Tomato";
import { Fern } from "./Fern";
import { Mushroom } from "./Mushroom";
import { Leaf } from "./Leaf";
import { Sun } from "./Sun";
import { Insect } from "./Insect";
import { Snail } from "./Snail";
import { Aphid } from "./Aphid";
import { Worm } from "./Worm";
import { Rain } from "./Rain";
import { Shovel } from "./Shovel";
import { Scissors } from "./Scissors";
import { WateringCan } from "./WateringCan";
import { Root } from "./Root";
import { Fruit } from "./Fruit";
import { Flower } from "./Flower";
import { Mildew } from "./Mildew";
import { Pest } from "./Pest";
import { Compost } from "./Compost";
import { Pot } from "./Pot";
import { RaisedBed } from "./RaisedBed";
import { Seedling } from "./Seedling";
import { Journal } from "./Journal";
import { Compass } from "./Compass";

export const botanicalRegistry = {
  tomato: Tomato,
  fern: Fern,
  mushroom: Mushroom,
  leaf: Leaf,
  sun: Sun,
  insect: Insect,
  snail: Snail,
  aphid: Aphid,
  worm: Worm,
  rain: Rain,
  shovel: Shovel,
  scissors: Scissors,
  wateringCan: WateringCan,
  root: Root,
  fruit: Fruit,
  flower: Flower,
  mildew: Mildew,
  pest: Pest,
  compost: Compost,
  pot: Pot,
  raisedBed: RaisedBed,
  seedling: Seedling,
  journal: Journal,
  compass: Compass,
} as const;

export type BotanicalName = keyof typeof botanicalRegistry;
