import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect } from "react";
import { MobileFrame, GlassCard, SectionTitle } from "@/components/leveluplife/Shell";
import { ExerciseArt } from "@/components/leveluplife/exercises/ExerciseArt";
import { MuscleMap } from "@/components/leveluplife/exercises/MuscleMap";
import { useApp } from "@/lib/leveluplife/store";
import { exerciseById } from "@/lib/leveluplife/exercises/library";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Clock,
  Heart,
  ListChecks,
  Shield,
  Sparkles,
  Target,
  Users,
  Play,
} from "lucide-react";

export const Route = createFileRoute("/exercises/$id")({
  head: () => ({ meta: [{ title: "Exercise — LevelUp Life" }] }),
  component: Detail,
});

function Detail() {
  const navigate = useNavigate();
  const { id } = Route.useParams();
  const { state } = useApp();

  useEffect(() => {
    if (!state.onboarded) navigate({ to: "/auth" });
  }, [state.onboarded, navigate]);

  const ex = exerciseById(id);
  if (!ex) {
    return (
      <MobileFrame withNav>
        <p className="text-sm text-muted-foreground">Exercise not found.</p>
        <Link to="/exercises" className="mt-3 inline-flex text-sm text-[var(--cyan-glow)]">
          ← Back to library
        </Link>
      </MobileFrame>
    );
  }

  const minutes = Math.max(1, Math.round(ex.estDurationSec / 60));

  return (
    <MobileFrame withNav>
      <header className="mb-4 flex items-center gap-3">
        <button
          onClick={() => navigate({ to: "/exercises" })}
          className="glass flex h-9 w-9 items-center justify-center rounded-full"
          aria-label="Back"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{ex.category.replace(/_/g, " ")}</p>
      </header>

      <GlassCard glow className="mb-5 overflow-hidden">
        <div className="mb-3 flex aspect-[5/3] w-full items-center justify-center rounded-xl bg-gradient-to-br from-white/5 to-white/0 text-[var(--cyan-glow)]">
          <div className="h-3/4 w-3/4">
            <ExerciseArt id={ex.id} animated />
          </div>
        </div>
        <h1 className="font-display text-2xl font-bold leading-tight">{ex.name}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{ex.cue}</p>
        <div className="mt-3 flex flex-wrap gap-2 text-[10px] uppercase tracking-[0.16em]">
          <span className="rounded-full bg-white/8 px-2 py-1">{ex.difficulty}</span>
          <span className="rounded-full bg-white/8 px-2 py-1">{ex.pattern}</span>
          <span className="inline-flex items-center gap-1 rounded-full bg-white/8 px-2 py-1">
            <Clock className="h-3 w-3" /> {minutes} min
          </span>
          <span className="rounded-full bg-white/8 px-2 py-1">MET {ex.metValue}</span>
        </div>
      </GlassCard>

      <SectionTitle>Target muscles</SectionTitle>
      <GlassCard className="mb-5">
        <MuscleMap primary={ex.primaryMuscles} secondary={ex.secondaryMuscles} showLabels />
        <div className="mt-3 flex flex-wrap gap-1.5 text-[11px]">
          {ex.primaryMuscles.map((m) => (
            <span key={m} className="rounded-md bg-[var(--cyan-glow)]/15 px-2 py-0.5 text-[var(--cyan-glow)]">
              {m.replace("_", " ")}
            </span>
          ))}
          {ex.secondaryMuscles.map((m) => (
            <span key={m} className="rounded-md bg-[var(--rare)]/15 px-2 py-0.5 text-[var(--rare)]">
              {m.replace("_", " ")}
            </span>
          ))}
        </div>
      </GlassCard>

      <Section icon={<Sparkles className="h-4 w-4" />} title="Benefits">
        <ul className="space-y-1.5 text-sm">
          {ex.benefits.map((b) => (
            <li key={b} className="flex gap-2"><span className="text-[var(--cyan-glow)]">·</span><span>{b}</span></li>
          ))}
        </ul>
      </Section>

      <Section icon={<ListChecks className="h-4 w-4" />} title="How to do it">
        <ol className="space-y-2 text-sm">
          {ex.instructions.map((step, i) => (
            <li key={i} className="flex gap-3">
              <span className="font-display text-sm font-semibold text-[var(--cyan-glow)]">{String(i + 1).padStart(2, "0")}</span>
              <span>{step}</span>
            </li>
          ))}
        </ol>
      </Section>

      <Section icon={<Target className="h-4 w-4" />} title="Common mistakes">
        <ul className="space-y-1.5 text-sm">
          {ex.mistakes.map((m) => (
            <li key={m} className="flex gap-2"><span className="text-[var(--warn)]">!</span><span>{m}</span></li>
          ))}
        </ul>
      </Section>

      <Section icon={<Shield className="h-4 w-4" />} title="Safety">
        <ul className="space-y-1.5 text-sm">
          {ex.safety.map((s) => (
            <li key={s} className="flex gap-2"><span className="text-[var(--rare)]">◆</span><span>{s}</span></li>
          ))}
        </ul>
      </Section>

      {ex.recommendedFor.length > 0 && (
        <Section icon={<Users className="h-4 w-4" />} title="Recommended for">
          <div className="flex flex-wrap gap-1.5 text-[11px]">
            {ex.recommendedFor.map((l) => (
              <span key={l} className="rounded-md bg-white/8 px-2 py-0.5 capitalize">{l}</span>
            ))}
          </div>
        </Section>
      )}

      {ex.scienceNote && (
        <Section icon={<Heart className="h-4 w-4" />} title="Why it matters">
          <p className="text-sm italic text-muted-foreground">{ex.scienceNote}</p>
        </Section>
      )}

      <Section icon={<Camera className="h-4 w-4" />} title="My Progress">
        <p className="text-sm text-muted-foreground">
          The demonstration above always shows correct form. Track your own attempts privately —
          photos, notes, and measurements live in your Progress Mirror.
        </p>
        <button
          onClick={() => navigate({ to: "/progress-mirror" })}
          className="mt-3 inline-flex items-center gap-2 rounded-xl bg-white/8 px-3 py-2 text-xs font-semibold text-foreground transition hover:bg-white/12"
        >
          <Camera className="h-3.5 w-3.5 text-[var(--cyan-glow)]" /> Track my progress
        </button>
      </Section>

      <div className="sticky bottom-24 mt-6 grid grid-cols-1 gap-2">
        <Button
          onClick={() => navigate({ to: "/workout" })}
          className="h-12 rounded-2xl bg-gradient-primary font-semibold text-[var(--primary-foreground)] shadow-glow"
        >
          <Play className="mr-2 h-4 w-4" /> Add to today's mission
        </Button>
      </div>

    </MobileFrame>
  );
}

function Section({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div className="mb-5">
      <h2 className="mb-2 inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.14em] text-muted-foreground">
        <span className="text-[var(--cyan-glow)]">{icon}</span>
        {title}
      </h2>
      <div className="glass rounded-xl p-4">{children}</div>
    </div>
  );
}

