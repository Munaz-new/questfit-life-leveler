import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Check, Minus } from "lucide-react";
import { EXERCISES } from "@/lib/leveluplife/exercises/library";
import { ExerciseAsset } from "@/components/leveluplife/exercises/ExerciseAsset";
import {
  coverage,
  getDemo,
  imageCount,
  qualityScore,
} from "@/lib/leveluplife/assets/assetManager";
import type { AssetRef } from "@/lib/leveluplife/assets/types";
import { PROVIDERS } from "@/lib/leveluplife/assets/providers";

export const Route = createFileRoute("/dev/asset-dashboard")({
  head: () => ({ meta: [{ title: "Asset Dashboard — LevelUp Life (dev)" }] }),
  component: AssetDashboard,
});

type Filter = "all" | "missing-female" | "missing-male";

function AssetDashboard() {
  const [filter, setFilter] = useState<Filter>("all");

  const rows = useMemo(() => {
    return EXERCISES.map((ex) => {
      const demo = getDemo(ex.id);
      const cov = coverage(ex.id);
      return { ex, demo, cov, count: imageCount(ex.id), score: qualityScore(ex.id) };
    }).filter((r) =>
      filter === "missing-female"
        ? !r.cov.female
        : filter === "missing-male"
        ? !r.cov.male
        : true,
    );
  }, [filter]);

  const total = EXERCISES.length;
  const maleCount = EXERCISES.filter((e) => coverage(e.id).male).length;
  const femaleCount = EXERCISES.filter((e) => coverage(e.id).female).length;
  const bothCount = EXERCISES.filter((e) => {
    const c = coverage(e.id);
    return c.male && c.female;
  }).length;
  const anyCount = EXERCISES.filter((e) => {
    const c = coverage(e.id);
    return c.male || c.female;
  }).length;
  const pct = (n: number) => Math.round((n / Math.max(1, total)) * 100);

  return (
    <div className="min-h-dvh bg-background p-6 text-foreground">
      <div className="mx-auto max-w-6xl">
        <header className="mb-6">
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Developer tool</p>
          <h1 className="font-display text-3xl font-bold">Exercise Asset Dashboard</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {total} exercises · {PROVIDERS.map((p) => p.label).join(", ")}
          </p>
          <p className="mt-2 text-xs text-muted-foreground">
            Run <code className="rounded bg-white/10 px-1.5 py-0.5">bun scripts/import-exercise-assets.ts</code> to
            populate assets. Unlinked dev/admin route — not in user navigation.
          </p>
        </header>

        {/* Coverage summary */}
        <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Stat label="Overall coverage" value={`${pct(anyCount)}%`} sub={`${anyCount}/${total} with any media`} />
          <Stat label="Male coverage" value={`${pct(maleCount)}%`} sub={`${maleCount}/${total}`} />
          <Stat label="Female coverage" value={`${pct(femaleCount)}%`} sub={`${femaleCount}/${total}`} />
          <Stat label="Both genders" value={`${pct(bothCount)}%`} sub={`${bothCount}/${total}`} />
        </div>
        <p className="mb-4 text-xs text-muted-foreground">
          Missing female: <span className="text-[var(--warn)]">{total - femaleCount}</span> ·{" "}
          Missing male: <span className="text-[var(--warn)]">{total - maleCount}</span>
        </p>

        <div className="mb-4 flex flex-wrap gap-2 text-sm">
          {(["all", "missing-female", "missing-male"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-full px-3 py-1.5 capitalize transition ${
                filter === f ? "bg-[var(--cyan-glow)]/20 text-[var(--cyan-glow)]" : "bg-white/8"
              }`}
            >
              {f.replace("-", " ")}
            </button>
          ))}
        </div>

        <div className="overflow-x-auto rounded-xl border border-white/10">
          <table className="w-full text-left text-sm">
            <thead className="bg-white/5 text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="p-3">Preview</th>
                <th className="p-3">Exercise</th>
                <th className="p-3">Male</th>
                <th className="p-3">Female</th>
                <th className="p-3">Images</th>
                <th className="p-3">Formats</th>
                <th className="p-3">License / Source</th>
                <th className="p-3">Import status</th>
                <th className="p-3">Coverage</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(({ ex, demo, cov, count, score }) => {
                const refs = collectRefs(demo);
                const prov = refs[0];
                const formats = Array.from(new Set(refs.map((a) => a.format)));
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
                    <td className="p-3"><Cov ok={cov.male} /></td>
                    <td className="p-3"><Cov ok={cov.female} /></td>
                    <td className="p-3 tabular-nums">{count}</td>
                    <td className="p-3 text-xs uppercase text-muted-foreground">
                      {formats.length ? formats.join(", ") : "—"}
                    </td>
                    <td className="p-3 text-xs text-muted-foreground">
                      {prov ? `${prov.license} · ${prov.source}` : "—"}
                    </td>
                    <td className="p-3 text-xs">
                      {cov.male && cov.female ? (
                        <span className="text-[var(--success)]">Complete</span>
                      ) : cov.male || cov.female ? (
                        <span className="text-[var(--warn)]">Partial</span>
                      ) : (
                        <span className="text-muted-foreground">Not imported</span>
                      )}
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

function collectRefs(demo: ReturnType<typeof getDemo>): AssetRef[] {
  const refs: AssetRef[] = [];
  const add = (ref?: AssetRef) => {
    if (ref) refs.push(ref);
  };
  const addGallery = (gallery?: AssetRef[]) => gallery?.forEach(add);
  add(demo.thumbnail);
  addGallery(demo.shared);
  addGallery(demo.male);
  addGallery(demo.female);
  add(demo.maleTier?.thumbnail);
  add(demo.maleTier?.hero);
  addGallery(demo.maleTier?.gallery);
  add(demo.maleTier?.animation);
  add(demo.maleTier?.video);
  add(demo.femaleTier?.thumbnail);
  add(demo.femaleTier?.hero);
  addGallery(demo.femaleTier?.gallery);
  add(demo.femaleTier?.animation);
  add(demo.femaleTier?.video);
  return refs;
}

function Stat({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-3">
      <p className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl font-bold tabular-nums">{value}</p>
      <p className="text-[11px] text-muted-foreground">{sub}</p>
    </div>
  );
}

function Cov({ ok }: { ok: boolean }) {
  return ok ? (
    <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[var(--success)]/20 text-[var(--success)]">
      <Check className="h-3.5 w-3.5" />
    </span>
  ) : (
    <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-white/8 text-muted-foreground">
      <Minus className="h-3.5 w-3.5" />
    </span>
  );
}
