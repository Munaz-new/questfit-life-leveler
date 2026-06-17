import { createFileRoute, useNavigate, useSearch } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { MobileFrame, GlassCard, SectionTitle } from "@/components/leveluplife/Shell";
import { CheckinSheet } from "@/components/leveluplife/CheckinSheet";
import { useApp } from "@/lib/leveluplife/store";
import { modeFor } from "@/lib/leveluplife/modes";
import { missionCopyFor } from "@/lib/leveluplife/missionCopy";
import { selectProtocol, recoveryMissionPlan } from "@/lib/leveluplife/engine/selector";
import { buildSession } from "@/lib/leveluplife/engine/builder";
import { PROTOCOLS, type ProtocolId } from "@/lib/leveluplife/engine/protocols";
import { Button } from "@/components/ui/button";
import { Play, Clock, Dumbbell, Activity, ChevronRight, RotateCcw } from "lucide-react";

interface Search {
  protocol?: ProtocolId;
}

export const Route = createFileRoute("/workout/")({
  head: () => ({ meta: [{ title: "Mission Briefing — LevelUp Life" }] }),
  validateSearch: (s: Record<string, unknown>): Search => ({
    protocol: typeof s.protocol === "string" ? (s.protocol as ProtocolId) : undefined,
  }),
  component: Briefing,
});

function Briefing() {
  const navigate = useNavigate();
  const search = useSearch({ from: "/workout/" });
  const {
    state,
    setCheckin,
    logSitting,
    startMission,
    clearActiveSession,
    daysSinceLastWorkout,
  } = useApp();
  const mode = modeFor(state.profile);
  const copy = missionCopyFor(mode.id);

  useEffect(() => {
    if (!state.onboarded) navigate({ to: "/auth" });
  }, [state.onboarded, navigate]);

  if (!state.profile) return null;

  // Resume in progress?
  const active = state.activeSession;
  if (active) {
    return (
      <MobileFrame withNav>
        <header className="mb-5">
          <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{copy.briefingTag}</p>
          <h1 className="mt-1 text-2xl font-bold">Mission in progress</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            You have an unfinished {active.session.protocolName.toLowerCase()}. Pick up where you left off, or start fresh.
          </p>
        </header>
        <GlassCard glow className="mb-4">
          <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Active</p>
          <p className="mt-1 font-display text-xl font-semibold">{active.session.protocolName}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            {active.completed.length} of {active.order.length} exercises done
          </p>
        </GlassCard>
        <div className="grid grid-cols-2 gap-3">
          <Button
            onClick={() => clearActiveSession()}
            variant="outline"
            className="glass h-12 rounded-2xl border-white/10"
          >
            <RotateCcw className="mr-2 h-4 w-4" /> Start fresh
          </Button>
          <Button
            onClick={() => navigate({ to: "/workout/play" })}
            className="h-12 rounded-2xl bg-gradient-primary font-semibold text-[var(--primary-foreground)] shadow-glow"
          >
            {copy.resumeCta} <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
      </MobileFrame>
    );
  }

  if (!state.checkin) {
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
    <BriefingScreen
      forceProtocol={search.protocol}
      onStart={(session, forceProtocol) => {
        startMission(session, { forceProtocol });
        navigate({ to: "/workout/play" });
      }}
    />
  );
}

function BriefingScreen({
  forceProtocol,
  onStart,
}: {
  forceProtocol?: ProtocolId;
  onStart: (s: ReturnType<typeof buildSession>, forceProtocol?: string) => void;
}) {
  const { state, daysSinceLastWorkout } = useApp();
  const mode = modeFor(state.profile);
  const copy = missionCopyFor(mode.id);

  const [seed, setSeed] = useState(0);
  const session = useMemo(() => {
    const signals = {
      sittingHoursToday: state.sittingHoursToday,
      daysSinceLastWorkout,
      streak: state.streak,
    };
    let plan;
    if (forceProtocol === "posture_reset") {
      plan = recoveryMissionPlan(state.profile!, signals);
    } else if (forceProtocol) {
      const p = PROTOCOLS[forceProtocol];
      plan = {
        protocol: p,
        reason: p.whyTemplate,
        level: state.profile!.level,
        timeMin: Math.min(state.checkin!.timeMin, p.mainMin + 4),
        recoveryMission: false,
      };
    } else {
      plan = selectProtocol(state.profile!, state.checkin!, signals);
    }
    // Adaptive boost — bump effective level if user has been crushing it.
    if (state.adaptiveBoost === 1 && plan.level === "beginner") plan.level = "intermediate";
    else if (state.adaptiveBoost === 1 && plan.level === "intermediate") plan.level = "advanced";
    else if (state.adaptiveBoost === -1 && plan.level === "advanced") plan.level = "intermediate";
    else if (state.adaptiveBoost === -1 && plan.level === "intermediate") plan.level = "beginner";
    return buildSession(state.profile!, plan, state.lastMoves);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seed, forceProtocol]);

  const totalMoves = session.warmup.length + session.main.length + session.cooldown.length;

  return (
    <MobileFrame withNav>
      <header className="mb-4">
        <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{copy.briefingTag}</p>
        <h1 className="mt-1 font-display text-3xl font-bold leading-tight">{session.protocolName}</h1>
        <p className="mt-1.5 text-sm text-muted-foreground">{session.reason}</p>
      </header>

      <GlassCard glow className="mb-4">
        <div className="grid grid-cols-3 gap-3 text-center">
          <Stat icon={<Clock className="h-4 w-4" />} label="Duration" value={`${session.durationMin}m`} />
          <Stat icon={<Activity className="h-4 w-4" />} label="Exercises" value={String(totalMoves)} />
          <Stat icon={<Dumbbell className="h-4 w-4" />} label="Intensity" value={session.intensity} />
        </div>
      </GlassCard>

      <SectionTitle hint={`${session.warmup.length} + ${session.main.length} + ${session.cooldown.length}`}>
        Warmup → Main → Cooldown
      </SectionTitle>
      <ul className="mb-4 space-y-1.5">
        {[...session.warmup, ...session.main, ...session.cooldown].map((m, i) => (
          <li
            key={`${m.id}-${i}`}
            className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm"
          >
            <span className="truncate">
              <span className="mr-2 text-[10px] uppercase tracking-wider text-muted-foreground">
                {String(i + 1).padStart(2, "0")}
              </span>
              {m.name}
            </span>
            <span className="shrink-0 text-xs text-muted-foreground">{m.reps}</span>
          </li>
        ))}
      </ul>

      <div className="grid grid-cols-[1fr_auto] gap-2">
        <Button
          onClick={() => onStart(session, forceProtocol)}
          className="h-14 rounded-2xl bg-gradient-primary text-base font-semibold text-[var(--primary-foreground)] shadow-glow"
        >
          <Play className="mr-2 h-5 w-5" /> {copy.startCta}
        </Button>
        <Button
          onClick={() => setSeed((s) => s + 1)}
          variant="outline"
          className="glass h-14 w-14 rounded-2xl border-white/10"
          aria-label="Regenerate"
        >
          <RotateCcw className="h-5 w-5" />
        </Button>
      </div>
    </MobileFrame>
  );
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div>
      <div className="mx-auto mb-1 flex h-7 w-7 items-center justify-center rounded-lg bg-white/5 text-[var(--cyan-glow)]">
        {icon}
      </div>
      <p className="font-display text-base font-semibold capitalize">{value}</p>
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</p>
    </div>
  );
}
