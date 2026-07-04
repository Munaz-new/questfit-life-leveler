/* ────────────────────────────────────────────────────────────────────────
 * Exercise Asset Manager — the ONLY thing the app asks for demonstrations.
 *
 * The Workout Player / exercise pages never know where an asset comes from
 * (Free Exercise DB, a community folder, future official LevelUp assets,
 * AI-generated demos, 3D models…). They ask for a gallery by exercise id +
 * gender and render whatever comes back.
 *
 * Fallback chain (guaranteed never-broken):
 *   gendered gallery → shared gallery → thumbnail → "coming soon" card
 *
 * The "coming soon" card lives in the React layer; this module stays pure so
 * the importer can reuse it.
 * ──────────────────────────────────────────────────────────────────── */

import { ASSET_MANIFEST } from "./manifest.generated";
import type {
  AssetRef,
  DemoImage,
  ExerciseDemoAssets,
  Gender,
  ResolvedGallery,
  ResolvedMedia,
} from "./types";

/**
 * Bundled asset URL map. The importer writes files under
 * src/assets/exercise-library/<folder>/<file> and stores the path relative
 * to exercise-library/ in the manifest (e.g. "push_up/step-0.webp"). Vite
 * turns each bundled file into a hashed URL at build time; we resolve the
 * manifest's relative path against that here. Absolute URLs (CDN pointers)
 * are returned untouched.
 */
const BUNDLED_FILES = import.meta.glob(
  "../../../assets/exercise-library/**/*",
  { eager: true, query: "?url", import: "default" },
) as Record<string, string>;

const BY_SUFFIX = new Map<string, string>();
for (const [key, url] of Object.entries(BUNDLED_FILES)) {
  const rel = key.split("/exercise-library/")[1];
  if (rel) BY_SUFFIX.set(rel, url);
}

/** Resolve a manifest AssetRef to a real, loadable URL. */
export function assetUrl(ref: AssetRef): string {
  if (/^(https?:)?\/\//.test(ref.url) || ref.url.startsWith("data:")) return ref.url;
  return BY_SUFFIX.get(ref.url) ?? ref.url;
}

/** All imported demonstration assets for an exercise (empty object if none). */
export function getDemo(id: string): ExerciseDemoAssets {
  return ASSET_MANIFEST[id] ?? {};
}

/** The thumbnail ref, if imported. */
export function getThumbnail(id: string): AssetRef | undefined {
  return getDemo(id).thumbnail;
}

/**
 * The single source of truth for exercise demonstration media.
 *
 * Treats the gender-neutral `shared` gallery as the canonical MALE
 * demonstrator. When a female request has no native female gallery it is
 * served the male/shared set SILENTLY — `isFallback` is retained for internal
 * bookkeeping (dashboard/analytics) but the UI never surfaces a note, overlay
 * or placeholder. The user always sees a proper demonstration.
 */
export function resolveMedia(id: string, requestedGender: Gender): ResolvedMedia {
  const demo = getDemo(id);

  const maleSet = (demo.male && demo.male.length ? demo.male : demo.shared) ?? undefined;

  const thumbGallery = (): DemoImage[] | undefined => {
    if (!demo.thumbnail) return undefined;
    return [{ ...demo.thumbnail, step: "demo", stepLabel: "Demonstration" }];
  };

  if (requestedGender === "female") {
    const female = demo.female && demo.female.length ? demo.female : undefined;
    if (female) {
      return { images: female, requestedGender, servedGender: "female", isFallback: false };
    }
    // Silent fallback to the available male demonstration — no note.
    const fallback = maleSet ?? thumbGallery();
    if (fallback) {
      return { images: fallback, requestedGender, servedGender: "male", isFallback: true };
    }
    return { images: [], requestedGender, servedGender: "male", isFallback: false };
  }

  // Male request — shared/male is the native set.
  const male = maleSet ?? thumbGallery();
  return { images: male ?? [], requestedGender, servedGender: "male", isFallback: false };
}

/** Which gender tiers have real demonstration media for an exercise. */
export function coverage(id: string): { male: boolean; female: boolean } {
  const d = getDemo(id);
  return {
    male: Boolean(d.male?.length || d.shared?.length || d.thumbnail),
    female: Boolean(d.female?.length),
  };
}

/**
 * Preload the cover frames for an ordered list of exercises so a workout can
 * start instantly. Safe to call from the browser only; no-op during SSR.
 */
export function preloadExerciseMedia(ids: string[], gender: Gender): void {
  if (typeof window === "undefined") return;
  for (const id of ids) {
    const first = resolveMedia(id, gender).images[0];
    if (first) {
      const img = new Image();
      img.src = assetUrl(first);
    }
  }
}

/**
 * The best available ordered gallery for an exercise + requested gender.
 * Thin wrapper over {@link resolveMedia} kept for existing call sites.
 * Returns undefined when nothing has been imported — the caller then shows
 * the "Illustration coming soon" card.
 */
export function resolveGallery(id: string, gender: Gender): ResolvedGallery | undefined {
  const media = resolveMedia(id, gender);
  if (!media.images.length) return undefined;
  return { images: media.images, gendered: media.servedGender === gender && !media.isFallback };
}


/** Does this exercise have any imported demonstration asset at all? */
export function hasImportedAsset(id: string): boolean {
  const d = getDemo(id);
  return Boolean(d.thumbnail || d.shared?.length || d.male?.length || d.female?.length);
}

/** Whether a true gender-specific gallery exists for this exercise. */
export function hasGenderedAsset(id: string, gender: Gender): boolean {
  return Boolean(getDemo(id)[gender]?.length);
}

/**
 * 0–100 quality score for the dev dashboard. Weighted by which tiers exist;
 * richer demonstration coverage scores higher.
 */
export function qualityScore(id: string): number {
  const d = getDemo(id);
  let score = 0;
  if (d.thumbnail) score += 20;
  if (d.shared?.length) score += Math.min(40, d.shared.length * 15);
  if (d.male?.length) score += 20;
  if (d.female?.length) score += 20;
  return Math.min(100, score);
}

/** How many demonstration images exist for an exercise (any tier). */
export function imageCount(id: string): number {
  const d = getDemo(id);
  return d.shared?.length ?? d.male?.length ?? d.female?.length ?? (d.thumbnail ? 1 : 0);
}
