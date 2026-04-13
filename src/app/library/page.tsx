import type { Metadata } from "next";
import { getAllResources } from "@/lib/resources";
import { getAllTraditions } from "@/lib/traditions";
import AdUnit from "@/components/AdUnit";
import EmailCapture from "@/components/EmailCapture";
import LibraryFilter from "@/components/LibraryFilter";

export const metadata: Metadata = {
  title: "Library",
  description:
    "A curated collection of books, podcasts, documentaries, and primary sources from every major faith tradition.",
};

export default function LibraryPage() {
  const resources = getAllResources();
  const traditions = getAllTraditions();

  return (
    <>
      {/* Header */}
      <section className="bg-gradient-to-br from-cream-100 via-cream-50 to-primary-50 py-16 sm:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <h1 className="font-serif text-4xl sm:text-5xl text-ink-900 mb-5 leading-tight">
            Library
          </h1>
          <p className="text-lg sm:text-xl text-ink-500 max-w-2xl mx-auto leading-relaxed">
            A curated collection of books, podcasts, documentaries, and primary
            sources from every major faith tradition.
          </p>
        </div>
      </section>

      {/* Ad: top */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 mt-8">
        <AdUnit slot="library-top" format="horizontal" />
      </div>

      {/* Filter + Grid */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-14">
        <LibraryFilter resources={resources} traditions={traditions} />
      </section>

      {/* Email Capture */}
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
        <EmailCapture />
      </div>

      {/* Ad: bottom */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 mb-8">
        <AdUnit slot="library-bottom" format="horizontal" />
      </div>
    </>
  );
}
