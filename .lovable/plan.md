
# LevelUp Life — Visual Shell (Pass 1)

A premium mobile-first PWA with the full screen set, design system, and interactions in place. Data is mocked (in-memory + localStorage) so we can perfect look/feel, then wire backend persistence and the adaptive AI engine in pass 2.

## What ships in this pass

**All 7 screens, navigable and polished:**
1. Splash — animated logo, glow pulse, auto-advance
2. Welcome / Auth — Guest, Google, Email (Lovable Cloud)
3. Onboarding — 7-step immersive flow (Basics → Lifestyle → Routine → Equipment → Goals → Level → Motivation Style) with progress bar + "Generating Your System" reveal
4. Home — greeting, daily mission card (4 quests), adaptive AI tip (static for now), streak + XP + level widget
5. Quests — daily adaptive list, XP rewards, recovery-mission fallback, no guilt copy
6. Workout — adaptive workout cards, timer, set/rep tracker, rest timer, animations
7. Progress — XP/level hero card, 7 real-life stats (Strength, Stamina, Recovery, Discipline, Vitality, Flexibility, Focus), skill cards (Posture Guardian, Endurance Core, Discipline Passive, Flex Master) with subtle glow
8. Profile — lifestyle summary, goals, motivation style, theme, settings

**Premium bottom nav** (Home / Quests / Workout / Progress / Profile) with animated active state.

## Design system

Defined as Tailwind v4 tokens in `src/styles.css`:

```text
bg:        #070B14         (deep space)
card:      #111827         (elevated surface)
accent-1:  #00D4FF cyan
accent-2:  #3B82F6 electric blue
accent-3:  #7C3AED violet  (used sparingly for rare/level-up)
text:      #F3F4F6 / #94A3B8
success:   #10B981  warn: #F59E0B
gradient-primary:  cyan → electric blue (CTAs, XP bars, hero glow)
gradient-rare:     blue → violet (level-up, skill unlocks)
```

- Glassmorphism cards (`bg-card/60` + `backdrop-blur-xl` + 1px inner border `border-white/5`)
- Soft outer glow on key elements (`shadow-[0_0_40px_-10px_rgba(0,212,255,0.5)]`)
- Rounded radius scale: cards 20px, chips 12px, buttons 14px
- Typography: Inter (body) + Space Grotesk (display/numerics)
- Motion: fade-in + scale-in entrances, animated XP bar fill, haptic-feel button press, page transitions
- Mobile-first — locked to phone width with safe-area insets; works full-screen as installed PWA

## Architecture

- **Stack**: TanStack Start + React + Tailwind v4 + shadcn primitives (heavily restyled — no default look)
- **Routes**:
  - `/` splash → redirects based on onboarding state
  - `/auth` welcome + sign-in
  - `/onboarding` multi-step
  - `/_authenticated/home`, `/quests`, `/workout`, `/progress`, `/profile`
- **State**: Zustand store for user profile + XP/quests/streak; persisted to localStorage in pass 1, replaced with Supabase in pass 2
- **Auth**: Lovable Cloud enabled. Email + Google sign-in. Guest mode bypasses auth and stores locally. Google goes through the Lovable broker per platform requirements.
- **PWA**: manifest + icons + theme color so it installs to Android/iOS home screen. No offline service worker in pass 1.

## Mock data shape (ready for pass 2)

User profile, onboarding answers, today's quest list, workout library (bodyweight / chair / band / dumbbell variants), XP curve, skill definitions — all typed in `src/lib/leveluplife/*` so swapping to Supabase queries is a one-file change per concern.

## Explicitly out of scope this pass (saved for pass 2)

- Real adaptive AI engine (rule-based generator + Lovable AI tip generation)
- Persisting quests/XP/streak to Postgres with RLS
- Workout history + progress charts
- Push notifications, reminders
- Profile editing flows beyond display

## Acceptance criteria

- Opens on phone, installs to home screen, launches standalone with dark theme
- Onboarding completes and produces a personalized-feeling Home screen
- Every screen looks intentionally designed — not a shadcn-default look
- Bottom nav transitions are smooth; no layout shift on route change
- Guest mode works end-to-end without signing in
