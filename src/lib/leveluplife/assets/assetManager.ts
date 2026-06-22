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
  "../../../../assets/exercise-library/**/*",
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
 * The best available ordered gallery for an exercise + requested gender.
 *
 * Prefers a real gendered set; falls back to the shared (gender-neutral)
 * gallery; finally synthesizes a one-image gallery from the thumbnail.
 * Returns undefined when nothing has been imported — the caller then shows
 * the "Illustration coming soon" card.
 */
export function resolveGallery(id: string, gender: Gender): ResolvedGallery | undefined {
  const demo = getDemo(id);

  const gendered = demo[gender];
  if (gendered && gendered.length) return { images: gendered, gendered: true };

  if (demo.shared && demo.shared.length) return { images: demo.shared, gendered: false };

  if (demo.thumbnail) {
    const t = demo.thumbnail;
    const single: DemoImage = { ...t, step: "demo", stepLabel: "Demonstration" };
    return { images: [single], gendered: false };
  }

  return undefined;
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
