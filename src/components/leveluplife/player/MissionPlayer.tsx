import type { SetPerformance } from "@/lib/leveluplife/types";
import { useEffect, useRef, useState } from "react";
import { useNavigate, Link } from "@tanstack/react-router";
import { useApp } from "@/lib/leveluplife/store";
import { parseTarget } from "@/lib/leveluplife/engine/xp";
import { modeFor } from "@/lib/leveluplife/modes";
import { missionCopyFor } from "@/lib/leveluplife/missionCopy";
import { isLoadedSet, liftHistory } from "@/lib/leveluplife/exercises/liftHistory";
import { exerciseById } from "@/lib/leveluplife/exercises/library";
import { ExerciseArt } from "@/components/leveluplife/exercises/ExerciseArt";
import { GymBodyMap, gymMuscleGroups } from "@/components/leveluplife/GymBodyMap";
import { Button } from "@/components/ui/button";
import {
  Play,
  Pause,
  Plus,
  X,
  ChevronRight,
  Info,
  Check,
  BookOpen,
} from "lucide-react";

export function MissionPlayer() {
  const navigate = useNavigate();
  const {
    state,
    completeCurrentMove,
    skipCurrentMove,
    bumpSet,
    enterRest,
    exitRest,
    finishMission,
    clearActiveSession,
  } = useApp();

  const finishing = useRef(false);
  const a = state.activeSession;
  const mode = modeFor(state.profile);
  const copy = missionCopyFor(mode.id);

  // Bail if nothing in progress.
  useEffect(() => {
    if (!a && !finishing.current) navigate({ to: "/workout" });
  }, [a, navigate]);

  if (!a) return null;

  const allMoves = [...a.session.warmup, ...a.session.main, ...a.session.cooldown];
  const move = allMoves[a.cursor];
  const isLast = a.cursor >= allMoves.length - 1;
  const block: "Warmup" | "Main" | "Cooldown" =
    a.cursor < a.session.warmup.length
      ? "Warmup"
      : a.cursor >= a.session.warmup.length + a.session.main.length
      ? "Cooldown"
      : "Main";

  function finish() {
    finishing.current = true;
    finishMission();
    navigate({ to: "/workout/summary" });
  }

  function onAdvance() {
    if (isLast) finish();
    else enterRest();
  }

  function quit() {
    if (confirm("Quit mission? Partial progress will be saved.")) finish();
  }

  return (
    <div className="relative flex min-h-screen flex-col px-5 pb-6 pt-5">
      <Header
        block={block}
        cursor={a.cursor}
        total={allMoves.length}
        warmupEnd={a.session.warmup.length}
        mainEnd={a.session.warmup.length + a.session.main.length}
        onQuit={() => {
          clearActiveSession();
          navigate({ to: "/workout" });
        }}
      />

      {a.inRest ? (
        <RestScreen
          restSec={Math.max(15, move.rest || 30)}
          next={allMoves[Math.min(allMoves.length - 1, a.cursor + 1)]}
          onDone={() => exitRest()}
        />
      ) : (
        <ExerciseScreen
          key={a.cursor}
          move={move}
          block={block}
          set={a.currentSet}
          onCompleteAllSets={(performance) => {
            completeCurrentMove(performance);
            onAdvance();
          }}
          onLogSet={bumpSet}
          onSkip={() => {
            skipCurrentMove();
            onAdvance();
          }}
          onQuit={quit}
          isLast={isLast}
          finishLabel={copy.completeHeadline}
        />
      )}
    </div>
  );
}

function Header({
  block,
  cursor,
  total,
  warmupEnd,
  mainEnd,
  onQuit,
}: {
  block: string;
  cursor: number;
  total: number;
  warmupEnd: number;
  mainEnd: number;
  onQuit: () => void;
}) {
  return (
    <header className="mb-5 flex items-center gap-3">
      <button
        onClick={onQuit}
        className="glass flex h-9 w-9 items-center justify-center rounded-full"
        aria-label="Exit"
      >
        <X className="h-4 w-4" />
      </button>
      <div className="flex-1">
        <div className="flex items-baseline justify-between">
          <p className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
            {block}
          </p>
          <p className="text-xs text-muted-foreground">
            {cursor + 1} / {total}
          </p>
        </div>
        <div className="mt-1 flex h-1.5 gap-0.5 overflow-hidden rounded-full">
          {Array.from({ length: total }).map((_, i) => {
            const inBlock =
              i < warmupEnd ? "bg-[var(--cyan-glow)]" : i < mainEnd ? "bg-gradient-primary" : "bg-[var(--rare)]";
            const done = i < cursor;
            const active = i === cursor;
            return (
              <span
                key={i}
                className={`h-full flex-1 transition ${
                  done || active ? inBlock : "bg-white/8"
                } ${active ? "shadow-glow" : ""}`}
                style={{ opacity: done ? 1 : active ? 1 : 0.25 }}
              />
            );
          })}
        </div>
      </div>
    </header>
  );
}

