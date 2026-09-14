"use client";

import { useMemo, useState } from "react";
import { ArrowLeft, Star, Gift, Check, EyeOff, MessageSquare } from "lucide-react";

interface Row {
  id: string;
  email: string;
  kind: string;
  promptKey: string | null;
  choice: string | null;
  body: string | null;
  rating: number | null;
  analysisId: string | null;
  videoId: string | null;
  platform: string;
  creditGranted: boolean;
  createdAt: string;
}

interface Quote {
  id: string;
  email: string;
  displayName: string | null;
  role: string | null;
  quote: string;
  rating: number | null;
  approved: boolean;
  createdAt: string;
}

const KIND_LABEL: Record<string, string> = {
  pre_analysis: "Wait room",
  report_rating: "Report stars",
  milestone: "Milestone",
  idea: "Idea box",
};

const FILTERS = [
  { key: "all", label: "Everything" },
  { key: "written", label: "With words" },
  { key: "misses", label: "Misses (1–3★)" },
  { key: "pre_analysis", label: "Wait room" },
  { key: "report_rating", label: "Report stars" },
];

function when(iso: string) {
  return new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function Stars({ n }: { n: number }) {
  return (
    <span className="inline-flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={`h-3 w-3 ${i <= n ? "fill-[#FBBF24] text-[#FBBF24]" : "text-white/20"}`}
        />
      ))}
    </span>
  );
}

