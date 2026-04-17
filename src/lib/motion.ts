import type { Transition, Variants } from "framer-motion";

export const springOut: Transition = {
  type: "spring",
  stiffness: 320,
  damping: 22,
};

export const tapScale = {
  whileTap: { scale: 0.97 },
  transition: springOut,
} as const;

export const fadeLift: Variants = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 8 },
};

export const stagger: Variants = {
  animate: {
    transition: {
      staggerChildren: 0.05,
    },
  },
};

export const staggerItem: Variants = {
  initial: { opacity: 0, y: 6 },
  animate: { opacity: 1, y: 0 },
};
