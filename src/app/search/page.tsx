"use client";

import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { getAllTraditions } from "@/lib/traditions";
import { getAllResources } from "@/lib/resources";
import { getAllGroups } from "@/lib/groups";
import ResourceCard from "@/components/ResourceCard";
import AdUnit from "@/components/AdUnit";
import SearchBar from "@/components/SearchBar";

type ResultType = "tradition" | "resource" | "group";

interface SearchResult {
  type: ResultType;
  title: string;
  subtitle?: string;
  href: string;
  tags?: string[];
}

export default function SearchPage() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || "";
  const [query, setQuery] = useState(initialQuery);
  const [filterType, setFilterType] = useState<ResultType | "all">("all");

  useEffect(() => {
    const q = searchParams.get("q");
    if (q) setQuery(q);
  }, [searchParams]);

  const allResults = useMemo(() => {
    const results: SearchResult[] = [];

    for (const t of getAllTraditions()) {
      results.push({
        type: "tradition",
        title: t.name,
        subtitle: t.summary,
        href: `/traditions/${t.slug}`,
        tags: t.alternateNames,
      });
    }

    for (const r of getAllResources()) {
      results.push({
        type: "resource",
        title: r.title,
        subtitle: `${r.type} \u00b7 ${r.perspectiveType} \u00b7 ${r.traditionSlug}`,
        href: `/traditions/${r.traditionSlug}/resources/${r.slug}`,
        tags: r.tags,
      });
    }

    for (const g of getAllGroups()) {
      results.push({
        type: "group",
        title: g.name,
        subtitle: g.aliases.join(", "),
        href: `/groups/${g.slug}`,
        tags: [g.religion],
      });
    }

    return results;
  }, []);

  const filteredResults = useMemo(() => {
    if (!query || query.length < 2) return [];

    const lowerQuery = query.toLowerCase();
    return allResults
      .filter((r) => {
        if (filterType !== "all" && r.type !== filterType) return false;
        return (
          r.title.toLowerCase().includes(lowerQuery) ||
          r.subtitle?.toLowerCase().includes(lowerQuery) ||
          r.tags?.some((t) => t.toLowerCase().includes(lowerQuery))
        );
      })
      .slice(0, 50);
  }, [query, filterType, allResults]);

  const resources = getAllResources();
  const matchingResources = useMemo(() => {
    if (!query || query.length < 2) return [];
    const lowerQuery = query.toLowerCase();
    return resources.filter(
      (r) =>
        r.title.toLowerCase().includes(lowerQuery) ||
        r.summary.toLowerCase().includes(lowerQuery) ||
        r.tags.some((t) => t.toLowerCase().includes(lowerQuery))
    );
  }, [query, resources]);

  const typeFilters: { value: ResultType | "all"; label: string }[] = [
    { value: "all", label: "All" },
    { value: "tradition", label: "Traditions" },
    { value: "resource", label: "Resources" },
    { value: "group", label: "Groups" },
  ];

  return (
    <>
      <section className="py-10 sm:py-14">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <h1 className="font-serif text-3xl text-ink-900 mb-6">Search</h1>
          <SearchBar
            large
            placeholder="Search traditions, resources, groups, topics..."
          />

          {/* Manual search input for the full page */}
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type to search..."
            className="w-full mt-4 px-4 py-3 bg-cream-50 border border-cream-200 rounded-xl text-ink-800 placeholder:text-ink-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
      </section>

      <section className="max-w-3xl mx-auto px-4 sm:px-6 pb-20">
        {/* Type filters */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
          {typeFilters.map((f) => (
            <button
              key={f.value}
              onClick={() => setFilterType(f.value)}
              className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                filterType === f.value
                  ? "bg-primary-500 text-white"
                  : "bg-cream-100 text-ink-600 hover:bg-cream-200"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <AdUnit slot="search-top" format="horizontal" />

        {/* Results */}
        {query.length >= 2 ? (
          <>
            <p className="text-sm text-ink-400 mb-4">
              {filteredResults.length} results for &ldquo;{query}&rdquo;
            </p>

            {/* Resource card results */}
            {(filterType === "all" || filterType === "resource") &&
              matchingResources.length > 0 && (
                <div className="grid grid-cols-1 gap-3 mb-8">
                  {matchingResources.slice(0, 12).map((r) => (
                    <ResourceCard key={r.slug} resource={r} />
                  ))}
                </div>
              )}

            {/* Other results */}
            <div className="divide-y divide-cream-200">
              {filteredResults
                .filter((r) => r.type !== "resource")
                .map((result, i) => (
                  <Link
                    key={`${result.href}-${i}`}
                    href={result.href}
                    className="block py-4 group"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs text-ink-400 bg-cream-100 px-2 py-0.5 rounded-full">
                        {result.type}
                      </span>
                    </div>
                    <h3 className="font-serif font-medium text-ink-900 group-hover:text-primary-600 transition-colors">
                      {result.title}
                    </h3>
                    {result.subtitle && (
                      <p className="text-sm text-ink-500 mt-0.5 line-clamp-1">
                        {result.subtitle}
                      </p>
                    )}
                  </Link>
                ))}
            </div>

            {filteredResults.length === 0 && (
              <p className="text-center text-ink-400 py-12">
                No results found. Try different keywords.
              </p>
            )}
          </>
        ) : (
          <p className="text-center text-ink-400 py-12">
            Enter at least 2 characters to search.
          </p>
        )}
      </section>
    </>
  );
}
