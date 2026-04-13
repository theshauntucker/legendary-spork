import type { Metadata } from "next";
import { getAllTraditions } from "@/lib/traditions";
import TraditionCard from "@/components/TraditionCard";
import EmailCapture from "@/components/EmailCapture";

export const metadata: Metadata = {
  title: "[SiteName] \u2014 Browse Faith Traditions",
  description:
    "Explore the history, beliefs, and practices of the world\u2019s major faith traditions. Every tradition presented with equal dignity and academic rigor.",
};

export default function TraditionsPage() {
  const traditions = getAllTraditions();

  return (
    <>
      {/* ── Header ── */}
      <section className="py-14 sm:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <h1 className="font-serif text-4xl sm:text-5xl text-ink-900 mb-4 leading-tight">
            Faith Traditions
          </h1>
          <p className="text-lg text-ink-500 max-w-2xl mx-auto leading-relaxed">
            Explore the history, beliefs, and practices of the world&rsquo;s
            major faith traditions.
          </p>
        </div>
      </section>

      {/* ── Traditions grid ── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {traditions.map((t) => (
            <TraditionCard key={t.slug} tradition={t} />
          ))}
        </div>
      </section>

      {/* ── Email Capture ── */}
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
        <EmailCapture />
      </div>
    </>
  );
}
