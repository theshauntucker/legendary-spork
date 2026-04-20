"use client";

import { useState, useMemo, useCallback } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  Plus,
  Search,
  Trophy,
  ChevronRight,
  X,
  Pencil,
  Archive,
  Sparkles,
} from "lucide-react";

interface Studio {
  id: string;
  name: string;
  invite_code: string;
  region: string | null;
}

interface RosterDancer {
  id: string;
  name: string;
  nickname: string | null;
  dateOfBirth: string | null;
  ageGroup: string | null;
  level: string | null;
  primaryStyle: string | null;
  notes: string | null;
  createdAt: string | null;
  routineCount: number;
  bestScore: number | null;
  latestScore: number | null;
}

const AGE_GROUPS = [
  "Mini (5-6)",
  "Petite (6-9)",
  "Junior (9-12)",
  "Teen (12-15)",
  "Senior (15-19)",
  "Adult (20+)",
];
const LEVELS = ["Competitive", "Recreational", "Cheer", "Other"];
const STYLES = [
  "Jazz",
  "Contemporary",
  "Lyrical",
  "Hip Hop",
  "Tap",
  "Ballet",
  "Musical Theater",
  "Pom",
  "Acro",
  "Cheer",
  "Open / Freestyle",
];

type DrawerMode =
  | { kind: "closed" }
  | { kind: "add" }
  | { kind: "edit"; dancer: RosterDancer };

