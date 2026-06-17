import type { UserProfile } from "../types";
import { modeFor } from "../modes";
import type { Signals } from "./selector";

export interface RecCard {
  title: string;
  body: string;
  tone: "info" | "recovery" | "celebrate" | "restart";
  cta?: string;
}

export function recommendationMessage(
  profile: UserProfile | null,
  signals: Signals,
): RecCard {
  const lex = modeFor(profile).lexicon;
  if (!profile) {
    return { title: lex.adaptivePrefix, body: "Finish onboarding to unlock adaptive sessions.", tone: "info" };
  }
  if (signals.daysSinceLastWorkout >= 3) {
    return {
      title: "Restart Mode",
      body: `It's been ${signals.daysSinceLastWorkout} days. No worries — a 5-minute win brings the streak back.`,
      tone: "restart",
      cta: "5-min restart",
    };
  }
  if (signals.sittingHoursToday >= 7) {
    return {
      title: "Recovery Mission",
      body: `You sat ${signals.sittingHoursToday}h today. Neck, wrists and thoracic want 8 minutes.`,
      tone: "recovery",
      cta: "Start recovery",
    };
  }
  if (signals.streak >= 14) {
    return {
      title: "Progression unlocked",
      body: `${signals.streak}-day streak — your body has earned the next tier. Ready to push?`,
      tone: "celebrate",
      cta: "Step up",
    };
  }
  if (profile.energy <= 2) {
    return {
      title: lex.adaptivePrefix,
      body: "Energy reads low. A 10-minute flow keeps the streak alive — XP still counts.",
      tone: "info",
    };
  }
  return {
    title: lex.adaptivePrefix,
    body: "Consistency compounds. Today's session is calibrated to your signals.",
    tone: "info",
  };
}
