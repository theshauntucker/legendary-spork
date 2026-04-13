"use client";

interface AdUnitProps {
  slot: string;
  format?: "auto" | "horizontal" | "vertical" | "rectangle";
  className?: string;
}

export default function AdUnit({
  slot,
  format = "auto",
  className = "",
}: AdUnitProps) {
  const ezoicId = process.env.NEXT_PUBLIC_EZOIC_ID;

  // Show placeholder when no ad network is configured
  if (!ezoicId) {
    return (
      <div
        className={`bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl flex items-center justify-center text-slate-400 text-sm ${className}`}
        style={{ minHeight: format === "horizontal" ? "90px" : "250px" }}
      >
        Ad Space
      </div>
    );
  }

  // Ezoic uses div placeholders with specific IDs
  return (
    <div className={className}>
      <div
        id={`ezoic-pub-ad-placeholder-${slot}`}
        style={{ minHeight: format === "horizontal" ? "90px" : "250px" }}
      />
    </div>
  );
}
