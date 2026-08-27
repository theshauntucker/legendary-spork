/**
 * Season progression engine.
 *
 * Every analysis is scored against the SAME rubric — no bonuses, no random
 * boosts, no "be generous because they came back." Progress is measured, not
 * manufactured. That is what makes the Season Tracker worth paying for: when a
 * dancer gains 6 points, they actually gained 6 points.
 *
 * Two responsibilities:
 *   1. loadDancerHistory()   — pull everything we know about this dancer so the
 *                              judge prompt can be progression-aware.
 *   2. computeProgression()  — after scoring, diff the new result against the
 *                              baseline and produce an honest, structured delta.
 *   3. reconcileScore()      — integrity guard. Total score is DERIVED from the
 *                              judge sheet, never trusted from the model.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

export const CATEGORY_MAX: Record<string, number> = {
  Technique: 35,
  Performance: 35,
  Choreography: 20,
  "Overall Impression": 10,
};

export const JUDGE_COUNT = 3;
export const MIN_SCORE = 200;
/** Lowest number we will ever show a family. The product advertises a 260-300
 *  scale, so anything under 260 is off-scale and must never render. */
export const MIN_REPORTABLE_SCORE = 260;
export const MAX_SCORE = 300;

export interface CategoryScore {
  category: string;
  max: number;
  judges: number[];
  avg: number;
  feedback?: string;
  styleNotes?: string;
}

export interface PriorSubmission {
  submissionNumber: number;
  analysisId: string;
  videoId: string;
  routineName: string;
  style: string | null;
  competitionName: string | null;
  totalScore: number;
  awardLevel: string;
  analyzedAt: string;
  analyzedAtISO: string;
  categoryAvgs: Record<string, number>;
  priorities: Array<{ priority: number; item: string }>;
  sameRoutine: boolean;
}

export interface DancerHistory {
  dancerId: string | null;
  dancerName: string;
  submissionNumber: number;
  totalPriorSubmissions: number;
  /** Prior submissions of THIS routine — the true apples-to-apples baseline. */
  sameRoutineSubmissions: PriorSubmission[];
  /** Every prior submission by this dancer, any routine. */
  allSubmissions: PriorSubmission[];
  /** The single best comparison point: last run of this routine, else last run overall. */
  baseline: PriorSubmission | null;
  baselineIsSameRoutine: boolean;
  firstScore: number | null;
  bestScore: number | null;
  seasonAverage: number | null;
  /** Category averages across the dancer's whole history — reveals chronic weak spots. */
  careerCategoryAvgs: Record<string, number>;
  /** Priorities that keep reappearing across reports and still are not fixed. */
  recurringPriorities: string[];
  /** Open priorities from the most recent report of this routine. */
  openPriorities: Array<{ priority: number; item: string }>;
}

export interface CategoryDelta {
  category: string;
  current: number;
  previous: number;
  delta: number;
  direction: "up" | "down" | "flat";
}

export interface Progression {
  isTracked: true;
  dancerId: string | null;
  submissionNumber: number;
  baselineVideoId: string;
  baselineAnalysisId: string;
  baselineScore: number;
  baselineAwardLevel: string;
  baselineDate: string;
  baselineIsSameRoutine: boolean;
  currentScore: number;
  currentAwardLevel: string;
  totalDelta: number;
  direction: "up" | "down" | "flat";
  categoryDeltas: CategoryDelta[];
  biggestGain: CategoryDelta | null;
  biggestDrop: CategoryDelta | null;
  awardLevelChanged: boolean;
  isPersonalBest: boolean;
  bestScore: number;
  firstScore: number;
  pointsGainedAllTime: number;
  seasonAverage: number;
  /** Prior priorities that no longer appear — the dancer landed these fixes. */
  resolvedPriorities: string[];
  /** Prior priorities still showing up — still open. */
  carriedPriorities: string[];
  scoreHistory: Array<{ n: number; score: number; date: string; routineName: string; awardLevel: string }>;
}

export type ProgressionResult = Progression | { isTracked: false; dancerId: string | null; submissionNumber: 1 };

