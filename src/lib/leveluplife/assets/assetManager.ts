/* ────────────────────────────────────────────────────────────────────────
 * Exercise Asset Manager — the ONLY thing the app asks for demonstrations.
 *
 * The Workout Player / exercise pages never know where an asset comes from
 * (Free Exercise DB, a community folder, future official LevelUp assets,
 * AI-generated demos, 3D models…). They ask for a gallery by exercise id +
 * gender and render whatever comes back.
 *
 * Fallback chain (guaranteed never-broken when any real media exists):
 *   requested gender gallery → requested gender thumbnail → opposite/shared
 *   gallery → opposite/shared thumbnail → empty only when no real media exists.
 *
 * This module never returns user-facing fallback notes. If a requested female
 * set is missing, the available male/shared demonstration is served silently.
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
  const demo = getDemo(id);
  return demo.thumbnail ?? demo.maleTier?.thumbnail ?? demo.femaleTier?.thumbnail;
}

function galleryFrom(...sources: Array<DemoImage[] | undefined>): DemoImage[] | undefined {
  return sources.find((source) => source && source.length > 0);
}

function thumbnailGallery(ref: AssetRef | undefined): DemoImage[] | undefined {
  if (!ref) return undefined;
  return [{ ...ref, step: "demo", stepLabel: "Demonstration" }];
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

  const femaleGallery = galleryFrom(demo.femaleTier?.gallery, demo.female);
  const femaleThumb = demo.femaleTier?.thumbnail;
  const maleGallery = galleryFrom(demo.maleTier?.gallery, demo.male, demo.shared);
  const maleThumb = demo.maleTier?.thumbnail ?? demo.thumbnail;

  if (requestedGender === "female") {
    const female = femaleGallery ?? thumbnailGallery(femaleThumb);
    if (female?.length) {
      return { images: female, requestedGender, servedGender: "female", isFallback: false };
    }
    // Silent fallback to the available male demonstration — no note.
    const fallback = maleGallery ?? thumbnailGallery(maleThumb);
    if (fallback?.length) {
      return { images: fallback, requestedGender, servedGender: "male", isFallback: true };
    }
    return { images: [], requestedGender, servedGender: "male", isFallback: false };
  }

  // Male request — shared/male is the native set. If a future exercise only has
  // female media, show that real demonstration rather than an empty placeholder.
  const male = maleGallery ?? thumbnailGallery(maleThumb);
  if (male?.length) return { images: male, requestedGender, servedGender: "male", isFallback: false };

  const fallback = femaleGallery ?? thumbnailGallery(femaleThumb);
  if (fallback?.length) {
    return { images: fallback, requestedGender, servedGender: "female", isFallback: true };
  }

  return { images: [], requestedGender, servedGender: "male", isFallback: false };
}

/** Which gender tiers have real demonstration media for an exercise. */
export function coverage(id: string): { male: boolean; female: boolean } {
  const d = getDemo(id);
  const maleGallery = galleryFrom(d.maleTier?.gallery, d.male, d.shared);
  const femaleGallery = galleryFrom(d.femaleTier?.gallery, d.female);
  return {
    male: Boolean(maleGallery?.length || d.maleTier?.thumbnail || d.thumbnail),
    female: Boolean(femaleGallery?.length || d.femaleTier?.thumbnail),
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
 * Returns undefined only when no real media has been imported for any
 * demonstrator; callers then render a neutral unavailable state.
 */
export function resolveGallery(id: string, gender: Gender): ResolvedGallery | undefined {
  const media = resolveMedia(id, gender);
  if (!media.images.length) return undefined;
  return { images: media.images, gendered: media.servedGender === gender && !media.isFallback };
}


/** Does this exercise have any imported demonstration asset at all? */
export function hasImportedAsset(id: string): boolean {
  const d = getDemo(id);
  return Boolean(
    d.thumbnail ||
      d.shared?.length ||
      d.male?.length ||
      d.female?.length ||
      d.maleTier?.thumbnail ||
      d.maleTier?.gallery?.length ||
      d.femaleTier?.thumbnail ||
      d.femaleTier?.gallery?.length,
  );
}

/** Whether a true gender-specific gallery exists for this exercise. */
export function hasGenderedAsset(id: string, gender: Gender): boolean {
  const demo = getDemo(id);
  const tier = gender === "male" ? demo.maleTier : demo.femaleTier;
  return Boolean(demo[gender]?.length || tier?.gallery?.length || tier?.thumbnail);
}

/**
 * 0–100 quality score for the dev dashboard. Weighted by which tiers exist;
 * richer demonstration coverage scores higher.
 */
export function qualityScore(id: string): number {
  const d = getDemo(id);
  let score = 0;
  const maleGallery = galleryFrom(d.maleTier?.gallery, d.male, d.shared);
  const femaleGallery = galleryFrom(d.femaleTier?.gallery, d.female);
  if (d.thumbnail || d.maleTier?.thumbnail || d.femaleTier?.thumbnail) score += 20;
  if (maleGallery?.length) score += Math.min(35, maleGallery.length * 15);
  if (femaleGallery?.length) score += Math.min(25, femaleGallery.length * 12);
  if (d.maleTier?.hero || d.femaleTier?.hero) score += 5;
  if (d.maleTier?.animation || d.femaleTier?.animation) score += 8;
  if (d.maleTier?.video || d.femaleTier?.video) score += 7;
  return Math.min(100, score);
}

/** How many demonstration images exist for an exercise (any tier). */
export function imageCount(id: string): number {
  const d = getDemo(id);
  const urls = new Set<string>();
  const add = (ref?: AssetRef) => {
    if (ref?.url) urls.add(ref.url);
  };
  const addGallery = (gallery?: DemoImage[]) => gallery?.forEach(add);
  add(d.thumbnail);
  addGallery(d.shared);
  addGallery(d.male);
  addGallery(d.female);
  add(d.maleTier?.thumbnail);
  add(d.maleTier?.hero);
  add(d.maleTier?.animation);
  add(d.maleTier?.video);
  addGallery(d.maleTier?.gallery);
  add(d.femaleTier?.thumbnail);
  add(d.femaleTier?.hero);
  add(d.femaleTier?.animation);
  add(d.femaleTier?.video);
  addGallery(d.femaleTier?.gallery);
  return urls.size;
}
