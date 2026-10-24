import type { JudgesCardLine } from "./types";

export interface PracticeScale {
  /** "technique 25 · execution 15 · performance 30 · …" in card order. */
  split: string;
  /** Sum of the weights stored on this report. */
  total: number;
  /** Display form of `total`, e.g. "100" or "64.5". */
  outOf: string;
  /** Footnote listing this report's weights. */
  note: string;
}

function readWeight(value: unknown): number | null {
  const n = typeof value === "number" ? value : typeof value === "string" && value.trim() !== "" ? Number(value) : NaN;
  if (!Number.isFinite(n) || n <= 0) return null;
  return n;
}

function readLabel(line: JudgesCardLine): string | null {
  const name = typeof line?.name === "string" ? line.name.trim() : "";
  const category = typeof line?.category === "string" ? line.category.trim() : "";
  const label = (name || category).replace(/\s+/g, " ");
  return label ? label.toLowerCase() : null;
}

/** "100" or "64.5" — integer weights stay integer. */
export function formatPoints(n: number): string {
  const rounded = Math.round(n * 10) / 10;
  return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1);
}

/**
 * Weights actually stored on this report's judge card.
 * Returns null unless every line has a positive weight and a name (or
 * category). A partial card must not be described with a made-up split.
 */
export function practiceScale(lines: JudgesCardLine[] | null | undefined): PracticeScale | null {
  if (!lines?.length) return null;
  const parts: string[] = [];
  let total = 0;
  for (const line of lines) {
    const weight = readWeight(line?.weight);
    const label = readLabel(line);
    if (weight == null || !label) return null;
    parts.push(`${label} ${formatPoints(weight)}`);
    total += weight;
  }
  if (!(total > 0)) return null;
  const split = parts.join(" · ");
  return {
    split,
    total,
    outOf: formatPoints(total),
    note: `The split used for this estimate is RoutineX's practice scale (${split}), not an official competition sheet. Your circuit's card may differ; the notes are the part to use.`,
  };
}
