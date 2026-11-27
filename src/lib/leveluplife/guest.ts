const GUEST_KEY = "leveluplife.guest";
let guest = false;

export const accountSignInAvailable = Boolean(
  import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
);

export function isGuestMode() {
  try {
    return localStorage.getItem(GUEST_KEY) === "1";
  } catch {
    return guest;
  }
}

export function setGuestMode(enabled: boolean) {
  guest = enabled;
  try {
    if (enabled) localStorage.setItem(GUEST_KEY, "1");
    else localStorage.removeItem(GUEST_KEY);
  } catch {
    // Guest navigation still works when browser storage is unavailable.
  }
}