export default function FeedbackInbox({
  rows,
  quotes,
  creditsPaid,
}: {
  rows: Row[];
  quotes: Quote[];
  creditsPaid: number;
}) {
  const [filter, setFilter] = useState("all");
  const [pending, setPending] = useState<string | null>(null);
  const [approvals, setApprovals] = useState<Record<string, boolean>>(
    Object.fromEntries(quotes.map((q) => [q.id, q.approved])),
  );

  const filtered = useMemo(() => {
    switch (filter) {
      case "written":
        return rows.filter((r) => r.body && r.body.trim().length > 0);
      case "misses":
        return rows.filter((r) => r.rating !== null && r.rating <= 3);
      case "all":
        return rows;
      default:
        return rows.filter((r) => r.kind === filter);
    }
  }, [rows, filter]);

  const written = rows.filter((r) => r.body).length;
  const rated = rows.filter((r) => r.rating !== null);
  const avg = rated.length
    ? (rated.reduce((s, r) => s + (r.rating ?? 0), 0) / rated.length).toFixed(1)
    : "—";

  const toggle = async (id: string, next: boolean) => {
    setPending(id);
    try {
      const res = await fetch("/api/admin/testimonial", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, approved: next }),
      });
      if (res.ok) setApprovals((a) => ({ ...a, [id]: next }));
    } catch {
      /* leave it as-is; the button can be tapped again */
    }
    setPending(null);
  };

  const stat = (label: string, value: string | number) => (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3">
      <p className="text-[10px] font-semibold uppercase tracking-[1px] text-[#C084FC]">{label}</p>
      <p className="mt-1 text-2xl font-bold text-white">{value}</p>
    </div>
  );

  return (
    <div className="min-h-screen px-4 py-10">
      <div className="mx-auto max-w-4xl">
        <a
          href="/admin"
          className="inline-flex items-center gap-2 text-sm text-[#A1A1AA] transition-colors hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" /> Admin
        </a>

        <h1 className="mt-6 text-3xl font-bold text-white">Customer inbox</h1>
        <p className="mt-1 text-sm text-[#A1A1AA]">
          Everything parents have told us, newest first.
        </p>

        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {stat("Notes", rows.length)}
          {stat("With words", written)}
          {stat("Avg stars", avg)}
          {stat("Credits paid", creditsPaid)}
        </div>

        {/* ── Testimonials awaiting publication ──────────────────────────── */}
        {quotes.length > 0 && (
          <section className="mt-10">
            <h2 className="text-lg font-bold text-white">Testimonials</h2>
            <p className="mt-1 text-xs text-[#71717A]">
              Approve one and it becomes publishable social proof for routinex.org.
            </p>
            <div className="mt-4 space-y-3">
              {quotes.map((q) => {
                const approved = approvals[q.id];
                return (
                  <div
                    key={q.id}
                    className={`rounded-2xl border p-4 transition-colors ${
                      approved
                        ? "border-[#FBBF24]/30 bg-[#FBBF24]/[0.05]"
                        : "border-white/10 bg-white/[0.03]"
                    }`}
                  >
                    <p className="text-sm leading-relaxed text-white">&ldquo;{q.quote}&rdquo;</p>
                    <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                      <div className="text-xs text-[#A1A1AA]">
                        <span className="font-semibold text-white/85">
                          {q.displayName || "Anonymous"}
                        </span>
                        {q.role ? ` · ${q.role}` : ""} · {q.email} · {when(q.createdAt)}
                        {q.rating ? (
                          <>
                            {" · "}
                            <Stars n={q.rating} />
                          </>
                        ) : null}
                      </div>
                      <button
                        onClick={() => toggle(q.id, !approved)}
                        disabled={pending === q.id}
                        className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-opacity disabled:opacity-50 ${
                          approved
                            ? "border border-white/12 bg-white/5 text-white/80"
                            : "bg-gradient-to-r from-[#9333EA] via-[#EC4899] to-[#F59E0B] text-white"
                        }`}
                      >
                        {approved ? (
                          <>
                            <EyeOff className="h-3 w-3" /> Unpublish
                          </>
                        ) : (
                          <>
                            <Check className="h-3 w-3" /> Publish
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* ── The notes ──────────────────────────────────────────────────── */}
        <section className="mt-10">
          <div className="flex flex-wrap gap-2">
            {FILTERS.map((f) => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                  filter === f.key
                    ? "bg-white text-black"
                    : "border border-white/12 bg-white/5 text-white/70 hover:bg-white/10"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          <div className="mt-4 space-y-3">
            {filtered.length === 0 && (
              <p className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-8 text-center text-sm text-[#71717A]">
                Nothing here yet.
              </p>
            )}
            {filtered.map((r) => (
              <div key={r.id} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <div className="flex flex-wrap items-center gap-2 text-[11px]">
                  <span className="rounded-md bg-[#C084FC]/15 px-2 py-0.5 font-semibold uppercase tracking-[0.5px] text-[#C084FC]">
                    {KIND_LABEL[r.kind] || r.kind}
                  </span>
                  {r.rating !== null && <Stars n={r.rating} />}
                  {r.creditGranted && (
                    <span className="inline-flex items-center gap-1 rounded-md bg-[#FBBF24]/15 px-2 py-0.5 font-semibold text-[#FBBF24]">
                      <Gift className="h-3 w-3" /> credited
                    </span>
                  )}
                  <span className="text-[#71717A]">
                    {r.email} · {r.platform} · {when(r.createdAt)}
                  </span>
                </div>

                {r.choice && (
                  <p className="mt-2 text-xs text-[#A1A1AA]">
                    <span className="text-[#71717A]">Tapped:</span> {r.choice}
                  </p>
                )}
                {r.body && (
                  <p className="mt-2 whitespace-pre-wrap border-l-2 border-[#9333EA]/50 pl-3 text-sm leading-relaxed text-white">
                    {r.body}
                  </p>
                )}

                <div className="mt-3 flex flex-wrap gap-3 text-[11px]">
                  <a
                    href={`mailto:${r.email}?subject=${encodeURIComponent("RoutineX — thanks for the note")}`}
                    className="inline-flex items-center gap-1 font-semibold text-[#C084FC] hover:text-white"
                  >
                    <MessageSquare className="h-3 w-3" /> Reply
                  </a>
                  {(r.analysisId || r.videoId) && (
                    <a
                      href={`/analysis/${r.analysisId || r.videoId}`}
                      className="text-[#71717A] hover:text-white"
                    >
                      View report
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
