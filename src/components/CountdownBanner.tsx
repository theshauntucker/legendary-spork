"use client";

import { Smartphone } from "lucide-react";

/**
 * Marketing banner shown ONLY on the public web (routinex.org). The
 * root layout suppresses this inside the iOS Capacitor shell — see
 * `!inIosApp && <CountdownBanner />` in src/app/layout.tsx.
 *
 * Apple App Store Review (rejection 2.3.10, May 6 2026) flagged earlier
 * copy that mentioned Android — App Store metadata can't reference
 * third-party platforms. Copy is now iOS-only and intentionally vague
 * about timing so it stays accurate through review + release.
 */
export default function CountdownBanner() {
  return (
    <div className="fixed top-0 left-0 right-0 z-[60] bg-surface-950/90 backdrop-blur-sm border-b border-white/5">
      <div className="flex items-center justify-center gap-2 px-3 h-8 text-white text-[11px] font-medium tracking-wide">
        <Smartphone className="h-3 w-3 text-primary-400 shrink-0" />
        <span>
          <span className="text-primary-300">RoutineX for iPhone</span> —
          launching soon on the App Store
        </span>
      </div>
    </div>
  );
}
