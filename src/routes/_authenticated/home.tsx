import { TrainingIcon } from "@/components/leveluplife/TrainingIcon";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { MobileFrame, GlassCard, SectionTitle } from "@/components/leveluplife/Shell";
import { XPBar } from "@/components/leveluplife/XPBar";
import { RecommendationCard } from "@/components/leveluplife/RecommendationCard";
import { DailyReport } from "@/components/leveluplife/day/DailyReport";
import { YourDay } from "@/components/leveluplife/day/YourDay";
import { useApp } from "@/lib/leveluplife/store";
import { modeFor } from "@/lib/leveluplife/modes";
import { recommendationMessage } from "@/lib/leveluplife/engine/messages";
import { Flame, Check, ChevronRight, Armchair } from "lucide-react";
import * as Icons from "lucide-react";

export const Route = createFileRoute("/_authenticated/home")({
  head: () => ({
    meta: [
      { title: "Your Day — LevelUp Life" },
      {
        name: "description",
        content:
          "A daily plan that adapts to your energy, time and recovery — guided workouts, mobility, hydration and focus missions.",
      },
      { property: "og:title", content: "Your Day — LevelUp Life" },
      {
        property: "og:description",
        content: "An adaptive daily plan built from how you actually feel today.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Home,
});

function Home() {
  const navigate = useNavigate();
  const {
    state,
    progressPct,
    xpForNextLevel,
    completeQuest,
    daysSinceLastWorkout,
    logSitting,
    submitDailyReport,
    recalibrateToday,
  } = useApp();
  const [recalibrating, setRecalibrating] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!state.onboarded) navigate({ to: "/auth" });
  }, [state.onboarded, navigate]);

  const mode = modeFor(state.profile);
  const lex = mode.lexicon;
  const name = state.profile?.displayName ?? "you";
  const doneCount = state.quests.filter((q) => q.done).length;
  const plan = state.dailyPlan;

  const card = recommendationMessage(state.profile, {
    sittingHoursToday: state.sittingHoursToday,
    daysSinceLastWorkout,
    streak: state.streak,
  });


  return (
    <MobileFrame withNav>
      <header className="mb-5 flex items-start justify-between">
        <div className="min-w-0 pr-3">
          <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
            <span className="mode-pill mr-2"><TrainingIcon name={mode.id} size={14} /> {mode.shortTag}</span>
          </p>
          <h1 className="mt-2 text-2xl font-bold leading-snug">
            {mounted ? lex.greeting(new Date().getHours(), name) : `Hello, ${name}`}
          </h1>
          <p className="mt-1 text-xs italic text-muted-foreground">"{mode.identity}"</p>
        </div>
        <div className="glass flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-sm">
          <Flame className="h-4 w-4 text-[var(--warn)]" />
          <span className="font-semibold">{state.streak}</span>
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{lex.streak}</span>
        </div>
      </header>

      <GlassCard glow className="mb-5 overflow-hidden">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">{lex.level}</p>
            <p className="font-display text-4xl font-bold leading-none">
              <span className="text-gradient">{lex.levelShort(state.level)}</span>
            </p>
          </div>
          <div className="text-right">
            <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">{lex.xp}</p>
            <p className="font-display text-xl font-semibold">
              {state.xp} <span className="text-xs text-muted-foreground">/ {xpForNextLevel}</span>
            </p>
          </div>
        </div>
        <XPBar pct={progressPct} className="mt-4" />
      </GlassCard>

      {/* ── Your Day: check-in first, then the adaptive board. ────────── */}
      {!plan || recalibrating ? (
        <DailyReport
          motivation={state.profile?.motivation}
          initial={state.adaptiveInput ?? undefined}
          submitLabel={recalibrating ? "Recalibrate my day" : "Build my day"}
          onCancel={recalibrating ? () => setRecalibrating(false) : undefined}
          onSubmit={(v) => {
            if (recalibrating) {
              recalibrateToday(v);
              setRecalibrating(false);
            } else {
              submitDailyReport(v);
            }
          }}
        />
      ) : (
        <div className="mb-5">
          <YourDay
            plan={plan}
            motivation={state.profile?.motivation}
            onRecalibrate={() => setRecalibrating(true)}
          />
        </div>
      )}

      {!plan && (
        <RecommendationCard
          card={card}
          onCta={() =>
            navigate({
              to: "/workout",
              search: card.tone === "recovery" ? { protocol: "posture_reset" } : {},
            })
          }
        />
      )}

      {/* Quick sitting log — feeds the engine. */}
      <GlassCard className="mb-5">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Armchair className="h-4 w-4 text-[var(--cyan-glow)]" />
            <span className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Hours sat today</span>
          </div>
          <span className="font-display text-lg font-semibold">{state.sittingHoursToday}h</span>
        </div>
        <input
          type="range"
          min={0}
          max={12}
          value={state.sittingHoursToday}
          onChange={(e) => logSitting(Number(e.target.value))}
          className="mt-3 w-full accent-[var(--cyan-glow)]"
        />
      </GlassCard>

      <SectionTitle hint={`${doneCount} / ${state.quests.length} ${lex.completed.toLowerCase()}`}>
        {lex.dailyQuests}
      </SectionTitle>
      <div className="space-y-2.5">
        {state.quests.slice(0, 4).map((q) => {
          const Icon = (Icons as unknown as Record<string, typeof Check>)[q.icon] ?? Check;
          return (
            <button
              key={q.id}
              onClick={() => completeQuest(q.id)}
              className={`group flex w-full items-center gap-3 rounded-[var(--radius)] border p-3.5 text-left transition ${
                q.done ? "border-[var(--success)]/30 bg-[var(--success)]/5" : "glass border-white/10 hover:border-white/20"
              }`}
            >
              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                  q.done ? "bg-[var(--success)] text-black" : "bg-white/5 text-[var(--cyan-glow)]"
                }`}
              >
                {q.done ? <Check className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
              </div>
              <div className="min-w-0 flex-1">
                <p className={`truncate text-sm font-semibold ${q.done ? "line-through opacity-70" : ""}`}>{q.title}</p>
                <p className="truncate text-xs text-muted-foreground">{q.subtitle}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">+{lex.xp}</p>
                <p className="font-display text-sm font-semibold text-[var(--cyan-glow)]">{q.xp}</p>
              </div>
            </button>
          );
        })}
      </div>

      <button
        onClick={() => navigate({ to: "/quests" })}
        className="mt-3 flex w-full items-center justify-center gap-1 rounded-xl py-2 text-xs text-muted-foreground transition hover:text-foreground"
      >
        View all {lex.questPlural.toLowerCase()} <ChevronRight className="h-3 w-3" />
      </button>
    </MobileFrame>
  );
}
