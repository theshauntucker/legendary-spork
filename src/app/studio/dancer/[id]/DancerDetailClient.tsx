"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Pencil,
  Archive,
  Trophy,
  Calendar,
  Music,
  Video,
  Sparkles,
  ChevronRight,
  X,
} from "lucide-react";

interface Studio {
  id: string;
  name: string;
  invite_code: string;
  region: string | null;
}

interface DancerPayload {
  id: string;
  name: string;
  nickname: string | null;
  dateOfBirth: string | null;
  ageGroup: string | null;
  level: string | null;
  primaryStyle: string | null;
  notes: string | null;
  isActive: boolean;
  archivedAt: string | null;
  createdAt: string | null;
}

interface StatsPayload {
  routineCount: number;
  bestScore: number | null;
  avgScore: number | null;
  latestScore: number | null;
  styles: string[];
  pendingCount: number;
}

interface RoutineRow {
  videoId: string;
  routineName: string | null;
  style: string | null;
  entryType: string | null;
  competitionName: string | null;
  competitionDate: string | null;
  ageGroup: string | null;
  uploadedAt: string;
  analysisId: string | null;
  totalScore: number | null;
  awardLevel: string | null;
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

function initialsOf(name: string) {
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts.map((p) => p[0]?.toUpperCase() ?? "").join("") || "·";
}

function ageFromDob(dob: string | null): number | null {
  if (!dob) return null;
  const d = new Date(dob);
  if (Number.isNaN(d.getTime())) return null;
  const now = new Date();
  let age = now.getFullYear() - d.getFullYear();
  const m = now.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < d.getDate())) age -= 1;
  return age;
}

function awardColor(award: string | null): string {
  const a = (award ?? "").toLowerCase();
  if (a.includes("diamond")) return "from-cyan-400/30 to-sky-400/30 text-cyan-200 border-cyan-400/40";
  if (a.includes("platinum")) return "from-fuchsia-400/30 to-purple-400/30 text-fuchsia-200 border-fuchsia-400/40";
  if (a.includes("high gold")) return "from-yellow-300/30 to-amber-400/30 text-yellow-200 border-yellow-300/40";
  if (a.includes("gold")) return "from-yellow-500/30 to-amber-500/30 text-yellow-300 border-yellow-500/40";
  return "from-white/10 to-white/5 text-surface-100 border-white/20";
}

