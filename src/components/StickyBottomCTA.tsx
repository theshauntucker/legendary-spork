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
      setVisible(window.scrollY > 600);
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
          <div className="mx-auto max-w-lg glass border border-white/10 rounded-2xl px-4 py-3 flex items-center justify-between gap-3 shadow-2xl">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-white truncate">✨ First analysis is always free</p>
              <p className="text-xs text-surface-200 truncate">No card required — see real judge feedback instantly</p>
            </div>
            <a
              href="/signup"
              className="shrink-0 inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-primary-600 to-accent-500 px-4 py-2 text-sm font-bold text-white hover:opacity-90 transition-opacity"
            >
              Try Free
              <ArrowRight className="h-3.5 w-3.5" />
            </a>
            <button
              onClick={() => setDismissed(true)}
              className="shrink-0 p-1 rounded-full hover:bg-white/10 transition-colors text-surface-200"
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
