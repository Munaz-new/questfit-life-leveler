import type { Pattern, Equip, Level, Move } from "../engine/patterns";
import type { Goal, LifestyleType } from "../types";

/** Anatomical muscle ids — must match <path id="..."> in MuscleMap.tsx. */
export type MuscleGroup =
  | "neck"
  | "traps"
  | "delts_front"
  | "delts_side"
  | "delts_rear"
  | "chest"
  | "biceps"
  | "triceps"
  | "forearms"
  | "lats"
  | "upper_back"
  | "lower_back"
  | "core"
  | "obliques"
  | "glutes"
  | "quads"
  | "hamstrings"
  | "calves"
  | "hip_flexors"
  | "wrists"
  | "ankles"
  | "full_body";

export type ExerciseCategory =
  | "strength_push"
  | "strength_pull"
  | "strength_squat"
  | "strength_hinge"
  | "strength_core"
  | "mobility_neck"
  | "mobility_shoulder"
  | "mobility_thoracic"
  | "mobility_hip"
  | "mobility_ankle"
  | "mobility_wrist"
  | "recovery_posture"
  | "recovery_desk"
  | "recovery_study"
  | "recovery_gaming"
  | "recovery_sleep"
  | "recovery_stress"
  | "cardio_walking"
  | "cardio_marching"
  | "cardio_low_impact"
  | "cardio_hiit"
  | "cardio_endurance";

export type CategoryGroup = "strength" | "mobility" | "recovery" | "cardio";

export function groupOf(cat: ExerciseCategory): CategoryGroup {
  if (cat.startsWith("strength")) return "strength";
  if (cat.startsWith("mobility")) return "mobility";
  if (cat.startsWith("recovery")) return "recovery";
  return "cardio";
}

export interface Exercise {
  id: string;
  name: string;
  category: ExerciseCategory;
  pattern: Pattern;
  difficulty: Level;
  equipment: Equip;
  apartmentSafe: boolean;
  area?: Move["area"];

  primaryMuscles: MuscleGroup[];
  secondaryMuscles: MuscleGroup[];

  benefits: string[];
  instructions: string[];
  mistakes: string[];
  safety: string[];

  recommendedFor: LifestyleType[];
  recommendedGoals: Goal[];

  estDurationSec: number;
  /** MET — Compendium of Physical Activities estimate. */
  metValue: number;

  defaultReps: string;
  defaultRest: number;
  cue: string;
  scienceNote?: string;

  /** Registry key into illustrations index. Defaults to id. */
  illustration?: string;
  /** Reserved: Lottie/Rive URL to drop in later without refactor. */
  animationUrl?: string;

  /* Future-readiness — intentionally optional and empty for now. */
  poseLandmarks?: string[];
  repCountingHint?: { type: "vertical" | "horizontal"; landmark: string };
  formCheckpoints?: { name: string; rule: string }[];
  healthKitMapping?: { appleHealth?: string; googleFit?: string };
}
