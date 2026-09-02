import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { MobileFrame, GlassCard } from "@/components/leveluplife/Shell";
import { useApp } from "@/lib/leveluplife/store";
import { modeFor } from "@/lib/leveluplife/modes";
import { missionCopyFor } from "@/lib/leveluplife/missionCopy";
import { Button } from "@/components/ui/button";
import { Home, Flame, Zap, Trophy, Activity } from "lucide-react";

export const Route = createFileRoute("/_authenticated/workout/summary")({
  head: () => ({ meta: [{ title: "Mission Complete — LevelUp Life" }] }),
  component: Summary,
});

function Summary() {
  const navigate = useNavigate();
  const { state, progressPct, xpForNextLevel } = useApp();
  const mode = modeFor(state.profile);
  const copy = missionCopyFor(mode.id);
  const s = state.lastSummary;

  useEffect(() => {
    if (!s) navigate({ to: "/workout" });
  }, [s, navigate]);
  if (!s) return null;

  return (
    <MobileFrame>
      <div className="flex min-h-screen flex-col pb-2">
        <header className="mb-5 text-center">
          <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-primary shadow-glow">
            <Trophy className="h-7 w-7 text-[var(--primary-foreground)]" />
          </div>
          <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">{mode.label}</p>
          <h1 className="mt-1 font-display text-3xl font-bold">
            {s.partial ? "Partial progress saved" : copy.completeHeadline}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">{s.protocolName}</p>
        </header>

        <GlassCard glow className="mb-4">
          <p className="text-center text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
            {mode.lexicon.xp} earned
          </p>
          <CountUp value={s.xpEarned} className="mt-1 block text-center font-display text-5xl font-bold text-gradient" />
          {s.partial && (
            <p className="mt-2 text-center text-xs italic text-muted-foreground">
              No guilt — momentum still counts.
            </p>
          )}
        </GlassCard>

        <div className="mb-4 grid grid-cols-2 gap-3">
          <StatCard
            icon={<Activity className="h-4 w-4" />}
            label="Exercises"
            value={`${s.completedMoves} / ${s.totalMoves}`}
          />
          <StatCard
            icon={<Zap className="h-4 w-4" />}
            label="Time on task"
            value={`${Math.max(1, Math.round(s.durationSec / 60))} min`}
          />
          <StatCard
            icon={<Flame className="h-4 w-4 text-[var(--warn)]" />}
            label={mode.lexicon.streak}
            value={`${state.streak} day${state.streak === 1 ? "" : "s"}`}
          />
          <StatCard
            icon={<Trophy className="h-4 w-4" />}
            label="Calories"
            value={s.caloriesEst != null ? `~${s.caloriesEst}` : "—"}
          />
        </div>

        <GlassCard className="mb-4">
          <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            {mode.lexicon.level} · {mode.lexicon.levelShort(state.level)}
          </p>
          <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-white/5">
            <div
              className="h-full bg-gradient-primary transition-all duration-700"
              style={{ width: `${progressPct}%` }}
            />
          </div>
          <p className="mt-1 text-right text-xs text-muted-foreground">
            {state.xp} / {xpForNextLevel}
          </p>
        </GlassCard>

        {Object.keys(s.patternHits).length > 0 && (
          <GlassCard className="mb-4">
            <p className="mb-2 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Pattern balance</p>
            <div className="flex flex-wrap gap-1.5">
              {Object.entries(s.patternHits).map(([p, n]) => (
                <span
                  key={p}
                  className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs capitalize"
                >
                  {p} · {n}
                </span>
              ))}
            </div>
          </GlassCard>
        )}

        <div className="mt-auto">
          <Button
            onClick={() => navigate({ to: "/home" })}
            className="h-14 w-full rounded-2xl bg-gradient-primary text-base font-semibold text-[var(--primary-foreground)] shadow-glow"
          >
            <Home className="mr-2 h-5 w-5" /> Back home
          </Button>
        </div>
      </div>
    </MobileFrame>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="glass rounded-[var(--radius)] p-4">
      <div className="flex items-center gap-1.5 text-muted-foreground">
        {icon}
        <p className="text-[10px] uppercase tracking-[0.18em]">{label}</p>
      </div>
      <p className="mt-1 font-display text-xl font-semibold">{value}</p>
    </div>
  );
}

function CountUp({ value, className }: { value: number; className?: string }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    const start = Date.now();
    const dur = 800;
    const id = setInterval(() => {
      const t = Math.min(1, (Date.now() - start) / dur);
      setN(Math.round(value * (1 - Math.pow(1 - t, 3))));
      if (t >= 1) clearInterval(id);
    }, 30);
    return () => clearInterval(id);
  }, [value]);
  return <span className={className}>+{n}</span>;
}
