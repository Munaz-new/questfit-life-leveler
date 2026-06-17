import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { MobileFrame, GlassCard, SectionTitle } from "@/components/leveluplife/Shell";
import { CheckinSheet } from "@/components/leveluplife/CheckinSheet";
import { useApp } from "@/lib/leveluplife/store";
import { modeFor } from "@/lib/leveluplife/modes";
import { selectProtocol } from "@/lib/leveluplife/engine/selector";
import { buildSession, sessionToMoves } from "@/lib/leveluplife/engine/builder";
import { Button } from "@/components/ui/button";
import { Check, Play, RotateCw, Timer, Info } from "lucide-react";

export const Route = createFileRoute("/workout")({
  head: () => ({ meta: [{ title: "Workout — LevelUp Life" }] }),
  component: Workout,
});

function Workout() {
  const navigate = useNavigate();
  const {
    state,
    completeQuest,
    setCheckin,
    logSitting,
    markSessionDone,
    daysSinceLastWorkout,
  } = useApp();
  const lex = modeFor(state.profile).lexicon;

  useEffect(() => {
    if (!state.onboarded) navigate({ to: "/auth" });
  }, [state.onboarded, navigate]);

  if (!state.profile) return null;

  const needCheckin = !state.checkin;

  if (needCheckin) {
    return (
      <MobileFrame withNav>
        <CheckinSheet
          initialSitting={state.sittingHoursToday}
          onSubmit={(c, sit) => {
            logSitting(sit);
            setCheckin(c);
          }}
        />
      </MobileFrame>
    );
  }

  return (
    <Session
      onFinish={() => navigate({ to: "/home" })}
      completeQuest={completeQuest}
      markSessionDone={markSessionDone}
      lex={lex}
      daysSinceLastWorkout={daysSinceLastWorkout}
    />
  );
}

function Session({
  onFinish,
  completeQuest,
  markSessionDone,
  lex,
  daysSinceLastWorkout,
}: {
  onFinish: () => void;
  completeQuest: (id: string) => void;
  markSessionDone: (ids: string[]) => void;
  lex: ReturnType<typeof modeFor>["lexicon"];
  daysSinceLastWorkout: number;
}) {
  const { state } = useApp();
  const session = useMemo(() => {
    const plan = selectProtocol(state.profile!, state.checkin!, {
      sittingHoursToday: state.sittingHoursToday,
      daysSinceLastWorkout,
      streak: state.streak,
    });
    return buildSession(state.profile!, plan, state.lastMoves);
    // Build once per check-in; user can Reset to rebuild.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const moves = sessionToMoves(session);
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

  function finish() {
    markSessionDone(moves.map((m) => m.id));
    completeQuest("workout");
    onFinish();
  }

  const allDone = done.size === moves.length;
  const protocolLabel = mapProtocolName(session.protocolName, lex);

  return (
    <MobileFrame withNav>
      <header className="mb-4">
        <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{lex.workout} · {session.durationMin} min</p>
        <h1 className="text-2xl font-bold">{protocolLabel}</h1>
        <p className="mt-1 flex items-start gap-1.5 text-sm text-muted-foreground">
          <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          <span>{session.reason}</span>
        </p>
      </header>

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

      <SectionTitle hint={`${done.size} / ${moves.length}`}>
        Warmup → Main → Cooldown
      </SectionTitle>
      <div className="space-y-2.5">
        {moves.map((m, i) => {
          const isDone = done.has(i);
          const isActive = i === active && !isDone;
          const block =
            i < session.warmup.length
              ? "Warmup"
              : i >= session.warmup.length + session.main.length
              ? "Cooldown"
              : `Main · ${m.pattern}`;
          return (
            <div
              key={`${m.id}-${i}`}
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
                  <p className="text-[10px] uppercase tracking-[0.2em] opacity-70">{block}</p>
                  <p className="text-base font-semibold">{m.name}</p>
                  <p className={`mt-0.5 text-xs ${isActive ? "opacity-80" : "text-muted-foreground"}`}>{m.cue}</p>
                  {m.scienceNote && !isActive && (
                    <p className="mt-1 text-[11px] italic text-muted-foreground/80">— {m.scienceNote}</p>
                  )}
                </div>
                <div className="shrink-0 text-right">
                  <p className="font-display text-lg font-bold">{m.reps}</p>
                  {m.rest > 0 && (
                    <p className={`text-[10px] ${isActive ? "opacity-80" : "text-muted-foreground"}`}>rest {m.rest}s</p>
                  )}
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
        <Button
          onClick={() => { setDone(new Set()); setActive(0); setResting(0); }}
          variant="outline"
          className="glass h-12 rounded-2xl border-white/10"
        >
          <RotateCw className="mr-2 h-4 w-4" /> Reset
        </Button>
        <Button
          onClick={finish}
          disabled={!allDone}
          className="h-12 rounded-2xl bg-gradient-primary font-semibold text-[var(--primary-foreground)] shadow-glow disabled:opacity-50"
        >
          <Play className="mr-2 h-4 w-4" /> {allDone ? lex.finishCta : "Keep going"}
        </Button>
      </div>
    </MobileFrame>
  );
}

/** Re-skin the protocol name per motivation mode. */
function mapProtocolName(name: string, lex: ReturnType<typeof modeFor>["lexicon"]): string {
  if (/posture|recovery|mobility/i.test(name)) return `${lex.adaptivePrefix} · ${name}`;
  if (/strength|full body/i.test(name)) return `${lex.workout}: ${name}`;
  return name;
}
