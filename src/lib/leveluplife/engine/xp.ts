import type { Move, Pattern } from "./patterns";

export type Target =
  | { kind: "time"; seconds: number; perSet?: boolean; sets?: number }
  | { kind: "reps"; sets: number; perSet: string };

/** Turn a Move's free-text `reps` field into a structured target. */
export function parseTarget(reps: string): Target {
  const r = reps.trim();
  // "1:00 min" or "1:30/side"
  const colon = r.match(/(\d+):(\d{2})/);
  if (colon) return { kind: "time", seconds: parseInt(colon[1], 10) * 60 + parseInt(colon[2], 10) };
  // "3 × 30s" or "3 × 20s/side" — sets of time
  const setsTime = r.match(/(\d+)\s*[×x]\s*(\d+)\s*s/i);
  if (setsTime)
    return {
      kind: "time",
      seconds: parseInt(setsTime[2], 10),
      perSet: true,
      sets: parseInt(setsTime[1], 10),
    };
  // bare "30s"
  const sec = r.match(/^(\d+)\s*s\b/);
  if (sec) return { kind: "time", seconds: parseInt(sec[1], 10) };
  // "10 min" or "2 min" (no × sign)
  const mn = r.match(/^(\d+)\s*min/i);
  if (mn) return { kind: "time", seconds: parseInt(mn[1], 10) * 60 };
  // "3 × 8" or "4 × 10/side"
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

/** Estimate kcal from MET (~5 for moderate bodyweight) × duration × bodyweight. */
export function estimateCalories(durationSec: number, profileWeight: string | undefined): number | null {
  if (!profileWeight) return null;
  const match = profileWeight.match(/(\d+)/g);
  if (!match || !match.length) return null;
  const nums = match.map((n) => parseInt(n, 10));
  const kg = nums.length >= 2 ? (nums[0] + nums[1]) / 2 : nums[0];
  if (!kg || kg < 30 || kg > 250) return null;
  const met = 5;
  const hours = durationSec / 3600;
  return Math.round(met * kg * hours);
}
