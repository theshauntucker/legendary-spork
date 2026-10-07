"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, X } from "lucide-react";

export default function StickyBottomCTA() {
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (dismissed) return;
      setVisible(window.scrollY > 700);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [dismissed]);

  return (
    <AnimatePresence>
      {visible && !dismissed && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="fixed bottom-0 left-0 right-0 z-50 p-3 sm:p-4"
        >
          <div className="mx-auto max-w-lg rounded-2xl border border-white/10 bg-[#121214]/90 px-4 py-3 flex items-center justify-between gap-3 backdrop-blur-xl shadow-[0_20px_60px_-20px_rgba(0,0,0,0.8)]">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-white truncate">
                Spotlight — one dancer, every frame, $14.99
              </p>
              <p className="text-xs text-zinc-400 truncate">
                Or score a routine — first one is 99¢.
              </p>
            </div>
            <a
              href="/spotlight"
              className="st-btn st-btn-sunset shrink-0 !px-4 !py-2 !text-sm"
            >
              See it
              <ArrowRight className="h-3.5 w-3.5" />
            </a>
            <button
              onClick={() => setDismissed(true)}
              className="shrink-0 p-1 rounded-full hover:bg-white/10 transition-colors text-zinc-400"
              aria-label="Dismiss"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
