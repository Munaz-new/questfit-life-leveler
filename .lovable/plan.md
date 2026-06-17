# Adaptive Workout Engine (Pass 1.5)

Rebuild the workout brain so it feels like a coach that reads the user's life, not a random exercise picker. Stays fully client-side (no AI calls, no backend) so it's instant, free, and offline — Pass 2 can later swap the rule engine for an LLM without touching the UI.

## What changes for the user

1. **Pre-workout check-in** (replaces "Today's workout" cold start): 4 quick taps — Energy, Time (5/10/20/40), Soreness, Stress. Remembered for the day.
2. **Smart recommendation card** on Home: dynamic message based on signals
   ("You've sat 7h — Recovery Mission unlocked", "3 days off — let's restart with a 5-min win", "14-day streak — ready to level up?").
3. **Workout is now a *Protocol*** with a name + reason line ("Posture Reset · because you sat 7h today"), built from movement patterns instead of a fixed 5-move list.
4. **Auto-unlocked Recovery Missions** for coders/gamers when sittingHours ≥ 6 — separate from the daily workout, 5–10 min, neck/wrist/thoracic/hip.
5. **Mode-aware copy** for the same protocol (Hunter "Recovery Quest" vs Zen "Gentle Reset" vs Scientist "Mobility Protocol" — already supported by `modes.ts` lexicon, just plumb through).

## The engine (`src/lib/leveluplife/engine/`)

New folder, pure functions, fully unit-testable:

- `patterns.ts` — exercise library tagged by **pattern** (squat/push/pull/hinge/core/mobility), **level** (beginner/intermediate/advanced), **equipment** (none/bands/dumbbells/chair/pullup), **apartmentSafe** (no jumping), **bodyPart**, **cue**, **scienceNote**. ~50 curated movements from the user's brief (chair squat → pistol progression, wall push-up → decline, band row → pull-up, glute bridge → RDL, dead bug/bird dog/plank, full mobility set).
- `protocols.ts` — protocol templates: `FullBody`, `PostureReset`, `RecoveryRestart`, `LowEnergyFlow`, `MobilityOnly`, `StrengthFocus`, `StudentExamWeek`. Each declares pattern ratios + duration target.
- `selector.ts` — `selectProtocol(profile, checkin, signals) → ProtocolPlan`. Decision tree from the brief:
  - missed ≥3 days → `RecoveryRestart` (5 min, no guilt copy)
  - sittingHours ≥ 6 AND lifestyle ∈ {gamer, developer, office} → `PostureReset` offered as Recovery Mission; daily workout still runs
  - energy = low OR soreness = yes OR badSleep → `LowEnergyFlow` / `MobilityOnly`
  - student + stress high → `StudentExamWeek` (10 min, 40/30/30 mobility/strength/cardio)
  - office → hinge + pull + mobility bias
  - streak ≥ 14 AND no negative signals → bump level one tier (progressive overload)
  - default → balanced `FullBody` honoring goals (muscle_gain → strength bias, weight_loss → density, posture → pull+hinge+mobility)
- `builder.ts` — `buildWorkout(plan, profile, checkin) → Session` assembles **Warmup → Main → Recovery → Cooldown** by sampling `patterns.ts` filtered by equipment + apartmentSafe + level, fitting the time budget, and never repeating yesterday's exact picks (stored in localStorage as `lastMoves`).
- `messages.ts` — `recommendationMessage(profile, signals, mode)` → the smart card copy, re-skinned per motivation mode via `modes.ts` lexicon.

## Data model additions

`src/lib/leveluplife/types.ts`:
- `Checkin { date, energy: 'low'|'med'|'high', timeMin: 5|10|20|40, sore: boolean, stress: 'low'|'med'|'high' }`
- `Session { id, protocol, reason, durationMin, moves: Move[] }` (replaces flat `WorkoutMove[]`)
- `Move { name, pattern, reps, rest, cue, scienceNote, apartmentSafe }`
- `AppState` gains `checkin: Checkin | null`, `lastSessionDate: string | null`, `lastMoves: string[]`, `sittingHoursToday: number` (manual quick-log on Home, optional).

## Store changes (`store.tsx`)

- `setCheckin(c)`, `logSitting(h)`, `markWorkoutDone(sessionId)` — the last one updates `lastSessionDate` + `lastMoves` so the engine can de-dupe and detect missed streaks.
- Derive `daysSinceLastWorkout` for the selector.

## UI changes (minimal, surgical — keep current visual style)

- **`src/routes/workout.tsx`**: if no `checkin` for today → render `<CheckinSheet />` first; on submit, call `selectProtocol` + `buildWorkout`, then show the session with new **protocol header** ("Posture Reset · 10 min · because you sat 7h"). Move list rendering stays the same shape (already supports name/reps/rest/cue).
- **`src/routes/home.tsx`**: replace static `adaptiveTip` with `recommendationMessage(...)` card; add "Recovery Mission" CTA when posture-reset condition triggers.
- **New `src/components/leveluplife/CheckinSheet.tsx`** — bottom sheet with 4 segmented controls + Start button. Uses existing shadcn primitives.
- **New `src/components/leveluplife/RecommendationCard.tsx`** — wraps `GlassCard`, mode-themed.

## What is explicitly NOT in this pass

- No backend / Supabase / AI gateway calls (rule engine is deterministic; matches the "no random workouts" requirement better than an LLM anyway).
- No video demos, no rep timers beyond what exists.
- No new onboarding fields — uses what the profile already collects (`lifestyle`, `sittingHours`, `energy`, `stress`, `equipment`, `goals`, `level`); the check-in covers per-session signals.

## Technical notes

- Pure TS, no new deps.
- Engine is framework-free → trivially portable to a server function in Pass 2 if we want LLM-augmented variation.
- Movement library and decision tree are seeded directly from the user's brief so the science rules (progressive overload, no 100-pushup challenges, no loud jumping for apartments, beginner cap 15–20 min) are encoded as filters, not vibes.

## File touch list

- new: `src/lib/leveluplife/engine/{patterns,protocols,selector,builder,messages}.ts`
- new: `src/components/leveluplife/{CheckinSheet,RecommendationCard}.tsx`
- edit: `src/lib/leveluplife/types.ts`, `src/lib/leveluplife/store.tsx`, `src/lib/leveluplife/data.ts` (keep `defaultQuestsFor`, delete old `generateWorkout`/`adaptiveTip` — replaced by engine)
- edit: `src/routes/workout.tsx`, `src/routes/home.tsx`

Ready to implement on approval.