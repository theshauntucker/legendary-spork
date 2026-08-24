/**
 * Practice Plan engine.
 *
 * Turns a finished judge report (plus the dancer's season history) into a
 * concrete two-week practice plan a parent can run at home. This is the
 * premium add-on: included for Season Members, $4.99 one-time otherwise.
 *
 * Every drill must trace back to something a judge actually flagged in THIS
 * dancer's report — never generic "practice more" filler. That traceability
 * is the entire reason it's worth paying for.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

export interface PracticePlanContent {
  title: string;
  summary: string;
  focusAreas: Array<{ name: string; why: string; targetCategory: string }>;
  weeks: Array<{
    week: number;
    theme: string;
    days: Array<{
      day: string;
      minutes: number;
      blocks: Array<{
        name: string;
        minutes: number;
        drill: string;
        sets: string;
        watchFor: string;
      }>;
    }>;
  }>;
  checkpoints: Array<{ when: string; test: string; passSignal: string }>;
  parentTips: string[];
  motivation: string;
}

export async function isSeasonMember(serviceClient: any, userId: string): Promise<boolean> {
  try {
    const { data } = await serviceClient
      .from("subscriptions")
      .select("status")
      .eq("user_id", userId)
      .in("status", ["active", "trialing"])
      .limit(1)
      .maybeSingle();
    return Boolean(data);
  } catch {
    return false;
  }
}

/**
 * Generate the plan content from the analysis. Throws on failure — callers
 * set plan status accordingly.
 */
