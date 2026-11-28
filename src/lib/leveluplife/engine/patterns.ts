/* ────────────────────────────────────────────────────────────────────────
 * Movement primitives + adapter over the Exercise Intelligence Library.
 * The MOVES array is derived from src/lib/leveluplife/exercises/library
 * so that the builder/selector and the Mission Player consume the same
 * single source of truth. Adding a move = adding an Exercise.
 * ──────────────────────────────────────────────────────────────────── */

import { GYM_EXERCISES } from "../exercises/gymmaneCatalog";
import { HOME_EXERCISES } from "../exercises/library";
import type { Exercise } from "../exercises/types";

export type Pattern =
  | "squat"
  | "push"
  | "pull"
  | "hinge"
  | "core"
  | "mobility"
  | "cardio";

export type Level = "beginner" | "intermediate" | "advanced";
export type Equip = "none" | "bands" | "dumbbells" | "chair" | "pullup" | "barbell" | "cable" | "machine" | "kettlebell" | "rings" | "weighted" | "other";

export interface Move {
  id: string;
  name: string;
  pattern: Pattern;
  level: Level;
  equipment: Equip;
  apartmentSafe: boolean;
  reps: string;
  rest: number;
  cue: string;
  scienceNote?: string;
  area?: "neck" | "wrist" | "thoracic" | "shoulder" | "hip" | "ankle" | "hamstring" | "full";
}

function toMove(e: Exercise): Move {
  return {
    id: e.id,
    name: e.name,
    pattern: e.pattern,
    level: e.difficulty,
    equipment: e.equipment,
    apartmentSafe: e.apartmentSafe,
    reps: e.defaultReps,
    rest: e.defaultRest,
    cue: e.cue,
    scienceNote: e.scienceNote,
    area: e.area,
  };
}

export const MOVES: Move[] = HOME_EXERCISES.map(toMove);
export const ROUTINE_MOVES = [...MOVES, ...GYM_EXERCISES.map(toMove)];

/* Hierarchy used when filtering by available equipment. */
const EQUIP_OK: Record<Equip, Equip[]> = {
  none:     ["none"],
  chair:    ["none", "chair"],
  bands:    ["none", "bands"],
  dumbbells:["none", "dumbbells"],
  pullup:   ["none", "pullup"],
  barbell: ["none", "barbell"],
  cable: ["none", "cable"],
  machine: ["none", "machine"],
  kettlebell: ["none", "kettlebell"],
  rings: ["none", "rings"],
  weighted: ["none", "weighted"],
  other: ["none", "other"],
};

export function filterMoves(opts: {
  pattern?: Pattern;
  level: Level;
  equipment: Equip[];
  apartmentSafe?: boolean;
  area?: Move["area"];
}): Move[] {
  const allowed = new Set<Equip>();
  for (const e of opts.equipment) for (const a of EQUIP_OK[e] ?? []) allowed.add(a);
  if (allowed.size === 0) allowed.add("none");
  const levelRank: Record<Level, number> = { beginner: 0, intermediate: 1, advanced: 2 };
  const maxRank = levelRank[opts.level];
  return MOVES.filter((m) => {
    if (opts.pattern && m.pattern !== opts.pattern) return false;
    if (opts.area && m.area !== opts.area) return false;
    if (!allowed.has(m.equipment)) return false;
    if (levelRank[m.level] > maxRank) return false;
    if (opts.apartmentSafe && !m.apartmentSafe) return false;
    return true;
  });
}
