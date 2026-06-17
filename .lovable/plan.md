
# Guided Mission Player (Workout Pass 2)

Kill the "Mark Done" checklist. Turn a workout into a fullscreen guided mission with per-exercise focus, live timers, auto rest, and a real summary. XP is earned, not tapped.

## User flow

```
/workout
  Check-in (existing)            → already there
  Mission Briefing screen        → NEW: protocol name, reason, exercise count,
                                   duration, equipment, mode-themed CTA
                                   ("Start Quest" / "Begin Flow" / etc.)
        ↓ Start Mission
/workout/play  (fullscreen)
  Warmup ex 1 → Rest → Warmup ex 2 → Rest …
  Main ex 1   → Rest → Main ex 2   → Rest …
  Cooldown 1  → Rest → Cooldown 2
        ↓ auto-advance on last
/workout/summary
  Mission Complete, XP, calories est, streak, level bar, share/back
```

If the user backs out mid-mission: state is preserved; on re-entry show
"Resume mission" vs "Restart" + a "Partial progress saved" toast.

## Per-exercise focus screen (the core change)

Fullscreen, one exercise only, no list visible:

- Top: `Exercise 3 of 8` + slim segmented progress bar (warmup/main/cooldown colored).
- Hero: exercise name (display font), one-line purpose.
- Demo slot: animated SVG/Lottie placeholder for MVP (static illustration or emoji glyph + cue diagram — no video).
- Target: `3 × 8 reps` for rep-based, or big countdown `00:30` for time-based.
- Coach cue (one line, large), expandable "Why this move" drawer:
  - Targets (muscles)
  - Benefits
  - Common mistake to avoid
- Bottom action depends on mode:
  - **Time-based**: `Start` → live countdown → auto-completes at 0. While running: pause / +15s / skip (skip = no XP).
  - **Rep-based**: `Set 1 done` button per set, advances set counter. After last set → auto rest. No global "Mark Done".

## Rest screen

Between every exercise (except last cooldown):

- Big "Recovery · 45s" countdown.
- "Up next: Band Row · 3×10" preview card.
- Buttons: `Skip rest`, `+15s`.
- Auto-advances to next exercise at 0.

## Mission briefing & summary

