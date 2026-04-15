/**
 * Studio Dashboard feature flag.
 *
 * Controlled by NEXT_PUBLIC_STUDIO_ENABLED env var (default: false).
 * When false, every Studio UI entry point (new pages, nav links, etc.) must
 * render nothing. The B2C experience must be byte-identical with the flag off.
 *
 * Because this var is prefixed NEXT_PUBLIC_, it is inlined into both server
 * and client bundles at build time, so the same helper is safe on both sides.
 */
export const STUDIO_ENABLED =
  process.env.NEXT_PUBLIC_STUDIO_ENABLED === "true";

export function isStudioEnabled(): boolean {
  return STUDIO_ENABLED;
}
