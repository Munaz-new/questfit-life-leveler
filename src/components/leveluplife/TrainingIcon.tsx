import {
  Baby, BookOpen, BriefcaseBusiness, CodeXml, Ellipsis, Flame, FlaskConical,
  Gamepad2, GraduationCap, Laptop, Leaf, Moon, Palette, Store, Swords, Trophy,
  type LucideIcon,
} from "lucide-react";
import type { LifestyleType, MotivationStyle } from "@/lib/leveluplife/types";

const symbols = {
  student: GraduationCap, office: BriefcaseBusiness, gamer: Gamepad2,
  developer: CodeXml, business: Store, creator: Palette, nightshift: Moon,
  freelancer: Laptop, parent: Baby, custom: Ellipsis,
  hunter: Swords, hero: Trophy, zen: Leaf, scientist: FlaskConical,
  story: BookOpen, discipline: Flame,
} satisfies Record<LifestyleType | MotivationStyle, LucideIcon>;

export function TrainingIcon({ name, size = 20 }: {
  name: keyof typeof symbols;
  size?: number;
}) {
  const Icon = symbols[name];
  return <Icon size={size} strokeWidth={1.8} aria-hidden="true" className="shrink-0" />;
}
