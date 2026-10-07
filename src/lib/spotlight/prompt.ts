/**
 * The Spotlight coaching prompt and the strict tool schema the model must
 * fill. The model sees the key frames (images) plus a table of MEASURED
 * angles for each one. It decides what to say and what to draw; it never
 * invents a number — every degree printed on the report comes from
 * landmarks.ts.
 */
import { formatTime, type FrameMetrics } from "./landmarks";
import type { KeyMoment, SpotlightFrame } from "./types";

export const SPOTLIGHT_SYSTEM = `You are the senior technique coach behind RoutineX Spotlight — a private, one-dancer video breakdown that families pay for instead of a $75–150 private lesson. You have judged and coached competitive dance and cheer for twenty years. You are warm, specific, and completely honest. Parents forward this report to the dancer's teacher, so every claim must be defensible from the frames.

HOW THIS WORKS
- You receive 12–16 freeze-frames from one routine, chosen automatically at the moments that matter (jump apex, fullest extension, landing, balance, turn, opening and final shapes), each with the timestamp and a table of angles MEASURED from a pose tracker on the dancer's own body.
- Measurements are 2-D projections from the camera's angle. Use them as evidence, note when the camera angle limits a reading, and never restate a number differently from the table.
- Only one dancer is being coached. Other dancers in the frame are blurred; ignore them.
- Write to the parent about the dancer by first name. Never use "your kid", "students", "grades" or "AI-judged". Say "the judges" and "a panel" when you mean competition scoring.

WHAT MAKES THIS WORTH $15 (AND WHAT A COACH WOULD CHARGE $150 FOR)
- Specificity. "Her supporting knee softens to 161° at the top of the développé (frame 6) — hold it straight and the line reads two inches longer from the judges' table" beats "work on extensions".
- Cause before symptom. If the arms drop on the landing, say what in the preparation caused it.
- Praise is evidence too. Tell her exactly what she is doing right and why it scores.
- Every drill is doable in a living room or studio hallway with no equipment, with sets/reps/time and a one-sentence cue she can say to herself.
- The four-week plan builds in order: foundation → strength → integration → performance.

DRAWING ON FRAMES
For each moment choose 1–3 annotations that a coach would draw on a printout. Use the exact landmark/joint names provided. Favor one strong idea per frame over clutter. Mark what is working with status "good", what to change with status "fix", reference geometry with "note". Use "angle" with an "ideal" value when a straighter line is the point. Use "extend" for a limb that should read as one straight line. Use "plumb" for posture/lean, "level" for shoulders/hips. Use "callout" for feet, hands, head, focus. Use "arrow" sparingly for lift/direction.

SCORING THE SEVEN CATEGORIES (1–10, honest, decimals allowed)
lines = extension & line quality · alignment = posture, square hips/shoulders, core · jumps = preparation, height, shape in the air, landing · turns = spot, relevé/balance, finish · arms = port de bras, carriage, hands · feet = pointe, articulation, turnout · presence = focus, projection, musical commitment as far as frames show. A 9+ is rare and should only appear when the frames prove it. A trained competitive dancer typically lands 5–8.

TONE
Direct and encouraging — a coach who wants her to win. No filler, no hedging paragraphs, no "as an AI". Use dance vocabulary naturally and define it in the glossary.`;

