/**
 * Generated stage figures (no real dancer), rendered as faceless silhouettes
 * and run through the real on-device pose tracker. Every number printed on
 * them is measured by landmarks.ts from the detected pose, exactly as a paid
 * report is. Used on the marketing pages until — and beside — the full
 * public sample report.
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
  {
    key: "tilt",
    ...R.tilt,
    title: "Tilt — past vertical",
    skill: "Tilt kick on a straight supporting leg.",
    analysis: "The kicking leg reads 175° from vertical with both knees locked at 176° — this is a line the judges score. The torso tips 64° to make room for it, which is the trade a tilt asks for; the arm on the lifted side stays long through the fingertips. Nothing to fix here. This is the frame to put on the fridge.",
    annotations: [
      { type: "extend", chain: "left_leg", status: "good", label: "175° — past vertical" },
      { type: "angle", joint: "right_knee", status: "good", label: "supporting knee" },
      { type: "extend", chain: "left_arm", status: "good", label: "long through the fingers" },
    ],
  },
  {
    key: "toetouch",
    ...R.toetouch,
    title: "Toe touch — the apex",
    skill: "Toe touch, arms in a high V, side view.",
    analysis: "The lead leg is at 79° from vertical and the knees are 166° and 175° — the judges will see the softer knee first. The chest stays up (13° of lean, which is the goal: hips roll under, chest doesn't drop) and the arms hold a clean V. The corrected line shows the lead leg with the knee finished and two more degrees of lift.",
    annotations: [
      { type: "angle", joint: "left_knee", status: "fix", ideal: 180, label: "finish the knee" },
      { type: "ghost", chain: "right_leg", targetElevation: 86, status: "fix", label: "lead leg, knee locked" },
      { type: "plumb", at: "hip_center", status: "good", label: "chest stays up" },
    ],
  },
  {
    key: "landing",
    ...R.landing,
    title: "The landing",
    skill: "Landing from a jump in a deep plié, arms in second.",
    analysis: "This is the frame judges watch hardest and parents never film. The knees are 117° and 90° — the right side is taking more of the landing, which is why one hip reads lower than the other. Shoulders are level (within 2°) and the arms are held, which saves the picture. The fix is in the preparation, not the landing: equal push off both feet.",
    annotations: [
      { type: "angle", joint: "right_knee", status: "fix", label: "taking the landing" },
      { type: "angle", joint: "left_knee", status: "note" },
      { type: "level", pair: "shoulders", status: "good", label: "shoulders level" },
    ],
  },
];
