/**
 * RoutineX Spotlight — pose geometry.
 *
 * Shared by the browser (MediaPipe runs on-device, frames never leave the
 * phone until the parent approves) and the server (key-moment selection,
 * annotation rendering, PDF). Everything here is pure math on normalized
 * landmark coordinates, so the numbers printed on a report are MEASURED
 * from the dancer's own frame — never invented by a model.
 *
 * Landmarks follow the MediaPipe Pose 33-point topology:
 * https://ai.google.dev/edge/mediapipe/solutions/vision/pose_landmarker
 */

export type Landmark = [x: number, y: number, z: number, visibility: number];
export type Pose = Landmark[]; // 33 entries

export const LM = {
  nose: 0,
  left_eye_inner: 1, left_eye: 2, left_eye_outer: 3,
  right_eye_inner: 4, right_eye: 5, right_eye_outer: 6,
  left_ear: 7, right_ear: 8,
  mouth_left: 9, mouth_right: 10,
  left_shoulder: 11, right_shoulder: 12,
  left_elbow: 13, right_elbow: 14,
  left_wrist: 15, right_wrist: 16,
  left_pinky: 17, right_pinky: 18,
  left_index: 19, right_index: 20,
  left_thumb: 21, right_thumb: 22,
  left_hip: 23, right_hip: 24,
  left_knee: 25, right_knee: 26,
  left_ankle: 27, right_ankle: 28,
  left_heel: 29, right_heel: 30,
  left_foot_index: 31, right_foot_index: 32,
} as const;

export type LandmarkName = keyof typeof LM;

/** Bone list used for the faint skeleton overlay. */
export const BONES: Array<[LandmarkName, LandmarkName]> = [
  ["left_shoulder", "right_shoulder"],
  ["left_hip", "right_hip"],
  ["left_shoulder", "left_hip"],
  ["right_shoulder", "right_hip"],
  ["left_shoulder", "left_elbow"],
  ["left_elbow", "left_wrist"],
  ["right_shoulder", "right_elbow"],
  ["right_elbow", "right_wrist"],
  ["left_hip", "left_knee"],
  ["left_knee", "left_ankle"],
  ["left_ankle", "left_heel"],
  ["left_heel", "left_foot_index"],
  ["left_ankle", "left_foot_index"],
  ["right_hip", "right_knee"],
  ["right_knee", "right_ankle"],
  ["right_ankle", "right_heel"],
  ["right_heel", "right_foot_index"],
  ["right_ankle", "right_foot_index"],
];

export type Pt = { x: number; y: number };

export function pt(pose: Pose, name: LandmarkName): Pt {
  const l = pose[LM[name]];
  return { x: l[0], y: l[1] };
}

export function vis(pose: Pose, name: LandmarkName): number {
  return pose[LM[name]]?.[3] ?? 0;
}

export function mid(a: Pt, b: Pt): Pt {
  return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
}

export function dist(a: Pt, b: Pt): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

/** Interior angle at vertex B of triangle A-B-C, in degrees (0..180). */
export function angleAt(a: Pt, b: Pt, c: Pt): number {
  const abx = a.x - b.x, aby = a.y - b.y;
  const cbx = c.x - b.x, cby = c.y - b.y;
  const dot = abx * cbx + aby * cby;
  const m = Math.hypot(abx, aby) * Math.hypot(cbx, cby);
  if (m === 0) return 0;
  return (Math.acos(Math.max(-1, Math.min(1, dot / m))) * 180) / Math.PI;
}

/** Angle of vector a→b from "straight down" (0 = down, 90 = horizontal, 180 = up). */
export function elevationFromDown(a: Pt, b: Pt): number {
  const dx = b.x - a.x, dy = b.y - a.y; // y grows downward in image space
  const down = { x: 0, y: 1 };
  const m = Math.hypot(dx, dy);
  if (m === 0) return 0;
  return (Math.acos(Math.max(-1, Math.min(1, (dx * down.x + dy * down.y) / m))) * 180) / Math.PI;
}

/** Signed tilt of segment a→b from horizontal, degrees. Positive = b is lower than a. */
export function tiltFromHorizontal(a: Pt, b: Pt): number {
  return (Math.atan2(b.y - a.y, b.x - a.x) * 180) / Math.PI;
}

/** Signed lean of segment bottom→top from vertical, degrees. */
export function leanFromVertical(bottom: Pt, top: Pt): number {
  return (Math.atan2(top.x - bottom.x, bottom.y - top.y) * 180) / Math.PI;
}

export const JOINTS = {
  left_knee: ["left_hip", "left_knee", "left_ankle"],
  right_knee: ["right_hip", "right_knee", "right_ankle"],
  left_hip: ["left_shoulder", "left_hip", "left_knee"],
  right_hip: ["right_shoulder", "right_hip", "right_knee"],
  left_elbow: ["left_shoulder", "left_elbow", "left_wrist"],
  right_elbow: ["right_shoulder", "right_elbow", "right_wrist"],
  left_shoulder: ["left_hip", "left_shoulder", "left_elbow"],
  right_shoulder: ["right_hip", "right_shoulder", "right_elbow"],
  left_ankle: ["left_knee", "left_ankle", "left_foot_index"],
  right_ankle: ["right_knee", "right_ankle", "right_foot_index"],
} as const satisfies Record<string, readonly [LandmarkName, LandmarkName, LandmarkName]>;

export type JointName = keyof typeof JOINTS;

