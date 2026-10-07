/**
 * Three generated stage photographs (Google Flow — no real dancer) run
 * through the real on-device pose tracker, with the annotations a coach
 * would draw. Every number printed on them is measured by landmarks.ts from
 * the detected pose, exactly as a paid report is. Used on the marketing
 * pages until — and beside — the full public sample report.
 */
import type { Pose } from "./landmarks";
import type { Annotation } from "./types";
import raw from "./demo-poses.json";

type RawDemo = Record<string, { src: string; w: number; h: number; pose: Pose }>;
const R = raw as unknown as RawDemo;

export interface DemoFrame {
  key: string;
  /** `${base}-${width}` — pair with .webp/.jpg */
  src: string;
  w: number;
  h: number;
  pose: Pose;
  title: string;
  skill: string;
  analysis: string;
  annotations: Annotation[];
}

export const DEMO_FRAMES: DemoFrame[] = [
  {
    key: "developpe",
    ...R.developpe,
    title: "Développé — the top of the line",
    skill: "Développé à la seconde, held on a straight supporting leg.",
    analysis: "The working leg reads 150° from vertical — well above the hip line, which is what the judges reward. The supporting knee is locked at 176°. The one note: the working knee is 171°, not quite straight, so the line stops two inches short of where the foot could be.",
    annotations: [
      { type: "extend", chain: "right_leg", status: "good", label: "150° — above the hip line" },
      { type: "angle", joint: "right_knee", status: "fix", ideal: 180, label: "finish the knee" },
      { type: "angle", joint: "left_knee", status: "good" },
    ],
  },
  {
    key: "leap",
    ...R.leap,
    title: "Grand jeté — the apex",
    skill: "Grand jeté, caught at the top of the arc.",
    analysis: "A 169° split in the air with the front leg straight at 176°. The back knee is 164°: it is the first thing a judge sees from the side, and straightening it is worth more than any extra inch of height. The ghost line shows where that back leg sits when the knee finishes.",
    annotations: [
      { type: "line", from: "left_ankle", to: "right_ankle", status: "note", label: "169° split" },
      { type: "angle", joint: "left_knee", status: "fix", ideal: 180, label: "back knee" },
      { type: "ghost", chain: "left_leg", targetElevation: 125, status: "fix", label: "back leg, knee straight" },
    ],
  },
];
