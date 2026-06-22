import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { EXERCISES } from "@/lib/leveluplife/exercises/library";
import { ExerciseAsset } from "@/components/leveluplife/exercises/ExerciseAsset";
import {
  getDemo,
  imageCount,
  qualityScore,
} from "@/lib/leveluplife/assets/assetManager";
import { PROVIDERS } from "@/lib/leveluplife/assets/providers";

export const Route = createFileRoute("/dev/asset-dashboard")({
  head: () => ({ meta: [{ title: "Asset Dashboard — LevelUp Life (dev)" }] }),
  component: AssetDashboard,
});

function AssetDashboard() {
  const [filter, setFilter] = useState<"all" | "incomplete">("all");

  const rows = useMemo(() => {
    return EXERCISES.map((ex) => {
      const demo = getDemo(ex.id);
      return {
        ex,
        demo,
        count: imageCount(ex.id),
        score: qualityScore(ex.id),
      };
    }).filter((r) => (filter === "incomplete" ? r.count === 0 : true));
  }, [filter]);

  const avg = Math.round(
    EXERCISES.reduce((s, e) => s + qualityScore(e.id), 0) / Math.max(1, EXERCISES.length),
  );
  const withMedia = EXERCISES.filter((e) => imageCount(e.id) > 0).length;

  return (
    <div className="min-h-dvh bg-background p-6 text-foreground">
      <div className="mx-auto max-w-6xl">
        <header className="mb-6">
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Developer tool</p>
          <h1 className="font-display text-3xl font-bold">Exercise Asset Dashboard</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {EXERCISES.length} exercises · {withMedia} with media · avg quality {avg}/100 ·{" "}
            {PROVIDERS.map((p) => p.label).join(", ")}
          </p>
          <p className="mt-2 text-xs text-muted-foreground">
            Run <code className="rounded bg-white/10 px-1.5 py-0.5">bun scripts/import-exercise-assets.ts</code> to
            populate assets. Unlinked dev route.
          </p>
        </header>

        <div className="mb-4 flex gap-2 text-sm">
          {(["all", "incomplete"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-full px-3 py-1.5 capitalize transition ${
                filter === f ? "bg-[var(--cyan-glow)]/20 text-[var(--cyan-glow)]" : "bg-white/8"
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        <div className="overflow-x-auto rounded-xl border border-white/10">
          <table className="w-full text-left text-sm">
            <thead className="bg-white/5 text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="p-3">Preview</th>
                <th className="p-3">Exercise</th>
                <th className="p-3">Images</th>
                <th className="p-3">License / Source</th>
                <th className="p-3">Updated</th>
                <th className="p-3">Quality</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(({ ex, demo, count, score }) => {
                const prov = demo.thumbnail ?? demo.shared?.[0] ?? demo.male?.[0] ?? demo.female?.[0];
                return (
                  <tr key={ex.id} className="border-t border-white/8">
                    <td className="p-3">
                      <div className="h-12 w-12 overflow-hidden rounded-lg text-[var(--cyan-glow)]">
                        <ExerciseAsset id={ex.id} />
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="font-medium">{ex.name}</div>
                      <div className="text-xs text-muted-foreground">{ex.id}</div>
                    </td>
                    <td className="p-3 tabular-nums">{count}</td>
                    <td className="p-3 text-xs text-muted-foreground">
                      {prov ? `${prov.license} · ${prov.source}` : "—"}
                    </td>
                    <td className="p-3 text-xs text-muted-foreground">
                      {prov?.updatedAt ? prov.updatedAt.slice(0, 10) : "—"}
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-16 overflow-hidden rounded-full bg-white/10">
                          <div
                            className="h-full bg-[var(--cyan-glow)]"
                            style={{ width: `${score}%` }}
                          />
                        </div>
                        <span className="text-xs tabular-nums">{score}</span>
                      </div>
                      {count === 0 && (
                        <div className="mt-1 text-[10px] text-[var(--warn)]">no media imported</div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
