import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";


import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useApp } from "@/lib/leveluplife/store";
import { accountSignInAvailable, setGuestMode } from "@/lib/leveluplife/guest";
import { Activity, ArrowRight, ChevronLeft, ChevronRight, Mail } from "lucide-react";

export const Route = createFileRoute("/auth")({
  head: () => ({ meta: [{ title: "Training studio — QuestFit" }] }),
  component: Auth,
});

const movements = [
  { name: "Deadlift", slug: "deadlift", equipment: "Barbell", pattern: "Hip hinge" },
  { name: "Goblet squat", slug: "goblet-squat", equipment: "Dumbbell", pattern: "Squat" },
  { name: "Bench press", slug: "bench-press", equipment: "Barbell", pattern: "Horizontal push" },
];

function Auth() {
  const navigate = useNavigate();
  const { state } = useApp();
  const [mode, setMode] = useState<"intro" | "email">("intro");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const [index, setIndex] = useState(0);
  const movement = movements[index];

  const next = () => navigate({ to: state.onboarded ? "/home" : "/onboarding" });

  useEffect(() => {
    if (!accountSignInAvailable) return;
    let active = true;
    const destination = state.onboarded ? "/home" : "/onboarding";
    supabase.auth
      .getSession()
      .then(({ data }) => {
        if (active && data.session) {
          setGuestMode(false);
          navigate({ to: destination, replace: true });
        }
      })
      .catch(() => toast.error("Could not restore your session"));
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" && session) {
        setGuestMode(false);
        navigate({ to: destination, replace: true });
      }
    });
    return () => {
      active = false;
      data.subscription.unsubscribe();
    };
  }, [navigate, state.onboarded]);

  async function google() {
    setLoading(true);
    try {
      const r = await supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo: `${window.location.origin}/auth` } });
      if (r.error) toast.error("Google sign-in failed");
    } catch {
      toast.error("Google sign-in failed");
    } finally {
      setLoading(false);
    }
  }

  async function emailSubmit(create: boolean) {
    if (!email || !password) return toast.error("Email + password required");
    setLoading(true);
    try {
      const { data, error } = await (create
        ? supabase.auth.signUp({
            email,
            password,
            options: { emailRedirectTo: new URL("/auth", window.location.origin).href },
          })
        : supabase.auth.signInWithPassword({ email, password }));
      if (error) return toast.error(error.message);
      if (!data.session) toast.success("Check your email to confirm your account.");
    } catch {
      toast.error("Could not complete email sign-in. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="studio">
      <header className="studio-header"><span className="studio-brand"><Activity aria-hidden="true" /> QuestFit</span><span>Training studio</span></header>
      <div className="studio-layout">
        <section className="studio-intro">
          <h1>Your personal<br /><em>training studio.</em></h1>
          <p>Build a routine, learn each movement, and track your progress with every session.</p>
          <div className="studio-actions">
          {mode === "intro" ? (
            <>
              {accountSignInAvailable && (
                <>
                  <Button
                    onClick={google}
                    disabled={loading}
                    className="h-12 w-full rounded-2xl bg-gradient-primary text-base font-semibold text-[var(--primary-foreground)] shadow-glow hover:opacity-95"
                  >
                    Continue with Google <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    disabled={loading}
                    onClick={() => setMode("email")}
                    className="glass h-12 w-full rounded-2xl border-white/10 text-base font-medium hover:bg-white/5"
                  >
                    <Mail className="mr-2 h-4 w-4" /> Continue with email
                  </Button>
                </>
              )}
              <Button
                variant={accountSignInAvailable ? "ghost" : "default"}
                disabled={loading}
                onClick={() => {
                  setGuestMode(true);
                  next();
                }}
                className="h-12 w-full rounded-2xl text-base"
              >
                Continue as guest <ArrowRight aria-hidden="true" />
              </Button>
            </>
          ) : (
            <div className="glass space-y-3 rounded-2xl p-4">
              <Input aria-label="Email address" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@email.com" type="email" className="h-11 rounded-xl border-white/10 bg-white/5" />
              <Input aria-label="Password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" type="password" className="h-11 rounded-xl border-white/10 bg-white/5" />
              <div className="grid grid-cols-2 gap-2">
                <Button onClick={() => emailSubmit(false)} disabled={loading} className="h-11 rounded-xl bg-gradient-primary font-semibold text-[var(--primary-foreground)]">Sign in</Button>
                <Button onClick={() => emailSubmit(true)} disabled={loading} variant="outline" className="h-11 rounded-xl border-white/10 bg-white/5">Create</Button>
              </div>
              <button onClick={() => setMode("intro")} className="w-full pt-1 text-xs text-muted-foreground hover:text-foreground">← back</button>
            </div>
          )}
          </div>
          <small>Guest progress is saved on this device.</small>
        </section>
        <section className="movement-card" aria-label="Exercise library preview">
          <header><span>Movement library</span><span>{String(index + 1).padStart(2, "0")} / 03</span></header>
          <div className="movement-plate"><img src={`/gymmane/exercises/${movement.slug}.svg#still`} alt={movement.name + " exercise illustration"} /></div>
          <footer><div aria-live="polite"><p>{movement.equipment} · {movement.pattern}</p><h2>{movement.name}</h2></div>
          <div className="movement-controls">{[-1, 1].map(delta => <button key={delta} type="button" aria-label={delta < 0 ? "Previous exercise" : "Next exercise"} onClick={() => setIndex((i) => (i + delta + movements.length) % movements.length)}>{delta < 0 ? <ChevronLeft /> : <ChevronRight />}</button>)}</div></footer>
        </section>
      </div>
    </main>
  );
}
