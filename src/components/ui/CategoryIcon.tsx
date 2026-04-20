import { Leaf, Sprout, Bug, Microscope, HeartCrack, ShieldCheck } from "lucide-react";
import type { Category } from "@/domain/types";
import { cn } from "@/lib/utils";

const iconMap: Record<Category, React.ElementType> = {
  PLANT: Leaf,
  WEED: Sprout,
  PEST: Bug,
  BENEFICIAL: ShieldCheck,
  DISEASE: Microscope,
  DAMAGE: HeartCrack,
};

const labelMap: Record<Category, string> = {
  PLANT: "Pflanze",
  WEED: "Unkraut",
  PEST: "Schädling",
  BENEFICIAL: "Nützling",
  DISEASE: "Krankheit",
  DAMAGE: "Schaden",
};

export function CategoryLabel({ category }: { category: Category }) {
  return <>{labelMap[category]}</>;
}

export function CategoryIcon({
  category,
  className,
}: {
  category: Category;
  className?: string;
}) {
  const Icon = iconMap[category];
  return <Icon className={cn("h-4 w-4", className)} />;
}
