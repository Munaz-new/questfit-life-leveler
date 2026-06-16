import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { AppState, Quest, UserProfile } from "./types";
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
};

interface Ctx {
  state: AppState;
  setProfile: (p: UserProfile) => void;
  setMotivation: (m: UserProfile["motivation"]) => void;
  completeQuest: (id: string) => void;
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
        const parsed = JSON.parse(raw) as AppState;
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

  const value = useMemo<Ctx>(() => {
    const xpForNextLevel = xpCurve(state.level);
    return {
      state,
      xpForNextLevel,
      progressPct: Math.min(100, Math.round((state.xp / xpForNextLevel) * 100)),
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