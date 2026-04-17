"use client";

import { Slot } from "@radix-ui/react-slot";
import { motion } from "framer-motion";
import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import { gradients } from "@/lib/gradients";
import { haptics } from "@/lib/haptics";
import { springOut } from "@/lib/motion";

type Variant = "primary" | "secondary" | "ghost";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  asChild?: boolean;
  children?: ReactNode;
};

const variantStyles: Record<Variant, React.CSSProperties> = {
  primary: {
    backgroundImage: gradients.sunset,
    color: "#fff",
    border: "1px solid rgba(255,255,255,0.12)",
  },
  secondary: {
    background: "rgba(255,255,255,0.06)",
    color: "#fff",
    border: "1px solid rgba(255,255,255,0.12)",
    backdropFilter: "blur(16px) saturate(180%)",
    WebkitBackdropFilter: "blur(16px) saturate(180%)",
  },
  ghost: {
    background: "transparent",
    color: "inherit",
    border: "1px solid transparent",
  },
};

const MotionButton = motion.button;

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = "primary", asChild, children, className = "", style, onClick, ...rest },
  ref,
) {
  const mergedStyle: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    padding: "10px 18px",
    borderRadius: 12,
    fontWeight: 600,
    fontSize: 15,
    lineHeight: 1,
    cursor: "pointer",
    ...variantStyles[variant],
    ...style,
  };

  const handleClick: React.MouseEventHandler<HTMLButtonElement> = (e) => {
    haptics.tap();
    onClick?.(e);
  };

  if (asChild) {
    return (
      <Slot ref={ref} style={mergedStyle} className={className} onClick={handleClick as never} {...rest}>
        {children}
      </Slot>
    );
  }

  return (
    <MotionButton
      ref={ref}
      whileTap={{ scale: 0.97 }}
      transition={springOut}
      className={className}
      style={mergedStyle}
      onClick={handleClick}
      {...(rest as React.ComponentProps<typeof MotionButton>)}
    >
      {children}
    </MotionButton>
  );
});

export default Button;