function ExerciseScreen({
  move,
  block,
  set,
  onCompleteAllSets,
  onLogSet,
  onSkip,
  finishLabel,
  isLast,
}: {
  move: import("@/lib/leveluplife/engine/patterns").Move;
  block: string;
  set: number;
  onCompleteAllSets: (performance?: SetPerformance) => void;
  onLogSet: (performance?: SetPerformance) => void;
  onSkip: () => void;
  onQuit: () => void;
  finishLabel: string;
  isLast: boolean;
}) {
  const target = parseTarget(move.reps);
  const ex = exerciseById(move.id);
  const [eduOpen, setEduOpen] = useState(false);
  const { state } = useApp();
  const lastLoaded = target.kind === "reps"
    ? liftHistory(state.workoutHistory, move.id).flatMap(({ sets }) => sets).find(isLoadedSet)
    : undefined;

  return (
    <div className="flex flex-1 flex-col">
      <div className="mb-3">
        <p className="text-xs uppercase tracking-[0.18em] text-[var(--cyan-glow)]">
          {block} · {move.pattern}
        </p>
        <h1 className="mt-1 font-display text-3xl font-bold leading-tight">{move.name}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{move.cue}</p>
      </div>

      {ex && (
        <div className="mb-3">
          <ExerciseArt exercise={ex} showInstructions />
        </div>
      )}

      {ex && <WorkoutTargets exercise={ex} />}

      {target.kind === "reps" && (
        <RepsBlock
          sets={target.sets}
          perSet={target.perSet}
          currentSet={set}
          previous={lastLoaded}
          onLogSet={onLogSet}
          onComplete={onCompleteAllSets}
        />
      )}
      {target.kind === "time" && (
        <TimedBlock
          seconds={target.seconds}
          sets={target.sets ?? 1}
          currentSet={set}
          perSet={!!target.perSet}
          perSide={!!target.perSide}
          onLogSet={onLogSet}
          onComplete={onCompleteAllSets}
        />
      )}

      <button
        onClick={() => setEduOpen((v) => !v)}
        className="mt-4 inline-flex items-center justify-between rounded-xl border border-white/10 px-4 py-3 text-left text-sm"
      >
        <span className="inline-flex items-center gap-2">
          <Info className="h-4 w-4 text-[var(--cyan-glow)]" /> Why this move
        </span>
        <ChevronRight className={`h-4 w-4 transition ${eduOpen ? "rotate-90" : ""}`} />
      </button>
      {eduOpen && ex && (
        <div className="mt-2 space-y-2 rounded-xl border border-white/10 bg-white/5 p-4 text-xs text-muted-foreground">
          {ex.benefits.slice(0, 2).map((b) => (
            <p key={b}><b className="text-foreground">+</b> {b}</p>
          ))}
          {ex.mistakes.slice(0, 2).map((m) => (
            <p key={m}><b className="text-[var(--warn)]">!</b> Avoid: {m}</p>
          ))}
          {move.scienceNote && <p className="italic">— {move.scienceNote}</p>}
        </div>
      )}

      <div className="mt-auto pt-4">
        <button
          onClick={onSkip}
          className="w-full rounded-xl py-2 text-xs text-muted-foreground hover:text-foreground"
        >
          {isLast ? `Skip — finish ${finishLabel.toLowerCase()}` : "Skip (no XP)"}
        </button>
      </div>
    </div>
  );
}

