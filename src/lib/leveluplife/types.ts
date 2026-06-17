export type LifestyleType =
  | "student"
  | "office"
  | "gamer"
  | "developer"
  | "business"
  | "creator"
  | "nightshift"
  | "freelancer"
  | "custom";

export type MotivationStyle =
  | "hunter"
  | "hero"
  | "zen"
  | "scientist"
  | "story"
  | "discipline";

export type EquipmentItem = "none" | "bands" | "dumbbells" | "chair" | "pullup";

export type Goal =
  | "weight_loss"
  | "muscle_gain"
  | "posture"
  | "stamina"
  | "consistency"
  | "mobility"
  | "discipline"
  | "confidence";

export type FitnessLevel = "beginner" | "intermediate" | "advanced";

export interface UserProfile {
  displayName: string;
  isGuest: boolean;
  ageRange: string;
  height: string;
  weight: string;
  lifestyle: LifestyleType;
  wakeTime: string;
  sleepTime: string;
  sittingHours: number;
  energy: number; // 1..5
  stress: number; // 1..5
  equipment: EquipmentItem[];
  goals: Goal[];
  level: FitnessLevel;
  motivation: MotivationStyle;
}

export interface Quest {
  id: string;
  title: string;
  subtitle: string;
  xp: number;
  icon: string;
  done: boolean;
  category: "hydration" | "stretch" | "mobility" | "walk" | "workout" | "recovery" | "focus";
}

export interface SkillState {
  id: string;
  name: string;
  level: number;
  xp: number;
  description: string;
  icon: string;
}

export interface Stats {
  strength: number;
  stamina: number;
  recovery: number;
  discipline: number;
  vitality: number;
  flexibility: number;
  focus: number;
}

/* ── Adaptive engine state ─────────────────────────────── */

export interface Checkin {
  /** YYYY-MM-DD. */
  date: string;
  energy: "low" | "med" | "high";
  timeMin: 5 | 10 | 20 | 40;
  sore: boolean;
  stress: "low" | "med" | "high";
}

export interface AppState {
  onboarded: boolean;
  profile: UserProfile | null;
  level: number;
  xp: number;
  streak: number;
  quests: Quest[];
  stats: Stats;
  skills: SkillState[];
  /** Today's check-in for the adaptive engine. */
  checkin: Checkin | null;
  /** Approx hours sat today — manually logged, used by the engine. */
  sittingHoursToday: number;
  /** YYYY-MM-DD of last completed workout, for streak/restart logic. */
  lastSessionDate: string | null;
  /** Move IDs from last session, used to de-dupe today's picks. */
  lastMoves: string[];
}
