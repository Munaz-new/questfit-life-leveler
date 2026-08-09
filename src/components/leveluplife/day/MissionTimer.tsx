import { useEffect, useRef, useState } from "react";
import { Pause, Play, X } from "lucide-react";
import type { DailyMission } from "@/lib/leveluplife/day/types";

function fmt(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

/**
 * A real countdown for timed / walk / focus missions. The mission only
 * completes when the timer reaches zero, or when the user honestly reports
 * finishing a non-verifiable mission early.
 */
export function MissionTimer({
  mission,
  onDone,
  onClose,
}: {
  mission: DailyMission;
  onDone: () => void;
  onClose: () => void;
}) {
  const total = mission.durationSec ?? 300;
  const [left, setLeft] = useState(total);
  const [running, setRunning] = useState(true);
  const finished = left <= 0;
  const doneRef = useRef(false);

  useEffect(() => {
    if (!running || finished) return;
    const id = setInterval(() => setLeft((v) => Math.max(0, v - 1)), 1000);
    return () => clearInterval(id);
  }, [running, finished]);

  useEffect(() => {
    if (finished && !doneRef.current) {
      doneRef.current = true;
      onDone();
    }
  }, [finished, onDone]);

  const pct = Math.round(((total - left) / total) * 100);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background/95 p-6 backdrop-blur-xl">
      <button
        onClick={onClose}
        aria-label="Close timer"
        className="absolute right-5 top-5 rounded-full border border-white/10 p-2 text-muted-foreground transition hover:text-foreground"
      >
        <X className="h-4 w-4" />
      </button>

      <p className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
        {mission.slot === "focus" ? "Focus block" : "In progress"}
      </p>
      <h2 className="mt-2 text-center font-display text-2xl font-bold">{mission.title}</h2>
      <p className="mt-1 text-center text-xs text-muted-foreground">{mission.subtitle}</p>

      <p className="mt-8 font-display text-6xl font-bold tabular-nums text-gradient">
        {fmt(left)}
      </p>

      <div className="mt-6 h-1.5 w-full max-w-xs overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full bg-[var(--cyan-glow)] transition-[width] duration-1000"
          style={{ width: `${pct}%` }}
        />
      </div>

      {finished ? (
        <button
          onClick={onClose}
          className="mt-8 rounded-xl bg-[var(--success)] px-6 py-3 text-sm font-semibold text-black"
        >
          Complete — XP banked
        </button>
      ) : (
        <div className="mt-8 flex items-center gap-3">
          <button
            onClick={() => setRunning((r) => !r)}
            className="flex items-center gap-2 rounded-xl border border-white/10 px-5 py-3 text-sm font-semibold"
          >
            {running ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            {running ? "Pause" : "Resume"}
          </button>
          {!mission.verifiable && (
            <button
              onClick={() => {
                setLeft(0);
              }}
              className="rounded-xl px-4 py-3 text-xs text-muted-foreground transition hover:text-foreground"
            >
              I finished this
            </button>
          )}
        </div>
      )}

      <p className="mt-6 max-w-xs text-center text-[11px] leading-relaxed text-muted-foreground">
        {mission.verifiable
          ? "Stay with the timer — it only counts when it runs out."
          : "This one is on your honour. The app can't verify it."}
      </p>
    </div>
  );
}
