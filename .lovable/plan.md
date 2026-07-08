## Diagnostic findings so far

### Step 1: Asset coverage audit

Current exercise library contains **42 exercises**.

Summary from metadata and generated manifest:

- **Total exercises:** 42
- **Exercises with male/shared assets:** 35
- **Exercises with true female assets:** 1
- **Exercises with thumbnails:** 35
- **Exercises with hero assets:** 0
- **Exercises with animation assets:** 0
- **Exercises with video assets:** 0
- **Exercises with no imported media at all:** 7
- **Average field coverage:** about 28%

Key coverage table:

```text
Exercise                         Male  Female  Thumb  Hero  Anim  Video  Coverage
Chair Squat                      Yes   Yes     Yes    No    No    No     50%
Assisted Squat                   Yes   No      Yes    No    No    No     33%
Bodyweight Squat                 Yes   No      Yes    No    No    No     33%
Goblet Squat                     Yes   No      Yes    No    No    No     33%
Split Squat                      Yes   No      Yes    No    No    No     33%
Assisted Pistol Squat            Yes   No      Yes    No    No    No     33%
Wall Push-Up                     Yes   No      Yes    No    No    No     33%
Incline Push-Up                  Yes   No      Yes    No    No    No     33%
Push-Up                          Yes   No      Yes    No    No    No     33%
Decline Push-Up                  Yes   No      Yes    No    No    No     33%
Band Row                         Yes   No      Yes    No    No    No     33%
Towel Row (Door)                 No    No      No     No    No    No     0%
Dumbbell Row                     Yes   No      Yes    No    No    No     33%
Scapular Pulls                   Yes   No      Yes    No    No    No     33%
Pull-Up                          Yes   No      Yes    No    No    No     33%
Glute Bridge                     Yes   No      Yes    No    No    No     33%
Hip Hinge Drill                  Yes   No      Yes    No    No    No     33%
Romanian Deadlift                Yes   No      Yes    No    No    No     33%
Single-Leg RDL                   Yes   No      Yes    No    No    No     33%
Dead Bug                         Yes   No      Yes    No    No    No     33%
Bird Dog                         No    No      No     No    No    No     0%
Plank                            Yes   No      Yes    No    No    No     33%
Side Plank                       Yes   No      Yes    No    No    No     33%
Neck CARs                        Yes   No      Yes    No    No    No     33%
Wrist Circles + Stretch          Yes   No      Yes    No    No    No     33%
Thoracic Opener                  No    No      No     No    No    No     0%
Shoulder Dislocates              Yes   No      Yes    No    No    No     33%
Hip Flexor Stretch               Yes   No      Yes    No    No    No     33%
Ankle Rocks                      Yes   No      Yes    No    No    No     33%
Hamstring Floss                  Yes   No      Yes    No    No    No     33%
Cat-Cow                          Yes   No      Yes    No    No    No     33%
Marching In Place                No    No      No     No    No    No     0%
Brisk Walk                       Yes   No      Yes    No    No    No     33%
Wall Angels                      No    No      No     No    No    No     0%
Chin Tucks                       Yes   No      Yes    No    No    No     33%
Doorway Pec Stretch              Yes   No      Yes    No    No    No     33%
Book Opener Rotation             No    No      No     No    No    No     0%
Child's Pose                     Yes   No      Yes    No    No    No     33%
Figure-4 Glute Stretch           Yes   No      Yes    No    No    No     33%
Box Breathing                    Yes   No      Yes    No    No    No     33%
20-20-20 Eye Reset               No    No      No     No    No    No     0%
Glute Squeeze Pulse              Yes   No      Yes    No    No    No     33%
```

### Step 2: Import pipeline audit

Observed pipeline behavior:

- Female provider exists: `ironhex-exercise-db`.
- Female import is real-only: importer only accepts provider matches with `gender === "female"`.
- Female images are downloaded into the new folder layout: `exercise-library/<folder>/female/...`.
- Existing male assets are preserved in the legacy flat shape under `assets.shared` + `assets.thumbnail`.
- Female-only import stores new female media under `tiers.female`.
- Manifest generation normalizes `tiers.female.gallery` into runtime `female` and `femaleTier`.

Root-cause candidates from the importer:

1. **Only one real female match currently exists**: Chair Squat. The other exercises did not receive female media because the provider search either found no high-confidence match or the verified `-female` files did not exist.
2. **The importer does not produce fake female assets**, which is correct.
3. **Seven exercises have no metadata at all**, so even male fallback cannot display a downloaded demonstration for those exercises.
4. Import logging is console-only. There is no durable import report showing which exercise was skipped, rejected, unmatched, or imported.

