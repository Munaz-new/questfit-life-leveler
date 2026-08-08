/* ────────────────────────────────────────────────────────────────────────
 * useExerciseMedia — the single React entry point for exercise demonstration
 * media. Every exercise screen (Library, Detail, Workout/Mission Player, and
 * all previews) reads media through this hook so they stay perfectly in sync
 * with the global Demonstrator preference.
 *
 * It combines the reactive gender preference with the pure `resolveMedia`
 * resolver, so components re-render immediately when the preference changes —
 * no app restart required. Future media types (video, GIF, animation) flow
 * through the same `AssetFormat` / `assetUrl` layer, so UI code never changes.
 * ──────────────────────────────────────────────────────────────────── */

import { resolveCoverCandidates, resolveMedia } from "./assetManager";
import { useDemoGender } from "./gender";
import type { DemoImage, Gender } from "./types";

export interface ExerciseMedia {
  /** Ordered demonstration frames for the current demonstrator (may be empty). */
  images: DemoImage[];
  /** First frame — the cover image. Undefined when nothing is imported. */
  cover?: DemoImage;
  /** The demonstrator the user selected. */
  gender: Gender;
  /** Internal-only: true when the requested demonstrator fell back to another real set. */
  isFallback: boolean;
  /** Internal-only provenance. Normal user UI must not render fallback notes. */
  note?: string;
  /** True only when no real imported media exists for any demonstrator. */
  isEmpty: boolean;
  /** Ordered real assets a renderer may try if the preferred image fails. */
  fallbackCovers: DemoImage[];
}

export function useExerciseMedia(id: string, overrideGender?: Gender): ExerciseMedia {
  const [savedGender] = useDemoGender();
  const gender = overrideGender ?? savedGender;
  const media = resolveMedia(id, gender);
  return {
    images: media.images,
    cover: media.images[0],
    gender,
    isFallback: media.isFallback,
    note: media.note,
    isEmpty: media.images.length === 0,
    fallbackCovers: resolveCoverCandidates(id, gender),
  };
}
