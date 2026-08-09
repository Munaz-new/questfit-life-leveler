/* ────────────────────────────────────────────────────────────────────────
 * Adaptive Day Engine — the single place a day is decided.
 *
 * generateDay() is pure: no React, no storage, no side effects. It reuses
 * the existing protocol selector so exercise selection logic is never
 * duplicated, then wraps the result in real-life missions.
 * ──────────────────────────────────────────────────────────────────── */

import type { Checkin, UserProfile } from "../types";
import { selectProtocol } from "../engine/selector";
import { PROTOCOLS, type ProtocolId } from "../engine/protocols";
import {
  SAFETY_NOTE,
  activeDaysThisWeek,
  energyScore,
  isGentleRestart,
  missionCapFor,
  needsPhysicalCare,
  recentWorkoutDays,
  shouldEnterRecoveryMode,
  showsOverload,
  workoutMinutesFor,
} from "./rules";
import type {
  AdaptiveInput,
  DailyMission,
  DailyPlan,
  DayHistory,
} from "./types";

/** Bridge the fast 3-tap report into the existing Checkin shape. */
export function inputToCheckin(input: AdaptiveInput): Checkin {
  const score = energyScore(input.energy);
  return {
    date: input.date,
    energy: score >= 3 ? "high" : score === 2 ? "med" : "low",
    timeMin: input.timeMin === 30 ? 40 : input.timeMin,
    sore: needsPhysicalCare(input),
    stress: score <= 1 ? "high" : score === 2 ? "med" : "low",
  };
}

function roundXp(n: number): number {
  return Math.max(10, Math.round(n / 5) * 5);
}

/** Recovery-mode protocols never come from the strength family. */
function recoveryProtocolFor(
  input: AdaptiveInput,
  history: DayHistory,
  fallback: ProtocolId,
): ProtocolId {
  if (isGentleRestart(history)) return "recovery_restart";
  if (input.physical === "sore") return "mobility_only";
  if (history.sittingHoursToday >= 8) return "eight_hour_sitting_reset";
  if (energyScore(input.energy) <= 1) return "low_energy_flow";
  const safe: ProtocolId[] = [
    "mobility_only",
    "low_energy_flow",
    "posture_reset",
    "recovery_restart",
    "gamer_neck_recovery",
    "programmer_flow",
    "laptop_posture_fix",
    "office_mobility",
    "midnight_coding_recovery",
    "study_break_flow",
    "exam_week_reset",
    "eight_hour_sitting_reset",
  ];
  return safe.includes(fallback) ? fallback : "low_energy_flow";
}

function whySentences(
  input: AdaptiveInput,
  history: DayHistory,
  recoveryMode: boolean,
  workoutMin: number,
  protocolName: string,
): string[] {
  const out: string[] = [];
  const reported =
    input.energy === "exhausted"
      ? "You reported being exhausted"
      : input.energy === "low"
        ? "You reported low energy"
        : input.energy === "okay"
          ? "You reported okay energy"
          : input.energy === "good"
            ? "You reported good energy"
            : "You reported great energy";
  out.push(`${reported} and about ${input.timeMin} minutes available.`);

  if (isGentleRestart(history)) {
    out.push(
      `It's been ${history.daysSinceLastWorkout} days since your last session, so today starts small on purpose.`,
    );
  } else if (input.physical === "sore") {
    out.push("You flagged soreness, so today prioritises mobility over load.");
  } else if (input.physical === "recovering") {
    out.push("You're recovering, so intensity stays low and the volume is short.");
  } else if (showsOverload(input, history)) {
    out.push(
      `You've trained ${recentWorkoutDays(history)} of the last 7 days — today reduces load to let that work settle.`,
    );
  } else if (history.sittingHoursToday >= 6) {
    out.push(
      `You've been sitting about ${history.sittingHoursToday}h today, so hips, thoracic and neck come first.`,
    );
  }

  if (recoveryMode) {
    out.push(`Today's plan is a ${workoutMin}-minute ${protocolName.toLowerCase()} plus light real-life missions.`);
  } else {
    out.push(`Today's main block is a ${workoutMin}-minute ${protocolName.toLowerCase()}.`);
  }

  if (activeDaysThisWeek(history) >= 5 && !recoveryMode) {
    out.push("Your consistency this week is strong, so progression is applied gradually.");
  }
  return out.slice(0, 3);
}

