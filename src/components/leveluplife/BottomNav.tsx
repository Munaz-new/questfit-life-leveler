import { Link, useRouterState } from "@tanstack/react-router";
import { Home, Dumbbell, BookOpen, BarChart3, User } from "lucide-react";

const tabs = [
  { to: "/home", label: "Home", Icon: Home },
  { to: "/exercises", label: "Library", Icon: BookOpen },
  { to: "/workout", label: "Workout", Icon: Dumbbell },
  { to: "/progress", label: "Progress", Icon: BarChart3 },
  { to: "/profile", label: "Profile", Icon: User },
] as const;

export function BottomNav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <nav className="fixed bottom-3 left-1/2 z-40 w-[calc(100%-1.5rem)] max-w-[456px] -translate-x-1/2">
      <div className="glass-strong flex items-center justify-between rounded-2xl px-2 py-2 shadow-[0_10px_40px_-12px_rgba(0,0,0,0.6)]">
        {tabs.map(({ to, label, Icon }) => {
          const active = pathname === to || pathname.startsWith(to + "/");
          return (
            <Link key={to} to={to} className="group relative flex flex-1 flex-col items-center gap-1 rounded-xl py-2 transition">
              <div
                className={`flex h-9 w-9 items-center justify-center rounded-xl transition ${
                  active ? "bg-gradient-primary text-[var(--primary-foreground)] shadow-glow" : "text-muted-foreground group-hover:text-foreground"
                }`}
              >
                <Icon className="h-[18px] w-[18px]" strokeWidth={2.25} />
              </div>
              <span className={`text-[10px] font-medium tracking-wide ${active ? "text-foreground" : "text-muted-foreground"}`}>{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
