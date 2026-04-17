"use client";

import { forwardRef, type HTMLAttributes } from "react";
import { gradients } from "@/lib/gradients";

type GlassProps = HTMLAttributes<HTMLDivElement>;

export const Glass = forwardRef<HTMLDivElement, GlassProps>(function Glass(
  { className = "", style, children, ...rest },
  ref,
) {
  return (
    <div
      ref={ref}
      className={className}
      style={{
        backdropFilter: "blur(16px) saturate(180%)",
        WebkitBackdropFilter: "blur(16px) saturate(180%)",
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.08)",
        boxShadow: gradients.shadowRim,
        borderRadius: 16,
        ...style,
      }}
      {...rest}
    >
      {children}
    </div>
  );
});

export default Glass;
