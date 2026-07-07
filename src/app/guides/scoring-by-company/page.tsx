import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ArrowLeft } from "lucide-react";
import Footer from "@/components/Footer";
import ScoreLookup from "@/components/ScoreLookup";
import { AWARD_LADDERS, AWARD_LADDER_DISCLAIMER } from "@/data/award-ladders";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://routinex.org";

const TITLE = "What Platinum Means at Every Dance Competition";
const DESCRIPTION =
  "A cross-competition award chart comparing StarQuest, NUVO, 24Seven, Radix, Encore, KAR, Showstopper and more — what Platinum, Diamond and High Gold actually mean at each.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: {
    canonical: "/guides/scoring-by-company",
  },
  openGraph: {
    title: `${TITLE} | RoutineX`,
    description: DESCRIPTION,
    type: "article",
    url: "/guides/scoring-by-company",
  },
  robots: {
    index: true,
    follow: true,
  },
};

const FAQ: { q: string; a: string }[] = [
  {
    q: "Is Platinum good?",
    a: "Almost always, yes — at most companies Platinum sits in the upper part of the ladder and reflects a clean, strong routine. But 'good' depends entirely on which company gave it. At one company Platinum is the very top tier; at another there are two or three named levels above Platinum. So a Platinum is real, earned work — just don't assume it means the same thing everywhere.",
  },
  {
    q: "Why does every competition have different awards?",
    a: "Because there is no governing body for competitive dance award levels. Each company is its own independent league and designs its own ladder, its own point cutoffs, and its own tier names to match its brand and philosophy. Some keep their top tier rare; others award their highest level more freely. It isn't a trick — it's just the nature of an industry with many separate organizers.",
  },
  {
    q: "Is High Gold at one competition the same as Platinum at another?",
    a: "Sometimes, effectively, yes. Because each company sets its own cutoffs, a routine that earns High Gold at a stricter company could earn Platinum at a more generous one with almost the same performance. That's exactly why comparing tier names across companies can be misleading. Your dancer didn't get worse between events — the ruler changed.",
  },
  {
    q: "What score is a Platinum?",
    a: "It depends on the company, the season, and often the age division and level. On a 300-point scale you'll frequently see Platinum-style tiers grouped in the 280s, but that is a general pattern and not a rule — companies move their cutoffs and use different scales entirely (some score per judge out of 100). Always check the specific company's current, official awards page for the exact number.",
  },
  {
    q: "How can I compare my dancer across different competitions?",
    a: "The most reliable way is to hold one ruler constant. Because company ladders shift from event to event, an independent, unchanging baseline score lets you compare a routine to itself over the season — so you can see real growth instead of guessing whether a different tier name means a different result.",
  },
];