**Briefing** (replaces today's workout list view):
- Protocol name + reason (already computed by engine)
- Stats row: duration, exercise count, intensity dot, equipment chips
- Exercise preview (collapsed list — names only, no per-item action)
- Mode-themed CTA: pulled from `modes.ts` lexicon (new `startCta` field per mode).

**Summary** (`/workout/summary` route, fullscreen):
- "Mission Complete" headline (mode-themed)
- XP earned (animated count-up)
- Stats: exercises finished / total, time on task, est. calories (simple MET × duration × bodyweight if known, else duration-only), streak before → after, level bar fill.
- Pattern balance mini-chart (squat/push/pull/hinge/core/mobility hits)
- CTAs: `Back home`, `Share streak` (later).

## XP rules (earned, not tapped)

- Time-based exercise: XP only when its countdown reaches 0 (or paused-then-resumed to 0). Skipping = 0 XP for that move.
- Rep-based exercise: XP only when all sets logged.
- Workout quest (`workout` category) completed only when summary screen reached with ≥70% of exercises actually completed (not skipped). Partial < 70% → "Partial progress saved", small consolation XP (~25% of full), no streak increment regression.
- Move move-level XP into the engine (new field per exercise) so cooldown stretches are worth less than main lifts.

## Recovery Missions (surfaced, not built new)

Engine already produces `posture_reset`, `recovery_restart`, `mobility_only`, `low_energy_flow`. The Mission Player works for these identically — they just use shorter timers and softer mode copy. Home gets a dedicated "Recovery Mission" CTA card when `sittingHoursToday ≥ 6` OR `daysSinceLastWorkout ≥ 3`, routing to `/workout?protocol=posture_reset` (override flag on the selector).

## Smart adaptation (lightweight, this pass)

- On summary: if completion ≥ 90% three sessions in a row → bump engine's effective `level` one tier next selection (stored on `AppState.adaptiveBoost`).
- If completion ≤ 50% twice in a row → drop one tier, switch next session to `low_energy_flow`.
- All client-side, no backend.

## Files

### New
- `src/routes/workout.play.tsx` — fullscreen player route (no bottom nav). Reads the active session from store; renders `ExerciseScreen` or `RestScreen` based on cursor.
- `src/routes/workout.summary.tsx` — fullscreen summary; computes XP + stats; clears active session on exit.
- `src/components/leveluplife/player/ExerciseScreen.tsx`
- `src/components/leveluplife/player/RestScreen.tsx`
- `src/components/leveluplife/player/MissionBriefing.tsx`
- `src/components/leveluplife/player/MissionProgressBar.tsx`
- `src/components/leveluplife/player/ExerciseEducation.tsx` (drawer)
- `src/lib/leveluplife/engine/education.ts` — `{ targets, benefits, avoid }` per move id, seeded for the ~50 moves already in `patterns.ts`.
- `src/lib/leveluplife/engine/xp.ts` — `xpForMove(move, block)` + `summarize(session, completed)`.

### Edited
- `src/lib/leveluplife/types.ts` — add `ActiveSession { sessionId, startedAt, cursor, completedMoveIds[], skippedMoveIds[], setProgress: Record<id, number> }`, `adaptiveBoost: -1|0|1`, optional `lastSummary`.
- `src/lib/leveluplife/store.tsx` — `startMission(session)`, `advanceCursor()`, `logSetDone(id)`, `completeTimedMove(id)`, `skipMove(id)`, `finishMission()` (computes XP via `xp.ts`, updates streak/level/adaptiveBoost, stashes `lastSummary`, clears `activeSession`).
- `src/lib/leveluplife/modes.ts` — add `startCta`, `completeHeadline` per mode (Hunter "Start Quest"/"Quest Complete", Zen "Begin Flow"/"Flow Complete", etc.).
- `src/lib/leveluplife/engine/selector.ts` — accept optional `forceProtocol` override for Recovery Mission CTA.
- `src/lib/leveluplife/engine/builder.ts` — attach `xpValue` and `block` to each emitted move; expose `Session` shape with id + createdAt.
- `src/routes/workout.tsx` — becomes the Briefing screen: check-in → briefing card → `Start Mission` navigates to `/workout/play`. No more inline checklist/Reset/Keep-going UI here.
- `src/routes/home.tsx` — add Recovery Mission CTA card when triggers fire; deep-link with `forceProtocol`.
- `src/components/leveluplife/Shell.tsx` — allow `withNav={false}` fullscreen variant (already supports `withNav` prop; verify) for player/summary routes.

### Removed
- The current in-place checklist UI in `src/routes/workout.tsx` (mark-done buttons, reset/finish row) — replaced by Briefing + Player.

## Out of scope (explicit)
- No sensor / step / motion APIs (listed as Future Phase).
- No real videos — animated SVG/Lottie placeholder slot only; can swap later.
- No backend sync; everything remains in localStorage via the existing store.
- No social share endpoint; summary "Share" button is stubbed.

## Open questions before I build
1. **Demo art**: ship with simple illustrated emoji-style glyphs per pattern (squat/push/pull/etc.) as a placeholder, or generate static SVG illustrations per move now? (Latter is ~50 small SVGs.)
2. **Calorie estimate**: profile already has `weight` as a string (ranges) — OK to parse the midpoint, or skip kcal and show "minutes active" only?
3. **Resume vs restart**: on re-entry to `/workout` with an `activeSession`, do you want a modal asking, or always auto-resume?

I'll wait on these before implementing, but defaults are: (1) pattern glyphs, (2) parse midpoint with graceful fallback, (3) modal.
