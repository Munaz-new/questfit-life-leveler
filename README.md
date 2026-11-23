# LevelUp Life

**Turn your real life into character progression.**

LevelUp Life is a mobile-first fitness web app that combines adaptive home workouts, daily quests, and RPG-style progression. Plans respond to a user's lifestyle, available time, equipment, energy, and recent activity.

## Features

- **Lifestyle onboarding** — collect fitness goals, routine, equipment, and motivation preferences.
- **Adaptive daily plans** — generate and adjust missions using local rules and activity history.
- **Guided workouts** — follow warmups, exercise sets, rest timers, and cooldowns.
- **Character progression** — earn XP, gain levels, develop skills, and track streaks.
- **Exercise library** — browse exercise details and demonstrations from supported media providers.
- **Progress Mirror** — record progress photos, body measurements, and achievements through Supabase.
- **Authentication** — sign in with email/password or Google through Supabase.
- **Responsive interface** — mobile navigation, visual themes, and a web app manifest.

The adaptation engine is rule-based and runs locally. It does not require an external AI API key.

## Technology

- **Application:** React 19, TypeScript, TanStack Start, and TanStack Router
- **UI:** Tailwind CSS 4, Radix UI, Lucide icons, and Recharts
- **Data and authentication:** Supabase and TanStack Query
- **Build and server:** Vite 8 and Nitro
- **Package management:** npm with a committed lockfile

This repository contains a web application, not a React Native or Expo application.

## Getting started

### 1. Install prerequisites

Use Node.js **22.12 or newer** and npm. A Supabase project is required for authentication and backend features.

### 2. Clone and install

```sh
git clone https://github.com/Munaz-new/questfit-life-leveler.git
cd questfit-life-leveler
npm ci
```

### 3. Configure the environment

```sh
cp .env.example .env
```

Fill in the following values from your Supabase project:

```dotenv
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-publishable-key
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_PUBLISHABLE_KEY=your-publishable-key
```

The `VITE_` values are public configuration included in the browser build. The corresponding `SUPABASE_` values configure server-side access. Use a publishable key, never a service-role or secret key, in these fields. Local `.env` files are excluded from Git.

### 4. Prepare Supabase

1. Apply the SQL files in [`supabase/migrations`](./supabase/migrations) to your project in timestamp order, using the Supabase CLI or SQL Editor.
2. Configure email authentication and the project's Site URL.
3. For Google sign-in, enable the Google provider and supply your Google OAuth credentials.
4. Register the callback URL shown by Supabase in your Google OAuth configuration.
5. Add your application's `/auth` URL to the allowed Supabase redirect URLs, including the local development URL when needed.

A new database needs its own migrations and configuration. Existing users, files, and application data are not transferred automatically.

### 5. Start development

```sh
npm run dev
```

Open the local URL printed by Vite. Use that origin when configuring development authentication redirects.

## Development commands

```sh
npm run dev        # Start the development server
npm run build      # Create the production build
npm run build:dev  # Build using development mode
npm run preview    # Preview the built application locally
npm run lint       # Run ESLint
npm run format     # Format the repository with Prettier
npx tsc --noEmit   # Check TypeScript types
```

## Project structure

```text
public/                    App icons and web app manifest
src/
  components/              Application and shared UI components
  integrations/supabase/   Supabase clients, auth middleware, and types
  lib/leveluplife/
    assets/                Exercise media providers and asset handling
    day/                   Adaptive daily plans and history
    engine/                Workout generation and XP calculations
    exercises/             Exercise library and recommendations
    store.tsx              Application state and browser persistence
    progressMirror.ts      Progress photos and measurement data access
  routes/                  File-based pages, layouts, and navigation
  server.ts                Server entry point
supabase/migrations/       Database and storage setup
vite.config.ts             Vite, TanStack Start, and Nitro configuration
```

## Data and current limitations

- Core application state, including XP, quests, and workout progress, is persisted in browser local storage. Do not assume all progress is synchronized between devices.
- Supabase supplies authentication and backend features such as Progress Mirror.
- The sign-in screen includes a guest button, but the current application route guard requires a signed-in user for the main screens. A complete guest flow is not implemented.
- Some exercise media comes from external providers and requires an internet connection.
- A web app manifest is included; full offline operation is not implemented.

## Deployment

Build the application:

```sh
npm ci
npm run build
```

The build creates Nitro output in `.output/`. Deploy that output to a compatible server host. For the default Node server output:

```sh
node .output/server/index.mjs
```

Set the public `VITE_SUPABASE_*` variables before building and the `SUPABASE_*` variables in the server environment. Update Supabase's Site URL and allowed redirects to match your production domain.

This application uses server functionality and should not be deployed as only a static folder. `npm run preview` is intended for local verification.

## Contributing

1. Create a branch for your change.
2. Keep changes focused and describe the resulting behavior.
3. Run TypeScript checks, lint, and a production build.
4. Open a pull request with a summary and verification details.

## License

No project license file has been added yet. Third-party packages and exercise assets have their own licenses.
