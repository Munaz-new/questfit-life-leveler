import type { SummaryState, WorkoutSet } from "../types";

export type LoadedSet = WorkoutSet & { reps: number; weightKg: number };

export function isLoadedSet(set: WorkoutSet): set is LoadedSet {
  return (
    typeof set.reps === "number" &&
    Number.isInteger(set.reps) &&
    set.reps > 0 &&
    typeof set.weightKg === "number" &&
    Number.isFinite(set.weightKg) &&
    set.weightKg > 0
  );
}

export function liftHistory(sessions: SummaryState[], exerciseId: string) {
  return sessions.flatMap((session) => {
    const sets = (session.loggedSets ?? []).filter((set) => set.exerciseId === exerciseId);
    return sets.length ? [{ date: session.date, name: session.protocolName, sets }] : [];
  });
}

export function repRecords(history: ReturnType<typeof liftHistory>) {
  const records = new Map<number, { set: LoadedSet; date: string }>();
  for (const { date, sets } of history) {
    for (const set of sets) {
      if (!isLoadedSet(set)) continue;
      const current = records.get(set.reps);
      if (!current || set.weightKg > current.set.weightKg) records.set(set.reps, { set, date });
    }
  }
  return [...records.values()].sort((a, b) => a.set.reps - b.set.reps);
}
