# LevelUp Life — Phase 1: Foundation

Scope note: this project runs as a mobile-first web app (React + TanStack Start). React Native/Expo cannot run here, so Phase 1 ships on the web while keeping profile/lifestyle/preference logic in platform-agnostic modules for a future native port. All later-phase systems already built (workout player, exercise library, adaptive day, progress mirror) stay untouched and keep working.

## 1. Accounts required

- Onboarding and the home screen move behind sign-in; guest mode is removed from the auth screen.
- Auth screen keeps email sign-up, email login, and Google, and gains a "Forgot password" flow.
- New `/reset-password` page (public) to set a new password after the email link.
- Sign out from the profile screen clears cached data and returns to sign-in.
- Protected screens live under the authenticated route group so an unauthenticated visitor is redirected to sign-in.

## 2. Profile data in the cloud

New private tables, one row per user, readable and writable only by that user:

- **profiles** — name, age range, height, weight, optional gender, fitness experience, primary goal, onboarding completion flag.
- **user_lifestyle** — lifestyle type (adds Parent to the existing list), wake time, sleep time, work/study schedule, sitting hours, workout space/room size, equipment list.
- **user_preferences** — motivation mode (Hunter, Hero, Zen, Discipline, Scientist, Story) and demonstrator preference (male/female).

Goals list becomes: Build Strength, Lose Fat, Improve Endurance, Improve Mobility, General Fitness, Build Consistency.

Data loads once on sign-in into the existing app store, and each onboarding step or settings change saves back. Progression values (level, XP, quests, sessions) stay in local state for now — later phases move them.

## 3. Onboarding

Short, one-question-per-screen flow, reusing the current stepper:

1. Basics — name, age range, height, weight, optional gender
2. Experience — Beginner / Intermediate / Advanced
3. Primary goal
4. Lifestyle — type, wake/sleep, schedule, sitting hours, space, equipment
5. Motivation mode
6. Exercise demonstrator — with helper text: "Changes the demonstrator shown in exercise instructions. It does not change your workout plan."

Every step is resumable: partially completed onboarding is restored from the cloud on next sign-in.

## 4. Home screen

Cleaned-up layout showing: app name, current level and XP, a TODAY block with the single starting action (Start workout), and a Character Stats card with Strength, Stamina, Recovery, Discipline, Flexibility, Focus, Vitality. Existing adaptive-day board stays available but is not the Phase 1 focus of the screen's top hierarchy.

## 5. Visual tone-down

- Reduce gradient/glow usage to accents only; flatter cards, stronger type hierarchy, clearer spacing scale.
- Larger touch targets (min 44px) and consistent card/section components.
- Adjust the shared design tokens in `src/styles.css` rather than per-component colors, so all screens inherit the calmer look.

## 6. Loading / error / empty states

Reusable state components used by profile load, onboarding save, and home data, so nothing renders blank or half-saved.

## 7. Extension points for later phases

- Central exercise media provider hook stays the single entry point for demonstrator media (already present) — screens keep reading it rather than hardcoding images.
- Profile/lifestyle/preferences exposed through one typed accessor so the future Life Adaptation Engine reads one contract.
- No new dependencies.

## Technical details

- Migration creates `profiles`, `user_lifestyle`, `user_preferences` with `user_id` referencing the auth user, timestamps + update triggers, explicit grants to the authenticated role, RLS enabled, and policies scoped to `auth.uid()`. Existing progress-mirror tables are left as-is; no `user_goals` table is needed since the primary goal is a validated column on `profiles`.
- Reads/writes go through authenticated server functions (`requireSupabaseAuth`), called from components/authenticated loaders — no admin client, no public policies.
- Route moves: `onboarding`, `home`, `profile`, `progress`, `quests`, `workout*`, `exercises*` become children of the authenticated group; `auth` and `reset-password` stay public. Old paths keep working via the same URLs.
- Store gains a hydration step from the cloud plus debounced persistence, replacing localStorage as the source of truth for profile/preferences.
- Validation with zod on every server function input (enums for goal, level, lifestyle, motivation, demonstrator; ranges for sitting hours).
- Final pass: typecheck, lint, route check, browser test of register → onboarding → home → sign out → sign back in with data restored, plus a cross-user access check.
