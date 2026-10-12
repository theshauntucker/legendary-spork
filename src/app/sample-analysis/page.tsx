import type { Metadata } from "next";
import SampleAnalysis from "@/components/SampleAnalysis";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Sample Analysis Report",
  description:
    "See a sample RoutineX analysis: a 3-judge scoring breakdown, timestamped performance notes, and improvement priorities. Sample only — not a real dancer's score.",
  alternates: {
    canonical: "/sample-analysis",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function SampleAnalysisPage() {
  return (
    <main>
      <SampleAnalysis />
      <Footer />
    </main>
  );
}
