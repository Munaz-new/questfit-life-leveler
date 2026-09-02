import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";
import type { UserProfile } from "./types";

/**
 * Phase 1 cloud contract for identity data.
 *
 * Everything the future Life Adaptation Engine needs about *who the user is*
 * (profile, lifestyle, preferences) is read and written through this single
 * module. Progression data (XP, quests, sessions) is intentionally NOT here —
 * later phases own that.
 */

const goalEnum = z.enum([
  "weight_loss",
  "muscle_gain",
  "posture",
  "stamina",
  "consistency",
  "mobility",
  "discipline",
  "confidence",
]);

const profileSchema = z.object({
  displayName: z.string().trim().min(1).max(40),
  gender: z.enum(["male", "female"]),
  ageRange: z.enum(["13-17", "18-24", "25-34", "35-44", "45-54", "55+"]),
  height: z.string().trim().max(6),
  weight: z.string().trim().max(6),
  level: z.enum(["beginner", "intermediate", "advanced"]),
  primaryGoal: z.enum([
    "build_strength",
    "lose_fat",
    "improve_endurance",
    "improve_mobility",
    "general_fitness",
    "build_consistency",
  ]),
  goals: z.array(goalEnum).max(8),
  lifestyle: z.enum([
    "student",
    "office",
    "gamer",
    "developer",
    "creator",
    "business",
    "nightshift",
    "freelancer",
    "parent",
    "custom",
  ]),
  schedule: z.enum(["daytime", "evening", "night", "rotating", "flexible"]),
  roomSize: z.enum(["tiny", "small", "medium", "large"]),
  wakeTime: z.string().regex(/^\d{2}:\d{2}$/),
  sleepTime: z.string().regex(/^\d{2}:\d{2}$/),
  sittingHours: z.number().int().min(0).max(16),
  energy: z.number().int().min(1).max(5),
  stress: z.number().int().min(1).max(5),
  equipment: z.array(z.enum(["none", "bands", "dumbbells", "chair", "pullup"])).max(5),
  motivation: z.enum(["hunter", "hero", "zen", "scientist", "story", "discipline"]),
  onboarded: z.boolean(),
});

export type CloudProfile = z.infer<typeof profileSchema>;

export const getMyProfile = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<CloudProfile | null> => {
    const { supabase, userId } = context;
    const [profile, lifestyle, prefs] = await Promise.all([
      supabase.from("profiles").select("*").eq("user_id", userId).maybeSingle(),
      supabase.from("user_lifestyle").select("*").eq("user_id", userId).maybeSingle(),
      supabase.from("user_preferences").select("*").eq("user_id", userId).maybeSingle(),
    ]);
    if (profile.error) throw profile.error;
    if (!profile.data) return null;
    const p = profile.data;
    const l = lifestyle.data;
    const pr = prefs.data;

    const merged = {
      displayName: p.display_name || "Athlete",
      gender: (pr?.demonstration_preference ?? p.gender ?? "male") as CloudProfile["gender"],
      ageRange: p.age_range,
      height: p.height,
      weight: p.weight,
      level: p.fitness_level,
      primaryGoal: p.primary_goal,
      goals: p.goals ?? [],
      lifestyle: l?.lifestyle ?? "office",
      schedule: l?.schedule ?? "daytime",
      roomSize: l?.room_size ?? "medium",
      wakeTime: l?.wake_time ?? "07:00",
      sleepTime: l?.sleep_time ?? "23:00",
      sittingHours: l?.sitting_hours ?? 6,
      energy: l?.energy ?? 3,
      stress: l?.stress ?? 3,
      equipment: l?.equipment ?? ["none"],
      motivation: pr?.motivation_mode ?? "zen",
      onboarded: p.onboarded,
    };

    const parsed = profileSchema.safeParse(merged);
    return parsed.success ? parsed.data : null;
  });

export const saveMyProfile = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => profileSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    const results = await Promise.all([
      supabase.from("profiles").upsert(
        {
          user_id: userId,
          display_name: data.displayName,
          age_range: data.ageRange,
          height: data.height,
          weight: data.weight,
          gender: data.gender,
          fitness_level: data.level,
          primary_goal: data.primaryGoal,
          goals: data.goals,
          onboarded: data.onboarded,
        },
        { onConflict: "user_id" },
      ),
      supabase.from("user_lifestyle").upsert(
        {
          user_id: userId,
          lifestyle: data.lifestyle,
          schedule: data.schedule,
          room_size: data.roomSize,
          wake_time: data.wakeTime,
          sleep_time: data.sleepTime,
          sitting_hours: data.sittingHours,
          energy: data.energy,
          stress: data.stress,
          equipment: data.equipment,
        },
        { onConflict: "user_id" },
      ),
      supabase.from("user_preferences").upsert(
        {
          user_id: userId,
          motivation_mode: data.motivation,
          demonstration_preference: data.gender,
        },
        { onConflict: "user_id" },
      ),
    ]);

    const failed = results.find((r) => r.error);
    if (failed?.error) throw failed.error;
    return { ok: true as const };
  });

/** Local app profile → cloud contract. */
export function toCloudProfile(p: UserProfile, onboarded: boolean): CloudProfile {
  return {
    displayName: p.displayName,
    gender: p.gender,
    ageRange: p.ageRange as CloudProfile["ageRange"],
    height: p.height,
    weight: p.weight,
    level: p.level,
    primaryGoal: p.primaryGoal,
    goals: p.goals,
    lifestyle: p.lifestyle,
    schedule: p.schedule,
    roomSize: p.roomSize,
    wakeTime: p.wakeTime,
    sleepTime: p.sleepTime,
    sittingHours: p.sittingHours,
    energy: p.energy,
    stress: p.stress,
    equipment: p.equipment,
    motivation: p.motivation,
    onboarded,
  };
}

/** Cloud contract → local app profile. */
export function fromCloudProfile(c: CloudProfile): UserProfile {
  return {
    displayName: c.displayName,
    isGuest: false,
    gender: c.gender,
    ageRange: c.ageRange,
    height: c.height,
    weight: c.weight,
    lifestyle: c.lifestyle,
    schedule: c.schedule,
    roomSize: c.roomSize,
    primaryGoal: c.primaryGoal,
    wakeTime: c.wakeTime,
    sleepTime: c.sleepTime,
    sittingHours: c.sittingHours,
    energy: c.energy,
    stress: c.stress,
    equipment: c.equipment,
    goals: c.goals,
    level: c.level,
    motivation: c.motivation,
  };
}
