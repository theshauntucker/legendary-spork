"use client";

import { motion } from "framer-motion";
import { Sparkles, ArrowRight, Heart } from "lucide-react";

export default function Footer() {
  return (
    <footer className="relative">
      {/* Final CTA */}
      <section className="relative py-24 sm:py-32 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary-900/20 to-primary-900/40" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary-600/20 rounded-full blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold font-[family-name:var(--font-display)] leading-tight">
              Don&apos;t Let Your Dancer{" "}
              <span className="gradient-text">Fall Behind</span>
            </h2>
            <p className="mt-6 text-lg sm:text-xl text-surface-200 max-w-2xl mx-auto">
              Every routine is a chance to improve. RoutineX gives your dancer the detailed, professional feedback they need to climb from Gold to Diamond.
            </p>

            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href="#pricing"
                className="group inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-primary-600 via-accent-500 to-gold-500 px-8 py-4 text-lg font-bold text-white shadow-lg shadow-primary-600/25 hover:shadow-primary-600/40 transition-all animate-pulse-glow"
              >
                Get Your Free Analysis
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </a>
            </div>

            <p className="mt-6 text-sm text-surface-200">
              
              <br />
              DM us on Instagram @routinex.ai for your free first analysis.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Footer bar */}
      <div className="border-t border-white/10 py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary-400" />
              <span className="font-bold">
                Routine<span className="gradient-text">X</span>
              </span>
            </div>

            <div className="flex items-center gap-6 text-xs text-surface-200">
              <a href="/privacy" className="hover:text-white transition-colors">
                Privacy Policy
              </a>
              <a href="/terms" className="hover:text-white transition-colors">
                Terms of Service
              </a>
              <a href="/our-approach" className="hover:text-white transition-colors">
                Our Approach
              </a>
              <a href="/contact" className="hover:text-white transition-colors">
                Contact
              </a>
            </div>

            <p className="text-xs text-surface-200 flex items-center gap-1">
              Made with <Heart className="h-3 w-3 text-accent-500 fill-accent-500" /> for the dance community
            </p>
          </div>

          <p className="mt-4 text-center text-xs text-surface-200/50">
            &copy; {new Date().getFullYear()} RoutineX. All rights reserved. Not affiliated with any competition organization.
          </p>
        </div>
      </div>
    </footer>
  );
}
