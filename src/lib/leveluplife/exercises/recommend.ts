import type { UserProfile } from "../types";
import type { Exercise } from "./types";

/** Soft scoring: rank candidates by how well they fit this user.
 *  Higher = more relevant. Used by the builder after pattern/level/equip filter. */
export function scoreExercise(
  ex: Exercise,
  profile: UserProfile | null,
  recentIds: Set<string>,
): number {
  let score = 0;
  if (profile) {
    if (ex.recommendedFor.includes(profile.lifestyle)) score += 3;
    const goalOverlap = ex.recommendedGoals.filter((g) => profile.goals.includes(g)).length;
    score += goalOverlap * 2;
  }
  if (recentIds.has(ex.id)) score -= 2;
  // Mild jitter so we don't always pick the same top-N.
  score += Math.random() * 0.5;
  return score;
}
