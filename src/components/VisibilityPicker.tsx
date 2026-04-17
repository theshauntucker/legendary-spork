"use client";

import { useState } from "react";
import { haptics } from "@/lib/haptics";
import { VISIBILITY_OPTIONS, type Visibility } from "@/lib/visibility";

type Props = {
  value: Visibility;
  onChange: (v: Visibility) => void;
  size?: "sm" | "md";
};

export function VisibilityPicker({ value, onChange, size = "md" }: Props) {
  const [flash, setFlash] = useState<Visibility | null>(null);

  function handleSelect(next: Visibility) {
    haptics.select();
    setFlash(next);
    onChange(next);
    window.setTimeout(() => setFlash(null), 400);
  }

  const padding = size === "sm" ? "4px 10px" : "8px 14px";
  const fontSize = size === "sm" ? 12 : 13;

  return (
    <div
      role="radiogroup"
      aria-label="Visibility"
      style={{
        display: "inline-flex",
        gap: 4,
        padding: 4,
        borderRadius: 999,
        background: "rgba(0,0,0,0.06)",
        border: "1px solid var(--border)",
      }}
    >
      {VISIBILITY_OPTIONS.map((opt) => {
        const selected = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            role="radio"
            aria-checked={selected}
            title={opt.helper}
            onClick={() => handleSelect(opt.value)}
            className={flash === opt.value ? "animate-gradient-flash" : undefined}
            style={{
              fontSize,
              fontWeight: 600,
              padding,
              borderRadius: 999,
              border: "none",
              cursor: "pointer",
              background: selected
                ? "linear-gradient(135deg, #EC4899, #F97316, #FBBF24)"
                : "transparent",
              color: selected ? "#fff" : "inherit",
              transition: "background 160ms ease",
            }}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

export default VisibilityPicker;
