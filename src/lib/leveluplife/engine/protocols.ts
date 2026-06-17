import type { Pattern } from "./patterns";

export type ProtocolId =
  | "full_body"
  | "posture_reset"
  | "recovery_restart"
  | "low_energy_flow"
  | "mobility_only"
  | "strength_focus"
  | "student_exam";

export interface Protocol {
  id: ProtocolId;
  name: string;          // raw name; mode lexicon may re-skin
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
    ratio: { mobility: 4, core: 1.5, cardio: 1.5 }, // ~40/30/30 mob/strength/cardio
    whyTemplate: "Stress is high — short, calming, brain-clearing.",
  },
};
