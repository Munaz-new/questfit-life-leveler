import type { Move, Pattern } from "./patterns";
import { exerciseById } from "../exercises/library";

export type Target =
  | { kind: "time"; seconds: number; perSet?: boolean; sets?: number; perSide?: boolean }
  | { kind: "reps"; sets: number; perSet: string };

/** Turn a Move's free-text `reps` field into a structured target. */
export function parseTarget(reps: string): Target {
  const r = reps.trim();
  const perSide = /(?:\/|per\s+)(?:side|leg)\b/i.test(r);
  const timed = (seconds: number, sets = 1): Target => {
    if (perSide) return { kind: "time", seconds, perSide, perSet: true, sets: sets * 2 };
    return sets > 1 ? { kind: "time", seconds, perSet: true, sets } : { kind: "time", seconds };
  };
  const clock = r.match(/^(?:(\d+)\s*[×x]\s*)?(\d+):(\d{2})/);
  if (clock) return timed(Number(clock[2]) * 60 + Number(clock[3]), Number(clock[1] ?? 1));
  const unit = r.match(/^(?:(\d+)\s*[×x]\s*)?(\d+)\s*(s(?:ec(?:ond)?s?)?\b|min(?:ute)?s?\b)/i);
  if (unit)
    return timed(
      Number(unit[2]) * (unit[3].toLowerCase().startsWith("min") ? 60 : 1),
      Number(unit[1] ?? 1),
    );
  const sets = r.match(/(\d+)\s*[×x]\s*(.+)/);
  if (sets) return { kind: "reps", sets: parseInt(sets[1], 10), perSet: sets[2].trim() };
  return { kind: "reps", sets: 1, perSet: r };
}

const PATTERN_XP: Record<Pattern, number> = {
  squat: 12,
  push: 12,
  pull: 12,
  hinge: 12,
  core: 10,
  cardio: 8,
  mobility: 6,
};

export function xpForMove(m: Move): number {
  return PATTERN_XP[m.pattern] ?? 8;
}

function parseWeightKg(weight: string | undefined): number | null {
  if (!weight) return null;
  const match = weight.match(/(\d+)/g);
  if (!match || !match.length) return null;
  const nums = match.map((n) => parseInt(n, 10));
  const kg = nums.length >= 2 ? (nums[0] + nums[1]) / 2 : nums[0];
  if (!kg || kg < 30 || kg > 250) return null;
  return kg;
}

/** Estimate kcal using a per-exercise MET when available; fallback to MET 5. */
export function estimateCaloriesForMoves(
  moves: Move[],
  profileWeight: string | undefined,
): number | null {
  const kg = parseWeightKg(profileWeight);
  if (!kg) return null;
  let kcal = 0;
  for (const m of moves) {
    const ex = exerciseById(m.id);
    const met = ex?.metValue ?? 5;
    const sec = ex?.estDurationSec ?? 60;
    kcal += met * kg * (sec / 3600);
  }
  return Math.round(kcal);
}

/** Legacy fallback used by callers that only know total duration. */
export function estimateCalories(
  durationSec: number,
  profileWeight: string | undefined,
): number | null {
  const kg = parseWeightKg(profileWeight);
  if (!kg) return null;
  const met = 5;
  return Math.round(met * kg * (durationSec / 3600));
}
