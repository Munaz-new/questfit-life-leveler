import { createFileRoute, useNavigate, useSearch } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { MobileFrame } from "@/components/leveluplife/Shell";
import { ExerciseCard } from "@/components/leveluplife/exercises/ExerciseCard";
import { useApp } from "@/lib/leveluplife/store";
import { EXERCISES } from "@/lib/leveluplife/exercises/library";
import { groupOf, type CategoryGroup } from "@/lib/leveluplife/exercises/types";
import { Search, Star, X } from "lucide-react";

interface Search$ {
  group?: CategoryGroup;
}

export const Route = createFileRoute("/_authenticated/exercises/")({
  head: () => ({ meta: [{ title: "Exercise Library — LevelUp Life" }] }),
  validateSearch: (s: Record<string, unknown>): Search$ => ({
    group: (["strength", "mobility", "recovery", "cardio"] as const).includes(
      s.group as CategoryGroup,
    )
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
  const { state, toggleFavoriteExercise } = useApp();

  useEffect(() => {
    if (!state.onboarded) navigate({ to: "/auth" });
  }, [state.onboarded, navigate]);

  const [q, setQ] = useState("");
  const [group, setGroup] = useState<CategoryGroup | "all">(search.group ?? "all");

  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [library, setLibrary] = useState<"gym" | "levelup" | "all">("gym");
  const [limit, setLimit] = useState(72);
  const favorites = state.favoriteExerciseIds;

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return EXERCISES.filter((e) => {
      if (!favoritesOnly && library === "gym" && !e.gymMane) return false;
      if (!favoritesOnly && library === "levelup" && e.gymMane) return false;
      if (favoritesOnly && !favorites.includes(e.id)) return false;
      if (group !== "all" && groupOf(e.category) !== group) return false;
      if (!term) return true;
      const hay =
        `${e.name} ${e.gymMane?.equipment ?? e.equipment} ${e.gymMane?.aliases.join(" ") ?? ""} ${e.pattern} ${e.primaryMuscles.join(" ")} ${e.secondaryMuscles.join(" ")}`.toLowerCase();
      return hay.includes(term);
    });
  }, [q, group, favoritesOnly, favorites, library]);

  const sections = new Map<string, typeof filtered>();
  for (const exercise of [...filtered]
    .sort((a, b) => a.name.localeCompare(b.name))
    .slice(0, limit)) {
    const muscle = exercise.gymMane?.muscle ?? exercise.primaryMuscles[0] ?? exercise.pattern;
    const section = sections.get(muscle);
    if (section) section.push(exercise);
    else sections.set(muscle, [exercise]);
  }

  return (
    <MobileFrame withNav>
      <header className="mb-4">
        <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Library</p>
        <h1 className="mt-1 font-display text-3xl font-bold leading-tight">Exercises</h1>
      </header>

      <div className="glass mb-4 flex items-center gap-2 rounded-2xl px-3 py-2">
        <Search className="h-4 w-4 text-muted-foreground" />
        <input
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setLimit(72);
          }}
          placeholder="Search exercises"
          aria-label="Search exercises"
          className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
        />
        {q && (
          <button onClick={() => setQ("")} aria-label="Clear">
            <X className="h-4 w-4 text-muted-foreground" />
          </button>
        )}
      </div>

      <div className="mb-5 flex gap-2 overflow-x-auto no-scrollbar">
        <button
          type="button"
          aria-pressed={favoritesOnly}
          onClick={() => setFavoritesOnly(!favoritesOnly)}
          className={`glass inline-flex shrink-0 items-center gap-1 rounded-full px-3 py-1.5 text-xs ${favoritesOnly ? "text-[var(--cyan-glow)]" : "text-muted-foreground"}`}
        >
          <Star className="h-3.5 w-3.5" fill={favoritesOnly ? "currentColor" : "none"} />
          Favorites
        </button>
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

      {!favoritesOnly && (
        <div className="mb-4 flex items-center justify-between gap-2 text-sm">
          <label className="text-muted-foreground" htmlFor="exercise-catalog">
            Catalog
          </label>
          <select
            id="exercise-catalog"
            className="rounded-lg border border-border bg-background p-2"
            value={library}
            onChange={(event) => {
              setLibrary(event.target.value as typeof library);
              setLimit(72);
            }}
          >
            <option value="gym">GymMane</option>
            <option value="levelup">LevelUp Life</option>
            <option value="all">All exercises</option>
          </select>
          <span className="text-muted-foreground">{filtered.length} exercises</span>
        </div>
      )}
      {sections.size === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground">
          {favoritesOnly && favorites.length === 0
            ? "Star an exercise to find it here."
            : "No exercises match these filters."}
        </p>
      ) : (
        <div className="space-y-5">
          {[...sections.entries()]
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([muscle, exercises]) => (
              <section key={muscle}>
                <h2 className="mb-2 px-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {muscle.replaceAll("_", " ")} <span className="ml-1">{exercises.length}</span>
                </h2>
                <ul className="glass divide-y divide-border overflow-hidden rounded-3xl">
                  {exercises.map((exercise) => (
                    <li key={exercise.id}>
                      <ExerciseCard
                        ex={exercise}
                        favorite={favorites.includes(exercise.id)}
                        onToggleFavorite={() => toggleFavoriteExercise(exercise.id)}
                      />
                    </li>
                  ))}
                </ul>
              </section>
            ))}
        </div>
      )}
      {filtered.length > limit && (
        <button className="gym-pill mt-5 w-full" onClick={() => setLimit(limit + 72)}>
          Show more exercises
        </button>
      )}
    </MobileFrame>
  );
}