export default function ScoringByCompanyPage() {
  const canonical = `${BASE_URL}/guides/scoring-by-company`;

  const articleLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline:
      "The Cross-Competition Award Chart: What Platinum Actually Means at Every Dance Competition",
    description: DESCRIPTION,
    mainEntityOfPage: { "@type": "WebPage", "@id": canonical },
    author: { "@type": "Organization", name: "RoutineX", url: BASE_URL },
    publisher: {
      "@type": "Organization",
      name: "RoutineX",
      logo: { "@type": "ImageObject", url: `${BASE_URL}/logo.svg` },
    },
  };

  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };

  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }}
      />

      <article className="min-h-screen py-16 sm:py-20 px-4">
        <div className="mx-auto max-w-4xl">
          {/* Breadcrumb */}
          <Link
            href="/guides"
            className="inline-flex items-center gap-1.5 text-sm text-primary-400 hover:text-primary-300 transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            All guides
          </Link>

          {/* Title */}
          <h1 className="mt-6 text-3xl sm:text-4xl md:text-5xl font-bold font-[family-name:var(--font-display)] leading-tight">
            The Cross-Competition Award Chart: What Platinum Actually Means at{" "}
            <span className="gradient-text">Every Dance Competition</span>
          </h1>

          {/* Intro */}
          <div className="mt-8 space-y-4 text-lg text-surface-200 leading-relaxed">
            <p>
              If you have ever driven home from a competition wondering why the
              Platinum your dancer earned in the spring felt different from the
              Platinum at a summer event — or why a friend&apos;s team took home a
              Diamond for a routine that looked a lot like yours — here is the
              honest, reassuring truth: there is no governing body for dance and
              cheer award levels. Every company invented its own award ladder.
            </p>
            <p>
              That means the same routine can earn a differently named award at
              different competitions. A Platinum at one company can sit right
              where a Diamond sits at another. Your dancer didn&apos;t get worse
              between events. The ruler changed. Once you can see all the rulers
              side by side, the whole thing gets a lot calmer — and a lot more
              useful. This holds for cheer, too: every event producer sets its
              own bands.
            </p>
            <p>
              Below is the cross-competition award chart we wish someone had
              handed us from the stands: the tier order each company uses, and
              the kind of scale it&apos;s built on. We show order, not exact
              cutoffs — because those move every season.
            </p>
          </div>

          {/* Comparison table (desktop) */}
          <section className="mt-12">
            <h2 className="text-2xl font-bold text-white">
              The award ladders, side by side
            </h2>
            <p className="mt-2 text-sm text-surface-200">
              Tiers are listed top to bottom. Order only — not exact scores.
            </p>

            {/* Horizontally scrollable table for sm+ */}
            <div className="mt-6 hidden sm:block overflow-x-auto rounded-2xl border border-white/10">
              <table className="w-full text-left text-sm">
                <thead className="bg-white/5 text-surface-200">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Company</th>
                    <th className="px-4 py-3 font-semibold">Scale</th>
                    <th className="px-4 py-3 font-semibold">
                      Award tiers (top to bottom)
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {AWARD_LADDERS.map((ladder) => (
                    <tr
                      key={ladder.company}
                      className={`border-t border-white/10 align-top ${
                        ladder.isReference
                          ? "bg-gradient-to-r from-primary-700/20 to-accent-600/20"
                          : ""
                      }`}
                    >
                      <td className="px-4 py-4">
                        <span className="font-semibold text-white">
                          {ladder.company}
                        </span>
                        <p className="mt-1 text-xs text-surface-200/80 leading-relaxed">
                          {ladder.notes}
                        </p>
                      </td>
                      <td className="px-4 py-4 text-surface-200 whitespace-nowrap">
                        {ladder.scaleNote}
                      </td>
                      <td className="px-4 py-4">
                        <ol className="space-y-1">
                          {ladder.tiers.map((tier, i) => (
                            <li
                              key={tier}
                              className="text-surface-100 flex gap-2"
                            >
                              <span className="text-surface-200/50 tabular-nums">
                                {i + 1}.
                              </span>
                              <span
                                className={
                                  i === 0
                                    ? "font-semibold text-primary-300"
                                    : ""
                                }
                              >
                                {tier}
                              </span>
                            </li>
                          ))}
                        </ol>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Cards for mobile */}
            <div className="mt-6 space-y-4 sm:hidden">
              {AWARD_LADDERS.map((ladder) => (
                <div
                  key={ladder.company}
                  className={`glass rounded-2xl p-5 ${
                    ladder.isReference ? "ring-1 ring-primary-500/40" : ""
                  }`}
                >
                  <div className="flex items-baseline justify-between gap-3">
                    <h3 className="font-semibold text-white">
                      {ladder.company}
                    </h3>
                    <span className="text-xs text-surface-200/80 whitespace-nowrap">
                      {ladder.scaleNote}
                    </span>
                  </div>
                  <ol className="mt-3 space-y-1 text-sm">
                    {ladder.tiers.map((tier, i) => (
                      <li key={tier} className="flex gap-2">
                        <span className="text-surface-200/50 tabular-nums">
                          {i + 1}.
                        </span>
                        <span
                          className={
                            i === 0 ? "font-semibold text-primary-300" : ""
                          }
                        >
                          {tier}
                        </span>
                      </li>
                    ))}
                  </ol>
                  <p className="mt-3 text-xs text-surface-200/80 leading-relaxed">
                    {ladder.notes}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* Disclaimer */}
          <div className="mt-8 rounded-2xl border border-accent-500/30 bg-accent-500/10 p-5 sm:p-6">
            <p className="text-sm font-semibold text-white mb-1">
              Read this before you compare anything
            </p>
            <p className="text-sm text-surface-200 leading-relaxed">
              {AWARD_LADDER_DISCLAIMER}
            </p>
          </div>

          {/* How to use */}
          <section className="mt-12">
            <h2 className="text-2xl font-bold text-white">
              How to use this chart
            </h2>
            <div className="mt-4 space-y-4 text-surface-200 leading-relaxed">
              <p>
                Start by finding the company you competed with, then read the
                tier list from the top down. The point isn&apos;t to memorize
                every ladder — it&apos;s to internalize one idea: a tier name is
                only meaningful next to the company that gave it. &quot;We got
                High Gold&quot; means something very different depending on
                whether High Gold was the second rung or the fifth.
              </p>
              <ul className="space-y-2 list-disc pl-5">
                <li>
                  Compare a company to <em>itself</em> across the season, not to
                  a different company&apos;s ladder.
                </li>
                <li>
                  When a company has several tiers stacked above Platinum, a
                  Platinum there is genuinely strong — it just isn&apos;t the
                  ceiling.
                </li>
                <li>
                  Per-judge (out of 100) results and combined (out of 300)
                  results are different math. Don&apos;t line the raw numbers up
                  directly.
                </li>
                <li>
                  For the exact cutoffs, always open the company&apos;s current
                  awards or rules page for your season, age, and level.
                </li>
              </ul>
            </div>
          </section>

          {/* Score lookup tool */}
          <section className="mt-12">
            <h2 className="text-2xl font-bold text-white mb-5">
              Try it: where does your score usually land?
            </h2>
            <ScoreLookup />
          </section>

          {/* FAQ */}
          <section className="mt-12">
            <h2 className="text-2xl font-bold text-white">
              Frequently asked questions
            </h2>
            <div className="mt-6 space-y-6">
              {FAQ.map((item) => (
                <div key={item.q}>
                  <h3 className="text-lg font-semibold text-white">
                    {item.q}
                  </h3>
                  <p className="mt-2 text-surface-200 leading-relaxed">
                    {item.a}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* Related links */}
          <section className="mt-12 border-t border-white/10 pt-8">
            <h2 className="text-lg font-bold text-white mb-4">Keep reading</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <Link
                href="/guides/dance-competition-award-levels-explained"
                className="group glass rounded-2xl p-5 transition-transform hover:-translate-y-0.5"
              >
                <h3 className="font-semibold text-white group-hover:text-primary-300 transition-colors">
                  Dance Competition Award Levels Explained
                </h3>
                <p className="mt-2 text-sm text-surface-200">
                  Gold, High Gold, Platinum, Diamond and beyond — how the tiers
                  work and why they vary.
                </p>
              </Link>
              <Link
                href="/guides/why-platinum-not-diamond"
                className="group glass rounded-2xl p-5 transition-transform hover:-translate-y-0.5"
              >
                <h3 className="font-semibold text-white group-hover:text-primary-300 transition-colors">
                  Why Platinum and Not Diamond?
                </h3>
                <p className="mt-2 text-sm text-surface-200">
                  What usually separates the top tiers — and what it really says
                  about your dancer.
                </p>
              </Link>
            </div>
          </section>

          {/* Bottom CTA */}
          <div className="mt-14 rounded-2xl bg-gradient-to-r from-primary-700/25 to-accent-600/25 border border-white/10 p-6 sm:p-8">
            <p className="text-white font-semibold text-lg mb-2">
              One ruler that never changes.
            </p>
            <p className="text-sm text-surface-200 leading-relaxed">
              Company ladders shift from event to event. RoutineX gives you one
              consistent, objective baseline score you can carry across every
              competition — so you can watch real growth instead of guessing
              what a different tier name means.
            </p>
            <div className="mt-5">
              <Link
                href="/signup"
                className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-primary-600 to-accent-500 px-6 py-3 font-semibold text-white hover:opacity-90 transition-opacity"
              >
                Get one baseline score — first analysis $1.99
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </article>
      <Footer />
    </main>
  );
}
