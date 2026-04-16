"use client";

import { Smartphone } from "lucide-react";

export default function CountdownBanner() {
  return (
    <div className="fixed top-0 left-0 right-0 z-[60] bg-surface-950/90 backdrop-blur-sm border-b border-white/5">
      <div className="flex items-center justify-center gap-2 px-3 h-8 text-white text-[11px] font-medium tracking-wide">
        <Smartphone className="h-3 w-3 text-primary-400 shrink-0" />
        <span>
          <span className="text-primary-300">RoutineX Mobile</span> — coming
          soon to iOS &amp; Android
        </span>
      </div>
    </div>
  );
}
