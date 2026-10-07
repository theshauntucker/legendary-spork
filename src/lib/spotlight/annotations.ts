/**
 * Turns a moment's annotation specs + the frame's landmarks into drawing
 * primitives in normalized (0..1) coordinates. The web view renders them as
 * SVG; the PDF renders the same primitives with react-pdf's Svg. One source
 * of truth, so the report on the phone and the PDF on the fridge match.
 */
import {
  CHAINS, JOINTS, LM, angleAt, elevationFromDown, leanFromVertical, mid, pt, tiltFromHorizontal,
  type LandmarkName, type Pose, type Pt, BONES,
} from "./landmarks";
import type { Annotation, AnnotationStatus } from "./types";

export type Primitive =
  | { kind: "line"; a: Pt; b: Pt; status: AnnotationStatus; dashed?: boolean; width?: number }
  | { kind: "arc"; c: Pt; r: number; start: number; end: number; status: AnnotationStatus }
  | { kind: "dot"; p: Pt; status: AnnotationStatus; r?: number }
  | { kind: "label"; p: Pt; text: string; status: AnnotationStatus; anchor?: "start" | "middle" | "end"; dy?: number }
  | { kind: "arrow"; a: Pt; b: Pt; status: AnnotationStatus }
  /** Translucent corrected limb. */
  | { kind: "ghost"; pts: Pt[]; status: AnnotationStatus };

export const STATUS_COLOR: Record<AnnotationStatus, string> = {
  good: "#FBBF24", // gold — what is working
  fix: "#F472B6",  // pink — what to change
  note: "#E4E4E7", // soft white — reference lines
};

const resolve = (pose: Pose, name: LandmarkName | "hip_center" | "shoulder_center"): Pt => {
  if (name === "hip_center") return mid(pt(pose, "left_hip"), pt(pose, "right_hip"));
  if (name === "shoulder_center") return mid(pt(pose, "left_shoulder"), pt(pose, "right_shoulder"));
  return pt(pose, name);
};

const nice = (n: LandmarkName | string) => n.replace(/_/g, " ");

/** Faint skeleton drawn under every annotation so the parent sees the tracking is real. */
export function skeletonPrimitives(pose: Pose, aspect: number): Primitive[] {
  const out: Primitive[] = [];
  for (const [a, b] of BONES) {
    if (pose[LM[a]][3] < 0.4 || pose[LM[b]][3] < 0.4) continue;
    out.push({ kind: "line", a: pt(pose, a), b: pt(pose, b), status: "note", width: 1.2 });
  }
  for (const name of ["left_shoulder", "right_shoulder", "left_elbow", "right_elbow", "left_wrist", "right_wrist", "left_hip", "right_hip", "left_knee", "right_knee", "left_ankle", "right_ankle"] as LandmarkName[]) {
    if (pose[LM[name]][3] < 0.4) continue;
    out.push({ kind: "dot", p: pt(pose, name), status: "note", r: 2.2 / Math.sqrt(aspect) });
  }
  return out;
}

/**
 * @param aspect width/height of the frame — used to keep arcs round and
 *   offsets sane in normalized space.
 */
