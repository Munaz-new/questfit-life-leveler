/* ────────────────────────────────────────────────────────────────────────
 * Movement library — pattern-tagged, level-progressive, apartment-aware.
 * Every move is annotated with a short science note so the UI can show
 * "why this move" rather than reading like a random YouTube list.
 * ──────────────────────────────────────────────────────────────────── */

export type Pattern =
  | "squat"
  | "push"
  | "pull"
  | "hinge"
  | "core"
  | "mobility"
  | "cardio";

export type Level = "beginner" | "intermediate" | "advanced";
export type Equip = "none" | "bands" | "dumbbells" | "chair" | "pullup";

export interface Move {
  id: string;
  name: string;
  pattern: Pattern;
  level: Level;
  equipment: Equip;          // minimum needed
  apartmentSafe: boolean;    // no loud jumping
  reps: string;
  rest: number;              // seconds
  cue: string;
  scienceNote?: string;
  /** Optional finer body-part tag for mobility moves. */
  area?: "neck" | "wrist" | "thoracic" | "shoulder" | "hip" | "ankle" | "hamstring" | "full";
}

export const MOVES: Move[] = [
  /* ── SQUAT ─────────────────────────────────────────────── */
  { id: "squat-chair",    name: "Chair squat",          pattern: "squat", level: "beginner",     equipment: "chair",     apartmentSafe: true,  reps: "3 × 8",  rest: 45, cue: "Tap the seat, stand tall.",            scienceNote: "Builds knee + hip ROM safely." },
  { id: "squat-assisted", name: "Assisted squat",       pattern: "squat", level: "beginner",     equipment: "none",      apartmentSafe: true,  reps: "3 × 10", rest: 45, cue: "Hold a doorframe. Knees track toes." },
  { id: "squat-bw",       name: "Bodyweight squat",    pattern: "squat", level: "beginner",     equipment: "none",      apartmentSafe: true,  reps: "3 × 12", rest: 45, cue: "Chest tall. Sit between your hips.",     scienceNote: "Foundation lower-body pattern." },
  { id: "squat-goblet",   name: "Goblet squat",         pattern: "squat", level: "intermediate", equipment: "dumbbells", apartmentSafe: true,  reps: "4 × 10", rest: 60, cue: "Elbows inside knees at the bottom." },
  { id: "squat-split",    name: "Split squat",          pattern: "squat", level: "intermediate", equipment: "none",      apartmentSafe: true,  reps: "3 × 8/leg", rest: 60, cue: "Back-knee hovers. Front shin vertical.", scienceNote: "Unilateral — fixes left/right gaps." },
  { id: "squat-pistol",   name: "Assisted pistol",      pattern: "squat", level: "advanced",     equipment: "none",      apartmentSafe: true,  reps: "3 × 5/leg",  rest: 75, cue: "Hold a strap for balance. Sit slow." },

  /* ── PUSH ──────────────────────────────────────────────── */
  { id: "push-wall",      name: "Wall push-up",         pattern: "push",  level: "beginner",     equipment: "none",      apartmentSafe: true,  reps: "3 × 10", rest: 45, cue: "Elbows ~45°. Body in a line.",          scienceNote: "Beginner-safe pushing pattern." },
  { id: "push-incline",   name: "Incline push-up",      pattern: "push",  level: "beginner",     equipment: "chair",     apartmentSafe: true,  reps: "3 × 8",  rest: 45, cue: "Hands on seat. Ribs down." },
  { id: "push-bw",        name: "Push-up",              pattern: "push",  level: "intermediate", equipment: "none",      apartmentSafe: true,  reps: "4 × 8",  rest: 60, cue: "Stack shoulders over wrists." },
  { id: "push-decline",   name: "Decline push-up",      pattern: "push",  level: "advanced",     equipment: "chair",     apartmentSafe: true,  reps: "4 × 8",  rest: 75, cue: "Feet elevated. Long body line." },

  /* ── PULL (critical for sitters) ──────────────────────── */
  { id: "pull-band-row",  name: "Band row",             pattern: "pull",  level: "beginner",     equipment: "bands",     apartmentSafe: true,  reps: "3 × 12", rest: 45, cue: "Pull to ribs. Squeeze shoulder blades.", scienceNote: "Counters forward-rounded posture." },
  { id: "pull-towel-row", name: "Towel row (door)",     pattern: "pull",  level: "beginner",     equipment: "none",      apartmentSafe: true,  reps: "3 × 10", rest: 45, cue: "Lean back, drive elbows behind ribs." },
  { id: "pull-db-row",    name: "Dumbbell row",         pattern: "pull",  level: "intermediate", equipment: "dumbbells", apartmentSafe: true,  reps: "4 × 10/side", rest: 60, cue: "Flat back. Elbow up the seam." },
  { id: "pull-scap",      name: "Scapular pulls",       pattern: "pull",  level: "beginner",     equipment: "pullup",    apartmentSafe: true,  reps: "3 × 8",  rest: 45, cue: "Hang. Pack shoulders down + back." },
  { id: "pull-pullup",    name: "Pull-up",              pattern: "pull",  level: "advanced",     equipment: "pullup",    apartmentSafe: true,  reps: "4 × 5",  rest: 90, cue: "Chest to bar. No kipping." },

  /* ── HINGE ─────────────────────────────────────────────── */
  { id: "hinge-bridge",   name: "Glute bridge",         pattern: "hinge", level: "beginner",     equipment: "none",      apartmentSafe: true,  reps: "3 × 12", rest: 45, cue: "Heels down. Squeeze at the top.",       scienceNote: "Wakes glutes — protects low back." },
  { id: "hinge-drill",    name: "Hip hinge drill",      pattern: "hinge", level: "beginner",     equipment: "none",      apartmentSafe: true,  reps: "3 × 10", rest: 30, cue: "Push hips back. Flat spine." },
  { id: "hinge-rdl-db",   name: "Romanian deadlift",    pattern: "hinge", level: "intermediate", equipment: "dumbbells", apartmentSafe: true,  reps: "4 × 8",  rest: 75, cue: "Weights graze legs. Hinge, don't squat." },
  { id: "hinge-single",   name: "Single-leg RDL",       pattern: "hinge", level: "advanced",     equipment: "dumbbells", apartmentSafe: true,  reps: "3 × 8/leg",  rest: 75, cue: "Hips square. Reach long." },

  /* ── CORE (function, not crunches) ────────────────────── */
  { id: "core-deadbug",   name: "Dead bug",             pattern: "core",  level: "beginner",     equipment: "none",      apartmentSafe: true,  reps: "3 × 8/side", rest: 30, cue: "Low-back glued to floor.",        scienceNote: "Anti-extension — spinal stability." },
  { id: "core-birddog",   name: "Bird dog",             pattern: "core",  level: "beginner",     equipment: "none",      apartmentSafe: true,  reps: "3 × 8/side", rest: 30, cue: "Reach long. No hip rotation." },
  { id: "core-plank",     name: "Plank",                pattern: "core",  level: "intermediate", equipment: "none",      apartmentSafe: true,  reps: "3 × 30s", rest: 30, cue: "Ribs down. Glutes on." },
  { id: "core-side",      name: "Side plank",           pattern: "core",  level: "intermediate", equipment: "none",      apartmentSafe: true,  reps: "3 × 20s/side", rest: 30, cue: "Stack hips. Push the floor away." },

  /* ── MOBILITY / RECOVERY ──────────────────────────────── */
  { id: "mob-neck",       name: "Neck CARs",            pattern: "mobility", level: "beginner", equipment: "none",       apartmentSafe: true,  reps: "1:00 min", rest: 0, cue: "Slow controlled circles — both ways.",    scienceNote: "Restores cervical ROM after screens.", area: "neck" },
  { id: "mob-wrist",      name: "Wrist circles + stretch", pattern: "mobility", level: "beginner", equipment: "none",    apartmentSafe: true,  reps: "1:00 min", rest: 0, cue: "Palms up, palms down. Hold each 20s.",    scienceNote: "Counters keyboard/controller load.", area: "wrist" },
  { id: "mob-thoracic",   name: "Thoracic opener",      pattern: "mobility", level: "beginner", equipment: "none",       apartmentSafe: true,  reps: "1:30 min", rest: 0, cue: "Quadruped. Reach hand to sky, rotate.",   scienceNote: "Unlocks the mid-back stiffened by sitting.", area: "thoracic" },
  { id: "mob-shoulder",   name: "Shoulder dislocates",  pattern: "mobility", level: "beginner", equipment: "none",       apartmentSafe: true,  reps: "2 × 8",    rest: 15, cue: "Use a towel. Pass overhead, slow.",       area: "shoulder" },
  { id: "mob-hip",        name: "Hip flexor stretch",   pattern: "mobility", level: "beginner", equipment: "none",       apartmentSafe: true,  reps: "1:00/side",rest: 0, cue: "Half-kneel. Tuck tailbone, then lean.",    scienceNote: "Releases what sitting tightens.", area: "hip" },
  { id: "mob-ankle",      name: "Ankle rocks",          pattern: "mobility", level: "beginner", equipment: "none",       apartmentSafe: true,  reps: "1:00 min", rest: 0, cue: "Knee over toe. Heel down.",               area: "ankle" },
  { id: "mob-hams",       name: "Hamstring floss",      pattern: "mobility", level: "beginner", equipment: "none",       apartmentSafe: true,  reps: "1:00/side",rest: 0, cue: "Lying. Strap or hand behind thigh.",      area: "hamstring" },
  { id: "mob-catcow",     name: "Cat–cow",              pattern: "mobility", level: "beginner", equipment: "none",       apartmentSafe: true,  reps: "1:30 min", rest: 0, cue: "Move with the breath. Spine wave.",       area: "full" },

  /* ── CARDIO (low-impact, apartment safe) ──────────────── */
  { id: "cardio-march",   name: "Marching in place",    pattern: "cardio", level: "beginner",    equipment: "none",      apartmentSafe: true,  reps: "2:00 min", rest: 30, cue: "Drive knees. Pump arms." },
  { id: "cardio-walk",    name: "Brisk walk",           pattern: "cardio", level: "beginner",    equipment: "none",      apartmentSafe: true,  reps: "10:00 min",rest: 0,  cue: "Outside if possible. Long exhales." },
];

/* Hierarchy used when filtering by available equipment. */
const EQUIP_OK: Record<Equip, Equip[]> = {
  none:     ["none"],
  chair:    ["none", "chair"],
  bands:    ["none", "bands"],
  dumbbells:["none", "dumbbells"],
  pullup:   ["none", "pullup"],
};

export function filterMoves(opts: {
  pattern?: Pattern;
  level: Level;
  equipment: Equip[];
  apartmentSafe?: boolean;
  area?: Move["area"];
}): Move[] {
  const allowed = new Set<Equip>();
  for (const e of opts.equipment) for (const a of EQUIP_OK[e] ?? []) allowed.add(a);
  if (allowed.size === 0) allowed.add("none");
  const levelRank: Record<Level, number> = { beginner: 0, intermediate: 1, advanced: 2 };
  const maxRank = levelRank[opts.level];
  return MOVES.filter((m) => {
    if (opts.pattern && m.pattern !== opts.pattern) return false;
    if (opts.area && m.area !== opts.area) return false;
    if (!allowed.has(m.equipment)) return false;
    if (levelRank[m.level] > maxRank) return false;
    if (opts.apartmentSafe && !m.apartmentSafe) return false;
    return true;
  });
}
