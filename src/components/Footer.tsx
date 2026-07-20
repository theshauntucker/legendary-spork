"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import RoutineXLogo from "@/components/RoutineXLogo";
import AppStoreBadge from "@/components/AppStoreBadge";

export default function Footer() {
  return (
    <footer className="relative">
      {/* ── Final CTA — the stage moment ── */}
      <section className="relative overflow-hidden stage-dark text-white">
        <div className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-24 sm:py-32 text-center">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight font-[family-name:var(--font-display)] leading-[1.08]">
              Walk into the next competition
              <br className="hidden sm:block" />{" "}
              <em
                className="italic"
                style={{
                  background:
                    "linear-gradient(120deg, #F472B6 0%, #FB923C 55%, #FBBF24 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                already knowing.
              </em>
            </h2>
            <p className="mt-6 text-lg text-white/60 max-w-xl mx-auto leading-relaxed">
              Three judges. A 300-point scorecard. Notes your dancer can use
              tonight.
            </p>

            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-5">
              <a
                href="/signup"
                className="btn-sunset group inline-flex items-center gap-2 rounded-full px-9 py-4 text-base font-bold"
              >
                Analyze a routine
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </a>
              <AppStoreBadge variant="white" height={56} />
            </div>

            <p className="mt-5 text-sm text-white/40">
              First analysis $1.99 · Results in under 5 minutes
            </p>
          </motion.div>
        </div>
      </section>

      {/* ── Footer bar ── */}
      <div className="py-10 bg-[#FBF8F3]">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex flex-col sm:flex-row items-center gap-5">
              <RoutineXLogo size="sm" wordmarkClassName="text-[#221A29]" />
              <AppStoreBadge variant="black" height={40} />
            </div>

            <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-[#7A7284]">
              <a href="/our-approach" className="hover:text-[#221A29] transition-colors">
                Our Approach
              </a>
              <a href="/guides" className="hover:text-[#221A29] transition-colors">
                Competition Guides
              </a>
              <a href="/events" className="hover:text-[#221A29] transition-colors">
                Events Calendar
              </a>
              <a href="/studio/signup" className="hover:text-[#221A29] transition-colors">
                For Studios
              </a>
              <a href="/privacy" className="hover:text-[#221A29] transition-colors">
                Privacy
              </a>
              <a href="/terms" className="hover:text-[#221A29] transition-colors">
                Terms
              </a>
              <a href="/contact" className="hover:text-[#221A29] transition-colors">
                Contact
              </a>
            </div>

            <p className="text-xs text-[#8B8492]">
              Made for the families backstage.
            </p>
          </div>

          <p className="mt-6 text-center text-[11px] text-[#9A93A5]">
            &copy; {new Date().getFullYear()} RoutineX. All rights reserved.
            Not affiliated with any competition organization.
          </p>
        </div>
      </div>
    </footer>
  );
}