export function annotationPrimitives(pose: Pose, a: Annotation, aspect: number): Primitive[] {
  const out: Primitive[] = [];
  const off = 0.035; // label offset in normalized units
  const ax = (dx: number) => dx / aspect; // convert a vertical-ish distance to horizontal units

  switch (a.type) {
    case "angle": {
      const [n1, n2, n3] = JOINTS[a.joint];
      const A = pt(pose, n1), B = pt(pose, n2), C = pt(pose, n3);
      const deg = Math.round(angleAt(A, B, C));
      out.push({ kind: "line", a: B, b: A, status: a.status, width: 2.4 });
      out.push({ kind: "line", a: B, b: C, status: a.status, width: 2.4 });
      // arc between the two rays
      const t1 = Math.atan2((A.y - B.y), (A.x - B.x) * aspect);
      const t2 = Math.atan2((C.y - B.y), (C.x - B.x) * aspect);
      out.push({ kind: "arc", c: B, r: 0.055, start: t1, end: t2, status: a.status });
      out.push({ kind: "dot", p: B, status: a.status, r: 3.2 });
      const text = `${deg}°${a.ideal ? ` → ${a.ideal}°` : ""}${a.label ? `  ${a.label}` : ""}`;
      // place label away from the limbs: opposite the bisector
      const bis = { x: Math.cos((t1 + t2) / 2), y: Math.sin((t1 + t2) / 2) };
      out.push({ kind: "label", p: { x: B.x - ax(bis.x * 0.09), y: B.y - bis.y * 0.09 }, text, status: a.status, anchor: "middle" });
      break;
    }
    case "line": {
      const A = pt(pose, a.from), B = pt(pose, a.to);
      out.push({ kind: "line", a: A, b: B, status: a.status, width: 2.4 });
      out.push({ kind: "dot", p: A, status: a.status, r: 3 });
      out.push({ kind: "dot", p: B, status: a.status, r: 3 });
      const m = mid(A, B);
      out.push({ kind: "label", p: { x: m.x + ax(off), y: m.y }, text: a.label ?? `${nice(a.from)} → ${nice(a.to)}`, status: a.status });
      break;
    }
    case "plumb": {
      const P = resolve(pose, a.at);
      const shoulderC = resolve(pose, "shoulder_center");
      const hipC = resolve(pose, "hip_center");
      const lean = Math.round(leanFromVertical(hipC, shoulderC));
      const top = Math.max(0.02, Math.min(P.y, shoulderC.y) - 0.12);
      const bottom = Math.min(0.98, Math.max(pt(pose, "left_ankle").y, pt(pose, "right_ankle").y) + 0.03);
      out.push({ kind: "line", a: { x: P.x, y: top }, b: { x: P.x, y: bottom }, status: "note", dashed: true, width: 1.6 });
      out.push({ kind: "line", a: hipC, b: shoulderC, status: a.status, width: 2.4 });
      out.push({ kind: "label", p: { x: P.x + ax(off), y: top + 0.03 }, text: a.label ?? `${Math.abs(lean)}° ${lean === 0 ? "plumb" : lean > 0 ? "lean right" : "lean left"}`, status: a.status });
      break;
    }
    case "level": {
      const [n1, n2]: [LandmarkName, LandmarkName] = a.pair === "shoulders" ? ["left_shoulder", "right_shoulder"] : ["left_hip", "right_hip"];
      const A = pt(pose, n1), B = pt(pose, n2);
      const tilt = Math.round(tiltFromHorizontal(A, B));
      const span = Math.abs(B.x - A.x) * 0.5 + 0.05;
      const m = mid(A, B);
      out.push({ kind: "line", a: { x: m.x - span, y: m.y }, b: { x: m.x + span, y: m.y }, status: "note", dashed: true, width: 1.6 });
      out.push({ kind: "line", a: A, b: B, status: a.status, width: 2.4 });
      out.push({ kind: "dot", p: A, status: a.status, r: 3 });
      out.push({ kind: "dot", p: B, status: a.status, r: 3 });
      out.push({ kind: "label", p: { x: m.x + span + ax(0.01), y: m.y }, text: a.label ?? `${a.pair} ${Math.abs(tilt)}° ${tilt === 0 ? "level" : "off level"}`, status: a.status });
      break;
    }
    case "extend": {
      const names = CHAINS[a.chain] as readonly (LandmarkName | "hip_center" | "shoulder_center")[];
      const pts = names.map((n) => resolve(pose, n));
      for (let i = 0; i < pts.length - 1; i++) out.push({ kind: "line", a: pts[i], b: pts[i + 1], status: a.status, width: 2.6 });
      pts.forEach((p) => out.push({ kind: "dot", p, status: a.status, r: 3 }));
      if (pts.length === 3) {
        // the "ideal" straight line from the root through where the end would be if fully extended
        const root = pts[0], end = pts[2];
        const len = Math.hypot((pts[1].x - root.x) * aspect, pts[1].y - root.y) + Math.hypot((end.x - pts[1].x) * aspect, end.y - pts[1].y);
        const dirx = (end.x - root.x) * aspect, diry = end.y - root.y;
        const m = Math.hypot(dirx, diry) || 1;
        const ideal = { x: root.x + (dirx / m) * len / aspect, y: root.y + (diry / m) * len };
        out.push({ kind: "line", a: root, b: ideal, status: "note", dashed: true, width: 1.6 });
        const bend = Math.round(180 - angleAt(root, pts[1], end));
        const elev = Math.round(elevationFromDown(root, end));
        const label = a.label ?? (a.chain.includes("leg") ? `${elev}° lift · ${bend}° knee bend` : `${bend}° elbow bend`);
        out.push({ kind: "label", p: { x: end.x + ax(off), y: end.y - 0.02 }, text: label, status: a.status });
      }
      break;
    }
    case "callout": {
      const P = pt(pose, a.at);
      out.push({ kind: "dot", p: P, status: a.status, r: 4 });
      out.push({ kind: "line", a: P, b: { x: P.x + ax(0.07), y: P.y - 0.07 }, status: a.status, width: 1.4 });
      out.push({ kind: "label", p: { x: P.x + ax(0.075), y: P.y - 0.075 }, text: a.text, status: a.status });
      break;
    }
    case "ghost": {
      const names = CHAINS[a.chain] as readonly (LandmarkName | "hip_center" | "shoulder_center")[];
      const pts = names.map((n) => resolve(pose, n));
      const root = pts[0], end = pts[pts.length - 1];
      // true length of the chain in pixel-ish space (aspect-corrected)
      let len = 0;
      for (let i = 0; i < pts.length - 1; i++) len += Math.hypot((pts[i + 1].x - pts[i].x) * aspect, pts[i + 1].y - pts[i].y);
      const side = (end.x - root.x) * aspect >= 0 ? 1 : -1; // keep the limb on the side it already sits
      const theta = (Math.max(0, Math.min(180, a.targetElevation)) * Math.PI) / 180; // 0 = straight down
      const gEnd = { x: root.x + (side * Math.sin(theta) * len) / aspect, y: root.y + Math.cos(theta) * len };
      const gMid = { x: root.x + (gEnd.x - root.x) * 0.5, y: root.y + (gEnd.y - root.y) * 0.5 };
      out.push({ kind: "ghost", pts: [root, gMid, gEnd], status: a.status });
      // the current limb, for contrast
      for (let i = 0; i < pts.length - 1; i++) out.push({ kind: "line", a: pts[i], b: pts[i + 1], status: "fix", width: 2.2 });
      out.push({ kind: "arrow", a: end, b: { x: end.x + (gEnd.x - end.x) * 0.85, y: end.y + (gEnd.y - end.y) * 0.85 }, status: a.status });
      const cur = Math.round(elevationFromDown(root, end));
      out.push({ kind: "label", p: { x: gEnd.x + ax(off), y: gEnd.y - 0.02 }, text: a.label ?? `${cur}° now → ${Math.round(a.targetElevation)}° here`, status: a.status });
      break;
    }
    case "arrow": {
      const P = pt(pose, a.at);
      const d = { up: { x: 0, y: -0.1 }, down: { x: 0, y: 0.1 }, left: { x: -0.1, y: 0 }, right: { x: 0.1, y: 0 } }[a.dir];
      const end = { x: P.x + ax(d.x), y: P.y + d.y };
      out.push({ kind: "arrow", a: P, b: end, status: a.status });
      out.push({ kind: "label", p: { x: end.x + ax(0.015), y: end.y }, text: a.text, status: a.status });
      break;
    }
  }
  return out;
}

export function momentPrimitives(pose: Pose, annotations: Annotation[], aspect: number, withSkeleton = true): Primitive[] {
  const out: Primitive[] = withSkeleton ? skeletonPrimitives(pose, aspect) : [];
  for (const a of annotations) {
    try { out.push(...annotationPrimitives(pose, a, aspect)); } catch { /* skip malformed spec */ }
  }
  return out;
}

/** SVG path for an arc in pixel space (used by both renderers). */
export function arcPath(cx: number, cy: number, r: number, start: number, end: number): string {
  let d = end - start;
  while (d > Math.PI) d -= 2 * Math.PI;
  while (d < -Math.PI) d += 2 * Math.PI;
  const e = start + d;
  const x1 = cx + r * Math.cos(start), y1 = cy + r * Math.sin(start);
  const x2 = cx + r * Math.cos(e), y2 = cy + r * Math.sin(e);
  const sweep = d > 0 ? 1 : 0;
  return `M ${x1.toFixed(1)} ${y1.toFixed(1)} A ${r.toFixed(1)} ${r.toFixed(1)} 0 0 ${sweep} ${x2.toFixed(1)} ${y2.toFixed(1)}`;
}
