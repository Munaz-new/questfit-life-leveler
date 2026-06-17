import type { Pattern } from "./patterns";

export type ProtocolId =
  | "full_body"
  | "posture_reset"
  | "recovery_restart"
  | "low_energy_flow"
  | "mobility_only"
  | "strength_focus"
  | "student_exam"
  // Lifestyle recovery protocols
  | "gamer_neck_recovery"
  | "programmer_flow"
  | "laptop_posture_fix"
  | "office_mobility"
  | "midnight_coding_recovery"
  | "study_break_flow"
  | "exam_week_reset"
  | "eight_hour_sitting_reset";

export interface Protocol {
  id: ProtocolId;
  name: string;
  /** Approx body time-budget in minutes for the *main* block. */
  mainMin: number;
  /** Distribution weights over patterns; selector samples from these. */
  ratio: Partial<Record<Pattern, number>>;
  /** Default intensity hint applied to the chosen moves. */
  intensity: "low" | "moderate" | "high";
  /** Plain-English reason template; the selector fills the {why} slot. */
  whyTemplate: string;
}

export const PROTOCOLS: Record<ProtocolId, Protocol> = {
  full_body: {
    id: "full_body",
    name: "Full Body",
    mainMin: 18,
    intensity: "moderate",
    ratio: { squat: 1, push: 1, pull: 1, hinge: 1, core: 1, mobility: 0.5 },
    whyTemplate: "Balanced session — every pattern, nothing overcooked.",
  },
  posture_reset: {
    id: "posture_reset",
    name: "Posture Reset",
    mainMin: 8,
    intensity: "low",
    ratio: { mobility: 3, pull: 1, core: 0.5 },
    whyTemplate: "You sat {sit}h — neck, thoracic, hips need a reset.",
  },
  recovery_restart: {
    id: "recovery_restart",
    name: "Recovery Restart",
    mainMin: 5,
    intensity: "low",
    ratio: { mobility: 2, core: 1, cardio: 1 },
    whyTemplate: "Restart small after {miss} days off. No guilt — just momentum.",
  },
  low_energy_flow: {
    id: "low_energy_flow",
    name: "Low-Energy Flow",
    mainMin: 10,
    intensity: "low",
    ratio: { mobility: 2, hinge: 1, core: 1, cardio: 0.5 },
    whyTemplate: "Energy reads low — keep the streak with a gentle session.",
  },
  mobility_only: {
    id: "mobility_only",
    name: "Mobility Flow",
    mainMin: 12,
    intensity: "low",
    ratio: { mobility: 5 },
    whyTemplate: "Soreness flagged — mobility today, strength tomorrow.",
  },
  strength_focus: {
    id: "strength_focus",
    name: "Strength Focus",
    mainMin: 22,
    intensity: "high",
    ratio: { squat: 1.5, push: 1.5, pull: 1.5, hinge: 1.5, core: 1 },
    whyTemplate: "Streak + recovery clean — time to push.",
  },
  student_exam: {
    id: "student_exam",
    name: "Study-Break Reset",
    mainMin: 10,
    intensity: "low",
    ratio: { mobility: 4, core: 1.5, cardio: 1.5 },
    whyTemplate: "Stress is high — short, calming, brain-clearing.",
  },

  /* ───────────── Lifestyle recovery protocols ───────────── */
  gamer_neck_recovery: {
    id: "gamer_neck_recovery",
    name: "Gamer Neck Recovery",
    mainMin: 9,
    intensity: "low",
    ratio: { mobility: 4, pull: 1 },
    whyTemplate: "Long session, locked-in neck — let's unstick it.",
  },
  programmer_flow: {
    id: "programmer_flow",
    name: "Programmer Recovery Flow",
    mainMin: 10,
    intensity: "low",
    ratio: { mobility: 3, pull: 1, hinge: 1 },
    whyTemplate: "Hours hunched at the keyboard — wrists, thoracic, hips first.",
  },
  laptop_posture_fix: {
    id: "laptop_posture_fix",
    name: "Laptop Posture Fix",
    mainMin: 8,
    intensity: "low",
    ratio: { mobility: 3, pull: 1.5 },
    whyTemplate: "Laptop slouch detected — open the chest, wake the back.",
  },
  office_mobility: {
    id: "office_mobility",
    name: "Office Worker Mobility",
    mainMin: 12,
    intensity: "low",
    ratio: { mobility: 3, hinge: 1, cardio: 1 },
    whyTemplate: "Desk-bound day — mobilize hips, fire glutes, walk it off.",
  },
  midnight_coding_recovery: {
    id: "midnight_coding_recovery",
    name: "Midnight Coding Recovery",
    mainMin: 8,
    intensity: "low",
    ratio: { mobility: 4, core: 0.5 },
    whyTemplate: "Late session — gentle reset, calm the system, prep for sleep.",
  },
  study_break_flow: {
    id: "study_break_flow",
    name: "Study Break Flow",
    mainMin: 5,
    intensity: "low",
    ratio: { mobility: 3, cardio: 1 },
    whyTemplate: "5-minute reset between study blocks. Brain breathes.",
  },
  exam_week_reset: {
    id: "exam_week_reset",
    name: "Exam Week Reset",
    mainMin: 10,
    intensity: "low",
    ratio: { mobility: 3, cardio: 1.5, core: 1 },
    whyTemplate: "Stress is loud — short, calming, focus-clearing.",
  },
  eight_hour_sitting_reset: {
    id: "eight_hour_sitting_reset",
    name: "8-Hour Sitting Reset",
    mainMin: 10,
    intensity: "low",
    ratio: { mobility: 3, hinge: 1.5, cardio: 1 },
    whyTemplate: "{sit}h sat today — hips, glutes, thoracic, a short walk.",
  },
};
