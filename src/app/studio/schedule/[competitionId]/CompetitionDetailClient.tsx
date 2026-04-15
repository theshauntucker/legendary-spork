"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Calendar,
  MapPin,
  Users,
  Loader2,
  Save,
  Music,
  Plus,
  X,
  StickyNote,
  Trash2,
} from "lucide-react";

interface Competition {
  id: string;
  name: string;
  competitionDate: string | null;
  location: string | null;
  notes: string | null;
}

interface Routine {
  id: string;
  routineName: string | null;
  dancerName: string | null;
  style: string | null;
  entryType: string | null;
  ageDivision: string | null;
  status: string;
  season: string;
  musicTrackId: string;
  trackName: string | null;
  artistName: string | null;
  albumImageUrl: string | null;
}

export default function CompetitionDetailClient({
  competition,
  attachedRoutines,
  availableRoutines,
}: {
  competition: Competition;
  attachedRoutines: Routine[];
  availableRoutines: Routine[];
}) {
  const router = useRouter();

  const [name, setName] = useState(competition.name);
  const [date, setDate] = useState(competition.competitionDate ?? "");
  const [location, setLocation] = useState(competition.location ?? "");
  const [notes, setNotes] = useState(competition.notes ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [savedAt, setSavedAt] = useState<number | null>(null);

  const [addingId, setAddingId] = useState<string | null>(null);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const dirty =
    name.trim() !== competition.name ||
    (date || null) !== (competition.competitionDate || null) ||
    (location.trim() || null) !== (competition.location || null) ||
    (notes.trim() || null) !== (competition.notes || null);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    const updates: Record<string, string | null> = {};
    if (name.trim() !== competition.name) updates.name = name.trim();
    if ((date || null) !== (competition.competitionDate || null)) {
      updates.competition_date = date || null;
    }
    if ((location.trim() || null) !== (competition.location || null)) {
      updates.location = location.trim() || null;
    }
    if ((notes.trim() || null) !== (competition.notes || null)) {
      updates.notes = notes.trim() || null;
    }
    const res = await fetch(`/api/studio/schedule/${encodeURIComponent(competition.id)}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });
    setSaving(false);
    if (!res.ok) {
      const { error: apiErr } = await res.json().catch(() => ({ error: "Save failed" }));
      setError(apiErr || "Save failed");
      return;
    }
    setSavedAt(Date.now());
    router.refresh();
  };

  const addEntry = async (routineMusicId: string) => {
    setAddingId(routineMusicId);
    const res = await fetch(
      `/api/studio/schedule/${encodeURIComponent(competition.id)}/entries`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ routineMusicId }),
      }
    );
    setAddingId(null);
    if (res.ok) router.refresh();
  };

  const removeEntry = async (routineMusicId: string) => {
    setRemovingId(routineMusicId);
    const res = await fetch(
      `/api/studio/schedule/${encodeURIComponent(competition.id)}/entries?routineMusicId=${encodeURIComponent(routineMusicId)}`,
      { method: "DELETE" }
    );
    setRemovingId(null);
    if (res.ok) router.refresh();
  };

  const deleteCompetition = async () => {
    if (!confirm("Delete this competition and unlink all its entries?")) return;
    setDeleting(true);
    const res = await fetch(`/api/studio/schedule/${encodeURIComponent(competition.id)}`, {
      method: "DELETE",
    });
    setDeleting(false);
    if (res.ok) {
      router.push("/studio/schedule");
      router.refresh();
    }
  };

  return (
    <div className="min-h-screen px-4 py-10">
      <div className="fixed inset-0 -z-10">
        <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-gold-500/10 rounded-full blur-3xl" />
      </div>

      <div className="max-w-3xl mx-auto">
        <div className="mb-5">
          <a href="/studio/schedule" className="text-sm text-gold-300 hover:underline">
            ← Back to Schedule
          </a>
        </div>

        {/* Edit form */}
        <form onSubmit={save} className="glass rounded-2xl p-5 sm:p-6 mb-6 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Competition name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              minLength={2}
              className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-sm text-white focus:outline-none focus:border-gold-500 transition-colors"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-2 flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-surface-200" /> Date
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-2.5 text-sm text-white focus:outline-none focus:border-gold-500 transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-surface-200" /> Location
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Chicago, IL"
                className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-2.5 text-sm text-white focus:outline-none focus:border-gold-500 transition-colors"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2 flex items-center gap-1.5">
              <StickyNote className="h-3.5 w-3.5 text-surface-200" /> Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              maxLength={2000}
              placeholder="Venue details, hotel info, call times…"
              className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-sm text-white focus:outline-none focus:border-gold-500 transition-colors resize-y"
            />
          </div>
          {error && <p className="text-sm text-red-400">{error}</p>}
          <div className="flex items-center justify-end gap-3">
            {savedAt && Date.now() - savedAt < 3000 && (
              <span className="text-sm text-green-400">Saved</span>
            )}
            <button
              type="submit"
              disabled={!dirty || saving}
              className="inline-flex items-center gap-1.5 rounded-full bg-gold-500 hover:bg-gold-400 disabled:opacity-50 text-surface-950 px-4 py-2 text-sm font-semibold transition-colors"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Save changes
            </button>
          </div>
        </form>

        {/* Attached routines */}
        <div className="glass rounded-2xl p-5 mb-6">
          <h2 className="flex items-center gap-2 font-semibold mb-3">
            <Users className="h-4 w-4 text-gold-400" />
            Entries you&apos;re bringing ({attachedRoutines.length})
          </h2>
          {attachedRoutines.length === 0 ? (
            <p className="text-sm text-surface-200">
              No routines assigned yet. Add some from the list below.
            </p>
          ) : (
            <ul className="divide-y divide-white/10">
              {attachedRoutines.map((r) => (
                <li key={r.id} className="py-3 flex items-center gap-3 flex-wrap">
                  <RoutineIcon r={r} />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">
                      {r.routineName || "Untitled routine"}
                      {r.dancerName && (
                        <span className="text-surface-200"> · {r.dancerName}</span>
                      )}
                    </p>
                    <p className="text-xs text-surface-200 truncate">
                      {[r.style, r.entryType, r.ageDivision].filter(Boolean).join(" · ")}
                      {r.trackName && ` · ♫ ${r.trackName}`}
                    </p>
                  </div>
                  <button
                    onClick={() => removeEntry(r.id)}
                    disabled={removingId === r.id}
                    className="inline-flex items-center gap-1 rounded-full bg-white/5 hover:bg-red-500/20 hover:text-red-300 text-surface-200 px-3 py-1.5 text-xs transition-colors"
                  >
                    {removingId === r.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <X className="h-3 w-3" />}
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Available routines to attach */}
        {availableRoutines.length > 0 && (
          <div className="glass rounded-2xl p-5 mb-6">
            <h2 className="flex items-center gap-2 font-semibold mb-3">
              <Plus className="h-4 w-4 text-gold-400" />
              Add a routine you&apos;ve linked to music
            </h2>
            <ul className="divide-y divide-white/10">
              {availableRoutines.map((r) => (
                <li key={r.id} className="py-3 flex items-center gap-3 flex-wrap">
                  <RoutineIcon r={r} />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">
                      {r.routineName || "Untitled routine"}
                      {r.dancerName && (
                        <span className="text-surface-200"> · {r.dancerName}</span>
                      )}
                    </p>
                    <p className="text-xs text-surface-200 truncate">
                      {[r.style, r.entryType, r.ageDivision].filter(Boolean).join(" · ")}
                      {r.trackName && ` · ♫ ${r.trackName}`}
                    </p>
                  </div>
                  <button
                    onClick={() => addEntry(r.id)}
                    disabled={addingId === r.id}
                    className="inline-flex items-center gap-1 rounded-full bg-gold-500/20 hover:bg-gold-500/30 text-gold-200 px-3 py-1.5 text-xs font-semibold transition-colors"
                  >
                    {addingId === r.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <Plus className="h-3 w-3" />}
                    Add
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {availableRoutines.length === 0 && attachedRoutines.length === 0 && (
          <div className="glass rounded-2xl p-5 mb-6 text-sm text-surface-200">
            No routines linked to music yet. Link a song to a routine in the{" "}
            <a href="/studio/music" className="text-accent-300 hover:underline">
              Music Hub
            </a>{" "}
            and come back here to assign it.
          </div>
        )}

        {/* Danger zone */}
        <div className="glass rounded-2xl p-5 border border-red-500/20">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <h2 className="font-semibold text-red-300">Delete competition</h2>
              <p className="text-xs text-surface-200 mt-0.5">
                Unlinks every entry from this competition. Routines stay in
                place on the Music Hub.
              </p>
            </div>
            <button
              onClick={deleteCompetition}
              disabled={deleting}
              className="inline-flex items-center gap-1.5 rounded-full bg-red-500/20 hover:bg-red-500/30 text-red-300 px-4 py-2 text-sm font-semibold transition-colors disabled:opacity-50"
            >
              {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function RoutineIcon({ r }: { r: Routine }) {
  if (r.albumImageUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={r.albumImageUrl} alt="" className="h-10 w-10 rounded-md object-cover flex-shrink-0" />
    );
  }
  return (
    <div className="h-10 w-10 rounded-md bg-surface-900 flex-shrink-0 flex items-center justify-center">
      <Music className="h-4 w-4 text-surface-200" />
    </div>
  );
}
