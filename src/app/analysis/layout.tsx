import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Analysis Report",
  description:
    "Your RoutineX AI dance competition analysis report — 3-judge scoring, detailed feedback, timestamped notes, and improvement roadmap.",
  robots: { index: false, follow: false },
};

export default function AnalysisLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
