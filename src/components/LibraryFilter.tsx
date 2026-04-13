"use client";

import { useState, useMemo } from "react";
import type { Resource } from "@/lib/resources";
import type { Tradition } from "@/lib/traditions";
import ResourceCard from "@/components/ResourceCard";

interface LibraryFilterProps {
  resources: Resource[];
  traditions: Tradition[];
}

const perspectiveTypes = ["devotional", "questioning", "academic", "personal"] as const;

const resourceTypes = [
  "article",
  "paper",
  "story",
  "book",
  "podcast",
  "video",
  "document",
  "website",
] as const;

export default function LibraryFilter({
  resources,
  traditions,
}: LibraryFilterProps) {
  const [selectedTradition, setSelectedTradition] = useState<string>("all");
  const [selectedPerspective, setSelectedPerspective] = useState<string>("all");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const filtered = useMemo(() => {
    return resources.filter((r) => {
      if (selectedTradition !== "all" && r.traditionSlug !== selectedTradition)
        return false;
      if (selectedPerspective !== "all" && r.perspectiveType !== selectedPerspective)
        return false;
      if (selectedType !== "all" && r.type !== selectedType) return false;
      if (
        searchQuery.trim() &&
        !r.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !r.summary.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !(r.author ?? "").toLowerCase().includes(searchQuery.toLowerCase())
      )
        return false;
      return true;
    });
  }, [resources, selectedTradition, selectedPerspective, selectedType, searchQuery]);

  const pillBase =
    "px-3 py-1.5 text-sm rounded-xl border transition-colors font-medium cursor-pointer";
  const pillActive =
    "bg-primary-500 text-white border-primary-500";
  const pillInactive =
    "bg-cream-50 text-ink-600 border-cream-200 hover:border-primary-500/40";

  return (
    <div>
      {/* Search */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search by title, author, or keyword..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-4 py-3 rounded-xl border border-cream-200 bg-cream-50 text-ink-800 placeholder:text-ink-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
        />
      </div>

      {/* Tradition filter */}
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-ink-600 mb-2">Tradition</h3>
        <div className="flex flex-wrap gap-2">
          <button
            className={`${pillBase} ${selectedTradition === "all" ? pillActive : pillInactive}`}
            onClick={() => setSelectedTradition("all")}
          >
            All
          </button>
          {traditions.map((t) => (
            <button
              key={t.slug}
              className={`${pillBase} ${selectedTradition === t.slug ? pillActive : pillInactive}`}
              onClick={() => setSelectedTradition(t.slug)}
            >
              {t.name}
            </button>
          ))}
        </div>
      </div>

      {/* Perspective filter */}
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-ink-600 mb-2">Perspective</h3>
        <div className="flex flex-wrap gap-2">
          <button
            className={`${pillBase} ${selectedPerspective === "all" ? pillActive : pillInactive}`}
            onClick={() => setSelectedPerspective("all")}
          >
            All
          </button>
          {perspectiveTypes.map((p) => (
            <button
              key={p}
              className={`${pillBase} ${selectedPerspective === p ? pillActive : pillInactive}`}
              onClick={() => setSelectedPerspective(p)}
            >
              {p.charAt(0).toUpperCase() + p.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Resource type filter */}
      <div className="mb-8">
        <h3 className="text-sm font-semibold text-ink-600 mb-2">
          Resource Type
        </h3>
        <div className="flex flex-wrap gap-2">
          <button
            className={`${pillBase} ${selectedType === "all" ? pillActive : pillInactive}`}
            onClick={() => setSelectedType("all")}
          >
            All
          </button>
          {resourceTypes.map((t) => (
            <button
              key={t}
              className={`${pillBase} ${selectedType === t ? pillActive : pillInactive}`}
              onClick={() => setSelectedType(t)}
            >
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Results */}
      {filtered.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-ink-400 text-lg">
            No resources match your filters.
          </p>
          <button
            onClick={() => {
              setSelectedTradition("all");
              setSelectedPerspective("all");
              setSelectedType("all");
              setSearchQuery("");
            }}
            className="mt-4 text-primary-500 hover:text-primary-600 font-medium text-sm"
          >
            Clear all filters
          </button>
        </div>
      ) : (
        <>
          <p className="text-sm text-ink-400 mb-4">
            {filtered.length} resource{filtered.length !== 1 ? "s" : ""} found
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((r) => (
              <ResourceCard key={r.slug} resource={r} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