export default function DancerDetailClient({
  studio,
  role,
  dancer,
  stats,
  routines,
}: {
  studio: Studio;
  role: "owner" | "choreographer" | "viewer";
  dancer: DancerPayload;
  stats: StatsPayload;
  routines: RoutineRow[];
}) {
  const router = useRouter();
  const canEdit = role === "owner" || role === "choreographer";

  const [editing, setEditing] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: dancer.name,
    nickname: dancer.nickname ?? "",
    dateOfBirth: dancer.dateOfBirth ?? "",
    ageGroup: dancer.ageGroup ?? "",
    level: dancer.level ?? "",
    primaryStyle: dancer.primaryStyle ?? "",
    notes: dancer.notes ?? "",
  });

  const age = useMemo(() => ageFromDob(dancer.dateOfBirth), [dancer.dateOfBirth]);

  // Build a simple score timeline (oldest → newest) for the sparkline
  const timeline = useMemo(() => {
    return [...routines]
      .filter((r) => typeof r.totalScore === "number")
      .sort(
        (a, b) =>
          new Date(a.uploadedAt).getTime() - new Date(b.uploadedAt).getTime(),
      )
      .map((r) => ({ score: r.totalScore as number, uploadedAt: r.uploadedAt, routineName: r.routineName }));
  }, [routines]);

  async function saveEdits() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/studio/dancers/${dancer.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          nickname: form.nickname,
          dateOfBirth: form.dateOfBirth,
          ageGroup: form.ageGroup,
          level: form.level,
          primaryStyle: form.primaryStyle,
          notes: form.notes,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Could not save");
        setBusy(false);
        return;
      }
      setEditing(false);
      setBusy(false);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Network error");
      setBusy(false);
    }
  }

  async function archiveDancer() {
    if (!confirm(`Archive ${dancer.name}? Their routine history stays intact; you can restore from the roster later.`)) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/studio/dancers/${dancer.id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "Could not archive");
        setBusy(false);
        return;
      }
      router.push("/studio/roster");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Network error");
      setBusy(false);
    }
  }

  async function restoreDancer() {
    setBusy(true);
    try {
      const res = await fetch(`/api/studio/dancers/${dancer.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: true }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "Could not restore");
        setBusy(false);
        return;
      }
      setBusy(false);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Network error");
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen py-10 px-4">
      <div className="fixed inset-0 -z-10">
        <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-primary-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent-500/10 rounded-full blur-3xl" />
      </div>

      <div className="mx-auto max-w-5xl">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-surface-200 mb-6">
          <Link href="/studio/dashboard" className="hover:text-white transition-colors">
            {studio.name}
          </Link>
          <ChevronRight className="h-3 w-3" />
          <Link href="/studio/roster" className="hover:text-white transition-colors">
            Roster
          </Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-white">{dancer.name}</span>
        </div>

        {/* Back link */}
        <Link
          href="/studio/roster"
          className="inline-flex items-center gap-1.5 text-sm text-surface-200 hover:text-white transition-colors mb-6"
        >
          <ArrowLeft className="h-4 w-4" /> Back to roster
        </Link>

        {/* Hero card */}
        <div className="glass rounded-3xl p-6 sm:p-8 mb-6 border border-white/10">
          <div className="flex items-start gap-5 flex-wrap">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-500/40 via-accent-500/30 to-gold-500/30 text-2xl font-bold text-white border border-white/10">
              {initialsOf(dancer.name)}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl sm:text-3xl font-bold font-[family-name:var(--font-display)]">
                  {dancer.name}
                </h1>
                {!dancer.isActive && (
                  <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-surface-700/50 border border-white/10 text-surface-200">
                    Archived
                  </span>
                )}
              </div>
              {dancer.nickname && (
                <p className="text-sm text-surface-200 mt-0.5">"{dancer.nickname}"</p>
              )}
              <div className="flex gap-2 flex-wrap mt-3">
                {age !== null && (
                  <span className="text-xs px-2.5 py-1 rounded-full bg-white/5 border border-white/10">
                    Age {age}
                  </span>
                )}
                {dancer.ageGroup && (
                  <span className="text-xs px-2.5 py-1 rounded-full bg-white/5 border border-white/10">
                    {dancer.ageGroup}
                  </span>
                )}
                {dancer.level && (
                  <span className="text-xs px-2.5 py-1 rounded-full bg-white/5 border border-white/10">
                    {dancer.level}
                  </span>
                )}
                {dancer.primaryStyle && (
                  <span className="text-xs px-2.5 py-1 rounded-full bg-white/5 border border-white/10 inline-flex items-center gap-1">
                    <Music className="h-3 w-3" /> {dancer.primaryStyle}
                  </span>
                )}
              </div>
              {dancer.notes && (
                <p className="mt-4 text-sm text-surface-100 bg-white/3 border border-white/5 rounded-xl p-3 leading-relaxed whitespace-pre-wrap">
                  {dancer.notes}
                </p>
              )}
            </div>

            {canEdit && dancer.isActive && (
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setEditing(true)}
                  disabled={busy}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-sm font-medium transition-colors disabled:opacity-50"
                >
                  <Pencil className="h-3.5 w-3.5" /> Edit
                </button>
                <button
                  type="button"
                  onClick={archiveDancer}
                  disabled={busy}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-white/10 bg-white/5 hover:bg-red-500/10 hover:border-red-500/30 text-sm font-medium transition-colors disabled:opacity-50"
                >
                  <Archive className="h-3.5 w-3.5" /> Archive
                </button>
              </div>
            )}
            {canEdit && !dancer.isActive && (
              <button
                type="button"
                onClick={restoreDancer}
                disabled={busy}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-green-500/30 bg-green-500/10 hover:bg-green-500/20 text-sm font-medium text-green-200 transition-colors disabled:opacity-50"
              >
                Restore
              </button>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <StatCard
            label="Routines Analyzed"
            value={stats.routineCount}
            icon={<Video className="h-4 w-4 text-primary-400" />}
          />
          <StatCard
            label="Best Score"
            value={stats.bestScore !== null ? stats.bestScore.toFixed(1) : "—"}
            icon={<Trophy className="h-4 w-4 text-gold-400" />}
            highlight={stats.bestScore !== null && stats.bestScore >= 280}
          />
          <StatCard
            label="Average"
            value={stats.avgScore !== null ? stats.avgScore.toFixed(1) : "—"}
            icon={<Sparkles className="h-4 w-4 text-accent-400" />}
          />
          <StatCard
            label="Latest Score"
            value={stats.latestScore !== null ? stats.latestScore.toFixed(1) : "—"}
            icon={<Calendar className="h-4 w-4 text-surface-200" />}
          />
        </div>

        {/* Timeline (sparkline) */}
        {timeline.length >= 2 && (
          <div className="glass rounded-2xl p-5 mb-6 border border-white/10">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="h-3.5 w-3.5 text-accent-400" />
              <span className="text-xs font-semibold uppercase tracking-wider text-surface-200">
                Score progression
              </span>
              <span className="text-[11px] text-surface-300 ml-auto">
                {timeline.length} routines over time
              </span>
            </div>
            <ScoreSparkline points={timeline.map((t) => t.score)} />
          </div>
        )}

        {/* Styles */}
        {stats.styles.length > 0 && (
          <div className="mb-6">
            <p className="text-xs font-semibold uppercase tracking-wider text-surface-200 mb-2">
              Styles performed
            </p>
            <div className="flex gap-2 flex-wrap">
              {stats.styles.map((s) => (
                <span
                  key={s}
                  className="text-xs px-2.5 py-1 rounded-full bg-accent-500/10 border border-accent-500/20 text-accent-200"
                >
                  {s}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Routines */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Video className="h-4 w-4 text-primary-400" />
            <h2 className="text-lg font-semibold">Routines</h2>
            <span className="text-xs text-surface-200 ml-auto">
              {stats.routineCount} analyzed
              {stats.pendingCount > 0 && ` · ${stats.pendingCount} pending`}
            </span>
          </div>

          {routines.length === 0 ? (
            <div className="glass rounded-2xl p-8 text-center border border-white/10">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-white/5 border border-white/10 mb-3">
                <Video className="h-5 w-5 text-surface-200" />
              </div>
              <p className="text-sm font-medium mb-1">No routines yet for {dancer.name}.</p>
              <p className="text-xs text-surface-200 mb-4">
                When you upload a routine and tag this dancer, it lands here automatically with the full analysis.
              </p>
              <Link
                href="/upload"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-gradient-to-r from-primary-600 to-accent-500 text-sm font-semibold hover:opacity-90 transition-opacity"
              >
                Upload a routine
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {routines.map((r) => (
                <Link
                  key={r.videoId}
                  href={`/routines/${r.videoId}`}
                  className="group flex items-center gap-4 rounded-2xl border border-white/10 bg-white/3 hover:bg-white/6 hover:border-white/20 p-4 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold text-sm truncate">
                        {r.routineName || "Untitled routine"}
                      </p>
                      {r.style && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-surface-100">
                          {r.style}
                        </span>
                      )}
                      {r.entryType && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-surface-100">
                          {r.entryType}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-[11px] text-surface-200 mt-1">
                      {r.competitionName && (
                        <span className="inline-flex items-center gap-1">
                          <Trophy className="h-3 w-3 text-gold-400" /> {r.competitionName}
                        </span>
                      )}
                      {r.competitionDate && (
                        <span className="inline-flex items-center gap-1">
                          <Calendar className="h-3 w-3" /> {new Date(r.competitionDate).toLocaleDateString()}
                        </span>
                      )}
                      {!r.competitionName && !r.competitionDate && (
                        <span>Uploaded {new Date(r.uploadedAt).toLocaleDateString()}</span>
                      )}
                    </div>
                  </div>

                  {typeof r.totalScore === "number" && (
                    <div className={`shrink-0 rounded-xl border bg-gradient-to-br px-3 py-2 text-right ${awardColor(r.awardLevel)}`}>
                      <p className="text-xs font-semibold uppercase tracking-wider opacity-80">
                        {r.awardLevel || "Score"}
                      </p>
                      <p className="text-lg font-bold">{r.totalScore.toFixed(1)}</p>
                    </div>
                  )}
                  <ChevronRight className="h-4 w-4 text-surface-200 group-hover:text-white transition-colors shrink-0" />
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Edit drawer */}
      <AnimatePresence>
        {editing && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !busy && setEditing(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            />
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ type: "spring", stiffness: 260, damping: 28 }}
              className="fixed inset-x-0 bottom-0 sm:inset-0 sm:m-auto sm:h-fit sm:max-w-xl z-50 glass rounded-t-3xl sm:rounded-3xl border border-white/10 p-6 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-lg font-semibold">Edit dancer</h3>
                <button
                  type="button"
                  onClick={() => !busy && setEditing(false)}
                  className="p-1.5 rounded-full hover:bg-white/10 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="space-y-4">
                <Field label="Name" required>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                    className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-sm text-white focus:outline-none focus:border-primary-500 transition-colors"
                  />
                </Field>
                <Field label="Nickname (optional)">
                  <input
                    type="text"
                    value={form.nickname}
                    onChange={(e) => setForm((f) => ({ ...f, nickname: e.target.value }))}
                    className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-sm text-white focus:outline-none focus:border-primary-500 transition-colors"
                  />
                </Field>
                <div className="grid sm:grid-cols-2 gap-3">
                  <Field label="Date of birth">
                    <input
                      type="date"
                      value={form.dateOfBirth}
                      onChange={(e) => setForm((f) => ({ ...f, dateOfBirth: e.target.value }))}
                      className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-sm text-white focus:outline-none focus:border-primary-500 transition-colors [color-scheme:dark]"
                    />
                  </Field>
                  <Field label="Age group">
                    <select
                      value={form.ageGroup}
                      onChange={(e) => setForm((f) => ({ ...f, ageGroup: e.target.value }))}
                      className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-sm text-white focus:outline-none focus:border-primary-500 transition-colors"
                    >
                      <option value="" className="bg-surface-900">—</option>
                      {AGE_GROUPS.map((a) => (
                        <option key={a} value={a} className="bg-surface-900">{a}</option>
                      ))}
                    </select>
                  </Field>
                </div>
                <div className="grid sm:grid-cols-2 gap-3">
                  <Field label="Level">
                    <select
                      value={form.level}
                      onChange={(e) => setForm((f) => ({ ...f, level: e.target.value }))}
                      className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-sm text-white focus:outline-none focus:border-primary-500 transition-colors"
                    >
                      <option value="" className="bg-surface-900">—</option>
                      {LEVELS.map((l) => (
                        <option key={l} value={l} className="bg-surface-900">{l}</option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Primary style">
                    <select
                      value={form.primaryStyle}
                      onChange={(e) => setForm((f) => ({ ...f, primaryStyle: e.target.value }))}
                      className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-sm text-white focus:outline-none focus:border-primary-500 transition-colors"
                    >
                      <option value="" className="bg-surface-900">—</option>
                      {STYLES.map((s) => (
                        <option key={s} value={s} className="bg-surface-900">{s}</option>
                      ))}
                    </select>
                  </Field>
                </div>
                <Field label="Notes">
                  <textarea
                    rows={3}
                    value={form.notes}
                    onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                    className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-sm text-white focus:outline-none focus:border-primary-500 transition-colors resize-none"
                  />
                </Field>
                {error && (
                  <p className="text-xs text-red-300 bg-red-500/10 border border-red-500/30 rounded-xl p-3">
                    {error}
                  </p>
                )}
                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => !busy && setEditing(false)}
                    className="flex-1 py-2.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-sm font-medium transition-colors disabled:opacity-50"
                    disabled={busy}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={saveEdits}
                    disabled={busy || !form.name.trim()}
                    className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-primary-600 to-accent-500 text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
                  >
                    {busy ? "Saving..." : "Save changes"}
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
  highlight,
}: {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border p-4 ${
        highlight
          ? "border-gold-400/40 bg-gradient-to-br from-gold-500/10 to-amber-500/5"
          : "border-white/10 bg-white/3"
      }`}
    >
      <div className="flex items-center gap-1.5 mb-2">
        {icon}
        <span className="text-[10px] uppercase tracking-wider text-surface-200">{label}</span>
      </div>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-surface-100 mb-1.5">
        {label} {required && <span className="text-accent-400">*</span>}
      </label>
      {children}
    </div>
  );
}

