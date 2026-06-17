import type { UserProfile, Checkin, FitnessLevel } from "../types";
import { PROTOCOLS, type Protocol, type ProtocolId } from "./protocols";

export interface Signals {
  sittingHoursToday: number;
  daysSinceLastWorkout: number;
  streak: number;
}

export interface ProtocolPlan {
  protocol: Protocol;
  reason: string;
  /** Effective level — may be bumped or reduced from profile level. */
  level: FitnessLevel;
  /** Effective time budget the builder must respect. */
  timeMin: number;
  /** Whether to also offer a Posture Reset as a side recovery mission. */
  recoveryMission: boolean;
}

const SITTER_LIFESTYLES = new Set(["gamer", "developer", "office", "freelancer", "creator"]);

function dropLevel(l: FitnessLevel): FitnessLevel {
  return l === "advanced" ? "intermediate" : l === "intermediate" ? "beginner" : "beginner";
}
function bumpLevel(l: FitnessLevel): FitnessLevel {
  return l === "beginner" ? "intermediate" : l === "intermediate" ? "advanced" : "advanced";
}

export function selectProtocol(
  profile: UserProfile,
  checkin: Checkin,
  signals: Signals,
): ProtocolPlan {
  const goals = new Set(profile.goals);
  const lifestyle = profile.lifestyle;
  const sitsHeavy = signals.sittingHoursToday >= 6 && SITTER_LIFESTYLES.has(lifestyle);

  // 1. Long absence → no-guilt restart.
  if (signals.daysSinceLastWorkout >= 3) {
    const p = PROTOCOLS.recovery_restart;
    return {
      protocol: p,
      reason: p.whyTemplate.replace("{miss}", String(signals.daysSinceLastWorkout)),
      level: dropLevel(profile.level),
      timeMin: Math.min(checkin.timeMin, 5),
      recoveryMission: false,
    };
  }

  // 2. Soreness → mobility only.
  if (checkin.sore) {
    const p = PROTOCOLS.mobility_only;
    return { protocol: p, reason: p.whyTemplate, level: dropLevel(profile.level), timeMin: Math.min(checkin.timeMin, 15), recoveryMission: sitsHeavy };
  }

  // 3. Student + high stress (or exam-week proxy) → reset flow.
  if (lifestyle === "student" && (checkin.stress === "high" || profile.stress >= 4)) {
    const p = PROTOCOLS.student_exam;
    return { protocol: p, reason: p.whyTemplate, level: dropLevel(profile.level), timeMin: Math.min(checkin.timeMin, 10), recoveryMission: false };
  }

  // 4. Low energy → low-energy flow.
  if (checkin.energy === "low" || profile.energy <= 2) {
    const p = PROTOCOLS.low_energy_flow;
    return { protocol: p, reason: p.whyTemplate, level: dropLevel(profile.level), timeMin: Math.min(checkin.timeMin, 12), recoveryMission: sitsHeavy };
  }

  // 5. Strong streak + healthy signals → strength focus / progressive overload.
  if (signals.streak >= 14 && checkin.energy === "high" && checkin.timeMin >= 20) {
    const p = PROTOCOLS.strength_focus;
    return { protocol: p, reason: p.whyTemplate, level: bumpLevel(profile.level), timeMin: checkin.timeMin, recoveryMission: sitsHeavy };
  }

  // 6. Heavy sit day → posture reset is the main session (small windows).
  if (sitsHeavy && checkin.timeMin <= 10) {
    const p = PROTOCOLS.posture_reset;
    return {
      protocol: p,
      reason: p.whyTemplate.replace("{sit}", String(signals.sittingHoursToday)),
      level: profile.level,
      timeMin: Math.min(checkin.timeMin, 10),
      recoveryMission: false,
    };
  }

  // 7. Default → balanced full-body, tuned by goals.
  const p = { ...PROTOCOLS.full_body };
  if (goals.has("posture")) p.ratio = { ...p.ratio, pull: 2, hinge: 1.5, mobility: 1 };
  if (goals.has("muscle_gain")) p.ratio = { ...p.ratio, squat: 1.5, push: 1.5, pull: 1.5, hinge: 1.5, mobility: 0.25 };
  if (goals.has("weight_loss")) p.ratio = { ...p.ratio, cardio: 1, core: 1.5 };
  if (goals.has("mobility")) p.ratio = { ...p.ratio, mobility: 1.5 };

  return {
    protocol: p,
    reason: p.whyTemplate,
    level: profile.level,
    timeMin: checkin.timeMin,
    recoveryMission: sitsHeavy,
  };
}

export function recoveryMissionPlan(profile: UserProfile, signals: Signals): ProtocolPlan {
  const p = PROTOCOLS.posture_reset;
  return {
    protocol: p,
    reason: p.whyTemplate.replace("{sit}", String(signals.sittingHoursToday)),
    level: profile.level,
    timeMin: 8,
    recoveryMission: false,
  };
}

export type { ProtocolId };
