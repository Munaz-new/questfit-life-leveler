import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { MobileFrame, GlassCard, SectionTitle } from "@/components/leveluplife/Shell";
import { GymProgress } from "@/components/leveluplife/GymProgress";
import { WorkoutHistory } from "@/components/leveluplife/WorkoutHistory";
import { XPBar } from "@/components/leveluplife/XPBar";
import { useApp } from "@/lib/leveluplife/store";
import { modeFor } from "@/lib/leveluplife/modes";
import * as Icons from "lucide-react";
import { Dumbbell, HeartPulse, Moon, Target, Sparkles, Wind, Brain, Camera, ChevronRight } from "lucide-react";

export const Route = createFileRoute("/_authenticated/progress")({
  head: () => ({ meta: [{ title: "Progress — LevelUp Life" }] }),
  component: ProgressPage,
});

const STAT_META = [
  { key: "strength", label: "Strength", Icon: Dumbbell },
  { key: "stamina", label: "Stamina", Icon: HeartPulse },
  { key: "recovery", label: "Recovery", Icon: Moon },
  { key: "discipline", label: "Discipline", Icon: Target },
  { key: "vitality", label: "Vitality", Icon: Sparkles },
  { key: "flexibility", label: "Flexibility", Icon: Wind },
  { key: "focus", label: "Focus", Icon: Brain },
] as const;

function ProgressPage() {
  const navigate = useNavigate();
  const { state, progressPct, xpForNextLevel } = useApp();
  useEffect(() => {
    if (!state.onboarded) navigate({ to: "/auth" });
  }, [state.onboarded, navigate]);

  const mode = modeFor(state.profile);
  const lex = mode.lexicon;

  return (
    <MobileFrame gym withNav>
      <h1 className="mb-5 text-center text-xl font-bold">Progress</h1>
      <GymProgress sessions={state.workoutHistory} />

      {/* Hero level card */}
      <GlassCard glow className="mb-6 overflow-hidden">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">{lex.level}</p>
            <p className="font-display text-5xl font-bold leading-none text-gradient">
              {lex.levelShort(state.level)}
            </p>
            <p className="mt-2 text-xs text-muted-foreground">
              {mode.label} · {state.profile?.level ?? "beginner"}
            </p>
          </div>
          <div className="text-right">
            <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">{lex.xp}</p>
            <p className="font-display text-xl font-semibold">{state.xp}<span className="text-xs text-muted-foreground">/{xpForNextLevel}</span></p>
            <p className="mt-1 text-[10px] text-muted-foreground">{progressPct}% to next</p>
          </div>
        </div>
        <XPBar pct={progressPct} className="mt-4" />
      </GlassCard>

      {/* Progress Mirror entry */}
      <button
        onClick={() => navigate({ to: "/progress-mirror" })}
        className="glass mb-6 flex w-full items-center gap-3 rounded-2xl border border-white/10 p-4 text-left transition hover:border-white/20"
      >
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-rare shadow-rare">
          <Camera className="h-5 w-5 text-white" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold">Progress Mirror</p>
          <p className="mt-0.5 text-xs text-muted-foreground">See your visual transformation — private to you</p>
        </div>
        <ChevronRight className="h-4 w-4 text-muted-foreground" />
      </button>



      <WorkoutHistory sessions={state.workoutHistory} />

      {/* Stats */}
      <SectionTitle hint="real-life stats">Attributes</SectionTitle>
      <div className="grid grid-cols-2 gap-2.5">
        {STAT_META.map(({ key, label, Icon }) => {
          const value = (state.stats as any)[key] as number;
          return (
            <div key={key} className="glass rounded-2xl border border-white/10 p-3.5">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/5 text-[var(--cyan-glow)]">
                  <Icon className="h-3.5 w-3.5" />
                </div>
                <p className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</p>
              </div>
              <p className="mt-2 font-display text-2xl font-bold">{value}</p>
              <div className="mt-1.5 h-1 w-full overflow-hidden rounded-full bg-white/5">
                <div className="h-full bg-gradient-primary" style={{ width: `${Math.min(100, value * 2)}%` }} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Skills */}
      <SectionTitle hint="evolving">Skills</SectionTitle>
      <div className="space-y-2.5">
        {state.skills.map((s) => {
          const Icon = (Icons as any)[s.icon] ?? Sparkles;
          const pct = Math.min(100, (s.xp / 100) * 100);
          return (
            <div key={s.id} className="glass relative overflow-hidden rounded-2xl border border-white/10 p-4">
              <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-gradient-rare opacity-15 blur-2xl" />
              <div className="relative flex items-start gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-rare shadow-rare">
                  <Icon className="h-5 w-5 text-white" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-sm font-semibold">{s.name}</p>
                    <span className="shrink-0 rounded-full bg-white/5 px-2 py-0.5 text-[10px] font-bold text-[var(--cyan-glow)]">
                      Lv.{s.level}
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs text-muted-foreground">{s.description}</p>
                  <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-white/5">
                    <div className="h-full bg-gradient-primary" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </MobileFrame>
  );
}