function WorkoutTargets({ exercise }: { exercise: NonNullable<ReturnType<typeof exerciseById>> }) {
  const primary = exercise.primaryMuscles.map((muscle) => gymMuscleGroups[muscle]);
  const secondary = exercise.secondaryMuscles.map((muscle) => gymMuscleGroups[muscle]);
  const fullBody = exercise.primaryMuscles.includes("full_body");

  return (
    <section
      aria-label="Target muscles"
      className="glass mb-4 grid grid-cols-[auto_minmax(0,1fr)] items-center gap-x-3 gap-y-2 rounded-2xl p-3 sm:grid-cols-[auto_minmax(0,1fr)_auto]"
    >
      <div aria-hidden="true" className="row-span-2 flex w-[76px] items-center rounded-xl bg-black/20 p-1.5 sm:row-span-1 sm:w-24">
        <GymBodyMap
          muscleColor={(muscle) => {
            if (fullBody || primary.includes(muscle)) return "var(--cyan-glow)";
            if (secondary.includes(muscle)) return "color-mix(in oklab, var(--cyan-glow) 45%, #505050)";
            return "#53565d";
          }}
        />
      </div>
      <div className="min-w-0">
        <h2 className="text-xs font-semibold text-muted-foreground">Target muscles</h2>
        <ul className="mt-1.5 flex flex-wrap gap-1.5">
          {exercise.primaryMuscles.map((muscle) => (
            <li
              key={muscle}
              className="rounded-md bg-[var(--cyan-glow)]/12 px-2 py-0.5 text-sm font-semibold capitalize text-foreground"
            >
              {muscle.replaceAll("_", " ")}
            </li>
          ))}
        </ul>
      </div>
      <Link
        to="/exercises/$id"
        params={{ id: exercise.id }}
        aria-label={`Open ${exercise.name} guide`}
        className="inline-flex min-h-[44px] w-fit items-center gap-2 rounded-xl border border-white/15 px-3 text-sm font-semibold text-[var(--cyan-glow)] transition hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--cyan-glow)]"
      >
        <BookOpen className="size-4 shrink-0" aria-hidden="true" />
        Guide
        <ChevronRight className="size-4 shrink-0" aria-hidden="true" />
      </Link>
    </section>
  );
}

function RepsBlock({
  sets,
  perSet,
  currentSet,
  previous,
  onLogSet,
  onComplete,
}: {
  sets: number;
  perSet: string;
  currentSet: number;
  previous?: { reps: number; weightKg: number };
  onLogSet: (performance?: SetPerformance) => void;
  onComplete: (performance?: SetPerformance) => void;
}) {
  const [enteredReps, setEnteredReps] = useState("");
  const [enteredWeight, setEnteredWeight] = useState("");
  const reps = Number(enteredReps);
  const weightKg = Number(enteredWeight);
  const validReps = enteredReps === "" || (Number.isInteger(reps) && reps > 0 && reps <= 1000);
  const validWeight = enteredWeight === "" || (weightKg >= 0 && weightKg <= 1000);
  const isLastSet = currentSet >= sets;
  return (
    <div className="glass rounded-[var(--radius)] p-5">
      <div className="flex items-end justify-between">
        <div>
          <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Target</p>
          <p className="font-display text-3xl font-bold text-gradient">
            {sets} × {perSet}
          </p>
        </div>
        <div className="text-right">
          <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Set</p>
          <p className="font-display text-2xl font-semibold">
            {currentSet} <span className="text-sm text-muted-foreground">/ {sets}</span>
          </p>
        </div>
      </div>
      {previous && (
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-sm text-muted-foreground">
          <span>Previous workout: {previous.weightKg} kg × {previous.reps}</span>
          <button type="button" className="min-h-10 rounded-lg border border-border px-3 text-foreground"
            onClick={() => {
              setEnteredWeight(String(previous.weightKg));
              setEnteredReps(String(previous.reps));
            }}>
            Use previous set
          </button>
        </div>
      )}
      <div className="mt-3 grid grid-cols-2 gap-2">
        <label className="text-xs">Reps done
          <input className="mt-1 w-full rounded-lg border border-border bg-background px-2 py-2"
            type="number" min={1} max={1000} placeholder="Optional" value={enteredReps}
            onChange={(event) => setEnteredReps(event.target.value)} />
        </label>
        <label className="text-xs">Load (kg)
          <input className="mt-1 w-full rounded-lg border border-border bg-background px-2 py-2"
            type="number" min={0} max={1000} step="any" placeholder="Optional" value={enteredWeight}
            onChange={(event) => setEnteredWeight(event.target.value)} />
        </label>
      </div>
      <Button
        disabled={!validReps || !validWeight}
        onClick={() => {
          const performance = {
            reps: enteredReps ? reps : undefined,
            weightKg: enteredWeight ? weightKg : undefined,
          };
          if (isLastSet) onComplete(performance);
          else onLogSet(performance);
        }}
        className="mt-4 h-12 w-full rounded-2xl bg-gradient-primary font-semibold text-[var(--primary-foreground)] shadow-glow"
      >
        <Check className="mr-2 h-4 w-4" /> {isLastSet ? "Complete exercise" : `Set ${currentSet} done`}
      </Button>
    </div>
  );
}

