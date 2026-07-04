/* ────────────────────────────────────────────────────────────────────────
 * Exercise Asset Pipeline — shared types.
 *
 * These describe the *provenance and format* of an exercise demonstration
 * asset. They are intentionally framework-agnostic (no React) so both the
 * runtime Asset Manager and the dev-time importer script can share them.
 * ──────────────────────────────────────────────────────────────────── */

/** Renderable formats the pipeline understands. Add new ones here only. */
export type AssetFormat =
  | "svg"
  | "lottie"
  | "webp"
  | "png"
  | "jpg"
  | "gif"
  | "mp4"
  | "glb";

/** The kinds of asset an exercise can have. */
export type AssetKind = "thumbnail" | "illustration" | "animation" | "video";

/** Demonstration gender. The dataset is single-model today; the model is
 *  future-ready so a gendered provider drops in without app changes. */
export type Gender = "male" | "female";

/** Ordered movement phases shown in the step strip. */
export type DemoStepKey = "start" | "movement" | "end" | "return" | "demo";

/** A single resolved asset plus its legal/provenance metadata. */
export interface AssetRef {
  /** Public URL (CDN pointer, /public path, or bundled import URL). */
  url: string;
  format: AssetFormat;
  /** Provider id the asset originated from (e.g. "free-exercise-db"). */
  source: string;
  /** SPDX-ish license string (e.g. "Unlicense", "CC-BY-4.0"). */
  license: string;
  /** Optional human/community contributor credit. */
  contributor?: string;
  /** Monotonic content version, bumped by the importer on change. */
  version: string;
  /** ISO timestamp of last import/update. */
  updatedAt: string;
  /** File size in bytes (used for the dashboard quality score). */
  bytes?: number;
}

/** A single demonstration step image (ordered hero/thumbnail gallery item). */
export interface DemoImage extends AssetRef {
  /** Movement phase this image represents. */
  step: DemoStepKey;
  /** Human-readable label (e.g. "Start Position"). */
  stepLabel: string;
}

/**
 * A per-gender demonstration bundle. Every slot is optional so a tier can hold
 * anything from a single thumbnail to a full multi-format set. New media types
 * (gif/mp4/lottie/glb) are expressed via the existing `AssetFormat` on each
 * ref, so adding them needs NO schema or UI change.
 */
export interface AssetTier {
  thumbnail?: AssetRef;
  hero?: AssetRef;
  /** Ordered start→end demonstration frames. */
  gallery?: DemoImage[];
  animation?: AssetRef;
  video?: AssetRef;
}

/**
 * All demonstration assets known for a single exercise.
 *
 * `shared` is the gender-neutral gallery used when no gender-specific set is
 * available (the case for the public-domain dataset today). `male`/`female`
 * hold the gender-specific galleries and take priority when present. The
 * structured `maleTier`/`femaleTier` carry the richer multi-format bundle used
 * by the importer and future media types; the flat arrays remain the canonical
 * runtime shape for back-compat.
 */
export interface ExerciseDemoAssets {
  thumbnail?: AssetRef;
  shared?: DemoImage[];
  male?: DemoImage[];
  female?: DemoImage[];
  maleTier?: AssetTier;
  femaleTier?: AssetTier;
}

/** Back-compat alias used by older call sites. */
export type ExerciseAssets = ExerciseDemoAssets;

/** What the Asset Manager hands back for a gallery request. */
export interface ResolvedGallery {
  images: DemoImage[];
  /** True when the gallery is the user's selected gender, not the shared set. */
  gendered: boolean;
}

/**
 * The richer result returned by `resolveMedia` — the single source of truth
 * every exercise screen consumes. Carries explicit fallback info so the UI
 * can render a consistent, subtle note without duplicating logic.
 */
export interface ResolvedMedia {
  images: DemoImage[];
  requestedGender: Gender;
  /** Which demonstrator the returned images actually depict. */
  servedGender: Gender;
  /** True when a female request was served the male/shared set. */
  isFallback: boolean;
  /** Subtle note to surface when isFallback is true. */
  note?: string;
}

