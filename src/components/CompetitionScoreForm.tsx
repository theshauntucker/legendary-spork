"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Trophy,
  X,
  Plus,
  CheckCircle,
  Loader2,
  Pencil,
  Trash2,
  TrendingUp,
  TrendingDown,
  Minus,
} from "lucide-react";

interface CompetitionScore {
  id: string;
  competition_name: string;
  competition_date: string;
  actual_score: number | null;
  actual_award_level: string | null;
  placement: string | null;
  notes: string | null;
}

const awardOptions = ["Gold", "High Gold", "Platinum", "Diamond"];

export function CompetitionScoreDisplay({
  scores,
  aiScore,
  analysisId,
  videoId,
  onScoresChange,
}: {
  scores: CompetitionScore[];
  aiScore: number;
  analysisId: string;
  videoId: string;
  onScoresChange: (scores: CompetitionScore[]) => void;
}) {
  const [showForm, setShowForm] = useState(false);
  const [editingScore, setEditingScore] = useState<CompetitionScore | null>(null);

  const handleSave = (newScore: CompetitionScore) => {
    if (editingScore) {
      onScoresChange(scores.map((s) => (s.id === newScore.id ? newScore : s)));
    } else {
      onScoresChange([newScore, ...scores]);
    }
    setShowForm(false);
    setEditingScore(null);
  };

  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/competition-scores?id=${id}`, { method: "DELETE" });
      onScoresChange(scores.filter((s) => s.id !== id));
    } catch {
      // Silent fail
    }
  };

  return (
    <div className="rounded-2xl bg-white/5 p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Trophy className="h-4 w-4 text-gold-400" />
          <h3 className="font-bold text-sm">Real Competition Results</h3>
        </div>
        <button
          onClick={() => {
            setEditingScore(null);
            setShowForm(true);
          }}
          className="inline-flex items-center gap-1 text-xs text-primary-400 hover:text-primary-300 transition-colors"
        >
          <Plus className="h-3 w-3" />
          Log Score
        </button>
      </div>

      {scores.length === 0 && !showForm ? (
        <button
          onClick={() => setShowForm(true)}
          className="w-full py-4 rounded-xl border border-dashed border-white/10 hover:border-primary-500/30 transition-colors text-sm text-surface-200 hover:text-white"
        >
          Log your real competition score to compare with AI
        </button>
      ) : (
        <div className="space-y-3">
          {scores.map((score) => (
            <div
              key={score.id}
              className="rounded-xl bg-white/5 p-4"
            >
              <div className="flex items-center justify-between mb-2">
                <div>
                  <p className="font-medium text-sm">{score.competition_name}</p>
                  <p className="text-xs text-surface-200">
                    {new Date(score.competition_date).toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => {
                      setEditingScore(score);
                      setShowForm(true);
                    }}
                    className="p-1.5 rounded hover:bg-white/10 transition-colors"
                  >
                    <Pencil className="h-3 w-3 text-surface-200" />
                  </button>
                  <button
                    onClick={() => handleDelete(score.id)}
                    className="p-1.5 rounded hover:bg-white/10 transition-colors"
                  >
                    <Trash2 className="h-3 w-3 text-surface-200" />
                  </button>
                </div>
              </div>

              {score.actual_score && (
                <div className="grid grid-cols-3 gap-3 mt-3">
                  <div className="text-center">
                    <p className="text-xs text-surface-200">AI Score</p>
                    <p className="text-lg font-bold text-primary-400">{aiScore}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-surface-200">Actual Score</p>
                    <p className="text-lg font-bold text-gold-400">{score.actual_score}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-surface-200">Difference</p>
                    <div className="flex items-center justify-center gap-1">
                      {aiScore > score.actual_score ? (
                        <TrendingUp className="h-3 w-3 text-green-400" />
                      ) : aiScore < score.actual_score ? (
                        <TrendingDown className="h-3 w-3 text-yellow-400" />
                      ) : (
                        <Minus className="h-3 w-3 text-surface-200" />
                      )}
                      <p
                        className={`text-lg font-bold ${
                          aiScore > score.actual_score
                            ? "text-green-400"
                            : aiScore < score.actual_score
                            ? "text-yellow-400"
                            : "text-surface-200"
                        }`}
                      >
                        {aiScore - score.actual_score > 0 ? "+" : ""}
                        {aiScore - score.actual_score}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {score.actual_award_level && (
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-xs text-surface-200">Award:</span>
                  <span className="text-xs font-medium text-gold-300">{score.actual_award_level}</span>
                </div>
              )}

              {score.placement && (
                <div className="mt-1 flex items-center gap-2">
                  <span className="text-xs text-surface-200">Placement:</span>
                  <span className="text-xs font-medium text-white">{score.placement}</span>
                </div>
              )}

              {score.notes && (
                <p className="mt-2 text-xs text-surface-200 italic">{score.notes}</p>
              )}
            </div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {showForm && (
          <CompetitionScoreFormModal
            analysisId={analysisId}
            videoId={videoId}
            existing={editingScore}
            onSave={handleSave}
            onClose={() => {
              setShowForm(false);
              setEditingScore(null);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function CompetitionScoreFormModal({
  analysisId,
  videoId,
  existing,
  onSave,
  onClose,
}: {
  analysisId: string;
  videoId: string;
  existing: CompetitionScore | null;
  onSave: (score: CompetitionScore) => void;
  onClose: () => void;
}) {
  const [competitionName, setCompetitionName] = useState(existing?.competition_name || "");
  const [competitionDate, setCompetitionDate] = useState(existing?.competition_date || "");
  const [actualScore, setActualScore] = useState(existing?.actual_score?.toString() || "");
  const [actualAwardLevel, setActualAwardLevel] = useState(existing?.actual_award_level || "");
  const [placement, setPlacement] = useState(existing?.placement || "");
  const [notes, setNotes] = useState(existing?.notes || "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!competitionName || !competitionDate) {
      setError("Competition name and date are required");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const method = existing ? "PUT" : "POST";
      const body = {
        ...(existing ? { id: existing.id } : { analysisId, videoId }),
        competitionName,
        competitionDate,
        actualScore: actualScore ? parseFloat(actualScore) : null,
        actualAwardLevel: actualAwardLevel || null,
        placement: placement || null,
        notes: notes || null,
      };

      const res = await fetch("/api/competition-scores", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      onSave(data.score);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="glass rounded-2xl p-6 w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-lg">
            {existing ? "Edit Competition Score" : "Log Competition Score"}
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-white/10 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs text-surface-200 mb-1">
              Competition Name *
            </label>
            <input
              type="text"
              value={competitionName}
              onChange={(e) => setCompetitionName(e.target.value)}
              placeholder="e.g. Star Power Orlando"
              className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-sm text-white placeholder-surface-200/50 focus:outline-none focus:border-primary-500/50"
            />
          </div>

          <div>
            <label className="block text-xs text-surface-200 mb-1">
              Competition Date *
            </label>
            <input
              type="date"
              value={competitionDate}
              onChange={(e) => setCompetitionDate(e.target.value)}
              className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-sm text-white focus:outline-none focus:border-primary-500/50"
            />
          </div>

          <div>
            <label className="block text-xs text-surface-200 mb-1">
              Actual Score (0-300)
            </label>
            <input
              type="number"
              value={actualScore}
              onChange={(e) => setActualScore(e.target.value)}
              placeholder="e.g. 278"
              min="0"
              max="300"
              step="0.1"
              className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-sm text-white placeholder-surface-200/50 focus:outline-none focus:border-primary-500/50"
            />
          </div>

          <div>
            <label className="block text-xs text-surface-200 mb-1">
              Award Level Received
            </label>
            <div className="flex flex-wrap gap-2">
              {awardOptions.map((award) => (
                <button
                  key={award}
                  type="button"
                  onClick={() =>
                    setActualAwardLevel(actualAwardLevel === award ? "" : award)
                  }
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                    actualAwardLevel === award
                      ? "bg-gradient-to-r from-primary-600 to-accent-500 text-white"
                      : "bg-white/5 text-surface-200 hover:bg-white/10"
                  }`}
                >
                  {award}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs text-surface-200 mb-1">
              Placement (optional)
            </label>
            <input
              type="text"
              value={placement}
              onChange={(e) => setPlacement(e.target.value)}
              placeholder="e.g. 1st Overall, 3rd in category"
              className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-sm text-white placeholder-surface-200/50 focus:outline-none focus:border-primary-500/50"
            />
          </div>

          <div>
            <label className="block text-xs text-surface-200 mb-1">
              Notes (optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any notes about the competition..."
              rows={2}
              className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-sm text-white placeholder-surface-200/50 focus:outline-none focus:border-primary-500/50 resize-none"
            />
          </div>

          {error && (
            <p className="text-xs text-red-400">{error}</p>
          )}

          <button
            type="submit"
            disabled={saving}
            className="w-full rounded-full bg-gradient-to-r from-primary-600 via-accent-500 to-gold-500 py-3 font-semibold text-white hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4" />
                {existing ? "Update Score" : "Save Score"}
              </>
            )}
          </button>
        </form>
      </motion.div>
    </motion.div>
  );
}
