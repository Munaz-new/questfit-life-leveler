## Exercise Media Reliability Plan

### Verified current state

- The Exercise Library contains **42 exercises**.
- **35** exercises have imported male/shared demonstrations; every referenced local WebP exists and decodes successfully.
- **1** exercise, Chair Squat, has a verified genuine female demonstration.
- **7** exercises have no imported media: Towel Row (Door), Bird Dog, Thoracic Opener, Marching In Place, Wall Angels, Book Opener Rotation, and 20-20-20 Eye Reset.
- Library cards, Exercise Detail, and Mission/Workout Player currently resolve exercise media through the shared `useExerciseMedia` → `resolveMedia` path.
- Female selection already falls back silently to valid male/shared media when no genuine female asset exists; no female-specific “coming soon” string remains in the current source.
- The remaining “Demonstration unavailable” state is caused by the seven exercises that have no metadata or imported files—not by broken paths among the 35 imported exercises.

### 1. Complete the asset-source audit

- Produce a durable audit row for every exercise containing ID, name, male/female tier, thumbnail/gallery/hero paths, source, license, file existence, decode result, and provider-match status.
- Probe provider URLs before import and record rejected candidates, confidence, HTTP status, and mapping decisions.
- Add explicit aliases for the seven unmatched exercise names where an approved provider contains a semantically equivalent movement.
- Never assign a male image to the female tier or fabricate female metadata.

### 2. Import every valid missing demonstration

- Run the approved open-source providers against all seven missing exercises using exact/alias-aware matching.
- Import each verified match into its exercise-owned folder, optimize to WebP, preserve source/license metadata, and regenerate the manifest.
- Import genuine female media wherever the provider URL is independently verified; otherwise leave the female tier empty and rely on the honest male/shared fallback.
- Keep any exercise with no valid approved source marked internally as missing and include it in the final report.

### 3. Harden the single media-provider contract

- Keep `resolveMedia` as the only pure resolver and `useExerciseMedia` as the only React consumption surface.
- Ensure the resolver validates all available tier shapes consistently: female, male, shared, thumbnails, and richer future tiers.
- Add image-load recovery so a corrupt or failed preferred frame advances to the next valid imported frame/tier rather than leaving a broken image.
- Remove stale model fields/comments that suggest screens may directly consume exercise image properties.
- Confirm Library, Exercise Detail, Mission/Workout Player, recommendations, search results, and all existing previews use `ExerciseAsset`/`ExerciseDemo`; document screens such as Daily Quests that currently show no exercise preview rather than inventing UI.

### 4. Keep preference behavior consistent

- Initialize the global demonstrator preference without a stale male first render after hydration.
- Verify Male selects male/shared media.
- Verify Female selects genuine female media where available and silently serves the best valid male/shared demonstration otherwise.
- Verify Exercise Detail’s temporary override remains local unless “Make this my default” is selected.
- Preload the resolved workout assets for the selected preference before playback.

### 5. Make the developer audit authoritative

- Back the existing unlinked developer asset dashboard with the same central resolver and audit helpers.
- Report male, female, both, only-male, only-female, no-valid-media, import status, coverage, source/license, and validation state per exercise.
- Keep this route absent from normal navigation; no user-facing redesign is included.

### 6. Rendered verification

- Open the real Exercise Library with a seeded guest profile and verify every card image has loaded with non-zero natural dimensions.
- Explicitly test Push-Up, Bodyweight Squat, Cat-Cow, Dead Bug, Glute Bridge, Hip Hinge, Romanian Deadlift, Single-Leg RDL, Figure-4 Glute Stretch, and Box Breathing.
- Run the exact Male → Library → Female → Library → Exercise Detail → Workout/Mission Player flow.
- Confirm Chair Squat changes to its genuine female asset and exercises without female media show a valid honest fallback with no overlay, warning, placeholder, or broken image.
- Re-run the complete file/decode audit after import and capture final browser evidence before declaring the system fixed.

### Final report

Provide totals for exercises, male media, female media, both, only male, only female, no valid media, broken URLs fixed, and assets imported. List every remaining exercise with no genuine demonstration and its provider diagnosis.