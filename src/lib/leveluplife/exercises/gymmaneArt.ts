import { GYM_EXERCISES_BY_ID } from "./gymmaneCatalog";

const slugs: Partial<Record<string, string>> = {
  "squat-bw": "bodyweight-squat",
  "squat-goblet": "goblet-squat",
  "squat-split": "split-squat",
  "squat-pistol": "assisted-pistol-squat",
  "push-wall": "wall-push-up",
  "push-incline": "incline-push-up",
  "push-bw": "push-up",
  "push-decline": "decline-push-up",
  "pull-band-row": "banded-row",
  "pull-db-row": "one-arm-dumbbell-row",
  "pull-scap": "scapular-pull-up",
  "pull-pullup": "pull-up",
  "hinge-bridge": "glute-bridge",
  "hinge-rdl-db": "dumbbell-romanian-deadlift",
  "hinge-single": "single-leg-romanian-deadlift",
  "core-deadbug": "dead-bug",
  "core-birddog": "bird-dog",
  "core-plank": "plank",
  "core-side": "side-plank",
  "mob-hams": "towel-hamstring-curl",
  "mob-hip": "kneeling-hip-flexor-stretch",
  "mob-catcow": "cat-cow-stretch",
  "rec-doorway-pec": "doorway-chest-stretch",
  "rec-childs-pose": "childs-pose",
};

export function gymManeArtUrl(id: string, animated = true) {
  const entry = GYM_EXERCISES_BY_ID.get(id)?.gymMane;
  if (entry?.icon && !entry.art) return `/gymmane/icons/${entry.icon}.svg`;
  const slug = entry?.art || slugs[id];
  return slug ? `/gymmane/exercises/${slug}.svg${animated ? "" : "#still"}` : undefined;
}
