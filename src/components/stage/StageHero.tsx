"use client";

import { useRef } from "react";
import Link from "next/link";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import HeroMark from "@/components/HeroMark";
import AppStoreBadge from "@/components/AppStoreBadge";
import StageImage from "@/components/stage/StageImage";
import { ARABESQUE_2_IMAGE, type StageAsset } from "@/lib/stage-assets";

/**
 * Hero — a dark competition stage. The generated stage photograph sits
 * behind a haze and drifts up slower than the page (parallax), the warm
 * spotlight pool tracks the scroll, and the Sunset X keeps its 3D float.
 * One orchestrated load: image settles from 1.06→1 while the headline rises.
 */
export default function StageHero({ image }: { image?: StageAsset }) {
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
      <motion.div style={{ y: imgY, scale: imgScale }} initial={{ scale: reduce ? 1 : 1.06, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 1.6, ease: [0.16, 1, 0.3, 1] }} className="absolute inset-x-0 top-0 -z-20 h-[58svh] lg:inset-0 lg:h-auto">
        {image ? (
          <StageImage asset={image} portrait={ARABESQUE_2_IMAGE} priority sizes="100vw" className="h-full w-full object-cover object-[50%_40%] lg:object-[62%_40%] lg:translate-x-[7%] lg:scale-[1.12]" />
        ) : (
          <div className="h-full w-full bg-[radial-gradient(70%_60%_at_70%_35%,rgba(249,115,22,0.18),transparent_60%),radial-gradient(50%_50%_at_20%_60%,rgba(147,51,234,0.16),transparent_60%)]" />
        )}
      </motion.div>
      {/* Haze + vignette so type always sits on black */}
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgba(9,9,11,0.45)_0%,rgba(9,9,11,0.05)_14%,rgba(9,9,11,0.6)_30%,rgba(9,9,11,0.94)_44%,#09090B_52%)] lg:bg-[linear-gradient(180deg,rgba(9,9,11,0.45)_0%,rgba(9,9,11,0.08)_35%,rgba(9,9,11,0.78)_80%,#09090B_100%)]" />
      <div className="absolute inset-0 -z-10 hidden bg-[linear-gradient(90deg,rgba(9,9,11,0.8)_0%,rgba(9,9,11,0.28)_42%,rgba(9,9,11,0)_70%)] lg:block" />
      <motion.div style={{ y: poolY, opacity: fade }} className="st-pool -z-10 left-[55%] top-[5%] h-[60vh] w-[60vw] bg-[radial-gradient(closest-side,rgba(251,191,36,0.22),rgba(249,115,22,0.1),transparent)]" />

      <div className="st-wrap relative flex min-h-[100svh] flex-col pt-24 pb-14 sm:pt-28">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, delay: 0.2 }} className="hidden w-fit origin-left scale-75 lg:block">
          <HeroMark />
        </motion.div>

        <motion.div style={{ opacity: fade }} initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 0.35, ease: [0.16, 1, 0.3, 1] }} className="mt-auto max-w-[46rem]">
          <p className="st-new !bg-black/55 backdrop-blur-sm">New · RoutineX Spotlight</p>
          <h1 className="st-display mt-5 text-[2.6rem] [text-shadow:0_2px_28px_rgba(9,9,11,0.85)] sm:text-6xl lg:text-[4.9rem]">
            See exactly what to fix. <span className="block">Drawn on her.</span>
          </h1>
          <p className="st-lede mt-6">
            One routine video from your phone. About three minutes later, a private technique breakdown of your dancer: every key moment measured and marked up. For competitive dance and cheer.
          </p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link href="/spotlight/new" className="st-btn st-btn-sunset">Get her breakdown — $14.99</Link>
            <Link href="/spotlight/sample" className="st-btn st-btn-ghost">See a real report</Link>
          </div>
          <p className="mt-5 text-sm text-zinc-400">
            Or <Link href="/signup" className="font-semibold text-zinc-200 underline underline-offset-4 hover:text-white">score a whole routine</Link> like a judging panel. First one is 99¢.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-zinc-400">
            <span className="inline-flex items-center gap-2"><span aria-hidden className="text-amber-300">★★★★★</span> 5.0 on the App Store</span>
            <span className="hidden sm:inline">Your video never leaves your phone</span>
            <AppStoreBadge variant="white" height={36} />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
