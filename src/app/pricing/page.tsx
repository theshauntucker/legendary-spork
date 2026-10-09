import type { Metadata } from "next";
import StagePricing from "@/components/stage/StagePricing";
import StageFAQ from "@/components/stage/StageFAQ";
import FinalCurtain from "@/components/stage/FinalCurtain";

export const metadata: Metadata = {
  title: "Pricing — 99¢ first analysis, Spotlight breakdowns $14.99",
  description:
    "RoutineX pricing: first routine analysis 99¢, then $1.99 each or $4.99/mo for four as a Season Member. RoutineX Spotlight, the frame-by-frame technique breakdown of one dancer, is $14.99.",
  alternates: { canonical: "/pricing" },
  robots: { index: true, follow: true },
};

export default function PricingPage() {
  return (
    <main data-stage-page className="pt-10">
      <div className="st-wrap pt-20 sm:pt-24">
        <p className="st-runner">Pricing</p>
        <h1 className="st-display mt-3 text-4xl sm:text-6xl">Score a routine. Or break one dancer down.</h1>
        <p className="st-lede mt-5">Score a routine for 99¢. Put one dancer under the Spotlight for $14.99. Single and pack credits never expire. Season Member credits reset each month.</p>
      </div>
      <StagePricing />
      <StageFAQ />
      <FinalCurtain />
    </main>
  );
}
