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
      <StagePricing />
      <StageFAQ />
      <FinalCurtain />
    </main>
  );
}
