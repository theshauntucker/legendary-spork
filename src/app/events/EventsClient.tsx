"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Calendar, MapPin, ExternalLink, Search, Star, Trophy, Sparkles, Filter } from "lucide-react";
import {
  DANCE_EVENTS,
  MONTH_NAMES,
  TYPE_LABELS,
  TYPE_COLORS,
  type EventType,
} from "@/data/competitions";

const CURRENT_MONTH = new Date().getMonth() + 1;

export default function EventsClient() {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<EventType | "all">("all");
  const [styleFilter, setStyleFilter] = useState("all");
  const [showFeaturedOnly, setShowFeaturedOnly] = useState(false);

  const allStyles = useMemo(() => {
    const s = new Set<string>();
    DANCE_EVENTS.forEach((e) => e.styles.forEach((st) => s.add(st)));
    return ["all", ...Array.from(s).sort()];
  }, []);

  const filtered = useMemo(() => {
    return DANCE_EVENTS.filter((event) => {
      if (search && !event.name.toLowerCase().includes(search.toLowerCase()) &&
          !event.description.toLowerCase().includes(search.toLowerCase()) &&
          !event.styles.some(s => s.toLowerCase().includes(search.toLowerCase()))) {
        return false;
      }
      if (typeFilter !== "all" && event.type !== typeFilter) return false;
      if (styleFilter !== "all" && !event.styles.includes(styleFilter) && !event.styles.includes("All styles")) return false;
      if (showFeaturedOnly && !event.featured) return false;
      return true;
    });
  }, [search, typeFilter, styleFilter, showFeaturedOnly]);

  const featured = DANCE_EVENTS.filter((e) => e.featured);
  const upcoming = DANCE_EVENTS.filter((e) =>
    e.typicalMonths.some((m) => m >= CURRENT_MONTH)
  ).slice(0, 4);

  return (
    <div className="min-h-screen pt-24 pb-20 px-4">
      {/* Background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent-500/10 rounded-full blur-3xl" />
      </div>

      <div className="mx-auto max-w-6xl">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-primary-500/30 bg-primary-500/10 px-4 py-1.5 mb-5">
            <Calendar className="h-4 w-4 text-primary-400" />
            <span className="text-sm text-primary-200">2025–2026 Season</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold font-[family-name:var(--font-display)] mb-4">
            Dance Competition &{" "}
            <span className="gradient-text">Convention Calendar</span>
          </h1>
          <p className="text-lg text-surface-200 max-w-2xl mx-auto">
            Every major dance competition and convention in one place. Find your next event, prep your routine with AI analysis, and walk in with confidence.
          </p>
          <div className="mt-6">
            <a
              href="/signup"
              className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-primary-600 to-accent-500 px-6 py-3 font-bold text-white hover:opacity-90 transition-opacity text-sm"
            >
              <Sparkles className="h-4 w-4" />
              Analyze Your Routine Before the Competition
            </a>
          </div>
        </motion.div>

        {/* Featured Events Strip */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-12"
        >
          <div className="flex items-center gap-2 mb-5">
            <Star className="h-4 w-4 text-gold-400" />
            <h2 className="font-bold text-lg">Featured Events</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {featured.map((event, i) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
                className="glass rounded-2xl p-5 border border-gold-500/20 hover:border-gold-500/40 transition-colors group"
              >
                <div className="flex items-start justify-between mb-3">
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${TYPE_COLORS[event.type]}`}>
                    {TYPE_LABELS[event.type]}
                  </span>
                  <a
                    href={event.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-surface-200 hover:text-white transition-colors"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </div>
                <h3 className="font-bold mb-1 group-hover:text-primary-300 transition-colors">{event.name}</h3>
                <p className="text-xs text-surface-200 mb-3 line-clamp-2">{event.description}</p>
                <div className="flex flex-wrap gap-1 mb-3">
                  {event.styles.slice(0, 3).map((s) => (
                    <span key={s} className="text-xs bg-white/5 text-surface-200 px-2 py-0.5 rounded-full">{s}</span>
                  ))}
                  {event.styles.length > 3 && (
                    <span className="text-xs text-surface-200/60 px-1 py-0.5">+{event.styles.length - 3} more</span>
                  )}
                </div>
                <div className="flex items-center gap-1 text-xs text-surface-200/70">
                  <Calendar className="h-3 w-3" />
                  <span>{event.typicalMonths.map(m => MONTH_NAMES[m]).join(", ")}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* RoutineX promo banner */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-12 rounded-2xl border border-primary-500/20 bg-gradient-to-r from-primary-500/10 via-accent-500/5 to-gold-500/10 p-6 flex flex-col sm:flex-row items-center justify-between gap-4"
        >
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-accent-500">
              <Trophy className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="font-bold">Prep your routine before the competition</p>
              <p className="text-sm text-surface-200">Get AI competition scoring — just like a real judge — before you hit the stage.</p>
            </div>
          </div>
          <a
            href="/signup"
            className="shrink-0 rounded-full bg-gradient-to-r from-primary-600 to-accent-500 px-5 py-2.5 text-sm font-bold text-white hover:opacity-90 transition-opacity whitespace-nowrap"
          >
            Try Free — No Card
          </a>
        </motion.div>

        {/* All Events — Searchable & Filterable */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.25 }}
        >
          <div className="flex items-center gap-2 mb-5">
            <Filter className="h-4 w-4 text-surface-200" />
            <h2 className="font-bold text-lg">All Events</h2>
            <span className="text-xs text-surface-200 ml-1">({filtered.length} found)</span>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3 mb-8">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-surface-200" />
              <input
                type="text"
                placeholder="Search competitions, styles, organizers..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-xl bg-white/5 border border-white/10 pl-9 pr-4 py-2.5 text-sm text-white placeholder-surface-200/50 focus:outline-none focus:border-primary-500 transition-colors"
              />
            </div>

            {/* Type filter */}
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as EventType | "all")}
              className="rounded-xl bg-white/5 border border-white/10 px-4 py-2.5 text-sm text-white focus:outline-none focus:border-primary-500 transition-colors"
            >
              <option value="all">All Types</option>
              <option value="competition">Competitions</option>
              <option value="convention">Conventions</option>
              <option value="nationals">Nationals</option>
            </select>

            {/* Featured toggle */}
            <button
              onClick={() => setShowFeaturedOnly(!showFeaturedOnly)}
              className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold border transition-colors ${
                showFeaturedOnly
                  ? "bg-gold-500/20 border-gold-500/40 text-gold-300"
                  : "bg-white/5 border-white/10 text-surface-200 hover:bg-white/10"
              }`}
            >
              <Star className="h-4 w-4" />
              Featured Only
            </button>
          </div>

          {/* Event cards grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((event, i) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: Math.min(i * 0.04, 0.4) }}
                className="glass rounded-2xl p-6 border border-white/10 hover:border-primary-500/30 transition-colors flex flex-col group"
              >
                <div className="flex items-start justify-between mb-3">
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${TYPE_COLORS[event.type]}`}>
                    {TYPE_LABELS[event.type]}
                  </span>
                  <div className="flex items-center gap-2">
                    {event.featured && (
                      <Star className="h-3.5 w-3.5 text-gold-400" />
                    )}
                    <a
                      href={event.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-surface-200 hover:text-white transition-colors"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </div>
                </div>

                <h3 className="font-bold text-base mb-2 group-hover:text-primary-300 transition-colors leading-snug">{event.name}</h3>
                <p className="text-sm text-surface-200 mb-4 flex-1 line-clamp-3">{event.description}</p>

                {event.notes && (
                  <p className="text-xs text-gold-300/80 italic mb-3">{event.notes}</p>
                )}

                {/* Styles */}
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {event.styles.slice(0, 4).map((s) => (
                    <span key={s} className="text-xs bg-white/5 text-surface-200 px-2 py-0.5 rounded-full">{s}</span>
                  ))}
                  {event.styles.length > 4 && (
                    <span className="text-xs text-surface-200/50">+{event.styles.length - 4}</span>
                  )}
                </div>

                {/* Meta */}
                <div className="space-y-1.5">
                  <div className="flex items-center gap-1.5 text-xs text-surface-200/70">
                    <Calendar className="h-3.5 w-3.5 shrink-0" />
                    <span>Typical season: {event.typicalMonths.map(m => MONTH_NAMES[m].slice(0, 3)).join(", ")}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-surface-200/70">
                    <MapPin className="h-3.5 w-3.5 shrink-0" />
                    <span>{event.regions.join(", ")}</span>
                  </div>
                </div>
              </motion.div>
            ))}

            {filtered.length === 0 && (
              <div className="col-span-3 text-center py-16 text-surface-200">
                <Calendar className="h-10 w-10 mx-auto mb-3 opacity-30" />
                <p className="font-medium">No events match your filters</p>
                <button onClick={() => { setSearch(""); setTypeFilter("all"); setStyleFilter("all"); setShowFeaturedOnly(false); }} className="mt-3 text-sm text-primary-400 hover:underline">
                  Clear filters
                </button>
              </div>
            )}
          </div>
        </motion.div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mt-16 text-center"
        >
          <h2 className="text-2xl font-bold mb-3">Ready for the Competition Stage?</h2>
          <p className="text-surface-200 mb-6 max-w-xl mx-auto">
            Upload your routine and get AI-powered scoring before your next competition. Know exactly what the judges will see — and fix it first.
          </p>
          <a
            href="/signup"
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-primary-600 via-accent-500 to-gold-500 px-8 py-4 text-lg font-bold text-white hover:opacity-90 transition-opacity"
          >
            <Sparkles className="h-5 w-5" />
            Analyze Free — No Card Required
          </a>
        </motion.div>
      </div>
    </div>
  );
}