export default function RosterClient({
  studio,
  role,
  initialRoster,
}: {
  studio: Studio;
  role: "owner" | "choreographer" | "viewer";
  initialRoster: RosterDancer[];
}) {
  const [roster, setRoster] = useState<RosterDancer[]>(initialRoster);
  const [query, setQuery] = useState("");
  const [drawer, setDrawer] = useState<DrawerMode>({ kind: "closed" });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canEdit = role === "owner" || role === "choreographer";

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return roster;
    return roster.filter(
      (d) =>
        d.name.toLowerCase().includes(q) ||
        (d.nickname && d.nickname.toLowerCase().includes(q)) ||
        (d.primaryStyle && d.primaryStyle.toLowerCase().includes(q)),
    );
  }, [roster, query]);

  const aggregate = useMemo(() => {
    const total = roster.length;
    const analyzed = roster.filter((d) => d.routineCount > 0).length;
    const routines = roster.reduce((s, d) => s + d.routineCount, 0);
    const bestScore = roster.reduce(
      (s, d) => (d.bestScore != null && d.bestScore > s ? d.bestScore : s),
      0,
    );
    return { total, analyzed, routines, bestScore };
  }, [roster]);

  const handleSave = useCallback(
    async (form: Partial<RosterDancer> & { name: string }) => {
      setBusy(true);
      setError(null);
      try {
        const isEdit = drawer.kind === "edit";
        const url = isEdit
          ? `/api/studio/dancers/${drawer.kind === "edit" ? drawer.dancer.id : ""}`
          : "/api/studio/dancers";
        const method = isEdit ? "PATCH" : "POST";
        const res = await fetch(url, {
          method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        if (!res.ok) {
          const { error: msg } = await res.json().catch(() => ({}));
          throw new Error(msg || "Save failed");
        }
        const { dancer } = await res.json();
        const normalized: RosterDancer = {
          id: dancer.id,
          name: dancer.name,
          nickname: dancer.nickname,
          dateOfBirth: dancer.date_of_birth,
          ageGroup: dancer.age_group,
          level: dancer.level,
          primaryStyle: dancer.primary_style,
          notes: dancer.notes,
          createdAt: dancer.created_at,
          routineCount: isEdit
            ? drawer.kind === "edit"
              ? drawer.dancer.routineCount
              : 0
            : 0,
          bestScore: isEdit
            ? drawer.kind === "edit"
              ? drawer.dancer.bestScore
              : null
            : null,
          latestScore: isEdit
            ? drawer.kind === "edit"
              ? drawer.dancer.latestScore
              : null
            : null,
        };
        setRoster((prev) =>
          isEdit
            ? prev.map((d) => (d.id === normalized.id ? normalized : d))
            : [...prev, normalized].sort((a, b) => a.name.localeCompare(b.name)),
        );
        setDrawer({ kind: "closed" });
      } catch (e) {
        setError(e instanceof Error ? e.message : "Save failed");
      } finally {
        setBusy(false);
      }
    },
    [drawer],
  );

  const handleArchive = useCallback(async (id: string) => {
    if (!confirm("Archive this dancer? Their past analyses stay linked; they just won't show in the active roster.")) return;
    const res = await fetch(`/api/studio/dancers/${id}`, { method: "DELETE" });
    if (res.ok) {
      setRoster((prev) => prev.filter((d) => d.id !== id));
    }
  }, []);

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="fixed inset-0 -z-10">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent-500/10 rounded-full blur-3xl" />
      </div>

      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <Link
            href="/studio/dashboard"
            className="flex items-center gap-2 text-surface-200 hover:text-white transition-colors text-sm"
          >
            <Sparkles className="h-4 w-4 text-primary-400" />
            <span className="font-bold">
              {studio.name} <span className="text-surface-200/60">Dashboard</span>
            </span>
          </Link>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8 mt-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500/30 to-accent-500/30">
                <Users className="h-5 w-5 text-primary-300" />
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold font-[family-name:var(--font-display)]">
                Studio Roster
              </h1>
            </div>
            <p className="text-surface-200 ml-[52px] text-sm">
              Enter each dancer once — they&apos;ll auto-fill on every routine upload,
              and their scores roll up into per-dancer stats.
            </p>
          </div>

          {canEdit && (
            <button
              onClick={() => setDrawer({ kind: "add" })}
              className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-primary-600 via-accent-500 to-gold-500 px-5 py-3 font-semibold text-white hover:opacity-90 transition-opacity"
            >
              <Plus className="h-4 w-4" />
              Add Dancer
            </button>
          )}
        </div>

        {/* Aggregate stats */}
        {roster.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
            {[
              { label: "On Roster", value: aggregate.total, icon: Users },
              { label: "With Analyses", value: aggregate.analyzed, icon: Trophy },
              { label: "Routines Analyzed", value: aggregate.routines, icon: Sparkles },
              {
                label: "Best Score",
                value: aggregate.bestScore > 0 ? aggregate.bestScore : "—",
                icon: Trophy,
              },
            ].map((stat) => (
              <div key={stat.label} className="glass rounded-2xl p-4 text-center">
                <stat.icon className="mx-auto h-4 w-4 text-gold-400 mb-1.5" />
                <p className="text-xl font-bold gradient-text">{stat.value}</p>
                <p className="text-[11px] text-surface-200 mt-0.5">{stat.label}</p>
              </div>
            ))}
          </div>
        )}

        {/* Search */}
        {roster.length > 0 && (
          <div className="relative mb-5">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-surface-200" />
            <input
              type="text"
              placeholder="Search dancers by name, nickname, or style..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full rounded-xl bg-white/5 border border-white/10 pl-11 pr-4 py-3 text-sm text-white placeholder-surface-200/50 focus:outline-none focus:border-primary-500 transition-colors"
            />
          </div>
        )}

        {/* Roster list */}
        {roster.length === 0 ? (
          <div className="glass rounded-3xl p-16 text-center">
            <Users className="mx-auto h-14 w-14 text-primary-400/40 mb-4" />
            <h2 className="text-2xl font-bold mb-2">Build your roster once</h2>
            <p className="text-surface-200 mb-6 max-w-md mx-auto text-sm">
              Add every dancer in your studio. After that, uploading a routine is
              a tap — pick the dancer, pick the routine, done. No more retyping
              names every time.
            </p>
            {canEdit && (
              <button
                onClick={() => setDrawer({ kind: "add" })}
                className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-primary-600 via-accent-500 to-gold-500 px-6 py-3.5 font-bold text-white hover:opacity-90 transition-opacity"
              >
                <Plus className="h-4 w-4" />
                Add Your First Dancer
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((d) => (
              <div
                key={d.id}
                className="group glass rounded-2xl p-4 sm:p-5 hover:border-primary-500/30 transition-all"
              >
                <div className="flex items-center gap-4">
                  <Link
                    href={`/studio/dancer/${d.id}`}
                    className="flex-1 min-w-0 flex items-center gap-4"
                  >
                    <div className="shrink-0 flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500/20 via-accent-500/20 to-gold-500/20 text-sm font-bold text-white">
                      {d.name
                        .split(" ")
                        .map((w) => w.charAt(0).toUpperCase())
                        .slice(0, 2)
                        .join("")}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-white group-hover:text-primary-300 transition-colors truncate">
                          {d.name}
                        </h3>
                        {d.nickname && (
                          <span className="text-xs text-surface-200 truncate">
                            &quot;{d.nickname}&quot;
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-surface-200 mt-0.5">
                        {d.ageGroup && <span>{d.ageGroup}</span>}
                        {d.ageGroup && d.level && <span className="text-white/20">·</span>}
                        {d.level && <span>{d.level}</span>}
                        {d.primaryStyle && <span className="text-white/20">·</span>}
                        {d.primaryStyle && <span>{d.primaryStyle}</span>}
                      </div>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-sm font-semibold text-white">
                        {d.routineCount}{" "}
                        <span className="text-xs text-surface-200 font-normal">
                          {d.routineCount === 1 ? "routine" : "routines"}
                        </span>
                      </p>
                      {d.bestScore != null && (
                        <p className="text-xs text-gold-300">Best: {d.bestScore}</p>
                      )}
                    </div>
                    <ChevronRight className="shrink-0 h-4 w-4 text-surface-200 group-hover:text-white group-hover:translate-x-1 transition-all" />
                  </Link>

                  {canEdit && (
                    <div className="shrink-0 flex items-center gap-1">
                      <button
                        onClick={() => setDrawer({ kind: "edit", dancer: d })}
                        className="p-2 rounded-lg text-surface-200 hover:text-white hover:bg-white/5"
                        aria-label="Edit dancer"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleArchive(d.id)}
                        className="p-2 rounded-lg text-surface-200 hover:text-red-300 hover:bg-red-500/10"
                        aria-label="Archive dancer"
                      >
                        <Archive className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
            {filtered.length === 0 && query && (
              <p className="text-center text-sm text-surface-200 py-6">
                No dancers match &quot;{query}&quot;.
              </p>
            )}
          </div>
        )}
      </div>

      {/* Add/Edit drawer */}
      <AnimatePresence>
        {drawer.kind !== "closed" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-4"
            onClick={() => !busy && setDrawer({ kind: "closed" })}
          >
            <motion.div
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 40, opacity: 0 }}
              className="w-full max-w-lg rounded-3xl bg-surface-900 border border-white/10 p-6 sm:p-8"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold">
                  {drawer.kind === "edit" ? "Edit Dancer" : "Add Dancer"}
                </h2>
                <button
                  onClick={() => setDrawer({ kind: "closed" })}
                  disabled={busy}
                  className="p-2 rounded-lg text-surface-200 hover:text-white hover:bg-white/5"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <DancerForm
                initial={drawer.kind === "edit" ? drawer.dancer : undefined}
                busy={busy}
                error={error}
                onSubmit={handleSave}
                onCancel={() => setDrawer({ kind: "closed" })}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function DancerForm({
  initial,
  busy,
  error,
  onSubmit,
  onCancel,
}: {
  initial?: RosterDancer;
  busy: boolean;
  error: string | null;
  onSubmit: (form: {
    name: string;
    nickname?: string;
    dateOfBirth?: string;
    ageGroup?: string;
    level?: string;
    primaryStyle?: string;
    notes?: string;
  }) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState(initial?.name ?? "");
  const [nickname, setNickname] = useState(initial?.nickname ?? "");
  const [dateOfBirth, setDateOfBirth] = useState(initial?.dateOfBirth ?? "");
  const [ageGroup, setAgeGroup] = useState(initial?.ageGroup ?? "");
  const [level, setLevel] = useState(initial?.level ?? "");
  const [primaryStyle, setPrimaryStyle] = useState(initial?.primaryStyle ?? "");
  const [notes, setNotes] = useState(initial?.notes ?? "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSubmit({
      name: name.trim(),
      nickname: nickname.trim() || undefined,
      dateOfBirth: dateOfBirth || undefined,
      ageGroup: ageGroup || undefined,
      level: level || undefined,
      primaryStyle: primaryStyle || undefined,
      notes: notes.trim() || undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1.5">
            Name <span className="text-accent-400">*</span>
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            maxLength={120}
            placeholder="Emma Johnson"
            className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-sm text-white placeholder-surface-200/50 focus:outline-none focus:border-primary-500 transition-colors"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1.5">Nickname</label>
          <input
            type="text"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            maxLength={60}
            placeholder="Em"
            className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-sm text-white placeholder-surface-200/50 focus:outline-none focus:border-primary-500 transition-colors"
          />
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1.5">Date of Birth</label>
          <input
            type="date"
            value={dateOfBirth}
            onChange={(e) => setDateOfBirth(e.target.value)}
            className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-sm text-white focus:outline-none focus:border-primary-500 transition-colors [color-scheme:dark]"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1.5">Age Division</label>
          <select
            value={ageGroup}
            onChange={(e) => setAgeGroup(e.target.value)}
            className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-sm text-white focus:outline-none focus:border-primary-500 transition-colors appearance-none"
          >
            <option value="" className="bg-surface-900">
              —
            </option>
            {AGE_GROUPS.map((ag) => (
              <option key={ag} value={ag} className="bg-surface-900">
                {ag}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1.5">Level</label>
          <select
            value={level}
            onChange={(e) => setLevel(e.target.value)}
            className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-sm text-white focus:outline-none focus:border-primary-500 transition-colors appearance-none"
          >
            <option value="" className="bg-surface-900">
              —
            </option>
            {LEVELS.map((l) => (
              <option key={l} value={l} className="bg-surface-900">
                {l}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1.5">Primary Style</label>
          <select
            value={primaryStyle}
            onChange={(e) => setPrimaryStyle(e.target.value)}
            className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-sm text-white focus:outline-none focus:border-primary-500 transition-colors appearance-none"
          >
            <option value="" className="bg-surface-900">
              —
            </option>
            {STYLES.map((s) => (
              <option key={s} value={s} className="bg-surface-900">
                {s}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1.5">Notes</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={2}
          maxLength={500}
          placeholder="Strong lyrical technique, working on turns this season…"
          className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-sm text-white placeholder-surface-200/50 focus:outline-none focus:border-primary-500 transition-colors resize-none"
        />
      </div>

      {error && <p className="text-sm text-red-400">{error}</p>}

      <div className="flex flex-col-reverse sm:flex-row gap-2 pt-2">
        <button
          type="button"
          onClick={onCancel}
          disabled={busy}
          className="flex-1 py-3 rounded-xl border border-white/10 text-sm font-medium hover:bg-white/5 transition-colors disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={busy || !name.trim()}
          className="flex-1 py-3 rounded-xl bg-gradient-to-r from-primary-600 via-accent-500 to-gold-500 text-sm font-bold text-white hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {busy ? "Saving..." : initial ? "Save Changes" : "Add to Roster"}
        </button>
      </div>
    </form>
  );
}
