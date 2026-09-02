import { createFileRoute, useNavigate, useSearch } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { MobileFrame, GlassCard, SectionTitle } from "@/components/leveluplife/Shell";
import { ExerciseCard } from "@/components/leveluplife/exercises/ExerciseCard";
import { useApp } from "@/lib/leveluplife/store";
import { EXERCISES } from "@/lib/leveluplife/exercises/library";
import { groupOf, type CategoryGroup } from "@/lib/leveluplife/exercises/types";
import { Search, X } from "lucide-react";

interface Search$ {
  group?: CategoryGroup;
}

export const Route = createFileRoute("/_authenticated/exercises/")({
  head: () => ({ meta: [{ title: "Exercise Library — LevelUp Life" }] }),
  validateSearch: (s: Record<string, unknown>): Search$ => ({
    group: (["strength", "mobility", "recovery", "cardio"] as const).includes(s.group as CategoryGroup)
      ? (s.group as CategoryGroup)
      : undefined,
  }),
  component: Library,
});

const GROUPS: { id: CategoryGroup | "all"; label: string }[] = [
  { id: "all", label: "All" },
  { id: "strength", label: "Strength" },
  { id: "mobility", label: "Mobility" },
  { id: "recovery", label: "Recovery" },
  { id: "cardio", label: "Cardio" },
];

function Library() {
  const navigate = useNavigate();
  const search = useSearch({ from: "/_authenticated/exercises/" });
  const { state } = useApp();

  useEffect(() => {
    if (!state.onboarded) navigate({ to: "/auth" });
  }, [state.onboarded, navigate]);

  const [q, setQ] = useState("");
  const [group, setGroup] = useState<CategoryGroup | "all">(search.group ?? "all");

  const forYou = useMemo(() => {
    if (!state.profile) return [];
    const lifestyle = state.profile.lifestyle;
    return EXERCISES.filter((e) => e.recommendedFor.includes(lifestyle)).slice(0, 6);
  }, [state.profile]);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return EXERCISES.filter((e) => {
      if (group !== "all" && groupOf(e.category) !== group) return false;
      if (!term) return true;
      const hay = `${e.name} ${e.pattern} ${e.primaryMuscles.join(" ")} ${e.secondaryMuscles.join(" ")}`.toLowerCase();
      return hay.includes(term);
    });
  }, [q, group]);

  return (
    <MobileFrame withNav>
      <header className="mb-4">
        <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Library</p>
        <h1 className="mt-1 font-display text-3xl font-bold leading-tight">Exercises</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Every move is tagged with target muscles, benefits, mistakes to avoid, and who it's built for.
        </p>
      </header>

      <div className="glass mb-4 flex items-center gap-2 rounded-2xl px-3 py-2">
        <Search className="h-4 w-4 text-muted-foreground" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search by name or muscle…"
          className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
        />
        {q && (
          <button onClick={() => setQ("")} aria-label="Clear">
            <X className="h-4 w-4 text-muted-foreground" />
          </button>
        )}
      </div>

      <div className="mb-5 flex gap-2 overflow-x-auto no-scrollbar">
        {GROUPS.map((g) => (
          <button
            key={g.id}
            onClick={() => setGroup(g.id)}
            className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
              group === g.id
                ? "bg-gradient-primary text-[var(--primary-foreground)] shadow-glow"
                : "glass text-muted-foreground hover:text-foreground"
            }`}
          >
            {g.label}
          </button>
        ))}
      </div>

      {forYou.length > 0 && group === "all" && !q && (
        <>
          <SectionTitle hint="based on your lifestyle">For you</SectionTitle>
          <GlassCard className="mb-5 !p-3">
            <div className="grid grid-cols-2 gap-2">
              {forYou.map((e) => (
                <ExerciseCard key={e.id} ex={e} />
              ))}
            </div>
          </GlassCard>
        </>
      )}

      <SectionTitle hint={`${filtered.length} moves`}>All exercises</SectionTitle>
      {filtered.length === 0 ? (
        <p className="rounded-xl border border-white/10 bg-white/5 p-4 text-center text-sm text-muted-foreground">
          No matches — try another search.
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-2">
          {filtered.map((e) => (
            <ExerciseCard key={e.id} ex={e} />
          ))}
        </div>
      )}
    </MobileFrame>
  );
}