function TimedBlock({
  seconds,
  sets,
  currentSet,
  perSet,
  perSide,
  onLogSet,
  onComplete,
}: {
  seconds: number;
  sets: number;
  currentSet: number;
  perSet: boolean;
  perSide: boolean;
  onLogSet: (performance?: SetPerformance) => void;
  onComplete: () => void;
}) {
  const [remaining, setRemaining] = useState(seconds);
  const [running, setRunning] = useState(false);
  const total = useRef(seconds);
  const isLastSet = currentSet >= sets;

  // Reset countdown when the set rolls over.
  useEffect(() => {
    setRemaining(seconds);
    total.current = seconds;
    setRunning(false);
  }, [seconds, currentSet]);

  useEffect(() => {
    if (!running) return;
    if (remaining <= 0) {
      setRunning(false);
      if (isLastSet || !perSet) onComplete();
      else onLogSet();
      return;
    }
    const t = setTimeout(() => setRemaining((r) => r - 1), 1000);
    return () => clearTimeout(t);
  }, [running, remaining, isLastSet, onComplete, onLogSet, perSet]);

  const mm = Math.floor(remaining / 60).toString().padStart(2, "0");
  const ss = (remaining % 60).toString().padStart(2, "0");
  const pct = total.current ? Math.min(100, (remaining / total.current) * 100) : 0;

  return (
    <div className="glass rounded-[var(--radius)] p-5">
      <div className="flex items-end justify-between">
        <div>
          <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Hold</p>
          <p className="font-display text-5xl font-bold text-gradient tabular-nums">
            {mm}:{ss}
          </p>
        </div>
        {perSet && (
          <div className="text-right">
            <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">{perSide ? "Side" : "Set"}</p>
            <p className="font-display text-2xl font-semibold">
              {perSide ? ((currentSet - 1) % 2) + 1 : currentSet} <span className="text-sm text-muted-foreground">/ {perSide ? 2 : sets}</span>
            </p>
          </div>
        )}
      </div>
      <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-white/5">
        <div className="h-full bg-gradient-primary transition-[width] duration-1000" style={{ width: `${pct}%` }} />
      </div>
      <div className="mt-4 grid grid-cols-3 gap-2">
        <Button
          onClick={() => setRunning((r) => !r)}
          className="h-12 rounded-2xl bg-gradient-primary font-semibold text-[var(--primary-foreground)] shadow-glow"
        >
          {running ? <Pause className="mr-1 h-4 w-4" /> : <Play className="mr-1 h-4 w-4" />}
          {running ? "Pause" : remaining < total.current ? "Resume" : "Start"}
        </Button>
        <Button
          onClick={() => setRemaining((r) => r + 15)}
          variant="outline"
          className="glass h-12 rounded-2xl border-white/10"
        >
          <Plus className="mr-1 h-4 w-4" /> 15s
        </Button>
        <Button
          onClick={() => {
            setRunning(false);
            if (isLastSet || !perSet) onComplete();
            else onLogSet();
          }}
          variant="outline"
          className="glass h-12 rounded-2xl border-white/10"
        >
          <Check className="mr-1 h-4 w-4" /> Finish hold
        </Button>
      </div>
    </div>
  );
}

function RestScreen({
  restSec,
  next,
  onDone,
}: {
  restSec: number;
  next: import("@/lib/leveluplife/engine/patterns").Move;
  onDone: () => void;
}) {
  const [remaining, setRemaining] = useState(restSec);
  useEffect(() => {
    if (remaining <= 0) {
      onDone();
      return;
    }
    const t = setTimeout(() => setRemaining((r) => r - 1), 1000);
    return () => clearTimeout(t);
  }, [remaining, onDone]);

  return (
    <div className="flex flex-1 flex-col">
      <div className="mb-4">
        <p className="text-xs uppercase tracking-[0.18em] text-[var(--cyan-glow)]">Recovery</p>
        <h1 className="mt-1 font-display text-3xl font-bold">Catch your breath.</h1>
      </div>
      <div className="glass mb-5 flex aspect-square w-full flex-col items-center justify-center rounded-[var(--radius)]">
        <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Rest</p>
        <p className="font-display text-7xl font-bold text-gradient tabular-nums">
          {remaining}s
        </p>
      </div>
      <div className="glass rounded-[var(--radius)] p-4">
        <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Up next</p>
        <p className="mt-1 text-lg font-semibold">{next.name}</p>
        <p className="text-xs text-muted-foreground">{next.reps}</p>
      </div>
      <div className="mt-auto grid grid-cols-2 gap-3 pt-4">
        <Button
          onClick={() => setRemaining((r) => r + 15)}
          variant="outline"
          className="glass h-12 rounded-2xl border-white/10"
        >
          <Plus className="mr-1 h-4 w-4" /> 15s
        </Button>
        <Button
          onClick={onDone}
          className="h-12 rounded-2xl bg-gradient-primary font-semibold text-[var(--primary-foreground)] shadow-glow"
        >
          Skip rest <ChevronRight className="ml-1 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
