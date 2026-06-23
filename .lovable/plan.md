# Exercise Demonstration Preference

Today the demonstrator (male/female) is set in a generic "The basics" onboarding sub-field, and the per-exercise toggle silently overwrites the global default. We'll make it a first-class, well-explained preference with a proper temporary-preview flow.

## What changes for the user

1. **New onboarding step** — A dedicated "Exercise Demonstration Preference" screen asking *"Which exercise demonstrator would you like to follow?"* with two clear options (Male / Female Demonstrator) and the note: *"This only changes the instructor shown in exercise guides. Your workout plan stays exactly the same."*
2. **Per-exercise preview switch** — On each exercise page, the existing Male/Female switch becomes a true temporary preview. When the user switches to the *other* demonstrator, a small prompt appears:
   - **Use only for this exercise** — applies just on this page, reverts when they leave.
   - **Make this my default** — updates the saved default everywhere.
3. **Settings > Workout Preferences** — A new section in the profile/settings screen where the saved default demonstrator can be changed anytime (replaces today's loose "Demonstration style" card, restyled and relabeled).

## How it works (technical)

**Default vs. session vs. per-exercise override (3 layers).** The default lives in `profile.gender` (persisted) and is mirrored into the existing `demoGender` localStorage value, which `useDemoGender()` already reads app-wide. We add a third, non-persistent **per-exercise override** held in React state inside `ExerciseDemo`, so "this exercise only" never touches the saved default.

- `src/routes/onboarding.tsx`
  - Remove the "Demonstration style" field from the current "The basics" step (step 1).
  - Insert a new dedicated step with the exact question, two large option cards, and the reassurance copy. Bump `TOTAL` from 9 to 10 and renumber the conditional `step === n` blocks accordingly. The selection still writes to `p.gender`, which `setProfile` already seeds into `demoGender`.

- `src/components/leveluplife/exercises/ExerciseDemo.tsx`
  - Track a local `override: Gender | null` state. The displayed demonstrator = `override ?? savedGender`. On leaving the page (component unmount / id change) the override is dropped automatically.
  - When the user taps the other demonstrator, instead of immediately calling `setDemoGender`, set the local override AND show a small inline prompt (lightweight popover/inline card, reusing existing UI tokens) with the two actions:
    - "Use only for this exercise" → keep local override only, dismiss prompt.
    - "Make this my default" → call `setDemoGender(g)` (updates the global default + persists), clear override, dismiss prompt.
  - Switching back to the saved demonstrator just clears the override with no prompt.

- `src/lib/leveluplife/store.tsx`
  - Add a small helper so "Make this my default" also updates `profile.gender` (not just the `demoGender` localStorage), keeping profile and demo preference in sync. (Re-use the existing `setProfile`/seed logic.)

- `src/routes/profile.tsx`
  - Rename the "Demonstration style" card to a **"Workout Preferences"** section containing the demonstrator default toggle (keeps current behavior of writing the persisted default), with copy clarifying it only affects demonstration media.

## Future-proofing (no DB changes)

The demonstrator is already a **string key** into the asset gallery map (`ExerciseDemoAssets` keyed by demonstrator). Adding new demonstration types later (e.g. additional instructors, animated, 3D) means adding new keys to that map and to the option list — no schema or storage-shape change, since the preference is just a stored string. The plan keeps the `male | female` keys for now and leaves the resolution/fallback chain in `assetManager.ts` untouched.

## Out of scope
- No new demonstrator media is sourced; both genders still fall back to the shared imported set where a gendered set doesn't exist.
- No workout/XP/session logic changes.