/**
 * Minimal inline SVG sparkline — no chart lib dependency.
 * Expects points[] ordered oldest→newest.
 */
function ScoreSparkline({ points }: { points: number[] }) {
  if (points.length < 2) return null;
  const w = 560;
  const h = 60;
  const pad = 4;
  const min = Math.min(...points);
  const max = Math.max(...points);
  const range = max - min || 1;
  const xFor = (i: number) =>
    pad + (i / (points.length - 1)) * (w - pad * 2);
  const yFor = (p: number) =>
    h - pad - ((p - min) / range) * (h - pad * 2);

  const path = points
    .map((p, i) => `${i === 0 ? "M" : "L"}${xFor(i).toFixed(1)},${yFor(p).toFixed(1)}`)
    .join(" ");

  return (
    <div className="w-full overflow-x-auto">
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-14" preserveAspectRatio="none">
        <defs>
          <linearGradient id="sparkFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#a78bfa" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#a78bfa" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path
          d={`${path} L${xFor(points.length - 1).toFixed(1)},${h - pad} L${pad},${h - pad} Z`}
          fill="url(#sparkFill)"
        />
        <path d={path} fill="none" stroke="#a78bfa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        {points.map((p, i) => (
          <circle
            key={i}
            cx={xFor(i)}
            cy={yFor(p)}
            r={2.5}
            fill={p === max ? "#fbbf24" : "#a78bfa"}
          />
        ))}
      </svg>
      <div className="flex justify-between text-[10px] text-surface-300 mt-1">
        <span>Low {min.toFixed(1)}</span>
        <span>High {max.toFixed(1)}</span>
      </div>
    </div>
  );
}
