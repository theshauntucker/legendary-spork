/**
 * Detects whether the current request is being served inside the
 * native iOS Capacitor shell.
 *
 * The Capacitor config (mobile/capacitor.config.ts) sets
 * `ios.appendUserAgent = "RoutineXiOS/1.0"`, so every request the
 * WebView makes — including the SSR HTML fetch for each page — carries
 * that token in the User-Agent header. We sniff it once at the top of
 * the layout to decide whether to render marketing chrome (Countdown
 * banner, top Navbar, "coming soon to iOS" cues) or strip everything
 * down to the in-app experience.
 *
 * Server-only — call from React Server Components or route handlers,
 * never from a client component. For the client side, check
 * `window.Capacitor` or read the `data-native-shell` attribute set on
 * `<html>` by the layout.
 */
import { headers } from "next/headers";

export const NATIVE_SHELL_UA_TOKEN = "RoutineXiOS";

export async function isNativeIosShell(): Promise<boolean> {
  try {
    const h = await headers();
    const ua = h.get("user-agent") ?? "";
    return ua.includes(NATIVE_SHELL_UA_TOKEN);
  } catch {
    // headers() throws if invoked from a static context — treat that
    // as "not the iOS app" and fall through to the marketing render.
    return false;
  }
}
