/* ────────────────────────────────────────────────────────────────────────
 * Demonstration gender preference.
 *
 * The selected gender controls which demonstration media shows across the
 * app. It is seeded from the user's onboarding choice and can be changed
 * anytime (in Settings, or via the toggle on an exercise). This only affects
 * demonstration MEDIA — never workout logic.
 * ──────────────────────────────────────────────────────────────────── */

import { useEffect, useState } from "react";
import type { Gender } from "./types";

const KEY = "leveluplife.demoGender";
const EVENT = "leveluplife:demoGender";

export function getDemoGender(): Gender {
  if (typeof window === "undefined") return "male";
  const v = window.localStorage.getItem(KEY);
  return v === "female" ? "female" : "male";
}

export function setDemoGender(g: Gender): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, g);
  window.dispatchEvent(new CustomEvent(EVENT, { detail: g }));
}

/** Reactive accessor — re-renders when the preference changes anywhere. */
export function useDemoGender(): [Gender, (g: Gender) => void] {
  const [gender, setGender] = useState<Gender>("male");

  useEffect(() => {
    const sync = () => setGender(getDemoGender());
    sync();
    window.addEventListener(EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  return [gender, setDemoGender];
}
