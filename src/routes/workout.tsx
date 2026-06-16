import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { MobileFrame, GlassCard, SectionTitle } from "@/components/leveluplife/Shell";
import { useApp } from "@/lib/leveluplife/store";
import { generateWorkout } from "@/lib/leveluplife/data";
import { modeFor } from "@/lib/leveluplife/modes";
import { Button } from "@/components/ui/button";
import { Check, Play, RotateCw, Timer } from "lucide-react";

export const Route = createFileRoute("/workout")({
  head: () => ({ meta: [{ title: "Workout — LevelUp Life" }] }),
  component: Workout,
});

function Workout() {
  const navigate = useNavigate();
  const { state, completeQuest } = useApp();
  const lex = modeFor(state.profile).lexicon;
  useEffect(() => {
    if (!state.onboarded) navigate({ to: "/auth" });
  }, [state.onboarded, navigate]);

  const moves = useMemo(() => generateWorkout(state.profile), [state.profile]);
  const [active, setActive] = useState(0);
  const [done, setDone] = useState<Set<number>>(new Set());
  const [running, setRunning] = useState(false);
  const [resting, setResting] = useState(0);

  useEffect(() => {
    if (!running || resting <= 0) return;
    const t = setTimeout(() => setResting((r) => r - 1), 1000);
    return () => clearTimeout(t);
  }, [running, resting]);

  function completeMove(i: number) {
    setDone((s) => new Set(s).add(i));
    setResting(moves[i].rest);
    setRunning(true);
    if (i < moves.length - 1) setActive(i + 1);
  }

  function finishSession() {
    completeQuest("workout");
    navigate({ to: "/home" });
  }

  const allDone = done.size === moves.length;

  return (
    <MobileFrame withNav>
      <header className="mb-5">
        <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{lex.workout}</p>
        <h1 className="text-2xl font-bold">Today's {lex.workout.toLowerCase()}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Calibrated to {state.profile?.level ?? "beginner"} · {state.profile?.equipment?.[0] ?? "no equipment"}
        </p>
      </header>

      {/* Rest timer */}
      {resting > 0 && (
        <GlassCard className="mb-4 border-[var(--cyan-glow)]/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Timer className="h-5 w-5 text-[var(--cyan-glow)]" />
              <span className="text-sm font-medium">Rest</span>
            </div>
            <span className="font-display text-2xl font-bold text-gradient">{resting}s</span>
          </div>
          <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-white/5">
            <div
              className="h-full bg-gradient-primary transition-all duration-1000"
              style={{ width: `${(resting / Math.max(1, moves[active - 1]?.rest ?? 1)) * 100}%` }}
            />
          </div>
        </GlassCard>
      )}

      <SectionTitle hint={`${done.size} / ${moves.length}`}>Moves</SectionTitle>
      <div className="space-y-2.5">
        {moves.map((m, i) => {
          const isDone = done.has(i);
          const isActive = i === active && !isDone;
          return (
            <div
              key={i}
              className={`rounded-2xl border p-4 transition ${
                isDone
                  ? "border-[var(--success)]/30 bg-[var(--success)]/5"
                  : isActive
                  ? "border-transparent bg-gradient-primary text-[var(--primary-foreground)] shadow-glow"
                  : "glass border-white/10"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[10px] uppercase tracking-[0.2em] opacity-70">{i === 0 ? "Warmup" : i === moves.length - 1 ? "Cooldown" : `Move ${i}`}</p>
                  <p className="text-base font-semibold">{m.name}</p>
                  <p className={`mt-0.5 text-xs ${isActive ? "opacity-80" : "text-muted-foreground"}`}>{m.cue}</p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="font-display text-lg font-bold">{m.reps}</p>
                  {m.rest > 0 && <p className={`text-[10px] ${isActive ? "opacity-80" : "text-muted-foreground"}`}>rest {m.rest}s</p>}
                </div>
              </div>
              {isActive && (
                <Button
                  onClick={() => completeMove(i)}
                  className="mt-3 h-10 w-full rounded-xl bg-black/30 font-semibold text-white hover:bg-black/40"
                >
                  <Check className="mr-2 h-4 w-4" /> Mark done
                </Button>
              )}
              {isDone && (
                <div className="mt-2 inline-flex items-center gap-1 text-xs text-[var(--success)]">
                  <Check className="h-3.5 w-3.5" /> complete
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <Button onClick={() => { setDone(new Set()); setActive(0); setResting(0); }} variant="outline" className="glass h-12 rounded-2xl border-white/10">
          <RotateCw className="mr-2 h-4 w-4" /> Reset
        </Button>
        <Button
          onClick={finishSession}
          disabled={!allDone}
          className="h-12 rounded-2xl bg-gradient-primary font-semibold text-[var(--primary-foreground)] shadow-glow disabled:opacity-50"
        >
          <Play className="mr-2 h-4 w-4" /> {allDone ? lex.finishCta : "Keep going"}
        </Button>
      </div>
    </MobileFrame>
  );
}