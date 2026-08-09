/* ────────────────────────────────────────────────────────────────────────
 * Adaptive Day — decision rules.
 *
 * Pure, testable helpers. Every adaptation decision the engine makes is
 * expressed here so intensity, safety and time budgeting live in exactly
 * one place. No React, no storage, no copy.
 * ──────────────────────────────────────────────────────────────────── */

import type { FitnessLevel, UserProfile } from "../types";
import type { AdaptiveInput, DayHistory, EnergyReport, TimeBudget } from "./types";

/** 0 (empty) … 4 (great). Used for intensity gating, never for shaming. */
export function energyScore(e: EnergyReport): number {
  switch (e) {
    case "great": return 4;
    case "good": return 3;
    case "okay": return 2;
    case "low": return 1;
    default: return 0;
  }
}

export function needsPhysicalCare(input: AdaptiveInput): boolean {
  return input.physical === "sore" || input.physical === "recovering";
}

/** Active days in the trailing 7 calendar days. */
export function activeDaysThisWeek(history: DayHistory): number {
  return history.records.slice(-7).filter((r) => r.completed > 0).length;
}

/** Rolling training load: workouts in the last 7 days. */
export function recentWorkoutDays(history: DayHistory): number {
  return history.records.slice(-7).filter((r) => r.workout).length;
}

/**
 * Overload heuristic — a lot of recent training combined with a body
 * report that isn't "ready". Deliberately conservative.
 */
export function showsOverload(input: AdaptiveInput, history: DayHistory): boolean {
  const load = recentWorkoutDays(history);
  if (load >= 6) return true;
  if (load >= 4 && needsPhysicalCare(input)) return true;
  if (load >= 4 && energyScore(input.energy) <= 1) return true;
  return false;
}

/** Recovery Mode trigger. Order of checks mirrors the product rules. */
export function shouldEnterRecoveryMode(
  input: AdaptiveInput,
  history: DayHistory,
): boolean {
  if (energyScore(input.energy) <= 1) return true;
  if (needsPhysicalCare(input)) return true;
  if (showsOverload(input, history)) return true;
  if (history.adaptiveBoost === -1 && energyScore(input.energy) <= 2) return true;
  return false;
}

/** Long absence → gentle restart, never a punishment session. */
export function isGentleRestart(history: DayHistory): boolean {
  return history.daysSinceLastWorkout >= 3;
}

/** Time band → minutes budgeted for the workout mission itself. */
export function workoutMinutesFor(
  budget: TimeBudget,
  recoveryMode: boolean,
  restart: boolean,
): number {
  const base = budget === 5 ? 5 : budget === 10 ? 9 : budget === 20 ? 18 : 28;
  if (restart) return Math.min(base, 6);
  if (recoveryMode) return Math.min(base, 12);
  return base;
}

/**
 * Effective training level. Progression is earned by consistency AND
 * confirmed by today's readiness — a streak alone never raises difficulty.
 */
export function effectiveLevel(
  profile: UserProfile,
  input: AdaptiveInput,
  history: DayHistory,
  recoveryMode: boolean,
): FitnessLevel {
  const down = (l: FitnessLevel): FitnessLevel =>
    l === "advanced" ? "intermediate" : "beginner";
  const up = (l: FitnessLevel): FitnessLevel =>
    l === "beginner" ? "intermediate" : "advanced";

  if (recoveryMode || isGentleRestart(history)) return down(profile.level);

  const consistent =
    history.adaptiveBoost === 1 &&
    activeDaysThisWeek(history) >= 4 &&
    history.recentCompletion.slice(-2).every((p) => p >= 0.9);
  const ready = energyScore(input.energy) >= 3 && input.physical === "ready";
  const enoughTime = input.timeMin >= 20;

  if (consistent && ready && enoughTime && !showsOverload(input, history)) {
    return up(profile.level);
  }
  return profile.level;
}

/**
 * Patterns to avoid today because the last session already loaded them
 * heavily. Mobility is never blocked.
 */
export function patternsToDeload(input: AdaptiveInput, history: DayHistory): string[] {
  if (history.daysSinceLastWorkout > 1) return [];
  if (!needsPhysicalCare(input) && energyScore(input.energy) >= 3) return [];
  return history.recentPatterns.filter((p) => p !== "mobility");
}

/** Hard caps so the engine can never produce an excessive day. */
export function missionCapFor(budget: TimeBudget, recoveryMode: boolean): number {
  if (budget === 5) return 3;
  if (budget === 10) return 4;
  return recoveryMode ? 4 : 5;
}

export const SAFETY_NOTE =
  "Move at a pace that feels controlled. If something hurts, stop that movement — if pain persists, check in with a qualified professional.";
