import type { CSSProperties } from "react";
import type { MotivationStyle, UserProfile } from "./types";

/* ──────────────────────────────────────────────────────────────────────────
 * Mode system
 *
 * Each mode redefines a small set of CSS custom properties on the app
 * wrapper. Because shared components (XPBar, GlassCard, BottomNav,
 * gradient buttons) already consume those variables, swapping modes
 * re-themes the entire visible surface — no per-component branching.
 *
 * Modes also ship:
 *   - a `lexicon` (microcopy) for workout / quest / xp / level / streak...
 *   - an `aesthetic` token (sharp / cinematic / soft / clinical /
 *     narrative / brutal) which gates per-mode utility classes.
 *   - greetings + adaptive-tip framing helpers.
 * ─────────────────────────────────────────────────────────────────────── */

export type Aesthetic =
  | "sharp"
  | "cinematic"
  | "soft"
  | "clinical"
  | "narrative"
  | "brutal";

export interface ModeLexicon {
  /** Single-word noun for a completable task ("Quest" / "Flow" / ...). */
  quest: string;
  questPlural: string;
  /** Capitalized phrase used in lists ("Daily Missions"). */
  dailyQuests: string;
  /** What the workout itself is called ("Quest" / "Protocol" / ...). */
  workout: string;
  /** Currency name ("XP" / "Growth" / "Performance"). */
  xp: string;
  /** Level / rank name. */
  level: string;
  /** Short level token used inline (e.g. "Rank E" / "Lv. 4"). */
  levelShort: (n: number) => string;
  streak: string;
  completed: string;
  progress: string;
  ctaPrimary: string;
  identity: string;
  emptyState: string;
  adaptivePrefix: string;
  greeting: (hour: number, name: string) => string;
  finishCta: string;
}

export interface ModeTheme {
  id: MotivationStyle;
  label: string;
  emoji: string;
  shortTag: string;
  identity: string;
  aesthetic: Aesthetic;
  /** Palette for preview chips (hex, for non-CSS uses). */
  swatch: [string, string, string];
  /** CSS variable overrides applied on the wrapper. */
  vars: CSSProperties;
  lexicon: ModeLexicon;
}

/* ── color helpers ───────────────────────────────────────────────────── */

function gradient(a: string, b: string) {
  return `linear-gradient(135deg, ${a}, ${b})`;
}

function bgField(c1: string, c2: string) {
  return `radial-gradient(1200px 600px at 20% -10%, ${c1}, transparent 60%), radial-gradient(900px 500px at 100% 100%, ${c2}, transparent 60%)`;
}

function glow(c: string, strength = 55) {
  return `0 0 40px -10px color-mix(in oklab, ${c} ${strength}%, transparent)`;
}

/* ── modes ───────────────────────────────────────────────────────────── */

