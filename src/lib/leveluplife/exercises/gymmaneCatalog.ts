// Catalog data from GymMane by InlitX. See public/gymmane/CREDITS.md.
import catalog from "./gymmaneCatalog.json";
import type { Exercise, MuscleGroup } from "./types";
import type { Equip, Level, Pattern } from "../engine/patterns";

const equipment: Record<string, Equip> = {
  Bodyweight: "none",
  Band: "bands",
  Dumbbell: "dumbbells",
  Barbell: "barbell",
  Cable: "cable",
  Machine: "machine",
  Kettlebell: "kettlebell",
  Rings: "rings",
  Weighted: "weighted",
  Other: "other",
};
const muscles: Record<string, MuscleGroup> = {
  abdomen: "core",
  back: "upper_back",
  biceps: "biceps",
  calves: "calves",
  chest: "chest",
  forearm: "forearms",
  glutes: "glutes",
  hamstrings: "hamstrings",
  lowerback: "lower_back",
  obliques: "obliques",
  quads: "quads",
  shoulders: "delts_front",
  trapezius: "traps",
  triceps: "triceps",
};
const strength: Record<string, Pattern> = {
  abdomen: "core",
  back: "pull",
  biceps: "pull",
  calves: "squat",
  chest: "push",
  forearm: "pull",
  glutes: "hinge",
  hamstrings: "hinge",
  lowerback: "hinge",
  obliques: "core",
  quads: "squat",
  shoulders: "push",
  trapezius: "pull",
  triceps: "push",
};

// Keep the identifiers used by existing saved routines and favorites.
const previousIds: Record<string, string> = {
  "bench-press": "gym-bench-press",
  "overhead-press": "gym-overhead-press",
  deadlift: "gym-deadlift",
  "seated-row": "gym-seated-row",
  "lat-pulldown": "gym-lat-pulldown",
  squat: "gym-squat",
  "leg-press": "gym-leg-press",
};
const assigned = new Set<string>();

export const GYM_EXERCISES: Exercise[] = catalog.map((entry) => {
  const previous = previousIds[entry.art];
  const id = previous && !assigned.has(previous) ? previous : `gym-${entry.id}`;
  assigned.add(id);
  const cardio =
    entry.kind === "sport" || entry.kind === "cardio" || entry.loggingMode === "cardio";
  const stretch = entry.kind === "stretch";
  const pattern = cardio ? "cardio" : stretch ? "mobility" : strength[entry.primary];
  const category = cardio
    ? "cardio_endurance"
    : stretch
      ? "mobility_hip"
      : `strength_${strength[entry.primary]}`;
  const timed = cardio || stretch || entry.loggingMode === "time";
  return {
    id,
    name: entry.name,
    category: category as Exercise["category"],
    pattern,
    difficulty: entry.difficulty.toLowerCase() as Level,
    equipment: equipment[entry.equipment],
    apartmentSafe: false,
    primaryMuscles: [muscles[entry.primary]],
    secondaryMuscles: entry.secondary.map((muscle) => muscles[muscle]),
    benefits: [],
    instructions: entry.steps,
    mistakes: [],
    safety: [],
    recommendedFor: [],
    recommendedGoals: [],
    estDurationSec: timed ? 60 : 120,
    metValue: 5,
    defaultReps: cardio ? "1 min" : timed ? "30s" : "3 × 8",
    defaultRest: timed ? 30 : 90,
    cue: entry.steps[0] ?? "",
    gymMane: {
      id: entry.id,
      equipment: entry.equipment,
      muscle: entry.primary,
      aliases: entry.aliases ?? [],
      art: entry.art,
      icon: entry.icon,
      loggingMode: entry.loggingMode || "reps",
    },
  };
});

export const GYM_EXERCISES_BY_ID = new Map(
  GYM_EXERCISES.map((exercise) => [exercise.id, exercise]),
);
