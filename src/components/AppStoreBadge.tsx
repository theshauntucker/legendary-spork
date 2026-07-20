/**
 * AppStoreBadge — the official Apple "Download on the App Store" badge,
 * linked to the live listing. One source of truth for the URL.
 *
 * Uses Apple's unmodified official artwork (public/appstore-badge-*.svg,
 * from toolbox.marketingtools.apple.com) per App Store marketing
 * guidelines: never restyled, never stretched, min-height respected.
 *
 * variant="black" on light backgrounds, variant="white" on dark.
 * Hidden inside the native iOS shell via the
 * `[data-native-shell="ios"] .appstore-badge` rule in globals.css —
 * you don't advertise the App Store to someone already in the app.
 */

export const APP_STORE_URL =
  "https://apps.apple.com/us/app/routinex-dance-cheer-ai/id6763345348";

export default function AppStoreBadge({
  variant = "black",
  height = 52,
  className = "",
}: {
  variant?: "black" | "white";
  height?: number;
  className?: string;
}) {
  return (
    <a
      href={APP_STORE_URL}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Download RoutineX on the App Store"
      className={`appstore-badge inline-flex hover:opacity-85 transition-opacity ${className}`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={variant === "black" ? "/appstore-badge-black.svg" : "/appstore-badge-white.svg"}
        alt="Download on the App Store"
        style={{ height, width: "auto", display: "block" }}
      />
    </a>
  );
}
