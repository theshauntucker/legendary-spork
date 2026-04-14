"use client";

import { useEffect, useRef } from "react";

interface AdUnitProps {
  slot: string;
  format?: "auto" | "horizontal" | "vertical" | "rectangle";
  className?: string;
}

const FORMAT_MAP: Record<string, string> = {
  auto: "auto",
  horizontal: "horizontal",
  vertical: "vertical",
  rectangle: "rectangle",
};

export default function AdUnit({
  slot,
  format = "auto",
  className = "",
}: AdUnitProps) {
  const adsenseClient =
    process.env.NEXT_PUBLIC_ADSENSE_CLIENT || "ca-pub-7833856993657379";
  const adsenseSlot = process.env.NEXT_PUBLIC_ADSENSE_SLOT;
  const ezoicId = process.env.NEXT_PUBLIC_EZOIC_ID;
  const pushed = useRef(false);

  useEffect(() => {
    if (!adsenseSlot || pushed.current) return;
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push(
        {}
      );
      pushed.current = true;
    } catch (e) {
      console.warn("AdSense push failed", e);
    }
  }, [adsenseSlot]);

  // Preferred path: AdSense manual ad unit using slot ID from env
  if (adsenseSlot) {
    return (
      <div className={className} data-ad-placeholder={slot}>
        <ins
          className="adsbygoogle"
          style={{
            display: "block",
            minHeight: format === "horizontal" ? "90px" : "250px",
          }}
          data-ad-client={adsenseClient}
          data-ad-slot={adsenseSlot}
          data-ad-format={FORMAT_MAP[format] || "auto"}
          data-full-width-responsive="true"
        />
      </div>
    );
  }

  // Legacy Ezoic path (kept for backwards compatibility)
  if (ezoicId) {
    return (
      <div className={className}>
        <div
          id={`ezoic-pub-ad-placeholder-${slot}`}
          style={{ minHeight: format === "horizontal" ? "90px" : "250px" }}
        />
      </div>
    );
  }

  // No manual slot configured — render nothing. AdSense Auto Ads (enabled
  // in the console) will still place ads via the script in layout.tsx.
  return null;
}
