# Exercise Intelligence System

Turn the movement list into a structured library with per-exercise visuals, target-muscle highlighting, a detail screen, a browsable Library tab, and 8 named lifestyle recovery protocols. Built to be future-extensible (Lottie, pose tracking, health integrations).

## 1. Data layer

New: `src/lib/leveluplife/exercises/types.ts`

```ts
type MuscleGroup = "neck"|"traps"|"delts_front"|"delts_side"|"delts_rear"
  |"chest"|"biceps"|"triceps"|"forearms"|"lats"|"upper_back"|"lower_back"
  |"core"|"obliques"|"glutes"|"quads"|"hamstrings"|"calves"|"hip_flexors"
  |"wrists"|"ankles"|"full_body";

type ExerciseCategory =
  | "strength_push"|"strength_pull"|"strength_squat"|"strength_hinge"|"strength_core"
  | "mobility_neck"|"mobility_shoulder"|"mobility_thoracic"|"mobility_hip"
  | "mobility_ankle"|"mobility_wrist"
  | "recovery_posture"|"recovery_desk"|"recovery_study"|"recovery_gaming"
  | "recovery_sleep"|"recovery_stress"
  | "cardio_walking"|"cardio_marching"|"cardio_low_impact"|"cardio_hiit"|"cardio_endurance";

interface Exercise {
  id: string; name: string;
  category: ExerciseCategory; pattern: Pattern;
  difficulty: "beginner"|"intermediate"|"advanced";
  equipment: Equip;
  primaryMuscles: MuscleGroup[]; secondaryMuscles: MuscleGroup[];
  benefits: string[]; instructions: string[];
  mistakes: string[]; safety: string[];
  recommendedFor: LifestyleType[]; recommendedGoals: Goal[];
  estDurationSec: number; metValue: number; // calories = MET × kg × hours
  defaultReps: string; defaultRest: number;
  illustration: string;        // id into src/components/leveluplife/exercises/illustrations
  animationUrl?: string;       // reserved for Lottie phase 2
  // Future: poseLandmarks?, repCountingHint?, formCheckpoints?
}
```

