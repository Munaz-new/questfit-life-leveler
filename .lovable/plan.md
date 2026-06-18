# Personal Progress Mirror — Build Plan (v1 Core)

A private, sign-in-gated section where users track their visual transformation. **v1 scope:** Photos + Transformation Timeline (before/after slider) + Body Measurements + Achievements, plus the onboarding opt-in and a Settings toggle. Videos and the per-exercise journal are deferred to a follow-up build (architecture is designed to accommodate them).

## Core principles
- **Private by default.** Every upload lives in a per-user folder in a private storage bucket. No public URLs, no feed, no sharing. Access always requires authentication.
- **Optional.** Off until the user opts in (onboarding or Settings). Never forced.
- **Sign-in required.** Guest users see a friendly "Sign in to unlock Progress Mirror" nudge instead of the feature. Rest of the app stays usable as guest.
- Clear privacy line shown on every screen: *"Your photos are private and visible only to you."*

## Data & storage (Lovable Cloud)
Private storage bucket `progress-media` (not public). Files stored under `{user_id}/photos/...` and (future) `{user_id}/videos/...`. RLS on `storage.objects` so a user can only read/write/delete objects whose first path segment equals their `auth.uid()`. No public URLs — images load via short-lived signed URLs.

New tables (all RLS-scoped to `auth.uid()`, full GRANTs):
- `progress_settings` — per-user: `enabled` (bool), `created_at/updated_at`.
- `progress_photos` — `user_id`, `storage_path`, `view` (front/side/back/closeup), `taken_at`, `mood`, `energy`, `pain_level`, `confidence`, `note`. (mood/energy/pain/confidence are the per-upload journal fields.)
- `body_measurements` — `user_id`, `measured_at`, optional numeric: `weight`, `body_fat`, `waist`, `chest`, `arms`, `legs`, `neck`, `shoulders`, `hip`, plus `unit` and `note`. All optional.
- `progress_achievements` — `user_id`, `achievement_key`, `unlocked_at` (unique on user+key). Keys: `first_photo`, `transformation_started`, `30_day_progress`, `100_day_journey`, `visual_progress`, `consistency_champion`.

Future-ready (created now, unused in v1): `progress_videos` table + `exercise_media` table reserved for the per-exercise journal and AI analysis fields (`analysis_status`, `analysis_json`). I'll define these as empty reserved tables only if you want; otherwise I'll add them in the follow-up build to avoid clutter. Default: add in follow-up.

## App changes

### Onboarding
Add one step ("Would you like to enable Progress Mirror?" → Enable / Skip for now) with the privacy reassurance. Choice is applied after the user has an account (saved to `progress_settings`); for guests it's remembered locally and synced on sign-in.

### Settings / Profile
Toggle to enable/disable Progress Mirror, plus a **"Delete all my media"** action that permanently removes all photos (storage + rows) after confirmation.

### New route `/progress-mirror` (sign-in gated)
Placed under the `_authenticated` layout so it's only reachable when signed in. Guests hitting it from a nav entry get the sign-in nudge first. Tabs:
- **Timeline** — chronological cards (Day 1, Week 2, Month 1…) with a draggable **before/after comparison slider** between any two selected photos of the same view.
- **Photos** — grid grouped by view (Front / Side / Back / Close-up), upload button, per-photo notes + mood/energy/pain/confidence.
- **Measurements** — add-entry form (all fields optional) + simple trend list/sparkline per metric.
- **Achievements** — milestone cards, locked/unlocked states with unlock dates.

### Navigation
Add a "Mirror" entry point (e.g. a card on Home/Progress and/or a Settings link) rather than replacing an existing bottom-nav tab.

### Exercise pages
No change to the official demonstration — it always stays visible. A small "Track my progress" link will point to the Mirror in v1; the full inline "My Progress" journal comes in the follow-up build.

## Achievements logic (v1)
Unlocked client-side after each relevant action and persisted: `first_photo` (1st upload), `transformation_started` (settings enabled), `visual_progress` (photos of 2+ different dates), `30_day_progress` / `100_day_journey` (span between earliest and latest photo), `consistency_champion` (photos in N distinct weeks).

## Security
- Private bucket + storage RLS keyed to `{user_id}/…`; images served only via signed URLs.
- Table RLS: users can only see/modify their own rows.
- Permanent delete removes both DB rows and storage objects.
- No file URL ever exposed publicly.

## Out of scope for v1 (next build)
Video recording/upload, per-exercise "My Progress" journal + rep-history charts, and AI form-analysis (architecture/fields reserved at that time). Confirm and I'll implement v1.

### Technical notes
- Reads/writes go through the browser Supabase client (RLS enforced) for simplicity; uploads use `supabase.storage.from('progress-media')` with signed-URL retrieval. Local app store is unchanged except for a transient onboarding flag.
- First protected route requires creating `src/routes/_authenticated/route.tsx` (integration-managed gate) alongside `src/routes/_authenticated/progress-mirror.tsx`.
