import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import * as Icons from "lucide-react";
import { Check, ChevronRight, Droplets, Info, ShieldCheck, Sparkles } from "lucide-react";
import { GlassCard, SectionTitle } from "@/components/leveluplife/Shell";
import { MissionTimer } from "./MissionTimer";
import { useApp } from "@/lib/leveluplife/store";
import { dayVoice } from "@/lib/leveluplife/day/copy";
import type { DailyMission, DailyPlan } from "@/lib/leveluplife/day/types";
import type { MotivationStyle } from "@/lib/leveluplife/types";

/**
 * "Your Day" — the central board. Every mission here is real: it either
 * opens the workout player, runs a genuine timer, or logs an honest
 * self-report. Nothing is a decorative checkbox.
 */
export function YourDay({
  plan,
  motivation,
  onRecalibrate,
}: {
  plan: DailyPlan;
  motivation: MotivationStyle | null | undefined;
  onRecalibrate: () => void;
}) {
  const navigate = useNavigate();
  const { completeMission, logWater } = useApp();
  const [timerMission, setTimerMission] = useState<DailyMission | null>(null);
  const [showWhy, setShowWhy] = useState(false);
  const voice = dayVoice(motivation);

  const done = plan.missions.filter((m) => m.done).length;
  const main = plan.missions.find((m) => m.slot === "main");
  const rest = plan.missions.filter((m) => m.slot !== "main");

  function open(mission: DailyMission) {
    if (mission.done) return;
    if (mission.kind === "workout") {
      navigate({
        to: "/workout",
        search: mission.protocolId ? { protocol: mission.protocolId } : {},
      });
      return;
    }
    if (mission.kind === "hydration") {
      logWater();
      return;
    }
    setTimerMission(mission);
  }

  return (
    <>
      <div className="mb-3 flex items-end justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold">{voice.boardTitle}</h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {voice.calibrated(plan.recoveryMode)}
          </p>
        </div>
        <span className="text-xs text-muted-foreground">
          {done}/{plan.missions.length} done
        </span>
      </div>

      {plan.recoveryMode && (
        <div className="mb-3 flex items-start gap-2 rounded-xl border border-[var(--warn)]/30 bg-[var(--warn)]/10 p-3">
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-[var(--warn)]" />
          <div>
            <p className="text-xs font-semibold">Recovery Mode</p>
            <p className="text-[11px] text-muted-foreground">{voice.recoveryBanner}</p>
          </div>
        </div>
      )}

      {main && (
        <GlassCard glow className="mb-4">
          <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            {voice.mainLabel}
          </p>
          <h3 className="mt-1.5 font-display text-lg font-bold leading-snug">{main.title}</h3>
          <p className="mt-1 text-xs text-muted-foreground">{main.subtitle}</p>
          <button
            onClick={() => open(main)}
            disabled={main.done}
            className={`mt-4 flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold transition ${
              main.done
                ? "border border-[var(--success)]/40 bg-[var(--success)]/10 text-[var(--success)]"
                : "bg-[var(--cyan-glow)] text-black"
            }`}
          >
            {main.done ? (
              <>
                <Check className="h-4 w-4" /> Completed today
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" /> Start mission · +{main.xp} XP
              </>
            )}
          </button>
        </GlassCard>
      )}

      <SectionTitle hint={`${plan.intensity} intensity`}>Today's missions</SectionTitle>
      <div className="space-y-2.5">
        {rest.map((m) => (
          <MissionRow key={m.id} mission={m} onOpen={() => open(m)} />
        ))}
      </div>

      <div className="mt-4 flex gap-2">
        <button
          onClick={() => setShowWhy((v) => !v)}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-white/10 py-2.5 text-xs text-muted-foreground transition hover:text-foreground"
        >
          <Info className="h-3.5 w-3.5" /> Why this plan?
        </button>
        <button
          onClick={onRecalibrate}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-white/10 py-2.5 text-xs text-muted-foreground transition hover:text-foreground"
        >
          {voice.recalibrateCta}
        </button>
      </div>

      {showWhy && (
        <GlassCard className="mt-3">
          <ul className="space-y-2">
            {plan.whyThisPlan.map((line) => (
              <li key={line} className="flex gap-2 text-xs leading-relaxed text-muted-foreground">
                <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-[var(--cyan-glow)]" />
                {line}
              </li>
            ))}
          </ul>
          {plan.safetyNote && (
            <p className="mt-3 border-t border-white/10 pt-3 text-[11px] leading-relaxed text-muted-foreground">
              {plan.safetyNote}
            </p>
          )}
        </GlassCard>
      )}

      {timerMission && (
        <MissionTimer
          mission={timerMission}
          onDone={() => completeMission(timerMission.id)}
          onClose={() => setTimerMission(null)}
        />
      )}
    </>
  );
}

function MissionRow({ mission, onOpen }: { mission: DailyMission; onOpen: () => void }) {
  const Icon =
    (Icons as unknown as Record<string, typeof Check>)[mission.icon] ?? Sparkles;
  const hydration = mission.kind === "hydration";
  const progress = mission.progress ?? 0;
  const target = mission.target ?? 0;

  return (
    <button
      onClick={onOpen}
      className={`group flex w-full items-center gap-3 rounded-[var(--radius)] border p-3.5 text-left transition ${
        mission.done
          ? "border-[var(--success)]/30 bg-[var(--success)]/5"
          : "glass border-white/10 hover:border-white/20"
      }`}
    >
      <div
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
          mission.done ? "bg-[var(--success)] text-black" : "bg-white/5 text-[var(--cyan-glow)]"
        }`}
      >
        {mission.done ? (
          <Check className="h-5 w-5" />
        ) : hydration ? (
          <Droplets className="h-5 w-5" />
        ) : (
          <Icon className="h-5 w-5" />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className={`truncate text-sm font-semibold ${mission.done ? "line-through opacity-70" : ""}`}>
          {mission.title}
        </p>
        <p className="truncate text-xs text-muted-foreground">
          {hydration && !mission.done ? `${progress} / ${target} glasses — tap to log` : mission.subtitle}
        </p>
      </div>
      <div className="flex items-center gap-1 text-right">
        <div>
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground">+XP</p>
          <p className="font-display text-sm font-semibold text-[var(--cyan-glow)]">{mission.xp}</p>
        </div>
        <ChevronRight className="h-3.5 w-3.5 text-muted-foreground opacity-0 transition group-hover:opacity-100" />
      </div>
    </button>
  );
}
