/** Per-move education: targets / benefits / common mistake.
 *  Falls back to pattern-level defaults when a specific id is missing. */

import type { Move, Pattern } from "./patterns";

export interface Education {
  targets: string;
  benefits: string;
  avoid: string;
}

const BY_ID: Record<string, Education> = {
  "squat-chair":    { targets: "Quads, glutes, calves", benefits: "Re-teaches the squat pattern safely.", avoid: "Knees collapsing inward." },
  "squat-bw":       { targets: "Quads, glutes, core", benefits: "Foundational lower-body strength.", avoid: "Heels lifting off the floor." },
  "squat-goblet":   { targets: "Quads, glutes, core, upper back", benefits: "Loaded strength + posture trainer.", avoid: "Rounding the lower back." },
  "squat-split":    { targets: "Quads, glutes, balance", benefits: "Fixes left/right strength gaps.", avoid: "Front knee caving inward." },
  "squat-pistol":   { targets: "Single-leg strength + control", benefits: "Maximum unilateral strength.", avoid: "Letting the back knee hit the floor." },
  "push-wall":      { targets: "Chest, shoulders, triceps", benefits: "Safe entry to pressing.", avoid: "Flared elbows past 90°." },
  "push-incline":   { targets: "Chest, shoulders, core", benefits: "Bridges to full push-ups.", avoid: "Hips sagging." },
  "push-bw":        { targets: "Chest, shoulders, triceps, core", benefits: "Total upper-body baseline.", avoid: "Head poking forward." },
  "push-decline":   { targets: "Upper chest, shoulders", benefits: "Progressive overload without weights.", avoid: "Losing the plank line." },
  "pull-band-row":  { targets: "Mid-back, rear delts, biceps", benefits: "Counters slouched posture.", avoid: "Shrugging the shoulders up." },
  "pull-towel-row": { targets: "Mid-back, biceps", benefits: "No equipment back work.", avoid: "Jerking with the lower back." },
  "pull-db-row":    { targets: "Lats, rhomboids, biceps", benefits: "Heavy pulling for back density.", avoid: "Twisting the torso." },
  "pull-scap":      { targets: "Lower traps, scapular control", benefits: "Pre-requisite for pull-ups.", avoid: "Bending the arms — keep them straight." },
  "pull-pullup":    { targets: "Lats, biceps, grip", benefits: "Gold standard upper-body pull.", avoid: "Kipping for momentum." },
  "hinge-bridge":   { targets: "Glutes, hamstrings", benefits: "Wakes glutes; protects the low back.", avoid: "Over-arching the lower back." },
  "hinge-drill":    { targets: "Hamstrings, glutes, posterior chain", benefits: "Teaches the hinge pattern.", avoid: "Squatting instead of hinging." },
  "hinge-rdl-db":   { targets: "Hamstrings, glutes, low back", benefits: "Loaded posterior chain strength.", avoid: "Rounding the back." },
  "hinge-single":   { targets: "Single-leg hamstrings, balance", benefits: "Bulletproof hamstrings and hips.", avoid: "Hips opening to the side." },
  "core-deadbug":   { targets: "Deep core, anti-extension", benefits: "Spinal stability for everything else.", avoid: "Lower back lifting off the floor." },
  "core-birddog":   { targets: "Core, glutes, balance", benefits: "Rotary stability + control.", avoid: "Twisting the hips." },
  "core-plank":     { targets: "Whole core, shoulders", benefits: "Endurance + posture.", avoid: "Sagging hips or piked butt." },
  "core-side":      { targets: "Obliques, hip stabilizers", benefits: "Anti-lateral-flexion strength.", avoid: "Hips drifting backward." },
  "mob-neck":       { targets: "Cervical spine", benefits: "Restores ROM after screen time.", avoid: "Forcing painful ranges." },
  "mob-wrist":      { targets: "Wrists, forearms", benefits: "Recovery from keyboard/controller load.", avoid: "Bouncing — move slowly." },
  "mob-thoracic":   { targets: "Mid-back rotation", benefits: "Unlocks the spine for everything above.", avoid: "Rotating from the low back." },
  "mob-shoulder":   { targets: "Shoulder mobility", benefits: "Restores overhead range.", avoid: "Yanking through pain." },
  "mob-hip":        { targets: "Hip flexors, quads", benefits: "Releases what sitting tightens.", avoid: "Over-arching the low back." },
  "mob-ankle":      { targets: "Ankle dorsiflexion", benefits: "Better squat depth + knee health.", avoid: "Letting the heel pop up." },
  "mob-hams":       { targets: "Hamstrings, nervous system", benefits: "Gentle, sustained lengthening.", avoid: "Bouncing the stretch." },
  "mob-catcow":     { targets: "Spine segmental motion", benefits: "Mobilizes every vertebra.", avoid: "Rushing the breath." },
  "cardio-march":   { targets: "Heart rate, hip flexors", benefits: "Low-impact warm-up.", avoid: "Shuffling — pick the knees up." },
  "cardio-walk":    { targets: "Aerobic base, recovery", benefits: "The most underrated training tool.", avoid: "Hunching over your phone." },
};

const BY_PATTERN: Record<Pattern, Education> = {
  squat:    { targets: "Lower body", benefits: "Strength and mobility.", avoid: "Knees caving in." },
  push:     { targets: "Pushing muscles", benefits: "Upper-body strength.", avoid: "Sagging hips." },
  pull:     { targets: "Pulling muscles", benefits: "Posture and balance.", avoid: "Shrugging shoulders." },
  hinge:    { targets: "Posterior chain", benefits: "Glutes and back health.", avoid: "Rounding the back." },
  core:     { targets: "Trunk stability", benefits: "Foundation for every other lift.", avoid: "Holding your breath." },
  mobility: { targets: "Joint range of motion", benefits: "Recovery and injury prevention.", avoid: "Forcing painful ranges." },
  cardio:   { targets: "Heart and lungs", benefits: "Aerobic base.", avoid: "Going faster than your form." },
};

export function educationFor(m: Move): Education {
  return BY_ID[m.id] ?? BY_PATTERN[m.pattern];
}
