import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { STUDIO_ENABLED } from "@/lib/studio/flag";

/**
 * Shared layout for every /studio/* route. Hard gate: if the Studio feature
 * flag is OFF (the default, including production today), every studio page
 * 404s. This is the belt to the per-page auth/membership suspenders so a
 * mis-configured env can't leak the UI.
 *
 * Auth + membership checks live on individual pages since /studio/signup
 * and /studio/join need to be reachable by not-yet-authenticated users.
 */
export default function StudioLayout({ children }: { children: ReactNode }) {
  if (!STUDIO_ENABLED) {
    notFound();
  }
  return <>{children}</>;
}
