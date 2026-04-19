"use client";

import { useState } from "react";
import { haptics } from "@/lib/haptics";

type Props = {
  bio: string;
};

/**
 * Profile owner control — opens a modal to edit bio (and eventually more).
 * Rendered only when isOwner is true. Updates /api/profile/update.
 */
export function EditProfileButton({ bio: initialBio }: Props) {
  const [open, setOpen] = useState(false);
  const [bio, setBio] = useState(initialBio ?? "");
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function save() {
    if (submitting) return;
    setErr(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/profile/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bio: bio.slice(0, 280) }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => null);
        setErr(j?.error || "Could not save changes");
        setSubmitting(false);
        return;
      }
      haptics.success();
      setOpen(false);
      if (typeof window !== "undefined") window.location.reload();
    } catch {
      setErr("Network error. Try again.");
      setSubmitting(false);
    }
  }

  return (
    <>
      <div style={{ marginTop: 32, textAlign: "center" }}>
        <button
          type="button"
          onClick={() => {
            haptics.tap();
            setOpen(true);
          }}
          style={{
            fontSize: 13,
            fontWeight: 600,
            padding: "8px 16px",
            borderRadius: 999,
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.1)",
            color: "inherit",
            cursor: "pointer",
            opacity: 0.8,
          }}
        >
          Edit profile
        </button>
      </div>
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
            }}
          >
            <header
              style={{
                display: "flex",
                alignItems: "baseline",
                justifyContent: "space-between",
                marginBottom: 16,
              }}
            >
              <h2
                style={{
                  fontSize: 20,
                  fontWeight: 800,
                  letterSpacing: "-0.01em",
                }}
              >
                Edit profile
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

            <label
              style={{
                display: "block",
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: "0.04em",
                textTransform: "uppercase",
                opacity: 0.75,
                marginBottom: 6,
              }}
            >
              Bio
            </label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value.slice(0, 280))}
              placeholder="Share a quick note — style, studio, goals."
              rows={4}
              style={{
                width: "100%",
                padding: "10px 12px",
                borderRadius: 12,
                border: "1px solid rgba(255,255,255,0.12)",
                background: "rgba(255,255,255,0.04)",
                color: "#fff",
                fontSize: 15,
                fontWeight: 500,
                outline: "none",
                resize: "vertical",
                fontFamily: "inherit",
              }}
            />
            <div
              style={{
                fontSize: 11,
                opacity: 0.5,
                marginTop: 4,
                textAlign: "right",
              }}
            >
              {bio.length} / 280
            </div>

            {err ? (
              <p style={{ color: "#FCA5A5", fontSize: 13, marginTop: 4 }}>
                {err}
              </p>
            ) : null}

            <div
              style={{
                display: "flex",
                gap: 10,
                marginTop: 16,
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
                onClick={save}
                style={{
                  padding: "10px 18px",
                  borderRadius: 12,
                  background:
                    "linear-gradient(135deg, #EC4899, #F97316, #FBBF24)",
                  color: "#0B0B10",
                  border: "1px solid rgba(255,255,255,0.12)",
                  cursor: submitting ? "wait" : "pointer",
                  fontWeight: 700,
                  fontSize: 14,
                  opacity: submitting ? 0.6 : 1,
                }}
              >
                {submitting ? "Saving…" : "Save"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

export default EditProfileButton;
