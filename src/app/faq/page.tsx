import type { Metadata } from "next";
import StageFAQ, { FAQ_ITEMS } from "@/components/stage/StageFAQ";
import FinalCurtain from "@/components/stage/FinalCurtain";

export const metadata: Metadata = {
  title: "Frequently asked questions",
  description:
    "How RoutineX scoring and Spotlight technique breakdowns work, what happens to your video, how the angles are measured, pricing and turnaround.",
  alternates: { canonical: "/faq" },
  robots: { index: true, follow: true },
};

export default function FAQPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ_ITEMS.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
  };
  return (
    <main data-stage-page className="pt-10">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="st-wrap pt-20 sm:pt-24">
        <p className="st-runner">FAQ</p>
        <h1 className="st-display mt-3 text-4xl sm:text-6xl">Questions parents ask first.</h1>
      </div>
      <StageFAQ />
      <FinalCurtain />
    </main>
  );
}