export const CHAINS = {
  left_leg: ["left_hip", "left_knee", "left_ankle"],
  right_leg: ["right_hip", "right_knee", "right_ankle"],
  left_arm: ["left_shoulder", "left_elbow", "left_wrist"],
  right_arm: ["right_shoulder", "right_elbow", "right_wrist"],
  spine: ["hip_center", "shoulder_center"],
} as const;

export type ChainName = keyof typeof CHAINS;

/** Per-frame measurements. All angles in degrees, all lengths normalized to body height. */
export interface FrameMetrics {
  jointAngles: Record<JointName, number>;
  /** 0 = leg hanging straight down, 90 = horizontal, >90 = above hip line. */
  legElevation: { left: number; right: number };
  /** Angle between the two legs measured at hip center (split = ~180). */
  splitAngle: number;
  /** Arm elevation from "hanging down": 90 = horizontal, 180 = straight up. */
  armElevation: { left: number; right: number };
  /** Signed lean of the torso from vertical. Positive = leaning toward image right. */
  torsoLean: number;
  /** Signed tilt of the shoulder line and hip line from horizontal. */
  shoulderTilt: number;
  hipTilt: number;
  /** Head offset from the shoulder centre, as a fraction of body height. */
  headOffset: number;
  /** Vertical position of the hip centre (0 top .. 1 bottom of frame). Lower = higher jump. */
  hipY: number;
  /** Estimated body height in normalized image units (shoulder→ankle). */
  bodyHeight: number;
  /** Which leg is carrying weight (lower ankle), or "both". */
  support: "left" | "right" | "both";
  /** Approx. facing: shoulder width over body height. Small = profile/turning. */
  facing: number;
  /** Mean visibility of the 12 major joints — tracking confidence. */
  confidence: number;
}

const MAJOR: LandmarkName[] = [
  "left_shoulder", "right_shoulder", "left_elbow", "right_elbow", "left_wrist", "right_wrist",
  "left_hip", "right_hip", "left_knee", "right_knee", "left_ankle", "right_ankle",
];

export function computeMetrics(pose: Pose): FrameMetrics {
  const P = (n: LandmarkName) => pt(pose, n);
  const shoulderC = mid(P("left_shoulder"), P("right_shoulder"));
  const hipC = mid(P("left_hip"), P("right_hip"));
  const lowAnkle = Math.max(P("left_ankle").y, P("right_ankle").y);
  const bodyHeight = Math.max(0.05, Math.abs(lowAnkle - shoulderC.y) + dist(shoulderC, mid(P("left_ear"), P("right_ear"))));

  const jointAngles = Object.fromEntries(
    (Object.keys(JOINTS) as JointName[]).map((j) => {
      const [a, b, c] = JOINTS[j];
      return [j, round1(angleAt(P(a), P(b), P(c)))];
    })
  ) as Record<JointName, number>;

  const legElevation = {
    left: round1(elevationFromDown(P("left_hip"), P("left_ankle"))),
    right: round1(elevationFromDown(P("right_hip"), P("right_ankle"))),
  };
  const armElevation = {
    left: round1(elevationFromDown(P("left_shoulder"), P("left_wrist"))),
    right: round1(elevationFromDown(P("right_shoulder"), P("right_wrist"))),
  };

  const la = P("left_ankle"), ra = P("right_ankle");
  const ankleGap = Math.abs(la.y - ra.y) / bodyHeight;
  const support: FrameMetrics["support"] = ankleGap < 0.08 ? "both" : la.y > ra.y ? "left" : "right";

  return {
    jointAngles,
    legElevation,
    splitAngle: round1(angleAt(la, hipC, ra)),
    armElevation,
    torsoLean: round1(leanFromVertical(hipC, shoulderC)),
    shoulderTilt: round1(tiltFromHorizontal(P("left_shoulder"), P("right_shoulder"))),
    hipTilt: round1(tiltFromHorizontal(P("left_hip"), P("right_hip"))),
    headOffset: round3((P("nose").x - shoulderC.x) / bodyHeight),
    hipY: round3(hipC.y),
    bodyHeight: round3(bodyHeight),
    support,
    facing: round3(dist(P("left_shoulder"), P("right_shoulder")) / bodyHeight),
    confidence: round3(MAJOR.reduce((s, n) => s + vis(pose, n), 0) / MAJOR.length),
  };
}

export function round1(n: number) { return Math.round(n * 10) / 10; }
export function round3(n: number) { return Math.round(n * 1000) / 1000; }

/** Axis-aligned bounding box of a pose in normalized coords, padded. */
export function poseBox(pose: Pose, pad = 0.12): { x: number; y: number; w: number; h: number } {
  let minX = 1, minY = 1, maxX = 0, maxY = 0;
  for (const [x, y, , v] of pose) {
    if (v < 0.3) continue;
    if (x < minX) minX = x; if (y < minY) minY = y;
    if (x > maxX) maxX = x; if (y > maxY) maxY = y;
  }
  if (maxX <= minX || maxY <= minY) return { x: 0, y: 0, w: 0, h: 0 };
  const pw = (maxX - minX) * pad, ph = (maxY - minY) * pad;
  return {
    x: Math.max(0, minX - pw), y: Math.max(0, minY - ph),
    w: Math.min(1, maxX + pw) - Math.max(0, minX - pw),
    h: Math.min(1, maxY + ph) - Math.max(0, minY - ph),
  };
}

export function poseCenter(pose: Pose): Pt {
  return mid(pt(pose, "left_hip"), pt(pose, "right_hip"));
}

export function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}