New: `src/lib/leveluplife/exercises/library.ts` — single source of truth, ~30 entries seeded from current MOVES + new recovery moves (wall angels, thoracic rotation, doorway pec stretch, child's pose, box breathing 4-7-8, etc.).

`patterns.ts` is kept but `MOVES` is regenerated from `library.ts` via a thin adapter so the existing builder/selector keep working with zero changes to their signatures.

## 2. Visuals (SVG now, Lottie-ready)

`src/components/leveluplife/exercises/illustrations/` — one React component per move (`PushUp.tsx`, `Squat.tsx`, `NeckCAR.tsx`, ...). Consistent stick-figure style, single accent color via `currentColor` so it themes automatically. Subtle CSS-keyframe loop (down→up, rotation) for movement moves; static for holds.

Registry: `illustrations/index.ts` exports `ILLUSTRATIONS: Record<string, ComponentType>`. `<ExerciseArt id={...} animated />` resolves it; falls back to a generic body silhouette only if a registry entry is missing (dev-warning logged).

`MuscleMap.tsx` — front+back body SVG with named `<path id="chest">` etc. Props: `primary: MuscleGroup[]`, `secondary?: MuscleGroup[]`. Highlights paths via fill class.

The `animationUrl` field stays unused now; `<ExerciseArt>` prefers it when present so Lottie can be dropped in later without touching call sites.

## 3. Exercise detail screen

New route: `src/routes/exercises.$id.tsx`

Layout (mobile-first):
- Hero: animated `<ExerciseArt>` on a soft gradient.
- Title, difficulty pill, category pill, est. time.
- `<MuscleMap>` with chips listing primary + secondary muscles.
- Sections: Benefits, How to do it (numbered), Common mistakes, Safety, Recommended for, Estimated time/calories.
- Sticky CTA: "Add to today's mission" (queues a one-off override the next mission build picks up) or "Start now" (5-min single-exercise mission).

## 4. Browse route

New: `src/routes/exercises.index.tsx` at `/exercises`, added to BottomNav as **Library**.

- Search by name/muscle.
- Filter chips: category group (Strength / Mobility / Recovery / Cardio), difficulty, equipment.
- Grid of `<ExerciseCard>` (art thumbnail, name, primary muscle, time). Tap → detail.
- Smart row at top: "For you" — top 6 exercises filtered by `recommendedFor.includes(profile.lifestyle)` and goals.

## 5. Mission Player integration

Replace `glyphs.ts` usage in `MissionPlayer.tsx`:
- Exercise screen renders `<ExerciseArt id={ex.illustration} animated />` instead of `PATTERN_GLYPH[ex.pattern]`.
- `<MuscleMap>` shown small under the exercise name.
- "Why this move" drawer is replaced by a "View full guide" link → `/exercises/$id` (preserves session via store), and an inline condensed version (top 2 benefits, top 2 mistakes) sourced from the new library instead of `education.ts`.
- `education.ts` becomes a thin re-export from the library to keep imports stable; then deleted in a follow-up.

`xp.ts` calorie estimate switches to per-exercise `metValue` × weight × time (replacing the current parser fallback), with the old parser kept for unknown ids.

## 6. AI recommendation upgrades

`selector.ts` already chooses a protocol; `builder.ts` already filters by pattern/level/equipment. Add a soft scoring pass after filter:

```
score = base
  + (recommendedFor.includes(profile.lifestyle) ? 3 : 0)
  + intersect(recommendedGoals, profile.goals).length * 2
  + (recentlyUsed ? -2 : 0)
```

Pick top N per pattern instead of random. Result: a gamer who sits 8h gets Neck CARs, Thoracic Opener, Wall Angels, Wrist Mobility, Hip Flexor surfaced before generic mobility.

## 7. Eight lifestyle recovery protocols

Add to `protocols.ts` (each with own copy + ratio + duration):

1. `gamer_neck_recovery` — neck, thoracic, wrist, shoulder.
2. `programmer_flow` — wrist, thoracic, hip, posture.
3. `laptop_posture_fix` — wall angels, chin tucks, thoracic, pec stretch.
4. `office_mobility` — hip, thoracic, glute activation, walk.
5. `midnight_coding_recovery` — gentle mobility + box breathing, low light intensity.
6. `study_break_flow` — 5-min, mobility + breathing.
7. `exam_week_reset` — stress recovery + light cardio + breathing.
8. `eight_hour_sitting_reset` — hip flexor, glute bridge, thoracic, walk.

`selector.ts` routes to these based on `lifestyle + sittingHoursToday + stress + timeMin` ahead of the generic fallbacks. Home `RecommendationCard` can deep-link any of them via `?protocol=<id>` (already wired).

## 8. Future-readiness (data only, no UI)

Optional fields on `Exercise` (left empty for now, documented):
- `poseLandmarks?: string[]` — MediaPipe landmark ids needed for form check.
- `repCountingHint?: { type: "vertical"|"horizontal"; landmark: string }`.
- `formCheckpoints?: { name: string; rule: string }[]`.
- `healthKitMapping?: { appleHealth?: string; googleFit?: string }`.

## Files

**New**
- `src/lib/leveluplife/exercises/types.ts`
- `src/lib/leveluplife/exercises/library.ts`
- `src/lib/leveluplife/exercises/recommend.ts`
- `src/components/leveluplife/exercises/ExerciseArt.tsx`
- `src/components/leveluplife/exercises/MuscleMap.tsx`
- `src/components/leveluplife/exercises/ExerciseCard.tsx`
- `src/components/leveluplife/exercises/illustrations/*.tsx` (~30) + `index.ts`
- `src/routes/exercises.index.tsx`
- `src/routes/exercises.$id.tsx`

**Edited**
- `src/lib/leveluplife/engine/patterns.ts` (MOVES becomes adapter over library)
- `src/lib/leveluplife/engine/protocols.ts` (+8 protocols)
- `src/lib/leveluplife/engine/selector.ts` (lifestyle routing)
- `src/lib/leveluplife/engine/builder.ts` (scoring pass)
- `src/lib/leveluplife/engine/xp.ts` (MET-based calories)
- `src/components/leveluplife/player/MissionPlayer.tsx` (art + muscle map + link)
- `src/components/leveluplife/BottomNav.tsx` (Library tab)
- `src/lib/leveluplife/missionCopy.ts` (CTA for new protocols)

**Deprecated (kept as re-export)**
- `src/lib/leveluplife/engine/education.ts`
- `src/components/leveluplife/player/glyphs.ts`

## Out of scope (call out)

- Actual Lottie files — schema/field ready, drop-in later.
- Pose estimation / rep counting / Apple Health — data fields reserved only.
- Editing the existing checklist UI beyond the player swap above.