export const MODES: Record<MotivationStyle, ModeTheme> = {
  /* ⚔ HUNTER ─ Solo-leveling cyber. Sharp, electric, grind-coded. */
  hunter: {
    id: "hunter",
    label: "Hunter Mode",
    emoji: "⚔",
    shortTag: "Rank up",
    identity: "I must become stronger.",
    aesthetic: "sharp",
    swatch: ["#00D4FF", "#7C3AED", "#070B14"],
    vars: {
      "--background": "oklch(0.14 0.04 265)",
      "--card": "oklch(0.20 0.045 265)",
      "--primary": "oklch(0.82 0.18 215)",
      "--primary-foreground": "oklch(0.10 0.04 265)",
      "--cyan-glow": "oklch(0.82 0.18 215)",
      "--electric": "oklch(0.62 0.22 260)",
      "--rare": "oklch(0.55 0.25 295)",
      "--ring": "oklch(0.82 0.18 215)",
      "--radius": "1rem",
      "--gradient-primary": gradient("oklch(0.82 0.18 215)", "oklch(0.62 0.22 260)"),
      "--gradient-rare": gradient("oklch(0.62 0.22 260)", "oklch(0.55 0.25 295)"),
      "--gradient-bg": bgField(
        "oklch(0.34 0.14 245 / 38%)",
        "oklch(0.30 0.18 290 / 28%)",
      ),
      "--shadow-glow": glow("oklch(0.82 0.18 215)", 60),
      "--shadow-rare": glow("oklch(0.55 0.25 295)", 55),
    } as CSSProperties,
    lexicon: {
      quest: "Quest",
      questPlural: "Quests",
      dailyQuests: "Daily Missions",
      workout: "Quest",
      xp: "XP",
      level: "Hunter Rank",
      levelShort: (n) => `Rank ${["E", "D", "C", "B", "A", "S"][Math.min(5, n - 1)] ?? "S"}`,
      streak: "Streak",
      completed: "Quest Cleared",
      progress: "Ascension",
      ctaPrimary: "Begin Quest",
      identity: "I must become stronger.",
      emptyState: "All missions cleared. Recovery quest unlocks at dawn.",
      adaptivePrefix: "System",
      greeting: (h, n) =>
        h < 5 ? `${n}, the dungeon never sleeps.` :
        h < 12 ? `Hunter ${n}. Mission window open.` :
        h < 18 ? `${n}. Stay sharp.` :
                 `${n}. One more raid before dark.`,
      finishCta: "Claim XP",
    },
  },

  /* 🏆 HERO ─ Cinematic, gold + amber, identity arc. */
  hero: {
    id: "hero",
    label: "Hero Mode",
    emoji: "🏆",
    shortTag: "Become",
    identity: "I am becoming my best self.",
    aesthetic: "cinematic",
    swatch: ["#F5B642", "#E07A2C", "#1A130A"],
    vars: {
      "--background": "oklch(0.16 0.025 60)",
      "--card": "oklch(0.22 0.035 60)",
      "--primary": "oklch(0.82 0.16 75)",
      "--primary-foreground": "oklch(0.12 0.02 60)",
      "--cyan-glow": "oklch(0.84 0.15 78)",
      "--electric": "oklch(0.68 0.18 55)",
      "--rare": "oklch(0.58 0.18 35)",
      "--ring": "oklch(0.82 0.16 75)",
      "--radius": "1.25rem",
      "--gradient-primary": gradient("oklch(0.86 0.15 80)", "oklch(0.62 0.18 45)"),
      "--gradient-rare": gradient("oklch(0.72 0.17 55)", "oklch(0.50 0.18 30)"),
      "--gradient-bg": bgField(
        "oklch(0.42 0.14 60 / 30%)",
        "oklch(0.30 0.12 35 / 26%)",
      ),
      "--shadow-glow": glow("oklch(0.84 0.15 78)", 55),
      "--shadow-rare": glow("oklch(0.58 0.18 35)", 50),
    } as CSSProperties,
    lexicon: {
      quest: "Challenge",
      questPlural: "Challenges",
      dailyQuests: "Today's Challenges",
      workout: "Challenge",
      xp: "Growth",
      level: "Hero Journey",
      levelShort: (n) => `Chapter ${n}`,
      streak: "Streak",
      completed: "Step taken",
      progress: "Hero Growth",
      ctaPrimary: "Rise to it",
      identity: "I am becoming my best self.",
      emptyState: "You showed up. That's the chapter.",
      adaptivePrefix: "Mentor",
      greeting: (h, n) =>
        h < 5 ? `Still up, ${n}? Even heroes rest.` :
        h < 12 ? `Good morning, ${n}. Today builds tomorrow's you.` :
        h < 18 ? `${n} — every hero started somewhere.` :
                 `${n}. End the day better than you began it.`,
      finishCta: "Claim Growth",
    },
  },

  /* 🌿 ZEN ─ Calm emerald. Rounded, sustainable, no guilt. */
  zen: {
    id: "zen",
    label: "Zen Mode",
    emoji: "🌿",
    shortTag: "Flow",
    identity: "Consistency without pressure.",
    aesthetic: "soft",
    swatch: ["#34D399", "#0E7C66", "#0A1714"],
    vars: {
      "--background": "oklch(0.18 0.03 170)",
      "--card": "oklch(0.24 0.035 170)",
      "--primary": "oklch(0.78 0.13 165)",
      "--primary-foreground": "oklch(0.14 0.03 170)",
      "--cyan-glow": "oklch(0.80 0.13 170)",
      "--electric": "oklch(0.65 0.13 185)",
      "--rare": "oklch(0.58 0.10 200)",
      "--ring": "oklch(0.78 0.13 165)",
      "--radius": "1.75rem",
      "--gradient-primary": gradient("oklch(0.80 0.13 165)", "oklch(0.58 0.11 195)"),
      "--gradient-rare": gradient("oklch(0.66 0.13 180)", "oklch(0.48 0.10 200)"),
      "--gradient-bg": bgField(
        "oklch(0.36 0.10 170 / 28%)",
        "oklch(0.30 0.09 200 / 22%)",
      ),
      "--shadow-glow": glow("oklch(0.80 0.13 170)", 35),
      "--shadow-rare": glow("oklch(0.58 0.10 200)", 35),
    } as CSSProperties,
    lexicon: {
      quest: "Flow",
      questPlural: "Flows",
      dailyQuests: "Today's Flow",
      workout: "Flow",
      xp: "Momentum",
      level: "Stage",
      levelShort: (n) => `Stage ${n}`,
      streak: "Consistency",
      completed: "Carried through",
      progress: "Momentum",
      ctaPrimary: "Begin gently",
      identity: "Consistency without pressure.",
      emptyState: "Nothing pending. Rest is part of the practice.",
      adaptivePrefix: "Note",
      greeting: (h, n) =>
        h < 5 ? `Quiet hour, ${n}. Breathe.` :
        h < 12 ? `Morning, ${n}. No rush.` :
        h < 18 ? `${n}, small steps matter.` :
                 `Evening, ${n}. Wind down well.`,
      finishCta: "Close the flow",
    },
  },

  /* 🧪 SCIENTIST ─ Clinical blue + white. Data-first, evidence-driven. */
  scientist: {
    id: "scientist",
    label: "Scientist Mode",
    emoji: "🧪",
    shortTag: "Measure",
    identity: "Measure. Improve.",
    aesthetic: "clinical",
    swatch: ["#60A5FA", "#1E40AF", "#0B1220"],
    vars: {
      "--background": "oklch(0.17 0.02 240)",
      "--card": "oklch(0.22 0.025 240)",
      "--primary": "oklch(0.74 0.14 235)",
      "--primary-foreground": "oklch(0.12 0.02 240)",
      "--cyan-glow": "oklch(0.78 0.12 230)",
      "--electric": "oklch(0.55 0.16 245)",
      "--rare": "oklch(0.42 0.14 250)",
      "--ring": "oklch(0.74 0.14 235)",
      "--radius": "0.625rem",
      "--gradient-primary": gradient("oklch(0.78 0.12 230)", "oklch(0.52 0.14 245)"),
      "--gradient-rare": gradient("oklch(0.55 0.16 245)", "oklch(0.40 0.14 250)"),
      "--gradient-bg": bgField(
        "oklch(0.32 0.09 235 / 22%)",
        "oklch(0.26 0.08 250 / 18%)",
      ),
      "--shadow-glow": glow("oklch(0.78 0.12 230)", 30),
      "--shadow-rare": glow("oklch(0.42 0.14 250)", 30),
    } as CSSProperties,
    lexicon: {
      quest: "Protocol",
      questPlural: "Protocols",
      dailyQuests: "Active Protocols",
      workout: "Training Protocol",
      xp: "Performance",
      level: "Tier",
      levelShort: (n) => `T${n.toString().padStart(2, "0")}`,
      streak: "Adherence",
      completed: "Logged",
      progress: "Performance Index",
      ctaPrimary: "Execute protocol",
      identity: "Measure. Improve.",
      emptyState: "All protocols logged. Awaiting next data window.",
      adaptivePrefix: "Analysis",
      greeting: (h, n) =>
        h < 5 ? `${n} — circadian phase: late.` :
        h < 12 ? `${n}. Cortisol peak window — high-yield block.` :
        h < 18 ? `${n}. Post-prandial dip; mobility advised.` :
                 `${n}. Recovery window opens in ~3h.`,
      finishCta: "Log session",
    },
  },

  /* 📖 STORY ─ Violet + soft gold. Chapter aesthetic, cinematic. */
  story: {
    id: "story",
    label: "Story Mode",
    emoji: "📖",
    shortTag: "Narrate",
    identity: "My life is a story.",
    aesthetic: "narrative",
    swatch: ["#A78BFA", "#F5B642", "#120A22"],
    vars: {
      "--background": "oklch(0.15 0.05 295)",
      "--card": "oklch(0.21 0.055 295)",
      "--primary": "oklch(0.74 0.16 295)",
      "--primary-foreground": "oklch(0.11 0.04 295)",
      "--cyan-glow": "oklch(0.78 0.15 295)",
      "--electric": "oklch(0.62 0.18 305)",
      "--rare": "oklch(0.80 0.14 78)",
      "--ring": "oklch(0.74 0.16 295)",
      "--radius": "1.125rem",
      "--gradient-primary": gradient("oklch(0.78 0.15 295)", "oklch(0.55 0.20 320)"),
      "--gradient-rare": gradient("oklch(0.80 0.14 78)", "oklch(0.62 0.18 50)"),
      "--gradient-bg": bgField(
        "oklch(0.30 0.14 300 / 38%)",
        "oklch(0.34 0.10 60 / 22%)",
      ),
      "--shadow-glow": glow("oklch(0.78 0.15 295)", 55),
      "--shadow-rare": glow("oklch(0.80 0.14 78)", 45),
    } as CSSProperties,
    lexicon: {
      quest: "Chapter Task",
      questPlural: "Chapter Tasks",
      dailyQuests: "Today's Page",
      workout: "Chapter Task",
      xp: "Story XP",
      level: "Character Growth",
      levelShort: (n) => `Ch. ${n}`,
      streak: "Streak",
      completed: "Written in",
      progress: "Journey",
      ctaPrimary: "Turn the page",
      identity: "My life is a story.",
      emptyState: "Page complete. Tomorrow's chapter is being written.",
      adaptivePrefix: "Narrator",
      greeting: (h, n) =>
        h < 5 ? `The hero ${n} has not yet slept...` :
        h < 12 ? `Chapter opens. ${n} stirs.` :
        h < 18 ? `Mid-arc — ${n} finds their footing.` :
                 `Dusk settles. ${n}'s story turns inward.`,
      finishCta: "Close the chapter",
    },
  },

  /* 🔥 DISCIPLINE ─ Bold orange/red. Accountable, structured, intense. */
  discipline: {
    id: "discipline",
    label: "Discipline Mode",
    emoji: "🔥",
    shortTag: "Execute",
    identity: "No excuses.",
    aesthetic: "brutal",
    swatch: ["#FF6B35", "#B91C1C", "#1A0A07"],
    vars: {
      "--background": "oklch(0.15 0.04 30)",
      "--card": "oklch(0.20 0.045 30)",
      "--primary": "oklch(0.70 0.20 35)",
      "--primary-foreground": "oklch(0.10 0.03 30)",
      "--cyan-glow": "oklch(0.74 0.20 40)",
      "--electric": "oklch(0.60 0.22 28)",
      "--rare": "oklch(0.50 0.22 18)",
      "--ring": "oklch(0.70 0.20 35)",
      "--radius": "0.375rem",
      "--gradient-primary": gradient("oklch(0.74 0.20 40)", "oklch(0.50 0.22 18)"),
      "--gradient-rare": gradient("oklch(0.60 0.22 28)", "oklch(0.42 0.22 12)"),
      "--gradient-bg": bgField(
        "oklch(0.32 0.16 30 / 32%)",
        "oklch(0.26 0.14 15 / 24%)",
      ),
      "--shadow-glow": glow("oklch(0.74 0.20 40)", 60),
      "--shadow-rare": glow("oklch(0.50 0.22 18)", 55),
    } as CSSProperties,
    lexicon: {
      quest: "Execution",
      questPlural: "Executions",
      dailyQuests: "Today's Executions",
      workout: "Session",
      xp: "Reps",
      level: "Tier",
      levelShort: (n) => `T${n}`,
      streak: "Consistency Score",
      completed: "Executed",
      progress: "Standard",
      ctaPrimary: "No excuses",
      identity: "No excuses.",
      emptyState: "Cleared. Tomorrow's standard does not lower.",
      adaptivePrefix: "Directive",
      greeting: (h, n) =>
        h < 5 ? `${n}. Up early. Good.` :
        h < 12 ? `${n}. The standard is set.` :
        h < 18 ? `${n}. Halfway. Don't drift.` :
                 `${n}. Finish what you started.`,
      finishCta: "Log execution",
    },
  },
};

export const MODE_LIST: ModeTheme[] = [
  MODES.hunter,
  MODES.hero,
  MODES.zen,
  MODES.scientist,
  MODES.story,
  MODES.discipline,
];

export function getMode(id: MotivationStyle | null | undefined): ModeTheme {
  return MODES[id ?? "hunter"] ?? MODES.hunter;
}

export function modeFor(profile: UserProfile | null | undefined): ModeTheme {
  return getMode(profile?.motivation);
}
