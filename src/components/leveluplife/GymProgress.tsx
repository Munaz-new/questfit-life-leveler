import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { subDays, format } from "date-fns";
import { NotebookPen } from "lucide-react";
import { GymBodyMap, gymMuscleGroups, gymMuscles, type GymMuscle } from "./GymBodyMap";
import { exerciseById } from "@/lib/leveluplife/exercises/library";
import type { SummaryState } from "@/lib/leveluplife/types";

const views = ["Week", "30D", "Recovery", "Untrained"] as const;
const colors = ["#484848", "#793f29", "#aa5d31", "#e68c41", "#ffc36f"];

export function GymProgress({ sessions }: { sessions: SummaryState[] }) {
  const [view, setView] = useState<(typeof views)[number]>("30D");
  const [selected, setSelected] = useState<GymMuscle>("trapezius");
  const allSets = sessions.flatMap((session) => session.loggedSets ?? []);
  const since = format(
    subDays(new Date(), view === "Week" ? 6 : view === "Recovery" ? 1 : 29),
    "yyyy-MM-dd",
  );
  const counts = new Map<string, number>();
  for (const session of sessions.filter(({ date }) => date >= since)) {
    for (const set of session.loggedSets ?? []) {
      const muscles = new Set(
        (exerciseById(set.exerciseId)?.primaryMuscles ?? [])
          .map((muscle) => gymMuscleGroups[muscle])
          .filter(Boolean),
      );
      for (const muscle of muscles) counts.set(muscle, (counts.get(muscle) ?? 0) + 1);
    }
  }
  const selectedCount = counts.get(selected) ?? 0;
  const label = selected === "lowerback" ? "Lower back" : selected;
  const stats = [
    ["Sessions", sessions.length, ""],
    ["Sets", allSets.length, ""],
    [
      "Time",
      Math.round(sessions.reduce((total, session) => total + session.durationSec, 0) / 60),
      "min",
    ],
    [
      "Lifted",
      Math.round(allSets.reduce((total, set) => total + (set.weightKg ?? 0) * (set.reps ?? 0), 0)),
      "kg",
    ],
  ] as const;

  return (
    <div className="mb-6 space-y-4">
      <div className="grid grid-cols-2 gap-3">
        {stats.map(([name, value, unit]) => (
          <div key={name} className="gym-panel p-4">
            <p className="text-xs font-bold uppercase tracking-[.18em] text-[#aaa]">{name}</p>
            <p className="mt-3 text-3xl font-bold">
              {value.toLocaleString()} <span className="text-sm text-[#aaa]">{unit}</span>
            </p>
          </div>
        ))}
      </div>
      <section className="gym-panel space-y-4 p-4">
        <h2 className="text-xs font-bold uppercase tracking-[.18em] text-[#aaa]">Muscle map</h2>
        <div className="flex rounded-full bg-[#292929] p-1 text-xs">
          {views.map((item) => (
            <button
              key={item}
              className="gym-pill flex-1 !px-2"
              aria-pressed={item === view}
              onClick={() => setView(item)}
            >
              {item}
            </button>
          ))}
        </div>
        <GymBodyMap
          selected={selected}
          onSelect={setSelected}
          muscleColor={(name) => {
            const count = counts.get(name) ?? 0;
            const shade =
              view === "Untrained" ? (count === 0 ? 3 : 0) : Math.min(4, Math.ceil(count / 3));
            return colors[shade];
          }}
        />
        <div className="flex items-center justify-between gap-2 text-xs text-[#aaa]">
          <span>{view === "Untrained" ? "Trained" : "Untouched"}</span>
          <span className="flex flex-1 gap-1">
            {colors.map((color) => (
              <span key={color} className="h-2 flex-1 rounded-sm" style={{ background: color }} />
            ))}
          </span>
          <span>{view === "Untrained" ? "Untrained" : "12+ sets"}</span>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <label className="capitalize">
            <span className="sr-only">Muscle</span>
            <select
              aria-label="Muscle"
              value={selected}
              className="rounded-full bg-[#292929] px-3 py-2 capitalize"
              onChange={(event) => setSelected(event.target.value as typeof selected)}
            >
              {gymMuscles.map((name) => (
                <option key={name} value={name}>
                  {name === "lowerback" ? "Lower back" : name}
                </option>
              ))}
            </select>
          </label>
          <p className="text-sm capitalize text-[#aaa]" aria-label={`${label} set count`}>
            {selectedCount} {selectedCount === 1 ? "set" : "sets"}
            {view === "Recovery" ? " in the last 2 days" : ""}
          </p>
        </div>
      </section>
      <Link to="/journal" className="gym-pill flex items-center gap-2">
        <NotebookPen size={18} /> Journal
      </Link>
    </div>
  );
}
