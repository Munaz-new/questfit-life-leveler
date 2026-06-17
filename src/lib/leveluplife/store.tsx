import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { AppState, Checkin, Quest, UserProfile } from "./types";
import { defaultQuestsFor, defaultSkills, defaultStats } from "./data";

const STORAGE_KEY = "leveluplife.v1";

const initialState: AppState = {
  onboarded: false,
  profile: null,
  level: 1,
  xp: 0,
  streak: 0,
  quests: [],
  stats: defaultStats(),
  skills: defaultSkills(),
  checkin: null,
  sittingHoursToday: 0,
  lastSessionDate: null,
  lastMoves: [],
};

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

function daysBetween(from: string | null, to: string): number {
  if (!from) return 99;
  const a = new Date(from + "T00:00:00").getTime();
  const b = new Date(to + "T00:00:00").getTime();
  return Math.max(0, Math.round((b - a) / 86_400_000));
}

interface Ctx {
  state: AppState;
  setProfile: (p: UserProfile) => void;
  setMotivation: (m: UserProfile["motivation"]) => void;
  completeQuest: (id: string) => void;
  setCheckin: (c: Checkin) => void;
  logSitting: (h: number) => void;
  markSessionDone: (moveIds: string[]) => void;
  daysSinceLastWorkout: number;
  resetAll: () => void;
  xpForNextLevel: number;
  progressPct: number;
}

const AppCtx = createContext<Ctx | null>(null);

function xpCurve(level: number) {
  return 100 + level * 50;
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(initialState);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<AppState>;
        setState({ ...initialState, ...parsed });
      }
    } catch {}
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {}
  }, [state, hydrated]);

  // Stale check-in / sitting log — clear at day rollover.
  useEffect(() => {
    if (!hydrated) return;
    const t = today();
    if (state.checkin && state.checkin.date !== t) {
      setState((s) => ({ ...s, checkin: null, sittingHoursToday: 0 }));
    }
  }, [hydrated, state.checkin]);

  const value = useMemo<Ctx>(() => {
    const xpForNextLevel = xpCurve(state.level);
    const daysSinceLastWorkout = daysBetween(state.lastSessionDate, today());
    return {
      state,
      xpForNextLevel,
      progressPct: Math.min(100, Math.round((state.xp / xpForNextLevel) * 100)),
      daysSinceLastWorkout,
      setProfile: (p: UserProfile) =>
        setState((s) => ({
          ...s,
          profile: p,
          onboarded: true,
          quests: s.quests.length ? s.quests : defaultQuestsFor(p),
          streak: s.streak || 1,
        })),
      setMotivation: (m) =>
        setState((s) =>
          s.profile ? { ...s, profile: { ...s.profile, motivation: m } } : s,
        ),
      completeQuest: (id: string) =>
        setState((s) => {
          const q = s.quests.find((x) => x.id === id);
          if (!q || q.done) return s;
          const newQuests: Quest[] = s.quests.map((x) =>
            x.id === id ? { ...x, done: true } : x,
          );
          let xp = s.xp + q.xp;
          let level = s.level;
          let cap = xpCurve(level);
          while (xp >= cap) {
            xp -= cap;
            level += 1;
            cap = xpCurve(level);
          }
          return { ...s, quests: newQuests, xp, level };
        }),
      setCheckin: (c) => setState((s) => ({ ...s, checkin: { ...c, date: today() } })),
      logSitting: (h) => setState((s) => ({ ...s, sittingHoursToday: Math.max(0, Math.min(16, h)) })),
      markSessionDone: (moveIds) =>
        setState((s) => {
          const t = today();
          const carry = s.lastSessionDate === t ? s.streak : s.streak + (daysBetween(s.lastSessionDate, t) <= 1 ? 1 : 0);
          return {
            ...s,
            lastSessionDate: t,
            lastMoves: moveIds,
            streak: Math.max(1, carry),
          };
        }),
      resetAll: () => {
        try {
          localStorage.removeItem(STORAGE_KEY);
        } catch {}
        setState(initialState);
      },
    };
  }, [state]);

  return <AppCtx.Provider value={value}>{children}</AppCtx.Provider>;
}

export function useApp() {
  const ctx = useContext(AppCtx);
  if (!ctx) throw new Error("useApp outside provider");
  return ctx;
}