### Step 3: Media provider/call-site audit

Current source-of-truth status:

- Exercise Library uses `ExerciseCard` → `ExerciseArt` → `ExerciseAsset` → `useExerciseMedia` → `resolveMedia`.
- Mission Player uses `ExerciseArt` → `ExerciseAsset` → `useExerciseMedia` → `resolveMedia`.
- Workout Player route renders `MissionPlayer`, so it follows the same path during active workouts.
- Exercise Detail uses `ExerciseDemo` → direct `resolveMedia(id, gender)`. This uses the same resolver, but bypasses the React `useExerciseMedia` hook/provider layer.
- Daily Quests currently render icons, not exercise media previews.
- Dev dashboard directly uses `getDemo` for coverage/status and `ExerciseAsset` for preview.

Important issue:

- There is not a true shared React `ExerciseMediaProvider` component. The app has a shared hook + resolver, but Exercise Detail still calls `resolveMedia` directly.
- The exact user-facing text `Female Demonstration Coming Soon` is not present in the current visible source, which means the message is likely coming from one of these:
  - stale bundled code / previous preview state,
  - a non-current file path not yet fully traced,
  - or a placeholder component variant shown when `images.length === 0`.
- Current fallback comments and placeholders still mention "coming soon" in generic terms, and `ComingSoon` renders `Illustration coming soon` when there is no media at all.

## Root cause to fix

The production-ready failure is likely two-part:

1. **Data coverage reality:** most exercises do not have true female media. The system must silently serve male/shared media for female selection.
2. **Renderer hardening gap:** any exercise with no female media and no male/shared media can still fall through to the generic placeholder path. Also, Exercise Detail bypasses the shared `useExerciseMedia` hook, so it is easier for behavior to drift.

## Fix plan

### 1. Make fallback absolute and centralized

Update the media resolver so the fallback chain is explicit and cannot produce a female-specific placeholder:

```text
requested female
  → female gallery
  → female thumbnail
  → male gallery
  → shared gallery
  → male thumbnail/shared thumbnail
  → empty only if no real asset exists for any demonstrator
```

For male:

```text
requested male
  → male gallery
  → shared gallery
  → male thumbnail/shared thumbnail
  → female gallery only as last-resort if it is the only real media
  → empty only if no real asset exists
```

No notes, overlays, badges, or warnings will be returned for normal UI.

### 2. Promote `useExerciseMedia` as the app-wide provider surface

Refactor Exercise Detail’s `ExerciseDemo` to use the shared hook/resolution path instead of directly calling `resolveMedia` in component code.

Keep the same UI and controls, but ensure all exercise screens consume the same media surface:

- Library cards
- Exercise detail hero/gallery
- Workout/Mission player
- Exercise previews
- Dev dashboard preview

### 3. Remove normal-use placeholder text for gender fallback

Keep a fallback only for truly missing media, but remove any female-specific or “coming soon” messaging from normal exercise rendering.

For exercises with no real media at all, display a neutral non-gendered empty state only where unavoidable, or replace with a deterministic non-placeholder app illustration if one already exists in the codebase. No fake assets will be created.

### 4. Add a durable importer diagnostic report

Enhance the importer in diagnostic mode so it reports, per exercise:

- provider searched
- best candidate label
- confidence
- female URL verified or missing
- imported / skipped / rejected / no match
- output paths written

This will make future female coverage debugging reproducible instead of relying on console text from one run.

### 5. Fix coverage math and dashboard schema awareness

Update coverage utilities so `assets`, `tiers`, `maleTier`, and `femaleTier` are all counted consistently.

This prevents false negatives like “Female: missing” when female media exists under the new tier schema.

### 6. Verify in runtime

After implementation:

- Select Female Demonstrator.
- Open Chair Squat: should show true female media.
- Open exercises without female media but with male/shared media: should silently show male/shared demonstration with no note or placeholder.
- Open the 7 exercises with no imported media: confirm they do not show female-specific placeholder text.
- Search the app bundle/source for `Female Demonstration Coming Soon`, `Female demonstration coming soon`, and user-facing `coming soon` strings.

## Final report after implementation

I will produce a final report containing:

- Total Exercises
- Exercises with Male Assets
- Exercises with Female Assets
- Overall Coverage %
- Importer Status
- Media Provider Status
- Remaining exercises with no real media
- Confirmation that no normal user path displays `Female Demonstration Coming Soon`