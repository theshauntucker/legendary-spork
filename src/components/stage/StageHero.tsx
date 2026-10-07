"use client";

import { useRef } from "react";
import Link from "next/link";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import HeroMark from "@/components/HeroMark";
import AppStoreBadge from "@/components/AppStoreBadge";

/**
 * Hero — a dark competition stage. The generated stage photograph sits
 * behind a haze and drifts up slower than the page (parallax), the warm
 * spotlight pool tracks the scroll, and the Sunset X keeps its 3D float.
 * One orchestrated load: image settles from 1.06→1 while the headline rises.
 */
export default function StageHero({ image }: { image?: string }) {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const imgY = useTransform(scrollYProgress, [0, 1], ["0%", reduce ? "0%" : "18%"]);
  const imgScale = useTransform(scrollYProgress, [0, 1], [1, reduce ? 1 : 1.08]);
  const fade = useTransform(scrollYProgress, [0, 0.6], [1, 0.15]);
  const poolY = useTransform(scrollYProgress, [0, 1], ["0%", reduce ? "0%" : "-30%"]);

  return (
    <section ref={ref} className="relative isolate min-h-[100svh] overflow-hidden">
      {/* Stage photograph */}
      <motion.div style={{ y: imgY, scale: imgScale }} initial={{ scale: reduce ? 1 : 1.06, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 1.6, ease: [0.16, 1, 0.3, 1] }} className="absolute inset-0 -z-20">
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={image} alt="" className="h-full w-full object-cover object-[62%_40%]" fetchPriority="high" />
        ) : (
          <div className="h-full w-full bg-[radial-gradient(70%_60%_at_70%_35%,rgba(249,115,22,0.18),transparent_60%),radial-gradient(50%_50%_at_20%_60%,rgba(147,51,234,0.16),transparent_60%)]" />
        )}
      </motion.div>
      {/* Haze + vignette so type always sits on black */}
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgba(9,9,11,0.55)_0%,rgba(9,9,11,0.25)_35%,rgba(9,9,11,0.85)_78%,#09090B_100%)]" />
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(9,9,11,0.82)_0%,rgba(9,9,11,0.35)_45%,rgba(9,9,11,0.05)_100%)]" />
      <motion.div style={{ y: poolY, opacity: fade }} className="st-pool -z-10 left-[55%] top-[5%] h-[60vh] w-[60vw] bg-[radial-gradient(closest-side,rgba(251,191,36,0.22),rgba(249,115,22,0.1),transparent)]" />

      <div className="st-wrap relative flex min-h-[100svh] flex-col pt-24 pb-14 sm:pt-28">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, delay: 0.2 }} className="w-fit origin-left scale-[0.62] sm:scale-75">
          <HeroMark />
        </motion.div>

        <motion.div style={{ opacity: fade }} initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 0.35, ease: [0.16, 1, 0.3, 1] }} className="mt-auto max-w-3xl">
          <p className="st-runner">AI video analysis for competitive dance and cheer</p>
          <h1 className="st-display mt-4 text-[2.9rem] sm:text-6xl lg:text-[5.2rem]">
            See exactly what the judges see.
          </h1>
          <p className="st-lede mt-6">
            Upload a routine from your phone. RoutineX scores it like a competition panel in minutes — and Spotlight breaks one dancer down frame by frame, with the corrections drawn on her.
          </p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link href="/spotlight" className="st-btn st-btn-sunset">See a Spotlight breakdown</Link>
            <Link href="/signup" className="st-btn st-btn-ghost">Score a routine — first one is 99¢</Link>
          </div>
          <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-zinc-400">
            <span className="inline-flex items-center gap-2"><span aria-hidden className="text-amber-300">★★★★★</span> 5.0 on the App Store</span>
            <span>Your video never leaves your phone</span>
            <AppStoreBadge variant="white" height={36} />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
