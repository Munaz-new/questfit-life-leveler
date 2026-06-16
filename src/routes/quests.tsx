import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { MobileFrame, GlassCard, SectionTitle } from "@/components/leveluplife/Shell";
import { useApp } from "@/lib/leveluplife/store";
import { modeFor } from "@/lib/leveluplife/modes";
import { Check, Heart } from "lucide-react";
import * as Icons from "lucide-react";

export const Route = createFileRoute("/quests")({
  head: () => ({ meta: [{ title: "Quests — LevelUp Life" }] }),
  component: Quests,
});

function Quests() {
  const navigate = useNavigate();
  const { state, completeQuest } = useApp();
  useEffect(() => {
    if (!state.onboarded) navigate({ to: "/auth" });
  }, [state.onboarded, navigate]);

  const lex = modeFor(state.profile).lexicon;
  const active = state.quests.filter((q) => !q.done);
  const done = state.quests.filter((q) => q.done);

  return (
    <MobileFrame withNav>
      <header className="mb-5">
        <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{lex.dailyQuests}</p>
        <h1 className="text-2xl font-bold">Today's run</h1>
      </header>

      {active.length === 0 && (
        <GlassCard className="mb-5 border-[var(--success)]/30">
          <div className="flex items-start gap-3">
            <Heart className="mt-0.5 h-5 w-5 text-[var(--success)]" />
            <div>
              <p className="font-semibold">{lex.completed}.</p>
              <p className="text-xs text-muted-foreground">{lex.emptyState}</p>
            </div>
          </div>
        </GlassCard>
      )}

      <SectionTitle hint={`${active.length} active`}>Active {lex.questPlural.toLowerCase()}</SectionTitle>
      <div className="space-y-2.5">
        {active.map((q) => {
          const Icon = (Icons as any)[q.icon] ?? Check;
          return (
            <button
              key={q.id}
              onClick={() => completeQuest(q.id)}
              className="glass group flex w-full items-center gap-3 rounded-[var(--radius)] border border-white/10 p-3.5 text-left transition hover:border-white/20"
            >
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/5 text-[var(--cyan-glow)]">
                <Icon className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">{q.title}</p>
                <p className="truncate text-xs text-muted-foreground">{q.subtitle}</p>
              </div>
              <div className="rounded-full bg-gradient-primary px-2.5 py-1 text-[11px] font-bold text-[var(--primary-foreground)] shadow-glow">
                +{q.xp} {lex.xp}
              </div>
            </button>
          );
        })}
      </div>

      {done.length > 0 && (
        <>
          <SectionTitle hint={`${done.length} ${lex.completed.toLowerCase()}`}>{lex.completed}</SectionTitle>
          <div className="space-y-2.5">
            {done.map((q) => (
              <div key={q.id} className="flex w-full items-center gap-3 rounded-[var(--radius)] border border-[var(--success)]/20 bg-[var(--success)]/5 p-3.5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--success)] text-black">
                  <Check className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold line-through opacity-70">{q.title}</p>
                  <p className="truncate text-xs text-muted-foreground">+{q.xp} {lex.xp} banked</p>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </MobileFrame>
  );
}
