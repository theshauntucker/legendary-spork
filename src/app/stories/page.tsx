import type { Metadata } from "next";
import { getAllStories } from "@/lib/stories";
import JourneyFilter from "@/components/JourneyFilter";
import EmailCapture from "@/components/EmailCapture";
import AdUnit from "@/components/AdUnit";

export const metadata: Metadata = {
  title: "Personal Stories",
  description:
    "Real experiences from people at every stage of their faith journey — entering, deepening, questioning, leaving, and returning.",
  openGraph: {
    title: "Personal Stories | Vibeproof",
    description:
      "Real experiences from people at every stage of their faith journey.",
    type: "website",
  },
};

export default function StoriesPage() {
  const stories = getAllStories();

  return (
    <>
      {/* Hero */}
      <section className="py-14 sm:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <h1 className="font-serif text-4xl sm:text-5xl text-ink-900 mb-4 leading-tight">
            Personal Stories
          </h1>
          <p className="text-lg text-ink-500 max-w-2xl mx-auto leading-relaxed">
            Real experiences from people at every stage of their faith journey
            &mdash; entering, deepening, questioning, leaving, and returning.
          </p>
        </div>
      </section>

      {/* Top Ad */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 mb-8">
        <AdUnit slot="stories-top" format="horizontal" />
      </div>

      {/* Filtered stories */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 pb-14">
        <JourneyFilter stories={stories} />
      </section>

      {/* Email Capture */}
      <div className="max-w-2xl mx-auto px-4 sm:px-6 pb-14">
        <EmailCapture />
      </div>

      {/* Bottom Ad */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 pb-10">
        <AdUnit slot="stories-bottom" format="horizontal" />
      </div>
    </>
  );
}