export function generateDay(
  profile: UserProfile,
  input: AdaptiveInput,
  history: DayHistory,
  revision = 1,
): DailyPlan {
  const checkin = inputToCheckin(input);
  const signals = {
    sittingHoursToday: history.sittingHoursToday,
    daysSinceLastWorkout: history.daysSinceLastWorkout,
    streak: history.streak,
  };

  const selected = selectProtocol(profile, checkin, signals);
  const recoveryMode = shouldEnterRecoveryMode(input, history);
  const restart = isGentleRestart(history);

  const protocolId: ProtocolId = recoveryMode
    ? recoveryProtocolFor(input, history, selected.protocol.id)
    : selected.protocol.id;
  const protocol = PROTOCOLS[protocolId] ?? selected.protocol;
  const workoutMin = Math.min(
    workoutMinutesFor(input.timeMin, recoveryMode, restart),
    protocol.mainMin + 6,
  );
  const intensity = recoveryMode ? "low" : protocol.intensity;

  const mobilityFocused =
    intensity === "low" || protocol.id === "mobility_only" || recoveryMode;

  const main: DailyMission = {
    id: "m-workout",
    slot: "main",
    kind: "workout",
    title: `${workoutMin}-minute ${protocol.name}`,
    subtitle: recoveryMode
      ? "Reduced load — guided in the player"
      : "Guided session in the Workout Player",
    xp: roundXp(14 + workoutMin * 1.4),
    icon: mobilityFocused ? "Activity" : "Dumbbell",
    protocolId,
    durationSec: workoutMin * 60,
    stat: mobilityFocused ? "flexibility" : "strength",
    skillId: mobilityFocused ? "flex" : "discipline",
    verifiable: true,
    done: false,
  };

  const mobilitySec = input.timeMin === 5 ? 120 : recoveryMode ? 300 : 300;
  const side: DailyMission = recoveryMode
    ? {
        id: "m-breathe",
        slot: "side",
        kind: "timed",
        title: "Breathing reset",
        subtitle: "Box breathing · 4-4-4-4",
        xp: 10,
        icon: "Wind",
        durationSec: 120,
        stat: "recovery",
        skillId: "posture",
        verifiable: true,
        done: false,
      }
    : {
        id: "m-mobility",
        slot: "side",
        kind: "timed",
        title: `${Math.round(mobilitySec / 60)}-minute mobility reset`,
        subtitle: "Spine, hips, shoulders",
        xp: 15,
        icon: "Sparkles",
        durationSec: mobilitySec,
        stat: "flexibility",
        skillId: "flex",
        verifiable: true,
        done: false,
      };

  const hydration: DailyMission = {
    id: "m-hydrate",
    slot: "recovery",
    kind: "hydration",
    title: "Hydration",
    subtitle: "Log glasses of water as you drink them",
    xp: 10,
    icon: "Droplets",
    stat: "recovery",
    verifiable: false,
    done: false,
    target: 6,
    progress: 0,
  };

  const focusMin = input.timeMin >= 20 && energyScore(input.energy) >= 2 ? 25 : 10;
  const focus: DailyMission = {
    id: "m-focus",
    slot: "focus",
    kind: "focus",
    title: `${focusMin}-minute focus session`,
    subtitle: "One task, no switching",
    xp: focusMin >= 25 ? 20 : 12,
    icon: "Brain",
    durationSec: focusMin * 60,
    stat: "focus",
    verifiable: true,
    done: false,
  };

  const walkMin = recoveryMode || input.timeMin <= 10 ? 10 : 15;
  const walk: DailyMission = {
    id: "m-walk",
    slot: "bonus",
    kind: "walk",
    title: `${walkMin}-minute walk`,
    subtitle: "Self-reported — the app can't verify this",
    xp: 15,
    icon: "Footprints",
    durationSec: walkMin * 60,
    stat: "stamina",
    skillId: "endurance",
    verifiable: false,
    done: false,
  };

  const posture: DailyMission = {
    id: "m-posture",
    slot: "side",
    kind: "timed",
    title: "Posture reset",
    subtitle: "Neck, wrists, thoracic",
    xp: 12,
    icon: "ShieldCheck",
    durationSec: 90,
    stat: "flexibility",
    skillId: "posture",
    verifiable: true,
    done: false,
  };

  const ordered: DailyMission[] = recoveryMode
    ? [main, side, hydration, walk, posture]
    : history.sittingHoursToday >= 6
      ? [main, posture, hydration, focus, walk]
      : [main, side, hydration, focus, walk];

  const cap = missionCapFor(input.timeMin, recoveryMode);
  const missions = ordered.slice(0, cap);

  return {
    date: input.date,
    missions,
    recoveryMode,
    whyThisPlan: whySentences(input, history, recoveryMode, workoutMin, protocol.name),
    intensity,
    protocolId,
    workoutMin,
    revision,
    safetyNote: SAFETY_NOTE,
  };
}

/**
 * Recalibrate: regenerate only the missions that are still open. Completed
 * missions (and the XP they already banked) are carried over untouched.
 */
export function recalibrateDay(
  profile: UserProfile,
  plan: DailyPlan,
  input: AdaptiveInput,
  history: DayHistory,
): DailyPlan {
  const fresh = generateDay(profile, input, history, plan.revision + 1);
  const kept = plan.missions.filter((m) => m.done || (m.progress ?? 0) > 0);
  const keptIds = new Set(kept.map((m) => m.id));
  const merged = [
    ...kept,
    ...fresh.missions.filter((m) => !keptIds.has(m.id)),
  ];
  const slotRank: Record<DailyMission["slot"], number> = {
    main: 0,
    side: 1,
    recovery: 2,
    focus: 3,
    bonus: 4,
  };
  merged.sort((a, b) => slotRank[a.slot] - slotRank[b.slot]);
  return { ...fresh, missions: merged };
}
