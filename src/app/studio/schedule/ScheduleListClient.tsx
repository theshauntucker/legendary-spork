"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Calendar,
  MapPin,
  Users,
  Plus,
  ArrowRight,
  Loader2,
  Trash2,
} from "lucide-react";

interface Studio {
  id: string;
  name: string;
  region: string | null;
}

interface Competition {
  id: string;
  name: string;
  competitionDate: string | null;
  location: string | null;
  notes: string | null;
  createdAt: string;
  entryCount: number;
}

function formatDate(iso: string | null): string {
  if (!iso) return "Date TBD";
  // Render the ISO date as a local, human-readable label. We feed it as
  // YYYY-MM-DD so Date() in the browser stays timezone-agnostic-enough.
  try {
    return new Date(`${iso}T00:00:00`).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

export default function ScheduleListClient({
  studio,
  competitions,
}: {
  studio: Studio;
  competitions: Competition[];
}) {
  const router = useRouter();

  const [name, setName] = useState("");
  const [date, setDate] = useState("");
  const [location, setLocation] = useState("");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const createCompetition = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setError("");
    const res = await fetch("/api/studio/schedule", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: name.trim(),
        competition_date: date || undefined,
        location: location.trim() || undefined,
      }),
    });
    setCreating(false);
    if (!res.ok) {
      const { error: apiErr } = await res.json().catch(() => ({ error: "Create failed" }));
      setError(apiErr || "Create failed");
      return;
    }
    setName("");
    setDate("");
    setLocation("");
    router.refresh();
  };

  const deleteCompetition = async (id: string) => {
    if (!confirm("Delete this competition and unlink its entries?")) return;
    setDeletingId(id);
    const res = await fetch(`/api/studio/schedule/${encodeURIComponent(id)}`, {
      method: "DELETE",
    });
    setDeletingId(null);
    if (res.ok) router.refresh();
  };

  return (
    <div className="min-h-screen px-4 py-10">
      <div className="fixed inset-0 -z-10">
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-gold-500/10 rounded-full blur-3xl" />
      </div>

      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-6 flex-wrap">
          <div>
            <p className="text-xs uppercase tracking-widest text-gold-400 mb-1 inline-flex items-center gap-1.5">
              <Calendar className="h-3 w-3" />
              Season Schedule — {studio.name}
            </p>
            <h1 className="text-3xl sm:text-4xl font-bold font-[family-name:var(--font-display)]">
              Every competition in one place
            </h1>
            <p className="mt-2 text-sm text-surface-200 max-w-xl">
              Load the weekends you&apos;re attending, then assign the routines
              you&apos;re bringing. Collision detection reads this to enrich
              its cross-studio alerts.
            </p>
          </div>
          <a
            href="/studio/dashboard"
            className="inline-flex items-center gap-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 px-4 py-2 text-sm transition-colors"
          >
            ← Dashboard
          </a>
        </div>

        {/* Add competition form */}
        <form onSubmit={createCompetition} className="glass rounded-2xl p-5 mb-8">
          <h2 className="flex items-center gap-2 font-semibold mb-3">
            <Plus className="h-4 w-4 text-gold-400" />
            Add a competition
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Competition name (e.g. Energy Nationals)"
              required
              minLength={2}
              className="rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-sm text-white placeholder-surface-200/50 focus:outline-none focus:border-gold-500 transition-colors"
            />
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-sm text-white focus:outline-none focus:border-gold-500 transition-colors"
            />
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Location (e.g. Chicago, IL)"
              className="rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-sm text-white placeholder-surface-200/50 focus:outline-none focus:border-gold-500 transition-colors"
            />
          </div>
          <div className="mt-3 flex items-center justify-between gap-3 flex-wrap">
            {error && <p className="text-sm text-red-400">{error}</p>}
            <button
              type="submit"
              disabled={creating || !name.trim()}
              className="ml-auto inline-flex items-center gap-1.5 rounded-full bg-gold-500 hover:bg-gold-400 disabled:opacity-50 text-surface-950 px-4 py-2 text-sm font-semibold transition-colors"
            >
              {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              Add competition
            </button>
          </div>
        </form>

        {/* List */}
        <h2 className="text-lg font-semibold mb-3">
          Your schedule ({competitions.length})
        </h2>
        {competitions.length === 0 ? (
          <div className="glass rounded-2xl p-8 text-center">
            <Calendar className="mx-auto h-8 w-8 text-surface-200 mb-3" />
            <p className="text-surface-200 text-sm">
              No competitions added yet. Add one above — empty schedules still
              work for Music Hub and collision detection, they just skip the
              per-competition enrichment.
            </p>
          </div>
        ) : (
          <ul className="space-y-3">
            {competitions.map((c) => (
              <li key={c.id} className="glass rounded-2xl p-4 flex items-center gap-4 flex-wrap">
                <a
                  href={`/studio/schedule/${c.id}`}
                  className="flex-1 min-w-0 group"
                >
                  <p className="font-semibold truncate group-hover:text-gold-300 transition-colors">
                    {c.name}
                  </p>
                  <div className="mt-1 flex flex-wrap gap-3 text-xs text-surface-200">
                    <span className="inline-flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {formatDate(c.competitionDate)}
                    </span>
                    {c.location && (
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {c.location}
                      </span>
                    )}
                    <span className="inline-flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {c.entryCount} {c.entryCount === 1 ? "entry" : "entries"}
                    </span>
                  </div>
                </a>
                <div className="flex items-center gap-2">
                  <a
                    href={`/studio/schedule/${c.id}`}
                    className="inline-flex items-center gap-1 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 px-3 py-1.5 text-xs transition-colors"
                  >
                    Manage
                    <ArrowRight className="h-3 w-3" />
                  </a>
                  <button
                    onClick={() => deleteCompetition(c.id)}
                    disabled={deletingId === c.id}
                    className="inline-flex items-center gap-1 rounded-full bg-white/5 hover:bg-red-500/20 hover:text-red-300 text-surface-200 px-3 py-1.5 text-xs transition-colors disabled:opacity-50"
                    aria-label="Delete competition"
                  >
                    {deletingId === c.id ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <Trash2 className="h-3 w-3" />
                    )}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
