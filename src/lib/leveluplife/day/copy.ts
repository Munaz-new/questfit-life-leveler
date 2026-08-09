/* ────────────────────────────────────────────────────────────────────────
 * Adaptive Day — mode voice.
 *
 * Motivation modes change language only. The mission structure, duration,
 * intensity and safety rules produced by the engine are identical across
 * every mode.
 * ──────────────────────────────────────────────────────────────────── */

import type { MotivationStyle } from "../types";

export interface DayVoice {
  /** Board heading, e.g. "Your Day". */
  boardTitle: string;
  /** One-line system message under the heading. */
  calibrated: (recoveryMode: boolean) => string;
  /** Label above the primary mission. */
  mainLabel: string;
  checkinTitle: string;
  recalibrateCta: string;
  recoveryBanner: string;
  restartLine: string;
}

const VOICES: Record<MotivationStyle, DayVoice> = {
  hunter: {
    boardTitle: "Your Day",
    calibrated: (r) =>
      r ? "Today's target is scaled down. Recover, then hunt." : "Today's target is ready.",
    mainLabel: "Main Quest",
    checkinTitle: "Status check",
    recalibrateCta: "Recalibrate my day",
    recoveryBanner: "Your system is reducing today's load.",
    restartLine: "Back from a break — starting light on purpose.",
  },
  hero: {
    boardTitle: "Your Day",
    calibrated: (r) =>
      r ? "Today is about rebuilding, not proving." : "Build today's progress.",
    mainLabel: "Main Quest",
    checkinTitle: "How are you today?",
    recalibrateCta: "Adjust my day",
    recoveryBanner: "Today's load has been reduced so you can recover.",
    restartLine: "Let's restart gently — one honest session.",
  },
  zen: {
    boardTitle: "Your Day",
    calibrated: (r) =>
      r ? "Keep it soft today. Less is enough." : "Keep the session calm and consistent.",
    mainLabel: "Today's focus",
    checkinTitle: "How are you today?",
    recalibrateCta: "Adjust my day",
    recoveryBanner: "Today's plan is lighter on purpose.",
    restartLine: "Beginning again is part of the practice.",
  },
  scientist: {
    boardTitle: "Your Day",
    calibrated: (r) =>
      r
        ? "Workload reduced based on your reported state and recent volume."
        : "Your workload has been calibrated from recent activity.",
    mainLabel: "Primary block",
    checkinTitle: "Daily inputs",
    recalibrateCta: "Recalculate plan",
    recoveryBanner: "Recovery protocol active — training load reduced.",
    restartLine: "Detraining is minimal. Re-entry volume set low.",
  },
  story: {
    boardTitle: "Your Day",
    calibrated: (r) =>
      r
        ? "Today's chapter is a quiet one — rest is part of the arc."
        : "Today's chapter begins with a short movement session.",
    mainLabel: "Chapter quest",
    checkinTitle: "Where are you today?",
    recalibrateCta: "Rewrite today",
    recoveryBanner: "The story slows down so the hero can heal.",
    restartLine: "Every arc has a return. This is yours.",
  },
  discipline: {
    boardTitle: "Your Day",
    calibrated: (r) =>
      r ? "Reduced load today. Still show up." : "Show up. Execute the plan.",
    mainLabel: "Primary task",
    checkinTitle: "Report in",
    recalibrateCta: "Reset today's plan",
    recoveryBanner: "Load reduced. Recovery is part of the work.",
    restartLine: "No excuses needed. Start small, start today.",
  },
};

export function dayVoice(mode: MotivationStyle | null | undefined): DayVoice {
  return VOICES[mode ?? "hunter"] ?? VOICES.hunter;
}
