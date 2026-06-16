import type { Quest, SkillState, Stats, UserProfile } from "./types";

export function defaultStats(): Stats {
  return {
    strength: 12,
    stamina: 14,
    recovery: 16,
    discipline: 10,
    vitality: 18,
    flexibility: 11,
    focus: 13,
  };
}

export function defaultSkills(): SkillState[] {
  return [
    {
      id: "posture",
      name: "Posture Guardian",
      level: 1,
      xp: 20,
      description: "Resist the slouch. Realign daily.",
      icon: "ShieldCheck",
    },
    {
      id: "endurance",
      name: "Endurance Core",
      level: 1,
      xp: 35,
      description: "Stamina that outlasts the deadline.",
      icon: "Flame",
    },
    {
      id: "discipline",
      name: "Discipline Passive",
      level: 1,
      xp: 60,
      description: "Streaks compound. Identity locks in.",
      icon: "Target",
    },
    {
      id: "flex",
      name: "Flex Master",
      level: 1,
      xp: 15,
      description: "Mobility before mastery.",
      icon: "Sparkles",
    },
  ];
}

export function defaultQuestsFor(p: UserProfile): Quest[] {
  const base: Quest[] = [
    { id: "hydrate", title: "Hydrate", subtitle: "Drink a glass of water", xp: 10, icon: "Droplets", done: false, category: "hydration" },
    { id: "stretch", title: "5-min stretch", subtitle: "Unlock the spine + hips", xp: 15, icon: "Activity", done: false, category: "stretch" },
    { id: "workout", title: "Daily workout", subtitle: "Adaptive session", xp: 40, icon: "Dumbbell", done: false, category: "workout" },
    { id: "walk", title: "10-min walk", subtitle: "Move the blood", xp: 20, icon: "Footprints", done: false, category: "walk" },
  ];

  if (p.lifestyle === "gamer" || p.lifestyle === "developer" || p.sittingHours >= 6) {
    base.splice(2, 0, {
      id: "posture",
      title: "Posture reset",
      subtitle: "Neck + wrist mobility",
      xp: 15,
      icon: "ShieldCheck",
      done: false,
      category: "mobility",
    });
  }
  if (p.stress >= 4 || p.energy <= 2) {
    base.push({
      id: "breath",
      title: "Box breathing",
      subtitle: "4-4-4-4 · 2 minutes",
      xp: 10,
      icon: "Wind",
      done: false,
      category: "recovery",
    });
  }
  return base;
}

export function adaptiveTip(p: UserProfile | null): string {
  if (!p) return "Your system is calibrating. Complete onboarding to unlock recommendations.";
  if (p.lifestyle === "student" && p.stress >= 4)
    return "Long study session detected. Try a 5-minute posture reset before your next block.";
  if ((p.lifestyle === "gamer" || p.lifestyle === "developer") && p.sittingHours >= 6)
    return "6+ sitting hours today. Queue a neck mobility + wrist circuit — keeps the hands sharp.";
  if (p.energy <= 2)
    return "Energy reads low. Swap intensity for a 10-minute recovery flow — XP still counts.";
  if (p.lifestyle === "office")
    return "Mid-day window: a quick standing mobility set offsets 8 hours of chair-time.";
  return "Consistency beats intensity. Knock out today's quests and the streak compounds.";
}

export interface WorkoutMove {
  name: string;
  reps: string;
  rest: number;
  cue: string;
}

export function generateWorkout(p: UserProfile | null): WorkoutMove[] {
  const beginner = !p || p.level === "beginner";
  const eq = p?.equipment ?? ["none"];
  const hasBands = eq.includes("bands");
  const hasDb = eq.includes("dumbbells");

  const warmup: WorkoutMove = {
    name: "Dynamic warm-up",
    reps: "2:00 min",
    rest: 15,
    cue: "Arm circles → hip openers → cat-cow.",
  };

  const sets = beginner ? "3 × 8" : "4 × 12";
  const core = beginner ? "3 × 20s" : "3 × 45s";

  const main: WorkoutMove[] = [
    { name: hasDb ? "Goblet squat" : "Bodyweight squat", reps: sets, rest: 45, cue: "Knees track toes. Chest tall." },
    { name: hasBands ? "Band row" : "Inverted row (table)", reps: sets, rest: 45, cue: "Pull elbows back, squeeze." },
    { name: "Push-up (incline if needed)", reps: sets, rest: 45, cue: "Stack shoulders over wrists." },
    { name: "Glute bridge", reps: sets, rest: 30, cue: "Drive through heels. Squeeze at top." },
    { name: "Plank", reps: core, rest: 30, cue: "Ribs down. Glutes on." },
  ];

  const cooldown: WorkoutMove = {
    name: "Cooldown stretch",
    reps: "3:00 min",
    rest: 0,
    cue: "Long exhales. Forward fold → child's pose → twist.",
  };

  return [warmup, ...main, cooldown];
}

export const lifestyleOptions: { id: UserProfile["lifestyle"]; label: string; emoji: string }[] = [
  { id: "student", label: "Student", emoji: "🎓" },
  { id: "office", label: "Office worker", emoji: "💼" },
  { id: "gamer", label: "Gamer", emoji: "🎮" },
  { id: "developer", label: "Developer", emoji: "⌨️" },
  { id: "business", label: "Business owner", emoji: "📈" },
  { id: "creator", label: "Creator", emoji: "🎨" },
  { id: "nightshift", label: "Night shift", emoji: "🌙" },
  { id: "freelancer", label: "Freelancer", emoji: "💻" },
];

export const motivationStyles: { id: UserProfile["motivation"]; label: string; tag: string; desc: string }[] = [
  { id: "hunter", label: "Hunter Mode", tag: "Solo Leveling", desc: "Rank up. Daily quests. No excuses." },
  { id: "hero", label: "Hero Mode", tag: "Become the version", desc: "Big arc. Identity-driven training." },
  { id: "zen", label: "Zen Mode", tag: "Calm progression", desc: "Quiet, consistent, no pressure." },
  { id: "scientist", label: "Scientist", tag: "Data + protocol", desc: "Metrics, evidence, iteration." },
  { id: "story", label: "Story Mode", tag: "Narrative arc", desc: "Each week is a new chapter." },
];

export const goalOptions: { id: UserProfile["goals"][number]; label: string }[] = [
  { id: "weight_loss", label: "Weight loss" },
  { id: "muscle_gain", label: "Muscle gain" },
  { id: "posture", label: "Posture" },
  { id: "stamina", label: "Stamina" },
  { id: "consistency", label: "Consistency" },
  { id: "mobility", label: "Mobility" },
  { id: "discipline", label: "Discipline" },
  { id: "confidence", label: "Confidence" },
];

export const equipmentOptions: { id: UserProfile["equipment"][number]; label: string }[] = [
  { id: "none", label: "Nothing yet" },
  { id: "bands", label: "Resistance bands" },
  { id: "dumbbells", label: "Dumbbells" },
  { id: "chair", label: "Chair" },
  { id: "pullup", label: "Pull-up bar" },
];