export async function generatePracticePlanContent(opts: {
  analysis: any; // analyses row
  video: any; // videos row
}): Promise<PracticePlanContent> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY not set");

  const { analysis, video } = opts;

  const judgeSection = (Array.isArray(analysis.judge_scores) ? analysis.judge_scores : [])
    .map(
      (c: any) =>
        `${c.category} (${c.avg}/${c.max}): ${c.feedback ?? ""}${c.styleNotes ? ` Style notes: ${c.styleNotes}` : ""}`
    )
    .join("\n\n");

  const priorities = (Array.isArray(analysis.improvement_priorities) ? analysis.improvement_priorities : [])
    .map(
      (p: any) =>
        `${p.priority}. ${p.item} [impact: ${p.impact ?? "?"}, est. time: ${p.timeToFix ?? "?"}]${p.trainingTip ? ` Tip already given: ${p.trainingTip}` : ""}`
    )
    .join("\n");

  const prog = analysis.progression;
  const progressionSection = prog?.isTracked
    ? `
SEASON CONTEXT (submission #${prog.submissionNumber}):
- Score moved ${prog.baselineScore} → ${prog.currentScore} (${prog.totalDelta >= 0 ? "+" : ""}${prog.totalDelta})
- Category deltas: ${(prog.categoryDeltas ?? []).map((d: any) => `${d.category} ${d.delta >= 0 ? "+" : ""}${d.delta}`).join(", ")}
- Priorities still open from previous reports: ${(prog.carriedPriorities ?? []).join("; ") || "none"}
- Priorities they already fixed: ${(prog.resolvedPriorities ?? []).join("; ") || "none"}
Focus the plan hardest on what is STILL open. Do not waste practice time on what they already fixed.`
    : "";

  const prompt = `You are an elite competitive dance coach designing a home practice plan for a specific dancer, based on their actual judged report below.

DANCER: ${video.dancer_name || "the dancer"}
STYLE: ${video.style || "—"} · ENTRY TYPE: ${video.entry_type || "Solo"} · AGE DIVISION: ${video.age_group || "—"}
ROUTINE: "${video.routine_name || "Untitled"}"
SCORE: ${analysis.total_score}/300 (${analysis.award_level})

JUDGE FEEDBACK:
${judgeSection}

IMPROVEMENT PRIORITIES FROM THE JUDGES:
${priorities}
${progressionSection}

Design a 2-WEEK home practice plan. Rules:
- 4 practice days per week, 20–30 minutes per day. Realistic for a busy competitive dancer on top of studio classes.
- EVERY drill must trace to a specific note in the judge feedback above. In each block's "drill" text, reference what the judges saw (e.g. "the judges flagged your pirouette landings travelling — this drill fixes the landing").
- Safe for unsupervised home practice: no new acro/tumbling skills, no partnering, nothing requiring a spotter or sprung floor. Conditioning, technique repetition, flexibility, performance/facial work, and musicality drills only.
- Age-appropriate for the division listed.
- Week 2 progresses week 1 (more reps, added complexity, or combining elements) — not a copy.
- "watchFor" is what a PARENT with no dance training can look for to know it's being done right.
- Checkpoints are simple pass/fail self-tests, filmed on a phone, at end of week 1 and week 2.
- Warm, direct coach voice. No generic filler. No "keep practicing!"

Return ONLY a JSON object with EXACTLY this structure:
{
  "title": "<plan title using the routine name>",
  "summary": "<3-4 sentences: what this plan targets and the score movement it is built to earn>",
  "focusAreas": [
    { "name": "<focus>", "why": "<the judge note this comes from>", "targetCategory": "<Technique|Performance|Choreography|Overall Impression>" }
  ],
  "weeks": [
    {
      "week": 1,
      "theme": "<week theme>",
      "days": [
        {
          "day": "Day 1",
          "minutes": <total>,
          "blocks": [
            { "name": "<block name>", "minutes": <n>, "drill": "<exact instructions, step by step>", "sets": "<e.g. 3 sets of 8>", "watchFor": "<what a parent checks>" }
          ]
        }
      ]
    }
  ],
  "checkpoints": [
    { "when": "End of Week 1", "test": "<filmable self-test>", "passSignal": "<what passing looks like>" }
  ],
  "parentTips": ["<2-4 short tips for the parent running this>"],
  "motivation": "<2-3 sentences, coach to dancer, specific to their situation — not generic>"
}

3-4 focusAreas. 4 days per week, 2-4 blocks per day. Return ONLY the JSON.`;

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-opus-5",
      max_tokens: 8192,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Practice plan API error ${response.status}: ${errText.slice(0, 300)}`);
  }

  const data = await response.json();
  const text = data.content?.[0]?.text;
  if (!text) throw new Error("Empty practice plan response");

  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("Could not parse practice plan JSON");

  const plan = JSON.parse(jsonMatch[0]) as PracticePlanContent;
  if (!plan.weeks?.length || !plan.focusAreas?.length) {
    throw new Error("Practice plan missing required sections");
  }
  return plan;
}

/**
 * Full pipeline: load rows, generate, persist. Idempotent — a plan already
 * 'ready' is returned as-is.
 */
export async function generateAndSavePlan(
  serviceClient: any,
  planId: string
): Promise<{ ok: boolean; error?: string }> {
  const { data: plan } = await serviceClient
    .from("practice_plans")
    .select("*")
    .eq("id", planId)
    .single();

  if (!plan) return { ok: false, error: "Plan not found" };
  if (plan.status === "ready") return { ok: true };

  await serviceClient
    .from("practice_plans")
    .update({ status: "generating", updated_at: new Date().toISOString() })
    .eq("id", planId);

  try {
    const [{ data: video }, { data: analysis }] = await Promise.all([
      serviceClient.from("videos").select("*").eq("id", plan.video_id).single(),
      serviceClient
        .from("analyses")
        .select("*")
        .eq("video_id", plan.video_id)
        .order("created_at", { ascending: false })
        .limit(1)
        .single(),
    ]);

    if (!video || !analysis) throw new Error("Video or analysis missing for plan");

    const content = await generatePracticePlanContent({ analysis, video });

    await serviceClient
      .from("practice_plans")
      .update({
        status: "ready",
        content,
        analysis_id: analysis.id,
        error: null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", planId);

    return { ok: true };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("Practice plan generation failed:", planId, msg);
    await serviceClient
      .from("practice_plans")
      .update({ status: "error", error: msg.slice(0, 500), updated_at: new Date().toISOString() })
      .eq("id", planId);
    return { ok: false, error: msg };
  }
}