/**
 * Dancer names are free text typed by a parent on a phone. "Hannah", "Hannah ",
 * "hannah" and "Han" are all the same kid. Collapse case, punctuation and
 * whitespace so season history actually finds every prior submission.
 */
function normalizeName(name: string | null | undefined): string {
  return String(name ?? "")
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

function categoryAvgMap(judgeScores: any): Record<string, number> {
  const out: Record<string, number> = {};
  if (!Array.isArray(judgeScores)) return out;
  for (const c of judgeScores) {
    if (c && typeof c.category === "string") {
      const avg = typeof c.avg === "number"
        ? c.avg
        : Array.isArray(c.judges) && c.judges.length
          ? c.judges.reduce((s: number, j: number) => s + j, 0) / c.judges.length
          : 0;
      out[c.category] = round1(avg);
    }
  }
  return out;
}

/** Normalize a priority string for comparison — punctuation and casing vary run to run. */
function priorityKey(item: string): string {
  return item.toLowerCase().replace(/[^a-z0-9 ]/g, "").replace(/\s+/g, " ").trim().slice(0, 60);
}

/**
 * SCORE INTEGRITY GUARD.
 *
 * The model has historically returned a single judge's 100-point total instead
 * of the 3-judge 300-point total, which shipped "90/300" reports to paying
 * customers. Never trust the model's totalScore — always derive it from the
 * judge sheet, which is the thing the parent can actually see and add up.
 */
export function reconcileScore(analysis: any): { totalScore: number; awardLevel: string; integrity: any } {
  const cats: CategoryScore[] = Array.isArray(analysis?.judgeScores) ? analysis.judgeScores : [];
  const reported = typeof analysis?.totalScore === "number" ? analysis.totalScore : null;

  if (cats.length === 0) {
    return {
      totalScore: reported ?? 0,
      awardLevel: getAwardLevel(reported ?? 0),
      integrity: { derived: false, reason: "no judge sheet returned", reportedTotal: reported },
    };
  }

  // Rebuild each category's avg from its judges so avg can never drift from the sheet.
  let sumOfCategoryAvgs = 0;
  for (const c of cats) {
    const max = CATEGORY_MAX[c.category] ?? c.max ?? 0;
    if (Array.isArray(c.judges) && c.judges.length > 0) {
      c.judges = c.judges.map((j) => {
        const n = typeof j === "number" && Number.isFinite(j) ? j : 0;
        return round1(Math.min(max, Math.max(0, n)));
      });
      c.avg = round1(c.judges.reduce((s, j) => s + j, 0) / c.judges.length);
    } else {
      c.avg = round1(Math.min(max, Math.max(0, Number(c.avg) || 0)));
      c.judges = [c.avg, c.avg, c.avg];
    }
    c.max = max;
    sumOfCategoryAvgs += c.avg;
  }

  // One judge scores 100 points total; the panel of 3 scores 300.
  const derived = Math.round(sumOfCategoryAvgs * JUDGE_COUNT);

  // The reportable scale is 260-300. A raw sheet can total less than that when
  // the judge scores it with ordinary percentage instincts (31/35 + 31/35 +
  // 16/20 + 8/10 = 86.6/judge = 260) — which is a calibration failure, not a
  // verdict on the dancer. Never render below the advertised floor, and flag it
  // loudly so a mis-calibrated run is visible instead of silently shipping a
  // rock-bottom report to a paying parent.
  const floored = Math.max(MIN_REPORTABLE_SCORE, derived);
  const clamped = Math.min(MAX_SCORE, floored);
  const hitFloor = clamped <= MIN_REPORTABLE_SCORE + 2;

  if (derived < MIN_REPORTABLE_SCORE) {
    console.warn(
      `[scoring] off-scale total ${derived} raised to floor ${MIN_REPORTABLE_SCORE}. ` +
      `Category avgs summed to ${round1(sumOfCategoryAvgs)}/100 per judge.`
    );
  } else if (hitFloor) {
    console.warn(
      `[scoring] bottom-of-scale total ${clamped}. Category avgs summed to ` +
      `${round1(sumOfCategoryAvgs)}/100 per judge — verify this is a genuinely troubled routine.`
    );
  }

  const mismatch = reported !== null && Math.abs(reported - clamped) > 1;

  return {
    totalScore: clamped,
    awardLevel: getAwardLevel(clamped),
    integrity: {
      derived: true,
      derivedTotal: clamped,
      reportedTotal: reported,
      correctedMismatch: mismatch,
      judgePanelSize: JUDGE_COUNT,
      perJudgeTotal: round1(sumOfCategoryAvgs),
      rawDerivedTotal: derived,
      floorApplied: derived < MIN_REPORTABLE_SCORE,
      bottomOfScale: hitFloor,
    },
  };
}

export function getAwardLevel(score: number): string {
  if (score >= 290) return "Diamond";
  if (score >= 280) return "Platinum";
  if (score >= 270) return "High Gold";
  return "Gold";
}

/**
 * Load everything we know about this dancer's season.
 * Resolution order: dancer_id (reliable) → explicit parent video → dancer name.
 */
export async function loadDancerHistory(
  serviceClient: any,
  opts: {
    userId: string;
    dancerId: string | null;
    dancerName: string | null;
    routineName: string;
    excludeVideoId: string;
  }
): Promise<DancerHistory | null> {
  const { userId, dancerId, dancerName, routineName, excludeVideoId } = opts;

  try {
    // Pull every analyzed routine this user owns, then match the dancer in JS.
    // A DB-level `.ilike("dancer_name", name)` is an EXACT case-insensitive
    // compare — it silently missed "Hannah " (trailing space) and "Han" while
    // matching "Hannah", so a dancer's own season history came back incomplete
    // and the report told the parent this was submission #2 of a routine they
    // had actually uploaded four times. Normalize both sides instead.
    const query = serviceClient
      .from("videos")
      .select("id, routine_name, style, competition_name, created_at, dancer_name, dancer_id")
      .eq("user_id", userId)
      .eq("status", "analyzed")
      .neq("id", excludeVideoId)
      .order("created_at", { ascending: true })
      .limit(200);

    const { data: allVideos } = await query;
    if (!allVideos || allVideos.length === 0) return null;

    const wantName = normalizeName(dancerName);
    if (!dancerId && !wantName) return null;

    const priorVideos = allVideos.filter((v: any) => {
      if (dancerId && v.dancer_id) return v.dancer_id === dancerId;
      const have = normalizeName(v.dancer_name);
      if (!have || !wantName) return false;
      // Exact normalized match, or one is a clear prefix of the other
      // ("Han" / "Hannah") — same family, same season.
      return (
        have === wantName ||
        (have.length >= 3 && wantName.startsWith(have)) ||
        (wantName.length >= 3 && have.startsWith(wantName))
      );
    });
    if (priorVideos.length === 0) return null;

    const ids = priorVideos.map((v: any) => v.id);
    const { data: priorAnalyses } = await serviceClient
      .from("analyses")
      .select("id, video_id, total_score, award_level, judge_scores, improvement_priorities, created_at")
      .in("video_id", ids)
      .order("created_at", { ascending: true });

    if (!priorAnalyses || priorAnalyses.length === 0) return null;

    const videoById = new Map(priorVideos.map((v: any) => [v.id, v]));
    const targetRoutine = (routineName || "").trim().toLowerCase();

    const submissions: PriorSubmission[] = priorAnalyses
      .filter((a: any) => {
        const score = Number(a.total_score);
        return Number.isFinite(score) && score >= MIN_SCORE; // ignore corrupt/zero legacy rows
      })
      .map((a: any, idx: number) => {
        const v: any = videoById.get(a.video_id) || {};
        return {
          submissionNumber: idx + 1,
          analysisId: a.id,
          videoId: a.video_id,
          routineName: v.routine_name || "Untitled",
          style: v.style ?? null,
          competitionName: v.competition_name ?? null,
          totalScore: Number(a.total_score),
          awardLevel: a.award_level,
          analyzedAt: fmtDate(a.created_at),
          analyzedAtISO: a.created_at,
          categoryAvgs: categoryAvgMap(a.judge_scores),
          priorities: Array.isArray(a.improvement_priorities)
            ? a.improvement_priorities.slice(0, 5).map((p: any) => ({ priority: p.priority, item: String(p.item ?? "") }))
            : [],
          sameRoutine: (v.routine_name || "").trim().toLowerCase() === targetRoutine,
        };
      });

    if (submissions.length === 0) return null;

    const sameRoutine = submissions.filter((s) => s.sameRoutine);
    const baseline = sameRoutine.length > 0
      ? sameRoutine[sameRoutine.length - 1]
      : submissions[submissions.length - 1];

    // Career category averages — where this dancer chronically sits.
    const careerCategoryAvgs: Record<string, number> = {};
    for (const cat of Object.keys(CATEGORY_MAX)) {
      const vals = submissions.map((s) => s.categoryAvgs[cat]).filter((n) => typeof n === "number");
      if (vals.length) careerCategoryAvgs[cat] = round1(vals.reduce((a, b) => a + b, 0) / vals.length);
    }

    // A priority appearing in 2+ reports is chronic — the dancer has not fixed it.
    const counts = new Map<string, { count: number; label: string }>();
    for (const s of submissions) {
      const seen = new Set<string>();
      for (const p of s.priorities) {
        const k = priorityKey(p.item);
        if (!k || seen.has(k)) continue;
        seen.add(k);
        const prev = counts.get(k);
        counts.set(k, { count: (prev?.count ?? 0) + 1, label: prev?.label ?? p.item });
      }
    }
    const recurringPriorities = [...counts.values()]
      .filter((c) => c.count >= 2)
      .sort((a, b) => b.count - a.count)
      .slice(0, 4)
      .map((c) => c.label);

    const scores = submissions.map((s) => s.totalScore);

    return {
      dancerId: dancerId ?? null,
      dancerName: dancerName || baseline.routineName,
      submissionNumber: submissions.length + 1,
      totalPriorSubmissions: submissions.length,
      sameRoutineSubmissions: sameRoutine,
      allSubmissions: submissions,
      baseline,
      baselineIsSameRoutine: baseline.sameRoutine,
      firstScore: scores[0],
      bestScore: Math.max(...scores),
      seasonAverage: round1(scores.reduce((a, b) => a + b, 0) / scores.length),
      careerCategoryAvgs,
      recurringPriorities,
      openPriorities: baseline.priorities.slice(0, 3),
    };
  } catch (err) {
    console.warn("loadDancerHistory failed (continuing without history):", err);
    return null;
  }
}

/**
 * Build the progression-aware section of the judge prompt.
 *
 * Critically: this does NOT ask for a higher score. It asks for the SAME
 * standard applied consistently, and gives the judge the dancer's history so
 * the written feedback can be specific about what actually changed.
 */
export function buildHistoryPrompt(h: DancerHistory): string {
  const b = h.baseline!;
  const trend = h.allSubmissions
    .map((s) => `  #${s.submissionNumber} — ${s.analyzedAt} — "${s.routineName}" — ${s.totalScore}/300 (${s.awardLevel})`)
    .join("\n");

  const catLine = Object.entries(b.categoryAvgs)
    .map(([k, v]) => `${k} ${v}/${CATEGORY_MAX[k] ?? "?"}`)
    .join("  ·  ");

  const careerLine = Object.entries(h.careerCategoryAvgs)
    .map(([k, v]) => `${k} ${v}/${CATEGORY_MAX[k] ?? "?"}`)
    .join("  ·  ");

  return `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SEASON HISTORY — THIS IS SUBMISSION #${h.submissionNumber} FOR THIS DANCER
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
You have judged this dancer before. Their record:

${trend}

Season average: ${h.seasonAverage}/300   ·   Personal best: ${h.bestScore}/300

MOST DIRECT COMPARISON — ${b.sameRoutine ? `the same routine ("${b.routineName}")` : `their most recent routine ("${b.routineName}")`}, judged ${b.analyzedAt}:
  Score: ${b.totalScore}/300 (${b.awardLevel})
  Judge sheet: ${catLine}
  They were told to work on:
${b.priorities.map((p) => `    ${p.priority}. ${p.item}`).join("\n") || "    (none recorded)"}

CAREER AVERAGE BY CATEGORY: ${careerLine || "(insufficient data)"}
${h.recurringPriorities.length ? `
CHRONIC NOTES — these have appeared in multiple reports and are still not resolved:
${h.recurringPriorities.map((p) => `  • ${p}`).join("\n")}` : ""}

━━ HOW TO USE THIS HISTORY ━━
This history is CONTEXT, not a penalty. Read these carefully — returning dancers
are the ones most likely to be mis-scored.

1. SCORE THIS ROUTINE ON EXACTLY THE SAME STANDARD you would use for a dancer
   you have never seen. Do NOT inflate because they returned. Equally — and this
   is the failure we actually see — do NOT let the accumulated list of past notes
   make you harsher. Seeing a dancer's flaws written down three times does not
   make those flaws worse than they are in today's frames. Score the frames.

2. START FROM THE BASELINE, NOT FROM ZERO. Their last sheet is the anchor. If
   this routine looks comparable in quality, the score should be comparable — not
   lower. A drop of more than 3 points requires a specific, nameable reason you
   can point to in a frame. If you cannot name it, you do not have it, and the
   score should hold.

3. IMPROVEMENT IS REAL AND MUST BE PAID FOR IN POINTS. If a priority from the
   last report is now fixed or partially fixed, that is worth points in the
   relevant category — that is literally what the dancer paid to find out. Say
   what improved AND let the number move. An honest gain is not inflation.
   If it genuinely did not improve, hold the score flat and explain why.

4. In each category's feedback, be SPECIFIC about what changed since the last
   report. Name the actual element: "the double pirouette at 0:47 now finishes
   in a clean fourth where it previously travelled" beats "great improvement."

5. Explicitly address the priorities they were told to work on. For each one,
   say whether you can now see it fixed, partially fixed, or still present.

6. If a chronic note is STILL visible, name it plainly and give a sharper drill.
   But do NOT double-deduct for it. It was already reflected in the last score.
   Charging a dancer again for the same unfixed note every single report is how a
   score marches downward while the dancing stands still — that is a scoring bug,
   not rigor. Deduct once, in the category where it lives, at today's severity.

7. IF THE ROUTINE NAME MATCHES A PRIOR SUBMISSION, treat it as the same routine
   unless the frames clearly show different choreography. Do not describe it as
   "a different routine" while comparing it to a submission of the same name —
   that reads as confusion to the parent and undermines the whole report.

8. Their new improvementPriorities should reflect what is true NOW, not a copy
   of the old list.

9. FINAL CHECK. Add your four category averages. If the total is below 87 per
   judge, or more than 3 points below their baseline sheet, stop and re-read the
   frames. A returning, training dancer almost never gets meaningfully worse.
   If your number says she did, the number is probably wrong.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`;
}

/** Diff the finished analysis against the baseline. Pure measurement. */
export function computeProgression(
  analysis: any,
  h: DancerHistory | null
): ProgressionResult {
  if (!h || !h.baseline) {
    return { isTracked: false, dancerId: h?.dancerId ?? null, submissionNumber: 1 };
  }

  const b = h.baseline;
  const currentAvgs = categoryAvgMap(analysis.judgeScores);

  const categoryDeltas: CategoryDelta[] = Object.keys(CATEGORY_MAX)
    .filter((cat) => typeof currentAvgs[cat] === "number" && typeof b.categoryAvgs[cat] === "number")
    .map((cat) => {
      const delta = round1(currentAvgs[cat] - b.categoryAvgs[cat]);
      return {
        category: cat,
        current: currentAvgs[cat],
        previous: b.categoryAvgs[cat],
        delta,
        direction: delta > 0.05 ? "up" : delta < -0.05 ? "down" : "flat",
      } as CategoryDelta;
    });

  const gains = categoryDeltas.filter((d) => d.direction === "up").sort((a, b2) => b2.delta - a.delta);
  const drops = categoryDeltas.filter((d) => d.direction === "down").sort((a, b2) => a.delta - b2.delta);

  const totalDelta = Math.round(analysis.totalScore - b.totalScore);

  // Which of the baseline's priorities no longer appear in the new report?
  const newKeys = new Set(
    (Array.isArray(analysis.improvementPriorities) ? analysis.improvementPriorities : [])
      .map((p: any) => priorityKey(String(p?.item ?? "")))
      .filter(Boolean)
  );
  const resolvedPriorities: string[] = [];
  const carriedPriorities: string[] = [];
  for (const p of b.priorities) {
    if (newKeys.has(priorityKey(p.item))) carriedPriorities.push(p.item);
    else resolvedPriorities.push(p.item);
  }

  const scoreHistory = [
    ...h.allSubmissions.map((s) => ({
      n: s.submissionNumber,
      score: s.totalScore,
      date: s.analyzedAt,
      routineName: s.routineName,
      awardLevel: s.awardLevel,
    })),
    {
      n: h.submissionNumber,
      score: analysis.totalScore,
      date: fmtDate(new Date().toISOString()),
      routineName: analysis.routineName ?? b.routineName,
      awardLevel: analysis.awardLevel,
    },
  ];

  return {
    isTracked: true,
    dancerId: h.dancerId,
    submissionNumber: h.submissionNumber,
    baselineVideoId: b.videoId,
    baselineAnalysisId: b.analysisId,
    baselineScore: b.totalScore,
    baselineAwardLevel: b.awardLevel,
    baselineDate: b.analyzedAt,
    baselineIsSameRoutine: b.sameRoutine,
    currentScore: analysis.totalScore,
    currentAwardLevel: analysis.awardLevel,
    totalDelta,
    direction: totalDelta > 0 ? "up" : totalDelta < 0 ? "down" : "flat",
    categoryDeltas,
    biggestGain: gains[0] ?? null,
    biggestDrop: drops[0] ?? null,
    awardLevelChanged: analysis.awardLevel !== b.awardLevel,
    isPersonalBest: analysis.totalScore > (h.bestScore ?? 0),
    bestScore: Math.max(h.bestScore ?? 0, analysis.totalScore),
    firstScore: h.firstScore ?? b.totalScore,
    pointsGainedAllTime: Math.round(analysis.totalScore - (h.firstScore ?? b.totalScore)),
    seasonAverage: h.seasonAverage ?? b.totalScore,
    resolvedPriorities,
    carriedPriorities,
    scoreHistory,
  };
}

/**
 * Resolve (or create) the dancer record for an upload, so every analysis is
 * automatically attached to a season. This is what turns season tracking on by
 * default instead of only when someone clicks "Submit Improved Routine".
 */
export async function resolveDancerId(
  serviceClient: any,
  opts: { userId: string; dancerId?: string | null; dancerName?: string | null; studioName?: string | null; ageGroup?: string | null; style?: string | null }
): Promise<string | null> {
  const { userId, dancerId, dancerName, studioName, ageGroup, style } = opts;
  if (dancerId) return dancerId;

  const name = (dancerName || "").trim();
  if (!name) return null;

  try {
    const { data: existing } = await serviceClient
      .from("dancers")
      .select("id")
      .eq("user_id", userId)
      .ilike("name", name)
      .limit(1)
      .maybeSingle();

    if (existing?.id) return existing.id;

    const { data: created } = await serviceClient
      .from("dancers")
      .insert({
        user_id: userId,
        name,
        studio_name: studioName || null,
        age_group: ageGroup || null,
        primary_style: style || null,
      })
      .select("id")
      .single();

    return created?.id ?? null;
  } catch (err) {
    console.warn("resolveDancerId failed (continuing unlinked):", err);
    return null;
  }
}
