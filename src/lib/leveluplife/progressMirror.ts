import { supabase } from "@/integrations/supabase/client";

// ---------- Types ----------
export type PhotoView = "front" | "side" | "back" | "closeup";

export interface ProgressPhoto {
  id: string;
  storage_path: string;
  view: PhotoView;
  taken_at: string;
  mood: number | null;
  energy: number | null;
  pain_level: number | null;
  confidence: number | null;
  note: string | null;
}

export interface BodyMeasurement {
  id: string;
  measured_at: string;
  weight: number | null;
  body_fat: number | null;
  waist: number | null;
  chest: number | null;
  arms: number | null;
  legs: number | null;
  neck: number | null;
  shoulders: number | null;
  hip: number | null;
  unit: string;
  note: string | null;
}

export interface UnlockedAchievement {
  achievement_key: string;
  unlocked_at: string;
}

export const PHOTO_VIEWS: { id: PhotoView; label: string }[] = [
  { id: "front", label: "Front View" },
  { id: "side", label: "Side View" },
  { id: "back", label: "Back View" },
  { id: "closeup", label: "Close-up" },
];

export const MEASUREMENT_FIELDS: { id: keyof BodyMeasurement; label: string; suffix: string }[] = [
  { id: "weight", label: "Weight", suffix: "kg" },
  { id: "body_fat", label: "Body Fat", suffix: "%" },
  { id: "waist", label: "Waist", suffix: "cm" },
  { id: "chest", label: "Chest", suffix: "cm" },
  { id: "arms", label: "Arms", suffix: "cm" },
  { id: "legs", label: "Legs", suffix: "cm" },
  { id: "neck", label: "Neck", suffix: "cm" },
  { id: "shoulders", label: "Shoulders", suffix: "cm" },
  { id: "hip", label: "Hip", suffix: "cm" },
];

export interface AchievementDef {
  key: string;
  title: string;
  description: string;
  emoji: string;
}

export const ACHIEVEMENTS: AchievementDef[] = [
  { key: "transformation_started", title: "Transformation Started", description: "Enabled Progress Mirror", emoji: "🌱" },
  { key: "first_photo", title: "First Photo", description: "Captured your first progress photo", emoji: "📸" },
  { key: "visual_progress", title: "Visual Progress", description: "Photos on 2+ different days", emoji: "🔍" },
  { key: "consistency_champion", title: "Consistency Champion", description: "Photos across 4 distinct weeks", emoji: "🏅" },
  { key: "30_day_progress", title: "30-Day Progress", description: "30 days between first and latest photo", emoji: "📅" },
  { key: "100_day_journey", title: "100-Day Journey", description: "100 days of documented transformation", emoji: "🚀" },
];

// ---------- Onboarding opt-in (local, pre-auth) ----------
const OPTIN_KEY = "leveluplife.mirror.optin";
export function setOnboardingOptIn(v: boolean) {
  try {
    localStorage.setItem(OPTIN_KEY, v ? "1" : "0");
  } catch {}
}
export function getOnboardingOptIn(): boolean | null {
  try {
    const v = localStorage.getItem(OPTIN_KEY);
    if (v === null) return null;
    return v === "1";
  } catch {
    return null;
  }
}

// ---------- Settings ----------
export async function getMirrorSettings(userId: string): Promise<{ enabled: boolean } | null> {
  const { data } = await supabase
    .from("progress_settings")
    .select("enabled")
    .eq("user_id", userId)
    .maybeSingle();
  return data ?? null;
}

export async function ensureMirrorSettings(userId: string): Promise<boolean> {
  const existing = await getMirrorSettings(userId);
  if (existing) return existing.enabled;
  const optIn = getOnboardingOptIn();
  const enabled = optIn ?? true;
  await supabase.from("progress_settings").upsert(
    { user_id: userId, enabled },
    { onConflict: "user_id" },
  );
  if (enabled) await unlockAchievement(userId, "transformation_started");
  return enabled;
}

export async function setMirrorEnabled(userId: string, enabled: boolean) {
  await supabase
    .from("progress_settings")
    .upsert({ user_id: userId, enabled }, { onConflict: "user_id" });
  if (enabled) await unlockAchievement(userId, "transformation_started");
}

// ---------- Photos ----------
export async function listPhotos(userId: string): Promise<ProgressPhoto[]> {
  const { data } = await supabase
    .from("progress_photos")
    .select("*")
    .eq("user_id", userId)
    .order("taken_at", { ascending: true });
  return (data ?? []) as ProgressPhoto[];
}

export async function uploadPhoto(
  userId: string,
  file: File,
  meta: {
    view: PhotoView;
    taken_at?: string;
    mood?: number | null;
    energy?: number | null;
    pain_level?: number | null;
    confidence?: number | null;
    note?: string | null;
  },
): Promise<ProgressPhoto> {
  const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
  const path = `${userId}/photos/${crypto.randomUUID()}.${ext}`;
  const up = await supabase.storage
    .from("progress-media")
    .upload(path, file, { contentType: file.type || "image/jpeg", upsert: false });
  if (up.error) throw up.error;

  const { data, error } = await supabase
    .from("progress_photos")
    .insert({
      user_id: userId,
      storage_path: path,
      view: meta.view,
      taken_at: meta.taken_at ?? new Date().toISOString(),
      mood: meta.mood ?? null,
      energy: meta.energy ?? null,
      pain_level: meta.pain_level ?? null,
      confidence: meta.confidence ?? null,
      note: meta.note ?? null,
    })
    .select("*")
    .single();
  if (error) throw error;
  return data as ProgressPhoto;
}

