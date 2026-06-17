import type { MotivationStyle } from "../types";

/** Mode-themed CTAs for the Mission Player. Kept out of modes.ts so we
 *  don't have to touch six lexicons every time copy evolves. */
export interface MissionCopy {
  startCta: string;
  completeHeadline: string;
  briefingTag: string;
  resumeCta: string;
}

const MAP: Record<MotivationStyle, MissionCopy> = {
  hunter:     { startCta: "Start Quest",     completeHeadline: "Quest Complete",     briefingTag: "Mission Briefing", resumeCta: "Resume Quest" },
  hero:       { startCta: "Begin Challenge", completeHeadline: "Challenge Cleared",  briefingTag: "Today's Challenge", resumeCta: "Continue" },
  zen:        { startCta: "Begin Flow",      completeHeadline: "Flow Complete",      briefingTag: "Today's Flow",      resumeCta: "Return to Flow" },
  scientist:  { startCta: "Start Protocol",  completeHeadline: "Protocol Logged",    briefingTag: "Protocol Brief",    resumeCta: "Resume Protocol" },
  story:      { startCta: "Begin Chapter",   completeHeadline: "Chapter Written",    briefingTag: "Today's Page",      resumeCta: "Continue Chapter" },
  discipline: { startCta: "Execute Session", completeHeadline: "Session Executed",   briefingTag: "Today's Session",   resumeCta: "Resume Session" },
};

export function missionCopyFor(mode: MotivationStyle | null | undefined): MissionCopy {
  return MAP[mode ?? "hunter"];
}
