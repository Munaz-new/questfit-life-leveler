# LevelUp Life V2 — Adaptive Day System

Built on top of the existing app. Nothing existing is removed: auth, onboarding, motivation modes, Exercise Library, demonstrations, Workout Player, Mission Player, XP/levels, skills, Progress, Progress Mirror, Profile, and the shared exercise media provider all stay exactly as they are.

## What the user gets

**Your Day** becomes the centre of the Home screen. Once per day the app asks three quick taps — energy, available time, and how the body feels — then generates a personalised set of missions:

```text
YOUR DAY                       Level 7
Today's system is calibrated to you.

MAIN QUEST      18-min Full Body Workout   +40 XP   [ Start Workout ]
SIDE QUEST      5-min Mobility Reset       +15 XP   [ Start 5:00 ]
RECOVERY        Hydration                  +10 XP   [ Log Water ]
FOCUS           25-min Focus Session       +20 XP   [ Start Focus ]
BONUS           10-min Walk                +15 XP   [ Start Mission ]

Today's Progress    2 / 5 complete     [ Why this plan? ]  [ Recalibrate ]
```

Each mission type has a real interaction — the workout opens the actual Workout Player, timed missions run a real timer, hydration logs a glass of water, focus runs a focus timer. Nothing claims to have verified an activity the app cannot verify; manual logs are labelled honestly as self-reported.

Recovery Mode kicks in automatically when signals point to low energy, soreness, several missed days, or too much recent training: the day shrinks to mobility, a walk, and a breathing reset, with supportive language rather than guilt. Recalibrating mid-day regenerates only the missions that are still open — completed missions and earned XP are never touched.

The plan is generated once per day and stored locally, so it does not change on every screen render, and it works for guests without sign-in. No new database tables are needed.

## The Adaptive Day Engine

One central module makes every decision; screens only render its output.

```text
Profile + goals + level + equipment + lifestyle + motivation mode
        +  today's check-in (energy / time / physical state)
        +  history (streak, days since last workout, recent completion,
                    recent muscle patterns, sitting hours, adaptive boost)
                              ↓
                    Adaptive Day Engine
                              ↓
   Daily Plan: missions, duration, intensity, XP, "why this plan"
                              ↓
   Mission System → real action → completion → XP / skills / stats
```

Rules it applies:

- Low energy or reported soreness → lower intensity, mobility/recovery/breathing/walk emphasis, never a punishment session.
- Time budget → 5 min micro mission, 10 min compact, 20 min standard, 30+ fuller session.
- Recent hard session on the same patterns → complementary or recovery work instead of repeating load.
- Missed days → gentle restart with a small achievable mission, no reset, no "you failed".
- High consistency → gradual progression only when energy, time, and recovery all allow; a streak alone never raises difficulty.
- Overload signs → recovery is prioritised.
- Safety guardrails cap volume and progression per fitness level; pain/injury reporting suggests stopping that activity and seeking professional guidance, with no diagnosis.

Motivation modes only change wording, framing, and emphasis — mission structure and intensity are identical across modes.

## Screens

- **Home** — greeting, level/XP, adaptive system message, Your Day mission list, daily progress, quick workout access. Same dark futuristic visual language, existing card/shell components reused.
- **Daily check-in** — a compact three-question sheet shown automatically on the first Home visit each day; reachable again through Recalibrate.
- **Quests** — kept as it is today (fixed habit list) and additionally shows today's adaptive missions in its own section, so both systems live side by side without duplicating logic.
- **Progress** — a new simple "This Week" summary above the existing attributes/skills: active days, plus improving/stable direction for strength, stamina, mobility, recovery, and focus. No heavy charts.
- **Progress Mirror** — untouched and still private; its media never mixes with exercise demonstration media.

## Technical section

New files under `src/lib/leveluplife/day/`:

- `types.ts` — `DailyPlan`, `DailyMission`, `MissionKind` (`workout | timed | walk | hydration | focus | habit`), `MissionStatus`, `AdaptiveInput`, `RecoveryState`.
- `engine.ts` — `generateDay(profile, input, history)` → `DailyPlan` with `missions`, `recoveryMode`, `whyThisPlan`, `intensity`. Wraps the existing `selectProtocol` / `buildSession` for the workout mission instead of reimplementing exercise selection. Pure function, no React, no storage.
- `rules.ts` — the safety caps, time budgets, pattern-freshness and progression checks used by `engine.ts`.
- `regenerate.ts` — `recalibrate(plan, newInput, history)` preserving completed missions and awarded XP.
- `history.ts` — derives signals (recent patterns, completion rate, active days this week) from existing store fields.
- `xp.ts` (day-level) — maps mission category to stat and skill gains: workout → strength/discipline, cardio & walk → stamina/Endurance Core, mobility → flexibility/Flex Master + Posture Guardian, recovery/hydration/breathing → recovery, focus → focus, consistent completion → discipline/Discipline Passive. Deterministic, no random awards.

Store (`src/lib/leveluplife/store.tsx`) additions — existing state and actions unchanged:

- `AppState`: `dailyPlan: DailyPlan | null`, `adaptiveInput: AdaptiveInput | null`, `waterLogs`, `missionHistory` (rolling last ~14 days of completions for trend/pattern signals).
- Actions: `ensureDailyPlan()` (generate only when no plan exists for today), `setAdaptiveInput()`, `recalibrateDay()`, `completeMission(id, meta)`, `logWater()`. `completeMission` routes through the day-level XP map so stats and skills advance from real behaviour, reusing the existing level-curve logic.
- Day rollover clears the plan/input and rolls yesterday into `missionHistory`.

New components under `src/components/leveluplife/day/`:

- `AdaptiveCheckin.tsx` — three-question sheet (reuses the existing `CheckinSheet` styling; the old sheet stays for the workout flow).
- `YourDay.tsx` — the mission list section.
- `MissionRow.tsx` — renders the correct action button per `MissionKind`.
- `MissionTimer.tsx` — shared countdown for timed/focus/walk missions.
- `WhyThisPlan.tsx` — collapsible explanation.
- `WeeklyTrends.tsx` — the Progress "This Week" summary.

Screens edited: `src/routes/home.tsx` (Your Day becomes the focus), `src/routes/quests.tsx` (adds an adaptive-missions section), `src/routes/progress.tsx` (adds `WeeklyTrends`). Workout missions navigate into the existing `/workout` + `/workout/play` player with the plan's protocol, and the existing summary flow reports completion back to the mission.

Exercise media: all mission and exercise visuals continue to go through `useExerciseMedia`; no new image path, no new resolver, existing silent male fallback preserved.

Also fixing a small existing bug found while inspecting Home: the greeting is derived from `new Date().getHours()` during render, which causes a server/client hydration mismatch. The greeting will be computed after mount.

Persistence: local storage only, same `leveluplife.v1` key with a version bump and safe defaults for older saved state. No database changes.

## Test scenarios to verify

High energy + 30 min; low energy + 5 min; good energy + 10 min; several missed workouts; recent hard workout; beginner with no equipment; student with a busy schedule; long-sitting lifestyle; time changed mid-day via Recalibrate; and Male/Female demonstrator switch staying in sync across Library, Detail, Player, and mission cards.
