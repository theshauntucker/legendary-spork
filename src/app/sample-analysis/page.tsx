import type { Metadata } from "next";
import SampleAnalysis from "@/components/SampleAnalysis";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Sample Analysis Report",
  description:
    "See exactly what a RoutineX analysis looks like: 3-judge scoring breakdown, timestamped performance notes, improvement priorities, and competition benchmarks.",
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
