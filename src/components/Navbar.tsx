"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Sparkles } from "lucide-react";

const navLinks = [
  { label: "How It Works", href: "#how-it-works" },
  { label: "Sample Analysis", href: "#sample-analysis" },
  { label: "Pricing", href: "#pricing" },
  { label: "FAQ", href: "#faq" },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <a href="#" className="flex items-center gap-2">
            <Sparkles className="h-7 w-7 text-primary-400" />
            <span className="text-xl font-bold tracking-tight">
              Routine<span className="gradient-text">X</span>
            </span>
          </a>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm text-surface-200 hover:text-white transition-colors"
              >
                {link.label}
              </a>
            ))}
            <a
              href="/login"
              className="text-sm text-surface-200 hover:text-white transition-colors"
            >
              Sign In
            </a>
            <a
              href="/signup"
              className="rounded-full bg-gradient-to-r from-primary-600 to-accent-500 px-5 py-2 text-sm font-semibold text-white hover:opacity-90 transition-opacity"
            >
              Sign Up
            </a>
          </div>

          {/* Mobile toggle */}
          <button
            className="md:hidden text-white"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden glass border-t border-white/10"
          >
            <div className="px-4 py-4 space-y-3">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="block text-sm text-surface-200 hover:text-white transition-colors"
                  onClick={() => setMobileOpen(false)}
                >
                  {link.label}
                </a>
              ))}
              <a
                href="/login"
                className="block text-sm text-surface-200 hover:text-white transition-colors"
                onClick={() => setMobileOpen(false)}
              >
                Sign In
              </a>
              <a
                href="/signup"
                className="block w-full text-center rounded-full bg-gradient-to-r from-primary-600 to-accent-500 px-5 py-2.5 text-sm font-semibold text-white"
                onClick={() => setMobileOpen(false)}
              >
                Sign Up
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
