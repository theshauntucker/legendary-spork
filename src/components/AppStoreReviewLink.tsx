"use client";

import { useEffect, useState } from "react";
import { Star } from "lucide-react";

/**
 * Always-there App Store review link. Sits at the bottom of every report so
 * anyone who wants to leave a review can find it — not just the people who
 * happened to see the one-time star prompt.
 *
 * Apple only accepts a review from an Apple ID that has downloaded the app,
 * so on the web the copy says "get the free app, then rate it". Inside the
 * iOS shell it deep-links straight to the write-review sheet.
 */

const APP_STORE_ID = "6763345348";
const WEB_REVIEW_URL = `https://apps.apple.com/us/app/routinex-dance-cheer-ai/id${APP_STORE_ID}?action=write-review`;
const SHELL_REVIEW_URL = `itms-apps://apps.apple.com/app/id${APP_STORE_ID}?action=write-review`;

function inIosShell(): boolean {
  if (typeof document === "undefined") return false;
  if (document.documentElement.dataset.nativeShell === "ios") return true;
  const cap = (window as unknown as { Capacitor?: { isNativePlatform?: () => boolean } }).Capacitor;
  return !!cap?.isNativePlatform?.();
}

export default function AppStoreReviewLink() {
  const [shell, setShell] = useState(false);
  useEffect(() => setShell(inIosShell()), []);

  return (
    <div className="border-t border-white/10 px-6 py-5 text-center" data-print-hide>
      <div className="flex items-center justify-center gap-0.5">
        {[0, 1, 2, 3, 4].map((i) => (
          <Star key={i} className="h-4 w-4 fill-[#FBBF24] text-[#FBBF24]" />
        ))}
      </div>
      <p className="mt-2 text-sm font-bold text-white">Is RoutineX helping your dancer?</p>
      <p className="mt-1 text-xs text-surface-200">
        {shell
          ? "A 30-second App Store review is how other dance and cheer families find us."
          : "A 30-second App Store review is how other dance and cheer families find us. Get the free app, then tap Rate."}
      </p>
      <a
        href={shell ? SHELL_REVIEW_URL : WEB_REVIEW_URL}
        target={shell ? undefined : "_blank"}
        rel="noopener noreferrer"
        className="mt-3 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#9333EA] via-[#EC4899] to-[#F59E0B] px-5 py-2.5 text-sm font-bold text-white transition-opacity hover:opacity-90"
      >
        <Star className="h-4 w-4" /> Rate RoutineX on the App Store
      </a>
    </div>
  );
}
