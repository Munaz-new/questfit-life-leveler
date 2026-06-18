import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, type CSSProperties } from "react";
import { MobileFrame, GlassCard } from "@/components/leveluplife/Shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronLeft, ChevronRight, Sparkles, Flame, ShieldCheck, Camera } from "lucide-react";
import { useApp } from "@/lib/leveluplife/store";
import {
  equipmentOptions,
  goalOptions,
  lifestyleOptions,
} from "@/lib/leveluplife/data";
import { MODE_LIST, getMode } from "@/lib/leveluplife/modes";
import { setOnboardingOptIn } from "@/lib/leveluplife/progressMirror";
import type { UserProfile } from "@/lib/leveluplife/types";

export const Route = createFileRoute("/onboarding")({
  head: () => ({ meta: [{ title: "Onboarding — LevelUp Life" }] }),
  component: Onboarding,
});

const TOTAL = 9;

function Onboarding() {
  const navigate = useNavigate();
  const { setProfile } = useApp();
  const [step, setStep] = useState(0);
  const [p, setP] = useState<UserProfile>({
    displayName: "Hunter",
    isGuest: true,
    ageRange: "25-34",
    height: "175",
    weight: "72",
    lifestyle: "developer",
    wakeTime: "07:00",
    sleepTime: "23:30",
    sittingHours: 6,
    energy: 3,
    stress: 3,
    equipment: ["none"],
    goals: ["consistency", "posture"],
    level: "beginner",
    motivation: "hunter",
  });

  function update<K extends keyof UserProfile>(k: K, v: UserProfile[K]) {
    setP((s) => ({ ...s, [k]: v }));
  }

  function toggleArray<K extends "equipment" | "goals">(k: K, v: string) {
    setP((s) => {
      const arr = s[k] as string[];
      const has = arr.includes(v);
      return { ...s, [k]: has ? arr.filter((x) => x !== v) : [...arr, v] } as UserProfile;
    });
  }

  function finish() {
    setProfile(p);
    navigate({ to: "/home" });
  }

  const pct = ((step + 1) / TOTAL) * 100;

  return (
    <MobileFrame>
      <div className="flex min-h-[88vh] flex-col">
        <div className="mb-5 flex items-center gap-3">
          {step > 0 ? (
            <button onClick={() => setStep(step - 1)} className="glass flex h-9 w-9 items-center justify-center rounded-xl">
              <ChevronLeft className="h-4 w-4" />
            </button>
          ) : (
            <div className="h-9 w-9" />
          )}
          <div className="flex-1">
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/5">
              <div className="h-full bg-gradient-primary transition-[width] duration-500" style={{ width: `${pct}%` }} />
            </div>
            <div className="mt-1 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
              Step {step + 1} / {TOTAL}
            </div>
          </div>
        </div>

        <div key={step} className="animate-float-up flex-1">
          {step === 0 && (
            <Step title="What should we call you?" sub="Your hunter name. Change it anytime.">
              <Input
                value={p.displayName}
                onChange={(e) => update("displayName", e.target.value)}
                className="h-12 rounded-xl border-white/10 bg-white/5 text-lg"
              />
            </Step>
          )}

          {step === 1 && (
            <Step title="The basics" sub="Used to calibrate intensity. Nothing is shared.">
              <Row>
                <Field label="Age range">
                  <Select value={p.ageRange} onChange={(v) => update("ageRange", v)} options={["13-17","18-24","25-34","35-44","45-54","55+"]} />
                </Field>
              </Row>
              <Row>
                <Field label="Height (cm)">
                  <Input className="h-11 rounded-xl border-white/10 bg-white/5" value={p.height} onChange={(e) => update("height", e.target.value)} />
                </Field>
                <Field label="Weight (kg)">
                  <Input className="h-11 rounded-xl border-white/10 bg-white/5" value={p.weight} onChange={(e) => update("weight", e.target.value)} />
                </Field>
              </Row>
            </Step>
          )}

          {step === 2 && (
            <Step title="What's your lifestyle?" sub="Workouts adapt to how you actually live.">
              <Grid>
                {lifestyleOptions.map((o) => (
                  <Chip key={o.id} active={p.lifestyle === o.id} onClick={() => update("lifestyle", o.id)}>
                    <span className="text-xl">{o.emoji}</span>
                    <span>{o.label}</span>
                  </Chip>
                ))}
              </Grid>
            </Step>
          )}

          {step === 3 && (
            <Step title="Daily routine" sub="When the day starts, and how taxing it feels.">
              <Row>
                <Field label="Wake">
                  <Input type="time" value={p.wakeTime} onChange={(e) => update("wakeTime", e.target.value)} className="h-11 rounded-xl border-white/10 bg-white/5" />
                </Field>
                <Field label="Sleep">
                  <Input type="time" value={p.sleepTime} onChange={(e) => update("sleepTime", e.target.value)} className="h-11 rounded-xl border-white/10 bg-white/5" />
                </Field>
              </Row>
              <Slider label={`Sitting hours: ${p.sittingHours}h`} value={p.sittingHours} min={0} max={14} onChange={(v) => update("sittingHours", v)} />
              <Slider label={`Energy: ${"⚡".repeat(p.energy)}`} value={p.energy} min={1} max={5} onChange={(v) => update("energy", v)} />
              <Slider label={`Stress: ${"🔥".repeat(p.stress)}`} value={p.stress} min={1} max={5} onChange={(v) => update("stress", v)} />
            </Step>
          )}

          {step === 4 && (
            <Step title="Equipment" sub="Multi-select. We adapt the moves to what you own.">
              <Grid>
                {equipmentOptions.map((o) => (
                  <Chip key={o.id} active={p.equipment.includes(o.id)} onClick={() => toggleArray("equipment", o.id)}>
                    <span>{o.label}</span>
                  </Chip>
                ))}
              </Grid>
            </Step>
          )}

          {step === 5 && (
            <Step title="Goals" sub="Pick a few. Quests bias toward these.">
              <Grid>
                {goalOptions.map((o) => (
                  <Chip key={o.id} active={p.goals.includes(o.id)} onClick={() => toggleArray("goals", o.id)}>
                    <span>{o.label}</span>
                  </Chip>
                ))}
              </Grid>
            </Step>
          )}

          {step === 6 && (
            <Step title="Fitness level" sub="We start where you are and ramp safely.">
              <Grid cols={1}>
                {(["beginner","intermediate","advanced"] as const).map((lvl) => (
                  <Chip key={lvl} active={p.level === lvl} onClick={() => update("level", lvl)}>
                    <span className="capitalize">{lvl}</span>
                  </Chip>
                ))}
              </Grid>
            </Step>
          )}

          {step === 7 && (
            <Step title="Pick your motivation mode" sub="Same workouts — radically different feel. Preview each before committing.">
              <ModePreview motivation={p.motivation} />
              <div className="grid grid-cols-2 gap-2.5">
                {MODE_LIST.map((m) => {
                  const active = p.motivation === m.id;
                  return (
                    <button
                      key={m.id}
                      onClick={() => update("motivation", m.id)}
                      style={
                        active
                          ? ({
                              backgroundImage: `linear-gradient(135deg, ${m.swatch[0]}, ${m.swatch[1]})`,
                              boxShadow: `0 0 30px -8px ${m.swatch[0]}80`,
                            } as CSSProperties)
                          : undefined
                      }
                      className={`group relative overflow-hidden rounded-2xl border p-3 text-left transition ${
                        active
                          ? "border-transparent text-black"
                          : "glass border-white/10 hover:border-white/20"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xl">{m.emoji}</span>
                        <div className="flex gap-1">
                          {m.swatch.slice(0, 2).map((c) => (
                            <span key={c} className="h-2.5 w-2.5 rounded-full ring-1 ring-white/20" style={{ backgroundColor: c }} />
                          ))}
                        </div>
                      </div>
                      <p className="mt-2 text-sm font-semibold leading-tight">{m.label}</p>
                      <p className={`mt-0.5 text-[11px] leading-snug ${active ? "text-black/70" : "text-muted-foreground"}`}>
                        “{m.identity}”
                      </p>
                    </button>
                  );
                })}
              </div>
            </Step>
          )}
        </div>

        <div className="pt-4">
          {step < TOTAL - 1 ? (
            <Button onClick={() => setStep(step + 1)} className="h-12 w-full rounded-2xl bg-gradient-primary text-base font-semibold text-[var(--primary-foreground)] shadow-glow">
              Continue <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          ) : (
            <Button onClick={finish} className="h-12 w-full rounded-2xl bg-gradient-primary text-base font-semibold text-[var(--primary-foreground)] shadow-glow">
              <Sparkles className="mr-2 h-4 w-4" /> Generate my system
            </Button>
          )}
        </div>
      </div>
    </MobileFrame>
  );
}

function Step({ title, sub, children }: { title: string; sub: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="text-2xl font-bold">{title}</h2>
      <p className="mt-1 text-sm text-muted-foreground">{sub}</p>
      <div className="mt-6 space-y-3">{children}</div>
    </div>
  );
}

function Row({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-2 gap-3">{children}</div>;
}
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-[11px] uppercase tracking-wider text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}
function Grid({ children, cols = 2 }: { children: React.ReactNode; cols?: 1 | 2 }) {
  return <div className={`grid gap-2 ${cols === 1 ? "grid-cols-1" : "grid-cols-2"}`}>{children}</div>;
}
function Chip({ children, active, onClick }: { children: React.ReactNode; active?: boolean; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center justify-center gap-2 rounded-2xl border px-3 py-3 text-sm font-medium transition ${
        active
          ? "border-transparent bg-gradient-primary text-[var(--primary-foreground)] shadow-glow"
          : "glass border-white/10 text-foreground hover:border-white/20"
      }`}
    >
      {children}
    </button>
  );
}
function Slider({ label, value, min, max, onChange }: { label: string; value: number; min: number; max: number; onChange: (v: number) => void }) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs text-muted-foreground">{label}</span>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-2 w-full appearance-none rounded-full bg-white/5 accent-[oklch(0.82_0.18_215)]"
      />
    </label>
  );
}
function Select({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: string[] }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="h-11 w-full rounded-xl border border-white/10 bg-white/5 px-3 text-sm"
    >
      {options.map((o) => (
        <option key={o} value={o} className="bg-background">{o}</option>
      ))}
    </select>
  );
}

/**
 * Live preview of the selected mode — re-themes via the same CSS variable
 * overrides the live app uses, so users see the actual feel before commit.
 */
function ModePreview({ motivation }: { motivation: UserProfile["motivation"] }) {
  const m = getMode(motivation);
  const lex = m.lexicon;
  return (
    <div
      key={m.id}
      data-aesthetic={m.aesthetic}
      style={{ ...(m.vars as CSSProperties), backgroundImage: "var(--gradient-bg)" }}
      className="animate-float-up mb-3 rounded-2xl border border-white/10 p-4"
    >
      <div className="flex items-center justify-between">
        <span className="mode-pill">{m.emoji} {m.shortTag}</span>
        <span className="text-[10px] uppercase tracking-wider text-muted-foreground">live preview</span>
      </div>
      <p className="mt-3 font-display text-lg font-bold leading-tight">
        <span className="text-gradient">{lex.levelShort(1)}</span>
        <span className="text-muted-foreground"> · {lex.dailyQuests}</span>
      </p>
      <p className="mt-0.5 text-xs italic text-muted-foreground">“{m.identity}”</p>

      <div className="mt-3 flex items-center gap-2 rounded-xl bg-white/5 p-2.5">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-primary shadow-glow">
          <Flame className="h-3.5 w-3.5 text-[var(--primary-foreground)]" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[11px] font-semibold">{lex.workout} · posture reset</p>
          <p className="truncate text-[10px] text-muted-foreground">+15 {lex.xp} · {lex.adaptivePrefix}</p>
        </div>
        <span className="rounded-full bg-gradient-primary px-2 py-0.5 text-[10px] font-bold text-[var(--primary-foreground)]">
          {lex.ctaPrimary}
        </span>
      </div>
    </div>
  );
}
