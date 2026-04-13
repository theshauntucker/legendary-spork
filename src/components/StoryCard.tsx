import Link from "next/link";
import type { Story } from "@/lib/stories";
import { JOURNEY_LABELS, JOURNEY_COLORS, getTraditionName } from "@/lib/stories";

interface StoryCardProps {
  story: Story;
}

export default function StoryCard({ story }: StoryCardProps) {
  return (
    <Link href={`/stories/${story.slug}`}>
      <article className="bg-white border border-cream-200 rounded-2xl p-6 hover:shadow-md hover:border-primary-500/30 transition-all duration-200 h-full flex flex-col">
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <span
            className={`inline-block px-3 py-0.5 rounded-full text-xs font-semibold ${JOURNEY_COLORS[story.journeyType]}`}
          >
            {JOURNEY_LABELS[story.journeyType]}
          </span>
          <span className="text-xs text-ink-400">
            {getTraditionName(story.traditionSlug)}
          </span>
        </div>

        <h3 className="font-serif font-semibold text-lg text-ink-900 mb-2 leading-snug">
          {story.title}
        </h3>

        <p className="text-sm text-ink-500 leading-relaxed mb-4 flex-1">
          {story.excerpt}
        </p>

        <div className="flex items-center justify-between text-xs text-ink-400">
          <span>{story.authorName}</span>
          <span className="text-primary-600 font-medium">
            Read story &rarr;
          </span>
        </div>
      </article>
    </Link>
  );
}
