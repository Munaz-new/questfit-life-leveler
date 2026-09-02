import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type CSSProperties } from "react";
import { MobileFrame, GlassCard, SectionTitle } from "@/components/leveluplife/Shell";
import { useApp } from "@/lib/leveluplife/store";
import { Button } from "@/components/ui/button";
import { LogOut, RefreshCcw, Trophy, Sparkles, Check, Camera, ShieldCheck, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { lifestyleOptions, goalOptions } from "@/lib/leveluplife/data";
import { MODE_LIST, getMode } from "@/lib/leveluplife/modes";
import type { MotivationStyle } from "@/lib/leveluplife/types";
import {
  getCurrentUserId,
  getMirrorSettings,
  setMirrorEnabled,
  deleteAllMedia,
} from "@/lib/leveluplife/progressMirror";
import { toast } from "sonner";
import { useDemoGender } from "@/lib/leveluplife/assets/gender";

export const Route = createFileRoute("/_authenticated/profile")({
  head: () => ({ meta: [{ title: "Profile — LevelUp Life" }] }),
  component: Profile,
});

function Profile() {
  const navigate = useNavigate();
  const { state, resetAll, setMotivation, setDemoGenderDefault } = useApp();
  const [switching, setSwitching] = useState<MotivationStyle | null>(null);
  const [demoGender] = useDemoGender();
  const [mirrorUser, setMirrorUser] = useState<string | null>(null);
  const [mirrorEnabled, setMirrorEnabledState] = useState<boolean | null>(null);

  useEffect(() => {
    if (!state.onboarded) navigate({ to: "/auth" });
  }, [state.onboarded, navigate]);

  useEffect(() => {
    let active = true;
    (async () => {
      const uid = await getCurrentUserId();
      if (!active) return;
      setMirrorUser(uid);
      if (uid) {
        const s = await getMirrorSettings(uid);
        if (active) setMirrorEnabledState(s?.enabled ?? false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  async function toggleMirror() {
    if (!mirrorUser) {
      navigate({ to: "/auth" });
      return;
    }
    const next = !mirrorEnabled;
    setMirrorEnabledState(next);
    await setMirrorEnabled(mirrorUser, next);
    toast.success(next ? "Progress Mirror enabled" : "Progress Mirror disabled");
  }

  async function wipeMedia() {
    if (!mirrorUser) return;
    if (!confirm("Permanently delete ALL your progress photos and measurements? This cannot be undone.")) return;
    await deleteAllMedia(mirrorUser);
    toast.success("All progress media deleted");
  }


  const p = state.profile;
  if (!p) return null;

  const mode = getMode(p.motivation);
  const lex = mode.lexicon;
  const lifestyleLabel = lifestyleOptions.find((x) => x.id === p.lifestyle)?.label ?? p.lifestyle;

  async function signOut() {
    await supabase.auth.signOut();
    resetAll();
    navigate({ to: "/auth" });
  }

  function pickMode(id: MotivationStyle) {
    if (id === p?.motivation) return;
    setSwitching(id);
    // Brief delay so the user sees the chip animation before re-theme.
    setTimeout(() => {
      setMotivation(id);
      setSwitching(null);
    }, 220);
  }

  return (
    <MobileFrame withNav>
      <header className="mb-5">
        <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Profile</p>
        <h1 className="text-2xl font-bold">{p.displayName}</h1>
        <p className="mt-1 text-xs italic text-muted-foreground">“{mode.identity}”</p>
      </header>

      <GlassCard glow className="mb-5">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-primary shadow-glow">
              <Trophy className="h-7 w-7 text-[var(--primary-foreground)]" />
            </div>
            <span className="absolute -bottom-1 -right-1 rounded-full border-2 border-background bg-[var(--rare)] px-1.5 py-0.5 text-[10px] font-bold">
              {lex.levelShort(state.level)}
            </span>
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">{mode.label}</p>
            <p className="truncate text-xs text-muted-foreground">{lifestyleLabel} · {p.level}</p>
          </div>
        </div>
      </GlassCard>

      <SectionTitle hint="affects demos only">Workout Preferences</SectionTitle>
      <GlassCard className="mb-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-medium">Exercise demonstrator</p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Your default instructor. This only changes the demonstrations you see — your workout
              plan stays exactly the same.
            </p>
          </div>
          <div
            role="radiogroup"
            aria-label="Default exercise demonstrator"
            className="inline-flex shrink-0 rounded-full border border-white/10 bg-white/5 p-1"
          >
            {(["male", "female"] as const).map((g) => (
              <button
                key={g}
                role="radio"
                aria-checked={demoGender === g}
                onClick={() => {
                  setDemoGenderDefault(g);
                  toast.success(`${g[0].toUpperCase()}${g.slice(1)} demonstrator set as default`);
                }}
                className={`min-h-9 rounded-full px-4 text-xs font-semibold uppercase tracking-[0.14em] transition ${
                  demoGender === g
                    ? "bg-gradient-primary text-[var(--primary-foreground)] shadow-glow"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {g}
              </button>
            ))}
          </div>
        </div>
      </GlassCard>


      <SectionTitle hint="switch anytime">Motivation Mode</SectionTitle>
      <div className="mb-5 grid grid-cols-2 gap-2.5">
        {MODE_LIST.map((m) => {
          const active = p.motivation === m.id;
          const isLoading = switching === m.id;
          return (
            <button
              key={m.id}
              onClick={() => pickMode(m.id)}
              style={
                active
                  ? ({
                      backgroundImage: `linear-gradient(135deg, ${m.swatch[0]}, ${m.swatch[1]})`,
                      boxShadow: `0 0 30px -8px ${m.swatch[0]}80`,
                    } as CSSProperties)
                  : undefined
              }
              className={`relative overflow-hidden rounded-2xl border p-3 text-left transition ${
                active ? "border-transparent text-black" : "glass border-white/10 hover:border-white/20"
              } ${isLoading ? "opacity-70" : ""}`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xl">{m.emoji}</span>
                {active ? (
                  <Check className="h-4 w-4 text-black/70" />
                ) : (
                  <div className="flex gap-1">
                    {m.swatch.slice(0, 2).map((c) => (
                      <span key={c} className="h-2 w-2 rounded-full ring-1 ring-white/10" style={{ backgroundColor: c }} />
                    ))}
                  </div>
                )}
              </div>
              <p className="mt-2 text-sm font-semibold leading-tight">{m.label}</p>
              <p className={`mt-0.5 text-[10px] leading-snug ${active ? "text-black/70" : "text-muted-foreground"}`}>
                {m.shortTag}
              </p>
            </button>
          );
        })}
      </div>

      <SectionTitle>Lifestyle</SectionTitle>
      <GlassCard className="mb-5 space-y-2">
        <Row k="Lifestyle" v={lifestyleLabel} />
        <Row k="Wake / Sleep" v={`${p.wakeTime} → ${p.sleepTime}`} />
        <Row k="Sitting" v={`${p.sittingHours} h/day`} />
        <Row k="Energy / Stress" v={`${p.energy}/5 · ${p.stress}/5`} />
        <Row k="Equipment" v={p.equipment.join(", ")} />
      </GlassCard>

      <SectionTitle>Goals</SectionTitle>
      <div className="mb-5 flex flex-wrap gap-2">
        {p.goals.map((g) => {
          const label = goalOptions.find((x) => x.id === g)?.label ?? g;
          return (
            <span key={g} className="glass rounded-full border border-white/10 px-3 py-1.5 text-xs font-medium">
              {label}
            </span>
          );
        })}
      </div>

      <SectionTitle hint="private">Progress Mirror</SectionTitle>
      <GlassCard className="mb-5 space-y-1">
        <div className="mb-1 flex items-start gap-2 rounded-xl bg-white/5 px-3 py-2 text-[11px] text-muted-foreground">
          <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[var(--cyan-glow)]" />
          Your photos are private and visible only to you.
        </div>
        <SettingRow
          icon={<Camera className="h-4 w-4" />}
          label="Open Progress Mirror"
          hint="Timeline, photos, measurements"
          onClick={() => navigate({ to: "/progress-mirror" })}
        />
        <button
          onClick={toggleMirror}
          className="-mx-1 flex w-full items-center gap-3 rounded-xl px-1 py-2 text-left transition hover:bg-white/5"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5 text-[var(--cyan-glow)]">
            <Sparkles className="h-4 w-4" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium">Enable Progress Mirror</p>
            <p className="text-xs text-muted-foreground">
              {mirrorUser ? (mirrorEnabled ? "Enabled" : "Disabled") : "Sign in to enable"}
            </p>
          </div>
          <span
            className={`relative h-6 w-11 rounded-full transition ${mirrorEnabled && mirrorUser ? "bg-gradient-primary" : "bg-white/10"}`}
          >
            <span
              className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all ${mirrorEnabled && mirrorUser ? "left-[1.375rem]" : "left-0.5"}`}
            />
          </span>
        </button>
        {mirrorUser && (
          <SettingRow
            icon={<Trash2 className="h-4 w-4" />}
            label="Delete all my media"
            hint="Permanently remove photos & measurements"
            onClick={wipeMedia}
          />
        )}
      </GlassCard>


      <SectionTitle>Settings</SectionTitle>
      <GlassCard className="mb-5 space-y-1">
        <SettingRow icon={<Sparkles className="h-4 w-4" />} label="Recalibrate system" hint="Re-run onboarding" onClick={() => navigate({ to: "/onboarding" })} />
        <SettingRow icon={<RefreshCcw className="h-4 w-4" />} label="Reset all progress" onClick={() => { if (confirm("Wipe all local progress?")) resetAll(); }} />
      </GlassCard>

      <Button onClick={signOut} variant="outline" className="glass h-12 w-full rounded-2xl border-white/10">
        <LogOut className="mr-2 h-4 w-4" /> Sign out
      </Button>
    </MobileFrame>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-muted-foreground">{k}</span>
      <span className="font-medium">{v}</span>
    </div>
  );
}
function SettingRow({ icon, label, hint, onClick }: { icon: React.ReactNode; label: string; hint?: string; onClick?: () => void }) {
  return (
    <button onClick={onClick} className="-mx-1 flex w-full items-center gap-3 rounded-xl px-1 py-2 text-left transition hover:bg-white/5">
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5 text-[var(--cyan-glow)]">{icon}</div>
      <div className="flex-1">
        <p className="text-sm font-medium">{label}</p>
        {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
      </div>
    </button>
  );
}
