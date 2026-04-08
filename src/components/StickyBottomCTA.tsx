"use client";

import { useState, useEffect } from "react";
import { ArrowRight, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function StickyBottomCTA() {
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    function onScroll() {
      if (dismissed) return;
      // Show after scrolling 600px (past the hero)
      setVisible(window.scrollY > 600);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [dismissed]);

  return (
    <AnimatePresence>
      {visible && !dismissed && (
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="fixed bottom-0 left-0 right-0 z-50 px-4 pb-4 sm:pb-5"
        >
          <div className="mx-auto max-w-lg">
            <div className="relative flex items-center justify-between gap-3 rounded-2xl bg-surface-950/95 backdrop-blur-md border border-primary-500/30 shadow-2xl shadow-black/50 px-5 py-4">
              {/* Left: copy */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-white leading-tight">
                  Your first analysis is free 🎉
                </p>
                <p className="text-xs text-surface-200 mt-0.5 truncate">
                  Know what judges will say — before competition day
                </p>
              </div>

              {/* CTA */}
              <a
                href="/signup"
                className="shrink-0 inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-primary-600 via-accent-500 to-gold-500 px-4 py-2.5 text-sm font-bold text-white hover:opacity-90 transition-opacity"
              >
                Try Free
                <ArrowRight className="h-3.5 w-3.5" />
              </a>

              {/* Dismiss */}
              <button
                onClick={() => setDismissed(true)}
                className="shrink-0 p-1 text-surface-200 hover:text-white transition-colors"
                aria-label="Dismiss"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
