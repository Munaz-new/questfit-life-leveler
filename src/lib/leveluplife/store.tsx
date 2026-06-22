import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type {
  ActiveSessionState,
  AppState,
  Checkin,
  Quest,
  SummaryState,
  UserProfile,
} from "./types";
import { defaultQuestsFor, defaultSkills, defaultStats } from "./data";
import type { Session } from "./engine/builder";
import { estimateCalories, parseTarget, xpForMove } from "./engine/xp";

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
  activeSession: null,
  lastSummary: null,
  adaptiveBoost: 0,
  recentCompletion: [],
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

function xpCurve(level: number) {
  return 100 + level * 50;
}

function flattenSession(s: Session): string[] {
  return [...s.warmup, ...s.main, ...s.cooldown].map((m) => m.id);
}

interface Ctx {
  state: AppState;
  setProfile: (p: UserProfile) => void;
  setMotivation: (m: UserProfile["motivation"]) => void;
  completeQuest: (id: string) => void;
  setCheckin: (c: Checkin) => void;
  logSitting: (h: number) => void;
  startMission: (s: Session, opts?: { forceProtocol?: string }) => void;
  clearActiveSession: () => void;
  completeCurrentMove: () => void;
  skipCurrentMove: () => void;
  bumpSet: () => void;
  enterRest: () => void;
  exitRest: () => void;
  finishMission: () => SummaryState;
  daysSinceLastWorkout: number;
  resetAll: () => void;
  xpForNextLevel: number;
  progressPct: number;
}

const AppCtx = createContext<Ctx | null>(null);

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
      setProfile: (p) => {
        // Seed the demonstration gender preference from onboarding.
        if (typeof window !== "undefined") {
          window.localStorage.setItem("leveluplife.demoGender", p.gender);
          window.dispatchEvent(new CustomEvent("leveluplife:demoGender", { detail: p.gender }));
        }
        setState((s) => ({
          ...s,
          profile: p,
          onboarded: true,
          quests: s.quests.length ? s.quests : defaultQuestsFor(p),
          streak: s.streak || 1,
        }));
      },
      setMotivation: (m) =>
        setState((s) => (s.profile ? { ...s, profile: { ...s.profile, motivation: m } } : s)),
      completeQuest: (id) =>
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
      logSitting: (h) =>
        setState((s) => ({ ...s, sittingHoursToday: Math.max(0, Math.min(16, h)) })),
      startMission: (session, opts) =>
        setState((s) => {
          const order = flattenSession(session);
          const active: ActiveSessionState = {
            startedAt: Date.now(),
            order,
            cursor: 0,
            currentSet: 1,
            inRest: false,
            completed: [],
            skipped: [],
            forceProtocol: opts?.forceProtocol,
            session,
          };
          return { ...s, activeSession: active };
        }),
      clearActiveSession: () => setState((s) => ({ ...s, activeSession: null })),
      enterRest: () =>
        setState((s) =>
          s.activeSession ? { ...s, activeSession: { ...s.activeSession, inRest: true } } : s,
        ),
      exitRest: () =>
        setState((s) => {
          if (!s.activeSession) return s;
          const a = s.activeSession;
          return {
            ...s,
            activeSession: {
              ...a,
              inRest: false,
              cursor: Math.min(a.order.length - 1, a.cursor + 1),
              currentSet: 1,
            },
          };
        }),
      bumpSet: () =>
        setState((s) =>
          s.activeSession
            ? { ...s, activeSession: { ...s.activeSession, currentSet: s.activeSession.currentSet + 1 } }
            : s,
        ),
      completeCurrentMove: () =>
        setState((s) => {
          if (!s.activeSession) return s;
          const a = s.activeSession;
          const id = a.order[a.cursor];
          if (a.completed.includes(id)) return s;
          return { ...s, activeSession: { ...a, completed: [...a.completed, id], currentSet: 1 } };
        }),
      skipCurrentMove: () =>
        setState((s) => {
          if (!s.activeSession) return s;
          const a = s.activeSession;
          const id = a.order[a.cursor];
          return { ...s, activeSession: { ...a, skipped: [...a.skipped, id], currentSet: 1 } };
        }),
      finishMission: () => {
        // Compute summary against the latest state, then commit it.
        let summary!: SummaryState;
        setState((s) => {
          const a = s.activeSession;
          if (!a) return s;
          const allMoves = [...a.session.warmup, ...a.session.main, ...a.session.cooldown];
          const completedSet = new Set(a.completed);
          const completedMoves = allMoves.filter((m) => completedSet.has(m.id));
          const completionPct = allMoves.length ? completedMoves.length / allMoves.length : 0;
          const partial = completionPct < 0.7;
          // XP: full for completed; 25% consolation if partial overall (still only on completed moves).
          let xpEarned = completedMoves.reduce((sum, m) => sum + xpForMove(m), 0);
          if (partial) xpEarned = Math.round(xpEarned * 0.5);
          const durationSec = Math.round((Date.now() - a.startedAt) / 1000);
          const patternHits: Record<string, number> = {};
          for (const m of completedMoves) patternHits[m.pattern] = (patternHits[m.pattern] ?? 0) + 1;

          summary = {
            date: today(),
            protocolId: a.session.protocolId,
            protocolName: a.session.protocolName,
            durationSec,
            totalMoves: allMoves.length,
            completedMoves: completedMoves.length,
            skippedMoves: a.skipped.length,
            xpEarned,
            caloriesEst: estimateCalories(durationSec, s.profile?.weight),
            patternHits,
            partial,
          };

          // Level up using earned XP.
          let xp = s.xp + xpEarned;
          let level = s.level;
          let cap = xpCurve(level);
          while (xp >= cap) {
            xp -= cap;
            level += 1;
            cap = xpCurve(level);
          }

          // Streak — only count as workout day if ≥70% completion.
          const t = today();
          let streak = s.streak;
          let lastSessionDate = s.lastSessionDate;
          if (!partial) {
            const gap = daysBetween(s.lastSessionDate, t);
            streak = s.lastSessionDate === t ? s.streak : s.streak + (gap <= 1 ? 1 : 0);
            streak = Math.max(1, streak);
            lastSessionDate = t;
          }

          // Quests: only credit the daily workout quest on full sessions.
          const quests = !partial
            ? s.quests.map((q) => (q.id === "workout" ? { ...q, done: true } : q))
            : s.quests;

          // Adaptive boost.
          const recent = [...s.recentCompletion, completionPct].slice(-3);
          let boost: -1 | 0 | 1 = s.adaptiveBoost;
          if (recent.length === 3 && recent.every((p) => p >= 0.9)) boost = 1;
          else if (recent.slice(-2).every((p) => p <= 0.5)) boost = -1;
          else if (recent.length >= 2 && recent.slice(-2).every((p) => p >= 0.7)) boost = 0;

          return {
            ...s,
            xp,
            level,
            streak,
            lastSessionDate,
            lastMoves: a.order,
            quests,
            adaptiveBoost: boost,
            recentCompletion: recent,
            activeSession: null,
            lastSummary: summary,
          };
        });
        return summary;
      },
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

/** Re-exported helper — handy for components rendering targets. */
export { parseTarget };
