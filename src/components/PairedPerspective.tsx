import Link from "next/link";
import type { Resource } from "@/lib/resources";

interface PairedPerspectiveProps {
  resource: Resource;
  paired: Resource;
}

export default function PairedPerspective({
  resource,
  paired,
}: PairedPerspectiveProps) {
  return (
    <section className="bg-cream-100 border border-cream-200 rounded-2xl p-6">
      <h3 className="font-serif font-semibold text-lg text-ink-900 mb-4">
        Related viewpoints on this topic
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 relative">
        {/* Visual connector */}
        <div className="hidden sm:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-cream-100 border border-cream-200 items-center justify-center">
          <span className="text-xs text-ink-400 font-medium">vs</span>
        </div>
        {/* Current resource */}
        <div className="bg-cream-50 rounded-xl p-4 border border-cream-200">
          <span className="text-xs font-medium text-primary-600 uppercase tracking-wide">
            {resource.perspectiveType}
          </span>
          <h4 className="font-serif font-semibold text-ink-800 mt-1">
            {resource.title}
          </h4>
          <p className="text-sm text-ink-500 mt-1">{resource.summary}</p>
        </div>

        {/* Paired resource */}
        <Link
          href={`/traditions/${paired.traditionSlug}/resources/${paired.slug}`}
          className="bg-cream-50 rounded-xl p-4 border border-cream-200 hover:border-primary-500/30 transition-all"
        >
          <span className="text-xs font-medium text-accent-600 uppercase tracking-wide">
            {paired.perspectiveType}
          </span>
          <h4 className="font-serif font-semibold text-ink-800 mt-1">
            {paired.title}
          </h4>
          <p className="text-sm text-ink-500 mt-1">{paired.summary}</p>
        </Link>
      </div>
    </section>
  );
}
