import { createFileRoute, Navigate, Outlet } from "@tanstack/react-router";
import { useApp } from "@/lib/leveluplife/store";
import { supabase } from "@/integrations/supabase/client";
import { accountSignInAvailable, isGuestMode } from "@/lib/leveluplife/guest";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    if (isGuestMode()) return { user: null, guestAccess: true };
    if (!accountSignInAvailable) return { user: null, guestAccess: false };
    const { data, error } = await supabase.auth.getUser();
    return { user: error ? null : data.user, guestAccess: false };
  },
  component: AppAccess,
});

function AppAccess() {
  const { user, guestAccess } = Route.useRouteContext();
  const { hydrated } = useApp();
  if (!hydrated) return null;
  return user || guestAccess ? <Outlet /> : <Navigate to="/auth" replace />;
}
