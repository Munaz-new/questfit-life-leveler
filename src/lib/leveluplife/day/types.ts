/* ────────────────────────────────────────────────────────────────────────
 * Adaptive Day — data contracts.
 *
 * The Adaptive Day Engine turns (profile + today's self-report + history)
 * into a persisted DailyPlan. Screens only ever render a DailyPlan; they
 * never make adaptation decisions themselves.
 * ──────────────────────────────────────────────────────────────────── */

import type { ProtocolId } from "../engine/protocols";

/** How a mission is actually performed in the real world. */
export type MissionKind =
  | "workout"    // opens the real Workout Player
  | "timed"      // runs a real countdown timer
  | "walk"       // timed, self-reported outdoors/indoors movement
  | "hydration"  // logs a glass of water
  | "focus"      // focus countdown timer
  | "habit";     // simple honest self-report

/** Presentation slot on the Your Day board. */
export type MissionSlot = "main" | "side" | "recovery" | "focus" | "bonus";

/** Which attribute a completed mission feeds. */
export type StatKey =
  | "strength"
  | "stamina"
  | "recovery"
  | "discipline"
  | "vitality"
  | "flexibility"
  | "focus";

export interface DailyMission {
  id: string;
  slot: MissionSlot;
  kind: MissionKind;
  title: string;
  subtitle: string;
  /** XP awarded on honest completion. */
  xp: number;
  /** lucide-react icon name. */
  icon: string;
  /** Countdown length for timed / walk / focus missions. */
  durationSec?: number;
  /** For workout missions — the protocol the player should build. */
  protocolId?: ProtocolId;
  /** Attribute this mission feeds. */
  stat: StatKey;
  /** Skill id in `state.skills` that this mission advances (optional). */
  skillId?: string;
  /**
   * True only when the app itself can observe the action (a completed
   * player session, a finished in-app timer). False = honest self-report.
   */
  verifiable: boolean;
  done: boolean;
  /** Repeatable missions (hydration) track progress toward `target`. */
  target?: number;
  progress?: number;
}

export type EnergyReport = "great" | "good" | "okay" | "low" | "exhausted";
export type PhysicalReport = "ready" | "stiff" | "sore" | "recovering";
export type TimeBudget = 5 | 10 | 20 | 30;

export interface AdaptiveInput {
  /** YYYY-MM-DD */
  date: string;
  energy: EnergyReport;
  timeMin: TimeBudget;
  physical: PhysicalReport;
}

export interface DailyPlan {
  /** YYYY-MM-DD — the plan is generated once per day. */
  date: string;
  missions: DailyMission[];
  recoveryMode: boolean;
  /** One or two concise sentences for "Why this plan?". */
  whyThisPlan: string[];
  intensity: "low" | "moderate" | "high";
  /** Protocol backing the workout mission, when there is one. */
  protocolId?: ProtocolId;
  workoutMin: number;
  /** Bumped whenever the user recalibrates — used for change feedback. */
  revision: number;
  /** Optional safety note shown under the board. */
  safetyNote?: string;
}

/** One archived day, used for weekly trends and load awareness. */
export interface DayRecord {
  date: string;
  completed: number;
  total: number;
  /** Stat keys touched that day. */
  stats: StatKey[];
  workout: boolean;
  recoveryMode: boolean;
}

/** Signals the engine reads from the existing app state. */
export interface DayHistory {
  streak: number;
  daysSinceLastWorkout: number;
  sittingHoursToday: number;
  adaptiveBoost: -1 | 0 | 1;
  /** Completion ratios of recent workout sessions (0..1). */
  recentCompletion: number[];
  /** Movement patterns hit in the last session. */
  recentPatterns: string[];
  /** Last ~14 days of mission days, newest last. */
  records: DayRecord[];
}
