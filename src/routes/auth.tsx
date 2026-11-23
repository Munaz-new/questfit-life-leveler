import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Logo } from "@/components/leveluplife/Logo";
import { MobileFrame } from "@/components/leveluplife/Shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useApp } from "@/lib/leveluplife/store";
import { ArrowRight, Mail } from "lucide-react";

export const Route = createFileRoute("/auth")({
  head: () => ({ meta: [{ title: "Sign in — LevelUp Life" }] }),
  component: Auth,
});

function Auth() {
  const navigate = useNavigate();
  const { state } = useApp();
  const [mode, setMode] = useState<"intro" | "email">("intro");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const next = () => navigate({ to: state.onboarded ? "/home" : "/onboarding" });

  useEffect(() => {
    // Guest mode stays available before a backend is configured.
    if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY) return;
    let active = true;
    const destination = state.onboarded ? "/home" : "/onboarding";
    supabase.auth.getSession().then(({ data }) => {
      if (active && data.session) navigate({ to: destination, replace: true });
    }).catch(() => toast.error("Could not restore your session"));
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" && session) navigate({ to: destination, replace: true });
    });
    return () => { active = false; data.subscription.unsubscribe(); };
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
    const fn = create
      ? supabase.auth.signUp({ email, password, options: { emailRedirectTo: window.location.origin } })
      : supabase.auth.signInWithPassword({ email, password });
    const { error } = await fn;
    setLoading(false);
    if (error) return toast.error(error.message);
    next();
  }

  return (
    <MobileFrame>
      <div className="flex min-h-[88vh] flex-col">
        <div className="flex flex-1 flex-col items-center justify-center gap-6 text-center">
          <Logo size={88} />
          <div className="animate-float-up">
            <h1 className="text-3xl font-bold">Welcome, hunter.</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Sign in to sync your level — or jump in as a guest.
            </p>
          </div>
        </div>

        <div className="space-y-3 pb-4">
          {mode === "intro" ? (
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
                onClick={() => setMode("email")}
                className="glass h-12 w-full rounded-2xl border-white/10 text-base font-medium hover:bg-white/5"
              >
                <Mail className="mr-2 h-4 w-4" /> Continue with email
              </Button>
              <button
                onClick={next}
                className="block w-full pt-2 text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
              >
                Continue as guest
              </button>
            </>
          ) : (
            <div className="glass space-y-3 rounded-2xl p-4">
              <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@email.com" type="email" className="h-11 rounded-xl border-white/10 bg-white/5" />
              <Input value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" type="password" className="h-11 rounded-xl border-white/10 bg-white/5" />
              <div className="grid grid-cols-2 gap-2">
                <Button onClick={() => emailSubmit(false)} disabled={loading} className="h-11 rounded-xl bg-gradient-primary font-semibold text-[var(--primary-foreground)]">Sign in</Button>
                <Button onClick={() => emailSubmit(true)} disabled={loading} variant="outline" className="h-11 rounded-xl border-white/10 bg-white/5">Create</Button>
              </div>
              <button onClick={() => setMode("intro")} className="w-full pt-1 text-xs text-muted-foreground hover:text-foreground">← back</button>
            </div>
          )}
        </div>
      </div>
    </MobileFrame>
  );
}