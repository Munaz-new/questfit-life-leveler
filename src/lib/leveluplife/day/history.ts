/* ────────────────────────────────────────────────────────────────────────
 * Adaptive Day — history signals derived from existing app state.
 * Nothing new is stored that the app doesn't already know.
 * ──────────────────────────────────────────────────────────────────── */

import type { AppState } from "../types";
import { exerciseById } from "../exercises/library";
import type { DayHistory, DayRecord, StatKey } from "./types";
import { activeDaysThisWeek } from "./rules";

export function buildHistory(state: AppState, daysSinceLastWorkout: number): DayHistory {
  const recentPatterns = Array.from(
    new Set(
      state.lastMoves
        .map((id) => exerciseById(id)?.pattern as string | undefined)
        .filter((p): p is string => Boolean(p)),
    ),
  );
  return {
    streak: state.streak,
    daysSinceLastWorkout,
    sittingHoursToday: state.sittingHoursToday,
    adaptiveBoost: state.adaptiveBoost,
    recentCompletion: state.recentCompletion,
    recentPatterns,
    records: state.dayRecords ?? [],
  };
}

export interface WeeklyTrend {
  key: StatKey;
  label: string;
  direction: "up" | "flat";
  hits: number;
}

const TREND_LABELS: { key: StatKey; label: string }[] = [
  { key: "strength", label: "Strength" },
  { key: "stamina", label: "Stamina" },
  { key: "flexibility", label: "Mobility" },
  { key: "recovery", label: "Recovery" },
  { key: "focus", label: "Focus" },
];

/**
 * A trend is "improving" when this week has more hits for that stat than
 * the week before, otherwise it reads as stable. Deliberately simple.
 */
export function weeklyTrends(records: DayRecord[]): WeeklyTrend[] {
  const week = records.slice(-7);
  const prev = records.slice(-14, -7);
  const count = (rs: DayRecord[], key: StatKey) =>
    rs.reduce((n, r) => n + r.stats.filter((s) => s === key).length, 0);

  return TREND_LABELS.map(({ key, label }) => {
    const hits = count(week, key);
    const before = count(prev, key);
    return { key, label, hits, direction: hits > before ? "up" : "flat" };
  });
}

export function weeklyActiveDays(records: DayRecord[]): number {
  return activeDaysThisWeek({ records } as DayHistory);
}
