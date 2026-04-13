"use client";

import { useState } from "react";
import type { Story, JourneyType } from "@/lib/stories";
import { JOURNEY_LABELS, JOURNEY_COLORS } from "@/lib/stories";
import StoryCard from "@/components/StoryCard";

interface JourneyFilterProps {
  stories: Story[];
}

const journeyTypes: JourneyType[] = [
  "entering",
  "deepening",
  "questioning",
  "leaving",
  "returning",
];

export default function JourneyFilter({ stories }: JourneyFilterProps) {
  const [active, setActive] = useState<JourneyType | "all">("all");

  const filtered =
    active === "all"
      ? stories
      : stories.filter((s) => s.journeyType === active);

  return (
    <>
      {/* Filter tabs */}
      <div className="flex flex-wrap gap-2 mb-8">
        <button
          onClick={() => setActive("all")}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
            active === "all"
              ? "bg-primary-500 text-white"
              : "bg-cream-100 text-ink-600 hover:bg-cream-200"
          }`}
        >
          All
        </button>
        {journeyTypes.map((type) => (
          <button
            key={type}
            onClick={() => setActive(type)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              active === type
                ? JOURNEY_COLORS[type]
                : "bg-cream-100 text-ink-600 hover:bg-cream-200"
            }`}
          >
            {JOURNEY_LABELS[type]}
          </button>
        ))}
      </div>

      {/* Story grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filtered.map((story) => (
          <StoryCard key={story.slug} story={story} />
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="text-center text-ink-400 py-12">
          No stories found for this journey type yet.
        </p>
      )}
    </>
  );
}
