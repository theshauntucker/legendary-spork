"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getAllTraditions } from "@/lib/traditions";
import { getAllResources } from "@/lib/resources";

interface SearchResult {
  type: "tradition" | "resource" | "tool" | "page";
  title: string;
  subtitle?: string;
  href: string;
}

const STATIC_PAGES: SearchResult[] = [
  { type: "tool", title: "Belief Explorer", subtitle: "BITE Model Assessment", href: "/tools/belief-explorer" },
  { type: "tool", title: "Tradition Compare", subtitle: "Side-by-side comparison", href: "/tools/tradition-compare" },
  { type: "tool", title: "Glossary", subtitle: "Religious terms explained", href: "/tools/glossary" },
  { type: "page", title: "Personal Stories", subtitle: "Faith journeys from real people", href: "/stories" },
  { type: "page", title: "Resource Library", subtitle: "Searchable index of all resources", href: "/library" },
  { type: "page", title: "About", subtitle: "Mission and editorial standards", href: "/about" },
];

function buildIndex(): SearchResult[] {
  const traditions = getAllTraditions().map((t) => ({
    type: "tradition" as const,
    title: t.name,
    subtitle: t.adherentCount || t.summary.slice(0, 60) + "...",
    href: `/traditions/${t.slug}`,
  }));

  const resources = getAllResources().map((r) => ({
    type: "resource" as const,
    title: r.title,
    subtitle: `${r.type} \u00b7 ${r.perspectiveType}`,
    href: `/traditions/${r.traditionSlugs?.[0] || r.traditionSlug}/resources/${r.slug}`,
  }));

  return [...traditions, ...resources, ...STATIC_PAGES];
}

interface SearchBarProps {
  large?: boolean;
  placeholder?: string;
  className?: string;
}

export default function SearchBar({
  large = false,
  placeholder = "Search traditions, resources, topics\u2026",
  className = "",
}: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const indexRef = useRef<SearchResult[] | null>(null);

  function getIndex() {
    if (!indexRef.current) {
      indexRef.current = buildIndex();
    }
    return indexRef.current;
  }

  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    const lowerQuery = query.toLowerCase();
    const filtered = getIndex()
      .filter(
        (item) =>
          item.title.toLowerCase().includes(lowerQuery) ||
          item.subtitle?.toLowerCase().includes(lowerQuery)
      )
      .slice(0, 8);

    setResults(filtered);
    setIsOpen(filtered.length > 0);
    setActiveIndex(-1);
  }, [query]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((prev) => Math.min(prev + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((prev) => Math.max(prev - 1, -1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (activeIndex >= 0 && results[activeIndex]) {
        router.push(results[activeIndex].href);
        setIsOpen(false);
        setQuery("");
      } else if (query.length >= 2) {
        router.push(`/search?q=${encodeURIComponent(query)}`);
        setIsOpen(false);
      }
    } else if (e.key === "Escape") {
      setIsOpen(false);
      inputRef.current?.blur();
    }
  }

  function navigate(href: string) {
    router.push(href);
    setIsOpen(false);
    setQuery("");
  }

  const typeLabels: Record<string, string> = {
    tradition: "Tradition",
    resource: "Resource",
    tool: "Tool",
    page: "Page",
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <div className="relative">
        <svg
          className={`absolute left-4 top-1/2 -translate-y-1/2 text-ink-400 ${large ? "w-5 h-5" : "w-4 h-4"}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => query.length >= 2 && results.length > 0 && setIsOpen(true)}
          placeholder={placeholder}
          className={`w-full bg-cream-50 border border-cream-200 text-ink-800 placeholder:text-ink-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all ${
            large
              ? "pl-12 pr-4 py-4 text-lg rounded-2xl shadow-sm"
              : "pl-10 pr-4 py-2.5 text-sm rounded-xl"
          }`}
        />
      </div>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-cream-50 border border-cream-200 rounded-xl shadow-lg overflow-hidden z-50">
          {results.map((result, i) => (
            <button
              key={`${result.href}-${i}`}
              onClick={() => navigate(result.href)}
              className={`w-full text-left px-4 py-3 flex items-center justify-between hover:bg-cream-100 transition-colors ${
                i === activeIndex ? "bg-cream-100" : ""
              } ${i > 0 ? "border-t border-cream-200/50" : ""}`}
            >
              <div>
                <p className="text-sm font-medium text-ink-800">{result.title}</p>
                {result.subtitle && (
                  <p className="text-xs text-ink-400 mt-0.5">{result.subtitle}</p>
                )}
              </div>
              <span className="text-xs text-ink-400 bg-cream-100 px-2 py-0.5 rounded-full">
                {typeLabels[result.type]}
              </span>
            </button>
          ))}
          <button
            onClick={() => {
              router.push(`/search?q=${encodeURIComponent(query)}`);
              setIsOpen(false);
            }}
            className="w-full text-left px-4 py-3 text-sm text-primary-600 hover:bg-cream-100 border-t border-cream-200 transition-colors"
          >
            See all results for &ldquo;{query}&rdquo;
          </button>
        </div>
      )}
    </div>
  );
}