export const SPOTLIGHT_TOOL = {
  name: "deliver_spotlight_report",
  description: "Deliver the complete Spotlight coaching report for this dancer.",
  input_schema: {
    type: "object",
    additionalProperties: false,
    required: ["headline", "opening", "verdict", "categories", "strengths", "priorities", "moments", "drills", "plan", "closing", "glossary"],
    properties: {
      headline: { type: "string", description: "One sentence, 8–14 words, the single biggest truth about this dancer right now. No exclamation marks." },
      opening: { type: "string", description: "2–3 short paragraphs to the parent. What you watched, the dancer's overall level, what this report will change." },
      verdict: {
        type: "object", additionalProperties: false, required: ["current", "potential", "timeline"],
        properties: {
          current: { type: "string", description: "Where she stands today in competition terms, 1–2 sentences." },
          potential: { type: "string", description: "What she can realistically look like with the fixes in this report, 1–2 sentences." },
          timeline: { type: "string", description: "Honest timeframe for the priority fixes, e.g. 'Four focused weeks before the next regional.'" },
        },
      },
      categories: {
        type: "array", minItems: 7, maxItems: 7,
        items: {
          type: "object", additionalProperties: false, required: ["key", "name", "score", "summary"],
          properties: {
            key: { type: "string", enum: ["lines", "alignment", "jumps", "turns", "arms", "feet", "presence"] },
            name: { type: "string" },
            score: { type: "number", minimum: 1, maximum: 10 },
            summary: { type: "string", description: "One or two sentences with a frame reference where possible." },
          },
        },
      },
      strengths: {
        type: "array", minItems: 3, maxItems: 5,
        items: {
          type: "object", additionalProperties: false, required: ["title", "detail"],
          properties: { title: { type: "string" }, detail: { type: "string" }, frame: { type: "integer", description: "Frame index that proves it." } },
        },
      },
      priorities: {
        type: "array", minItems: 3, maxItems: 5,
        items: {
          type: "object", additionalProperties: false, required: ["rank", "title", "why", "cue"],
          properties: {
            rank: { type: "integer" },
            title: { type: "string", description: "The fix, named like a coach would: 'Straighten the supporting knee at the top of the extension'." },
            why: { type: "string", description: "What it costs with the judges and what causes it, 2–3 sentences, cite frames." },
            cue: { type: "string", description: "A one-line cue she says to herself." },
            frame: { type: "integer" },
          },
        },
      },
      moments: {
        type: "array", minItems: 8, maxItems: 16,
        description: "One entry per key frame you want in the report, in time order. Cover every frame that shows something worth coaching.",
        items: {
          type: "object", additionalProperties: false, required: ["frame", "title", "skill", "analysis", "working", "fix", "annotations"],
          properties: {
            frame: { type: "integer", description: "Frame index from the list you were given." },
            title: { type: "string", description: "3–6 words, e.g. 'Développé — the top of the line'." },
            skill: { type: "string", description: "What she is doing at this instant, one line." },
            analysis: { type: "string", description: "2–4 sentences. What a pro sees, with the measured numbers where they matter." },
            working: { type: "array", items: { type: "string" }, maxItems: 3 },
            fix: { type: "array", items: { type: "string" }, maxItems: 3 },
            annotations: {
              type: "array", minItems: 1, maxItems: 3,
              items: {
                type: "object",
                required: ["type", "status"],
                properties: {
                  type: { type: "string", enum: ["angle", "line", "plumb", "level", "extend", "callout", "arrow"] },
                  status: { type: "string", enum: ["good", "fix", "note"] },
                  joint: { type: "string", enum: ["left_knee", "right_knee", "left_hip", "right_hip", "left_elbow", "right_elbow", "left_shoulder", "right_shoulder", "left_ankle", "right_ankle"] },
                  ideal: { type: "number" },
                  from: { type: "string" }, to: { type: "string" },
                  at: { type: "string" },
                  pair: { type: "string", enum: ["shoulders", "hips"] },
                  chain: { type: "string", enum: ["left_leg", "right_leg", "left_arm", "right_arm", "spine"] },
                  dir: { type: "string", enum: ["up", "down", "left", "right"] },
                  label: { type: "string", description: "Short, 2–6 words. Omit to let the measured value stand alone." },
                  text: { type: "string", description: "For callout/arrow: 2–6 words." },
                },
              },
            },
          },
        },
      },
      drills: {
        type: "array", minItems: 5, maxItems: 8,
        items: {
          type: "object", additionalProperties: false, required: ["name", "targets", "how", "dose", "cue"],
          properties: {
            name: { type: "string" },
            targets: { type: "string", description: "Which priority this fixes." },
            how: { type: "string", description: "Step-by-step, 2–4 sentences, no equipment." },
            dose: { type: "string", description: "e.g. '3 × 8 each side, 4 days a week'." },
            cue: { type: "string" },
          },
        },
      },
      plan: {
        type: "array", minItems: 4, maxItems: 4,
        items: {
          type: "object", additionalProperties: false, required: ["week", "focus", "plan"],
          properties: { week: { type: "integer" }, focus: { type: "string" }, plan: { type: "array", items: { type: "string" }, minItems: 3, maxItems: 5 } },
        },
      },
      closing: { type: "string", description: "A short closing note to the dancer herself, 3–5 sentences, signed 'Coach'." },
      glossary: {
        type: "array", minItems: 4, maxItems: 10,
        items: { type: "object", additionalProperties: false, required: ["term", "meaning"], properties: { term: { type: "string" }, meaning: { type: "string" } } },
      },
    },
  },
} as const;

export function metricsTable(m: FrameMetrics): string {
  const j = m.jointAngles;
  return [
    `knees L ${j.left_knee}° R ${j.right_knee}°`,
    `hips L ${j.left_hip}° R ${j.right_hip}°`,
    `elbows L ${j.left_elbow}° R ${j.right_elbow}°`,
    `leg lift from vertical L ${m.legElevation.left}° R ${m.legElevation.right}°`,
    `arm lift from down L ${m.armElevation.left}° R ${m.armElevation.right}°`,
    `split ${m.splitAngle}°`,
    `torso lean ${m.torsoLean}° · shoulders ${m.shoulderTilt}° · hips ${m.hipTilt}°`,
    `support: ${m.support} · hip height ${(1 - m.hipY).toFixed(2)} (higher = more air)`,
    `tracking confidence ${Math.round(m.confidence * 100)}%`,
  ].join(" | ");
}

export function buildUserText(p: {
  dancerName: string; style: string; division?: string | null; level?: string | null; routine?: string | null;
  focusNote?: string | null; duration?: number | null; frames: SpotlightFrame[]; keyMoments: KeyMoment[];
}): string {
  const lines: string[] = [];
  lines.push(`DANCER: ${p.dancerName} · STYLE: ${p.style}${p.division ? ` · DIVISION: ${p.division}` : ""}${p.level ? ` · LEVEL: ${p.level}` : ""}${p.routine ? ` · ROUTINE: "${p.routine}"` : ""}`);
  if (p.duration) lines.push(`VIDEO LENGTH: ${formatTime(p.duration)} · ${p.frames.length} frames sampled, ${p.frames.filter((f) => f.pose).length} with the dancer tracked.`);
  if (p.focusNote) lines.push(`WHAT THE FAMILY ASKED US TO LOOK AT: "${p.focusNote}"`);
  lines.push("");
  lines.push("KEY FRAMES (images follow in this order). Refer to them by frame index.");
  for (const k of p.keyMoments) {
    const f = p.frames[k.frame];
    lines.push(`frame ${k.frame} · ${formatTime(f.t)} · ${k.reason}${f.metrics ? `\n   measured: ${metricsTable(f.metrics)}` : ""}`);
  }
  lines.push("");
  lines.push("Deliver the full report with the deliver_spotlight_report tool. Use the dancer's first name. Cite frame indexes. Every number you quote must come from the measured table above.");
  return lines.join("\n");
}
