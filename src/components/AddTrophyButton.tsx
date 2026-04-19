"use client";

import { useState } from "react";
import { haptics } from "@/lib/haptics";

type AwardLevel = "gold" | "high_gold" | "platinum" | "diamond";

const LEVELS: Array<{ id: AwardLevel; label: string; range: string }> = [
  { id: "gold", label: "Gold", range: "260-269" },
  { id: "high_gold", label: "High Gold", range: "270-279" },
  { id: "platinum", label: "Platinum", range: "280-289" },
  { id: "diamond", label: "Diamond", range: "290-300" },
];

/**
 * Manual trophy entry for profile owners.
 * Lets a dancer log a real competition result that wasn't scored by the analyzer.
 * All entries are flagged self_reported on the server.
 */
export function AddTrophyButton() {
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const [award, setAward] = useState<AwardLevel>("gold");
  const [score, setScore] = useState("");
  const [compName, setCompName] = useState("");
  const [compDate, setCompDate] = useState("");
  const [routine, setRoutine] = useState("");
  const [category, setCategory] = useState("");

  async function submit() {
    if (submitting) return;
    setErr(null);
    const totalScore = score ? parseFloat(score) : null;
    if (totalScore !== null && (isNaN(totalScore) || totalScore < 0 || totalScore > 300)) {
      setErr("Score must be between 0 and 300");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/achievements/manual", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          award_level: award,
          total_score: totalScore,
          competition_name: compName.trim() || null,
          competition_date: compDate || null,
          routine_name: routine.trim() || null,
          category: category.trim() || null,
        }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => null);
        setErr(j?.error || "Could not save trophy");
        setSubmitting(false);
        return;
      }
      haptics.success();
      setOpen(false);
      // refresh the server component
      if (typeof window !== "undefined") window.location.reload();
    } catch {
      setErr("Network error. Try again.");
      setSubmitting(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => {
          haptics.tap();
          setOpen(true);
        }}
        style={{
          fontSize: 13,
          fontWeight: 700,
          padding: "7px 14px",
          borderRadius: 999,
          border: "1px solid rgba(255,255,255,0.14)",
          background: "linear-gradient(135deg, #EC4899, #F97316, #FBBF24)",
          color: "#0B0B10",
          cursor: "pointer",
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
        }}
      >
        + Add trophy
      </button>

      {open ? (
        <div
          role="dialog"
          aria-modal="true"
          onClick={() => setOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.6)",
            backdropFilter: "blur(8px)",
            zIndex: 1000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 16,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "100%",
              maxWidth: 440,
              background: "rgba(20,20,26,0.95)",
              backdropFilter: "blur(20px)",
              border: "1px solid rgba(255,255,255,0.12)",
              borderRadius: 20,
              padding: 24,
              color: "#fff",
              boxShadow: "0 32px 80px rgba(0,0,0,0.5)",
              maxHeight: "90vh",
              overflowY: "auto",
            }}
          >
            <header
              style={{
                display: "flex",
                alignItems: "baseline",
                justifyContent: "space-between",
                marginBottom: 6,
              }}
            >
              <h2
                style={{
                  fontSize: 20,
                  fontWeight: 800,
                  letterSpacing: "-0.01em",
                }}
              >
                Add a trophy
              </h2>
              <button
                type="button"
                onClick={() => setOpen(false)}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "inherit",
                  fontSize: 22,
                  cursor: "pointer",
                  opacity: 0.6,
                  lineHeight: 1,
                }}
                aria-label="Close"
              >
                ×
              </button>
            </header>
            <p style={{ fontSize: 13, opacity: 0.6, marginBottom: 18 }}>
              Log a real competition result. This adds to your Trophy Wall —
              visibility defaults to public.
            </p>

            <Field label="Tier">
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(2, 1fr)",
                  gap: 8,
                }}
              >
                {LEVELS.map((l) => {
                  const active = award === l.id;
                  return (
                    <button
                      key={l.id}
                      type="button"
                      onClick={() => {
                        haptics.select();
                        setAward(l.id);
                      }}
                      style={{
                        padding: "10px 12px",
                        borderRadius: 12,
                        border: active
                          ? "1px solid rgba(255,255,255,0.4)"
                          : "1px solid rgba(255,255,255,0.1)",
                        background: active
                          ? "rgba(255,255,255,0.08)"
                          : "rgba(255,255,255,0.03)",
                        color: "inherit",
                        cursor: "pointer",
                        textAlign: "left",
                      }}
                    >
                      <div style={{ fontWeight: 700, fontSize: 14 }}>
                        {l.label}
                      </div>
                      <div style={{ fontSize: 11, opacity: 0.55 }}>
                        {l.range}
                      </div>
                    </button>
                  );
                })}
              </div>
            </Field>

            <Field label="Score (optional)">
              <input
                type="number"
                inputMode="decimal"
                step="0.01"
                min="0"
                max="300"
                value={score}
                onChange={(e) => setScore(e.target.value)}
                placeholder="e.g. 287.5"
                style={inputStyle}
              />
            </Field>

            <Field label="Routine name (optional)">
              <input
                type="text"
                value={routine}
                onChange={(e) => setRoutine(e.target.value)}
                placeholder="Unstoppable"
                maxLength={80}
                style={inputStyle}
              />
            </Field>

            <Field label="Competition (optional)">
              <input
                type="text"
                value={compName}
                onChange={(e) => setCompName(e.target.value)}
                placeholder="Dance Awards 2026"
                maxLength={120}
                style={inputStyle}
              />
            </Field>

            <Field label="Date (optional)">
              <input
                type="date"
                value={compDate}
                onChange={(e) => setCompDate(e.target.value)}
                style={inputStyle}
              />
            </Field>

            <Field label="Category / style (optional)">
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="Jazz · Solo"
                maxLength={60}
                style={inputStyle}
              />
            </Field>

            {err ? (
              <p style={{ color: "#FCA5A5", fontSize: 13, marginTop: 4 }}>
                {err}
              </p>
            ) : null}

            <div
              style={{
                display: "flex",
                gap: 10,
                marginTop: 20,
                justifyContent: "flex-end",
              }}
            >
              <button
                type="button"
                onClick={() => setOpen(false)}
                style={{
                  padding: "10px 18px",
                  borderRadius: 12,
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.12)",
                  color: "inherit",
                  cursor: "pointer",
                  fontWeight: 600,
                  fontSize: 14,
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={submitting}
                onClick={submit}
                style={{
                  padding: "10px 18px",
                  borderRadius: 12,
                  background: "linear-gradient(135deg, #EC4899, #F97316, #FBBF24)",
                  color: "#0B0B10",
                  border: "1px solid rgba(255,255,255,0.12)",
                  cursor: submitting ? "wait" : "pointer",
                  fontWeight: 700,
                  fontSize: 14,
                  opacity: submitting ? 0.6 : 1,
                }}
              >
                {submitting ? "Saving…" : "Save trophy"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label
      style={{
        display: "block",
        marginBottom: 14,
        fontSize: 12,
        fontWeight: 700,
        letterSpacing: "0.04em",
        textTransform: "uppercase",
        opacity: 0.75,
      }}
    >
      <span style={{ marginBottom: 6, display: "block" }}>{label}</span>
      {children}
    </label>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "10px 12px",
  borderRadius: 10,
  border: "1px solid rgba(255,255,255,0.12)",
  background: "rgba(255,255,255,0.04)",
  color: "#fff",
  fontSize: 15,
  fontWeight: 500,
  outline: "none",
};

export default AddTrophyButton;
