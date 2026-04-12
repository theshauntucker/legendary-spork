"use client";

import { useEffect, useRef } from "react";

interface AdUnitProps {
  slot: string;
  format?: "auto" | "horizontal" | "vertical" | "rectangle";
  className?: string;
}

declare global {
  interface Window {
    adsbygoogle: Array<Record<string, unknown>>;
  }
}

export default function AdUnit({
  slot,
  format = "auto",
  className = "",
}: AdUnitProps) {
  const adRef = useRef<HTMLDivElement>(null);
  const isAdLoaded = useRef(false);

  useEffect(() => {
    if (isAdLoaded.current) return;
    try {
      if (typeof window !== "undefined" && window.adsbygoogle) {
        window.adsbygoogle.push({});
        isAdLoaded.current = true;
      }
    } catch {
      // AdSense not loaded yet — that's fine in dev
    }
  }, []);

  const adClientId = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID;

  // Show placeholder in development or when no AdSense ID is configured
  if (!adClientId) {
    return (
      <div
        className={`bg-surface-100 border-2 border-dashed border-surface-300 rounded-lg flex items-center justify-center text-surface-400 text-sm ${className}`}
        style={{ minHeight: format === "horizontal" ? "90px" : "250px" }}
      >
        Ad Space
      </div>
    );
  }

  return (
    <div ref={adRef} className={className}>
      <ins
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client={adClientId}
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive="true"
      />
    </div>
  );
}
