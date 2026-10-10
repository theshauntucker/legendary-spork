import type { Metadata } from "next";
import StageHero from "@/components/stage/StageHero";
import ReviewStrip from "@/components/stage/ReviewStrip";
import TwoWays from "@/components/stage/TwoWays";
import SpotlightTour from "@/components/stage/SpotlightTour";
import HowSpotlightWorks from "@/components/stage/HowSpotlightWorks";
import StagePricing from "@/components/stage/StagePricing";
import PrivacyStage from "@/components/stage/PrivacyStage";
import StageFAQ, { FAQ_ITEMS } from "@/components/stage/StageFAQ";
import FinalCurtain from "@/components/stage/FinalCurtain";
import StickyBottomCTA from "@/components/StickyBottomCTA";
import { HERO_IMAGE } from "@/lib/stage-assets";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQ_ITEMS.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
};

export default function Home() {
  return (
    <div data-stage-page>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <StageHero image={HERO_IMAGE} />
      <ReviewStrip />
      <SpotlightTour />
      <HowSpotlightWorks />
      <TwoWays />
      <StagePricing />
      <PrivacyStage />
      <StageFAQ />
      <FinalCurtain />
      <StickyBottomCTA />
    </div>
  );
}