export async function deletePhoto(userId: string, photo: ProgressPhoto) {
  await supabase.storage.from("progress-media").remove([photo.storage_path]);
  await supabase.from("progress_photos").delete().eq("id", photo.id).eq("user_id", userId);
}

const urlCache = new Map<string, { url: string; exp: number }>();
export async function signedUrl(path: string): Promise<string | null> {
  const cached = urlCache.get(path);
  if (cached && cached.exp > Date.now()) return cached.url;
  const { data } = await supabase.storage.from("progress-media").createSignedUrl(path, 3600);
  if (!data?.signedUrl) return null;
  urlCache.set(path, { url: data.signedUrl, exp: Date.now() + 3500 * 1000 });
  return data.signedUrl;
}

// ---------- Measurements ----------
export async function listMeasurements(userId: string): Promise<BodyMeasurement[]> {
  const { data } = await supabase
    .from("body_measurements")
    .select("*")
    .eq("user_id", userId)
    .order("measured_at", { ascending: true });
  return (data ?? []) as BodyMeasurement[];
}

export type MeasurementInput = {
  measured_at?: string;
  note?: string | null;
  unit?: string;
  weight?: number | null;
  body_fat?: number | null;
  waist?: number | null;
  chest?: number | null;
  arms?: number | null;
  legs?: number | null;
  neck?: number | null;
  shoulders?: number | null;
  hip?: number | null;
};

export async function addMeasurement(
  userId: string,
  values: MeasurementInput,
): Promise<BodyMeasurement> {
  const { data, error } = await supabase
    .from("body_measurements")
    .insert({ user_id: userId, ...values })
    .select("*")
    .single();
  if (error) throw error;
  return data as BodyMeasurement;
}

export async function deleteMeasurement(userId: string, id: string) {
  await supabase.from("body_measurements").delete().eq("id", id).eq("user_id", userId);
}

// ---------- Achievements ----------
export async function listAchievements(userId: string): Promise<UnlockedAchievement[]> {
  const { data } = await supabase
    .from("progress_achievements")
    .select("achievement_key, unlocked_at")
    .eq("user_id", userId);
  return (data ?? []) as UnlockedAchievement[];
}

export async function unlockAchievement(userId: string, key: string) {
  await supabase
    .from("progress_achievements")
    .upsert({ user_id: userId, achievement_key: key }, { onConflict: "user_id,achievement_key", ignoreDuplicates: true });
}

function dayKey(iso: string) {
  return iso.slice(0, 10);
}
function weekKey(iso: string) {
  const d = new Date(iso);
  const onejan = new Date(d.getFullYear(), 0, 1);
  const week = Math.ceil(((d.getTime() - onejan.getTime()) / 86_400_000 + onejan.getDay() + 1) / 7);
  return `${d.getFullYear()}-w${week}`;
}

/** Returns the set of achievement keys that *should* be unlocked from photos. */
export function evaluatePhotoAchievements(photos: ProgressPhoto[]): string[] {
  const keys: string[] = [];
  if (photos.length >= 1) keys.push("first_photo");
  const days = new Set(photos.map((p) => dayKey(p.taken_at)));
  if (days.size >= 2) keys.push("visual_progress");
  const weeks = new Set(photos.map((p) => weekKey(p.taken_at)));
  if (weeks.size >= 4) keys.push("consistency_champion");
  if (photos.length >= 2) {
    const sorted = [...photos].sort((a, b) => +new Date(a.taken_at) - +new Date(b.taken_at));
    const span = (+new Date(sorted[sorted.length - 1].taken_at) - +new Date(sorted[0].taken_at)) / 86_400_000;
    if (span >= 30) keys.push("30_day_progress");
    if (span >= 100) keys.push("100_day_journey");
  }
  return keys;
}

/** Persists any newly-earned achievements; returns keys newly unlocked. */
export async function syncAchievements(
  userId: string,
  photos: ProgressPhoto[],
  alreadyUnlocked: Set<string>,
): Promise<string[]> {
  const target = evaluatePhotoAchievements(photos);
  const fresh = target.filter((k) => !alreadyUnlocked.has(k));
  for (const k of fresh) await unlockAchievement(userId, k);
  return fresh;
}

// ---------- Danger zone ----------
export async function deleteAllMedia(userId: string) {
  // Remove storage objects under the user's folder.
  const folders = ["photos", "videos"];
  for (const f of folders) {
    const { data } = await supabase.storage.from("progress-media").list(`${userId}/${f}`, { limit: 1000 });
    if (data && data.length) {
      await supabase.storage
        .from("progress-media")
        .remove(data.map((o) => `${userId}/${f}/${o.name}`));
    }
  }
  await supabase.from("progress_photos").delete().eq("user_id", userId);
  await supabase.from("body_measurements").delete().eq("user_id", userId);
  await supabase.from("progress_achievements").delete().eq("user_id", userId);
  urlCache.clear();
}
