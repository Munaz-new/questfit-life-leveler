import { useEffect, useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useApp } from "@/lib/leveluplife/store";
import { parseTarget } from "@/lib/leveluplife/engine/xp";
import { educationFor } from "@/lib/leveluplife/engine/education";
import { modeFor } from "@/lib/leveluplife/modes";
import { missionCopyFor } from "@/lib/leveluplife/missionCopy";
import { Button } from "@/components/ui/button";
import {
  Play,
  Pause,
  SkipForward,
  Plus,
  X,
  ChevronRight,
  Info,
  Check,
} from "lucide-react";
import { PATTERN_GLYPH } from "./glyphs";

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

  const a = state.activeSession;
  const mode = modeFor(state.profile);
  const copy = missionCopyFor(mode.id);

  // Bail if nothing in progress.
  useEffect(() => {
    if (!a) navigate({ to: "/workout" });
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

  function onAdvance() {
    if (isLast) {
      finishMission();
      navigate({ to: "/workout/summary" });
    } else {
      enterRest();
    }
  }

  function quit() {
    if (confirm("Quit mission? Partial progress will be saved.")) {
      finishMission();
      navigate({ to: "/workout/summary" });
    }
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
          move={move}
          block={block}
          set={a.currentSet}
          onCompleteAllSets={() => {
            completeCurrentMove();
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
  onCompleteAllSets: () => void;
  onLogSet: () => void;
  onSkip: () => void;
  onQuit: () => void;
  finishLabel: string;
  isLast: boolean;
}) {
  const target = parseTarget(move.reps);
  const edu = educationFor(move);
  const [eduOpen, setEduOpen] = useState(false);

  return (
    <div className="flex flex-1 flex-col">
      <div className="mb-4">
        <p className="text-xs uppercase tracking-[0.18em] text-[var(--cyan-glow)]">
          {block} · {move.pattern}
        </p>
        <h1 className="mt-1 font-display text-3xl font-bold leading-tight">{move.name}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{move.cue}</p>
      </div>

      <div className="glass mb-5 flex aspect-square w-full items-center justify-center rounded-[var(--radius)] text-7xl">
        <span aria-hidden>{PATTERN_GLYPH[move.pattern]}</span>
      </div>

      {target.kind === "reps" && (
        <RepsBlock
          sets={target.sets}
          perSet={target.perSet}
          currentSet={set}
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
      {eduOpen && (
        <div className="mt-2 space-y-2 rounded-xl border border-white/10 bg-white/5 p-4 text-xs text-muted-foreground">
          <p><b className="text-foreground">Targets:</b> {edu.targets}</p>
          <p><b className="text-foreground">Why:</b> {edu.benefits}</p>
          <p><b className="text-foreground">Avoid:</b> {edu.avoid}</p>
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

function RepsBlock({
  sets,
  perSet,
  currentSet,
  onLogSet,
  onComplete,
}: {
  sets: number;
  perSet: string;
  currentSet: number;
  onLogSet: () => void;
  onComplete: () => void;
}) {
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
      <Button
        onClick={() => (isLastSet ? onComplete() : onLogSet())}
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
  onLogSet,
  onComplete,
}: {
  seconds: number;
  sets: number;
  currentSet: number;
  perSet: boolean;
  onLogSet: () => void;
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
  const pct = total.current ? (remaining / total.current) * 100 : 0;

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
            <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Set</p>
            <p className="font-display text-2xl font-semibold">
              {currentSet} <span className="text-sm text-muted-foreground">/ {sets}</span>
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
          <SkipForward className="mr-1 h-4 w-4" /> Skip
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
