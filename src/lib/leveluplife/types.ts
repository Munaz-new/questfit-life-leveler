export type LifestyleType =
  | "student"
  | "office"
  | "gamer"
  | "developer"
  | "business"
  | "creator"
  | "nightshift"
  | "freelancer"
  | "parent"
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

export type PrimaryGoal =
  | "build_strength"
  | "lose_fat"
  | "improve_endurance"
  | "improve_mobility"
  | "general_fitness"
  | "build_consistency";

export type WorkSchedule = "daytime" | "evening" | "night" | "rotating" | "flexible";

export type RoomSize = "tiny" | "small" | "medium" | "large";

export type FitnessLevel = "beginner" | "intermediate" | "advanced";

export interface UserProfile {
  displayName: string;
  isGuest: boolean;
  /** Demonstration gender preference. Affects demo media only, never logic. */
  gender: "male" | "female";
  ageRange: string;
  height: string;
  weight: string;
  lifestyle: LifestyleType;
  /** Work / study schedule shape — used later by the Life Adaptation Engine. */
  schedule: WorkSchedule;
  /** Available workout space. */
  roomSize: RoomSize;
  /** Single headline goal chosen during onboarding. */
  primaryGoal: PrimaryGoal;
  wakeTime: string;
  sleepTime: string;
  sittingHours: number;
  energy: number;
  stress: number;
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

export interface Checkin {
  date: string;
  energy: "low" | "med" | "high";
  timeMin: 5 | 10 | 20 | 40;
  sore: boolean;
  stress: "low" | "med" | "high";
}

/** A serialized live workout session in progress. */
export interface WorkoutSet {
  exerciseId: string;
  reps?: number;
  weightKg?: number;
}

export type SetPerformance = Omit<WorkoutSet, "exerciseId">;

export interface ActiveSessionState {
  loggedSets?: WorkoutSet[];
  startedAt: number;
  /** Linear list of move ids in order (warmup → main → cooldown). */
  order: string[];
  /** Cursor over `order`. */
  cursor: number;
  /** Set we're on for the current rep-based move (1-indexed). */
  currentSet: number;
  /** Whether we're in the rest screen after the current move. */
  inRest: boolean;
  /** Move ids the user fully completed (earn XP). */
  completed: string[];
  /** Move ids the user skipped (no XP). */
  skipped: string[];
  /** Forced protocol id (e.g. recovery mission). */
  forceProtocol?: string;
  /** Snapshot of the built session so we don't rebuild on every render. */
  session: import("./engine/builder").Session;
}

export interface SummaryState {
  loggedSets?: WorkoutSet[];
  date: string;
  protocolId: string;
  protocolName: string;
  durationSec: number;
  totalMoves: number;
  completedMoves: number;
  skippedMoves: number;
  xpEarned: number;
  caloriesEst: number | null;
  patternHits: Partial<Record<string, number>>;
  partial: boolean;
}

export interface WorkoutRoutine {
  id: string;
  name: string;
  exercises: { id: string; target: string; rest: number }[];
}

export interface GymSchedule {
  mode: "fixed" | "rotation";
  week: string[];
  rotation: string[];
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
  checkin: Checkin | null;
  sittingHoursToday: number;
  lastSessionDate: string | null;
  lastMoves: string[];
  /** Live workout session, null when nothing is in progress. */
  activeSession: ActiveSessionState | null;
  /** Last finished session summary, shown on the summary route. */
  lastSummary: SummaryState | null;
  workoutHistory: SummaryState[];
  routines: WorkoutRoutine[];
  favoriteExerciseIds: string[];
  gymSchedule: GymSchedule;
  journalNotes: Record<string, string>;
  /** Adaptive difficulty offset (−1 reduce / 0 baseline / +1 push). */
  adaptiveBoost: -1 | 0 | 1;
  /** Recent completion percentages, used to drive adaptiveBoost. */
  recentCompletion: number[];
  /** Today's adaptive plan, null until the daily check-in is done. */
  dailyPlan: import("./day/types").DailyPlan | null;
  /** The self-report that produced `dailyPlan`. */
  adaptiveInput: import("./day/types").AdaptiveInput | null;
  /** Trailing day-by-day mission history (kept to 14 days). */
  dayRecords: import("./day/types").DayRecord[];
}
