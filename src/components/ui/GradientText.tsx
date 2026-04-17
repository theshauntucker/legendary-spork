"use client";

import type { ElementType, HTMLAttributes } from "react";
import { gradients, type GradientKey } from "@/lib/gradients";

type GradientTextProps = HTMLAttributes<HTMLElement> & {
  gradient?: GradientKey;
  fallbackColor?: string;
  as?: ElementType;
};

export function GradientText({
  gradient = "sunsetText",
  fallbackColor = "#F472B6",
  as: Tag = "span",
  style,
  className = "",
  children,
  ...rest
}: GradientTextProps) {
  const Component = Tag as ElementType;
  return (
    <Component
      className={className}
      style={{
        color: fallbackColor,
        backgroundImage: gradients[gradient],
        WebkitBackgroundClip: "text",
        backgroundClip: "text",
        WebkitTextFillColor: "transparent",
        ...style,
      }}
      {...rest}
    >
      {children}
    </Component>
  );
}

export default GradientText;
