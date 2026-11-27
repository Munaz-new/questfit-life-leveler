import { useState } from "react";
import { format, parseISO } from "date-fns";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/leveluplife/Shell";
import { exerciseById } from "@/lib/leveluplife/exercises/library";
import type { SummaryState } from "@/lib/leveluplife/types";

const PAGE_SIZE = 10;

function downloadCsv(rows: (string | number)[][], filename: string) {
  const csv = rows
    .map((row) =>
      row
        .map((cell) => {
          const value = String(cell);
          const safe =
            typeof cell === "string" && /^[\s]*[=+@-]|^[\t\r\n]/.test(value) ? "'" + value : value;
          return `"${safe.replaceAll('"', '""')}"`;
        })
        .join(","),
    )
    .join("\r\n");
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function exportWorkouts(sessions: SummaryState[]) {
  const rows = [
    [
      "Date",
      "Workout",
      "Status",
      "Duration (seconds)",
      "Exercises completed",
      "Exercises planned",
      "XP",
    ],
    ...sessions.map((session) => [
      session.date,
      session.protocolName,
      session.partial ? "Partial" : "Completed",
      session.durationSec,
      session.completedMoves,
      session.totalMoves,
      session.xpEarned,
    ]),
  ];
  downloadCsv(rows, "levelup-workouts.csv");
}

function exportSets(sessions: SummaryState[]) {
  downloadCsv(
    [
      ["Date", "Workout", "Exercise", "Set", "Reps", "Load (kg)"],
      ...sessions.flatMap((session) => {
        const counts = new Map<string, number>();
        return (session.loggedSets ?? []).map((set) => {
          const number = (counts.get(set.exerciseId) ?? 0) + 1;
          counts.set(set.exerciseId, number);
          return [
            session.date,
            session.protocolName,
            exerciseById(set.exerciseId)?.name ?? set.exerciseId,
            number,
            set.reps ?? "",
            set.weightKg ?? "",
          ];
        });
      }),
    ],
    "levelup-sets.csv",
  );
}

export function WorkoutHistory({ sessions }: { sessions: SummaryState[] }) {
  const [limit, setLimit] = useState(PAGE_SIZE);

  return (
    <GlassCard className="mb-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-base font-semibold">Workout history</h2>
        {sessions.length > 0 && (
          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant="outline" onClick={() => exportWorkouts(sessions)}>
              <Download className="h-4 w-4" />
              Export CSV
            </Button>
            {sessions.some(({ loggedSets }) => loggedSets?.length) && (
              <Button size="sm" variant="outline" onClick={() => exportSets(sessions)}>
                <Download className="h-4 w-4" /> Export sets
              </Button>
            )}
          </div>
        )}
      </div>
      {sessions.length === 0 ? (
        <p className="mt-2 text-sm text-muted-foreground">
          Your workouts will appear here after you finish a session.
        </p>
      ) : (
        <ol className="mt-2 divide-y divide-border">
          {sessions.slice(0, limit).map((session, index) => (
            <li
              key={sessions.length - index}
              className="flex items-start justify-between gap-3 py-3"
            >
              <div className="min-w-0">
                <p className="break-words text-sm font-medium">{session.protocolName}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  <time dateTime={session.date}>
                    {format(parseISO(session.date), "MMM d, yyyy")}
                  </time>
                  {" · "}
                  {session.completedMoves}/{session.totalMoves} exercises
                  {" · "}
                  {session.partial ? "Partial" : "Completed"}
                </p>
              </div>
              <p className="shrink-0 text-sm font-semibold">{session.xpEarned} XP</p>
            </li>
          ))}
        </ol>
      )}
      {limit < sessions.length && (
        <Button variant="ghost" className="mt-2 w-full" onClick={() => setLimit(limit + PAGE_SIZE)}>
          Show more workouts
        </Button>
      )}
    </GlassCard>
  );
}
