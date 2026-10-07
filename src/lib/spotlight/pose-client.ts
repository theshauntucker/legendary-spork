"use client";
/**
 * On-device pose tracking for Spotlight.
 *
 * Runs MediaPipe Pose Landmarker in the browser on the frames we already
 * extract client-side. The video itself never leaves the device; only the
 * JPEG frames the family approves are uploaded — with every OTHER dancer in
 * a group video blurred before upload.
 */
import type { Pose } from "./landmarks";
import { computeMetrics, poseBox, poseCenter, type FrameMetrics } from "./landmarks";

const WASM_BASE = "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@1.1.0/wasm";
const MODEL_URL =
  "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_full/float16/latest/pose_landmarker_full.task";

type Landmarker = import("@mediapipe/tasks-vision").PoseLandmarker;
let landmarkerPromise: Promise<Landmarker> | null = null;

export async function loadPoseLandmarker(): Promise<Landmarker> {
  if (!landmarkerPromise) {
    landmarkerPromise = (async () => {
      const { FilesetResolver, PoseLandmarker } = await import("@mediapipe/tasks-vision");
      const fileset = await FilesetResolver.forVisionTasks(WASM_BASE);
      const make = (delegate: "GPU" | "CPU") =>
        PoseLandmarker.createFromOptions(fileset, {
          baseOptions: { modelAssetPath: MODEL_URL, delegate },
          runningMode: "IMAGE",
          numPoses: 6,
          minPoseDetectionConfidence: 0.5,
          minPosePresenceConfidence: 0.5,
          minTrackingConfidence: 0.5,
        });
      try { return await make("GPU"); } catch { return await make("CPU"); }
    })();
  }
  return landmarkerPromise;
}

export interface DetectedFrame {
  index: number;
  timestamp: number;
  /** All poses found in this frame, normalized. */
  poses: Pose[];
}

export async function detectPoses(landmarker: Landmarker, image: HTMLImageElement | HTMLCanvasElement): Promise<Pose[]> {
  const result = landmarker.detect(image);
  return result.landmarks.map((lms) => lms.map((l) => [l.x, l.y, l.z ?? 0, l.visibility ?? 1] as [number, number, number, number]));
}

/**
 * Follow one dancer through the frames. `seed` is the pose the parent tapped
 * on the reference frame. Returns, per frame, the index of the matching pose
 * or -1 when the dancer was not found. Matching = nearest hip centre to the
 * last known position, with a tolerance that scales with body height; a
 * short "memory" lets us re-acquire after a frame or two of occlusion.
 */
export function trackDancer(frames: DetectedFrame[], refFrame: number, seed: number): number[] {
  const out = new Array(frames.length).fill(-1);
  const ref = frames[refFrame].poses[seed];
  if (!ref) return out;
  let last = poseCenter(ref);
  let lastBox = poseBox(ref, 0);
  let lastSeen = refFrame;
  out[refFrame] = seed;

  const walk = (order: number[]) => {
    let cur = last, box = lastBox, seen = lastSeen;
    for (const i of order) {
      const f = frames[i];
      if (f.poses.length === 0) continue;
      const gap = Math.abs(i - seen);
      const tol = Math.max(0.12, box.h * 0.9) * Math.min(3, 1 + gap * 0.5);
      let best = -1, bestD = Infinity;
      f.poses.forEach((p, k) => {
        const c = poseCenter(p);
        const d = Math.hypot(c.x - cur.x, c.y - cur.y);
        // single-person frames: accept generously, it's her
        const cap = f.poses.length === 1 ? tol * 2 : tol;
        if (d < cap && d < bestD) { bestD = d; best = k; }
      });
      if (best >= 0) { out[i] = best; cur = poseCenter(f.poses[best]); box = poseBox(f.poses[best], 0); seen = i; }
    }
  };
  // forward then backward from the reference frame
  walk(frames.map((_, i) => i).filter((i) => i > refFrame));
  last = poseCenter(ref); lastBox = poseBox(ref, 0); lastSeen = refFrame;
  walk(frames.map((_, i) => i).filter((i) => i < refFrame).reverse());
  return out;
}

/**
 * Privacy pass: blur every pose that is NOT the tracked dancer, in place on
 * the canvas, then return a JPEG blob. Padding keeps hair/costume edges in.
 */
export async function blurOthersAndEncode(
  source: HTMLImageElement | HTMLCanvasElement,
  poses: Pose[],
  keep: number,
  quality = 0.86
): Promise<{ blob: Blob; w: number; h: number }> {
  const w = source.width, h = source.height;
  const canvas = document.createElement("canvas");
  canvas.width = w; canvas.height = h;
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(source, 0, 0, w, h);
  poses.forEach((p, k) => {
    if (k === keep) return;
    const b = poseBox(p, 0.18);
    if (b.w <= 0 || b.h <= 0) return;
    const x = Math.floor(b.x * w), y = Math.floor(b.y * h), bw = Math.ceil(b.w * w), bh = Math.ceil(b.h * h);
    // two-pass: heavy blur, then a soft dark veil so the figure reads as "present but private"
    ctx.save();
    ctx.beginPath();
    const r = Math.min(bw, bh) * 0.25;
    roundRect(ctx, x, y, bw, bh, r);
    ctx.clip();
    ctx.filter = "blur(18px)";
    ctx.drawImage(canvas, x, y, bw, bh, x, y, bw, bh);
    ctx.filter = "blur(18px)";
    ctx.drawImage(canvas, x, y, bw, bh, x, y, bw, bh);
    ctx.filter = "none";
    ctx.fillStyle = "rgba(9,9,11,0.35)";
    ctx.fillRect(x, y, bw, bh);
    ctx.restore();
  });
  const blob: Blob = await new Promise((res, rej) => canvas.toBlob((b) => (b ? res(b) : rej(new Error("encode failed"))), "image/jpeg", quality));
  return { blob, w, h };
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

export function metricsFor(pose: Pose | null): FrameMetrics | null {
  return pose ? computeMetrics(pose) : null;
}

/** How many frames to sample: dense for short clips, capped at 80 for a full routine. */
export function spotlightFrameCount(duration: number): number {
  if (duration <= 15) return Math.max(24, Math.round(duration * 4));
  if (duration <= 45) return Math.round(Math.min(72, duration * 2));
  return 80;
}

export interface DenseFrame {
  index: number;
  timestamp: number;
  blob: Blob;
  w: number;
  h: number;
  poses: Pose[];
}

/**
 * Extract `count` evenly spaced frames across the whole clip (Spotlight wants
 * coverage, not the judge-sheet "skip the walk-on" heuristic), run pose
 * detection on each one while it's still on the canvas, and keep only a JPEG
 * blob + landmarks so 80 frames fit in a phone's memory.
 */
export async function extractAndDetect(
  file: File,
  count: number,
  landmarker: Landmarker,
  onProgress: (done: number, total: number) => void
): Promise<{ frames: DenseFrame[]; duration: number }> {
  const video = document.createElement("video");
  video.preload = "auto"; video.muted = true; video.playsInline = true;
  const url = URL.createObjectURL(file);
  video.src = url;
  await new Promise<void>((res, rej) => { video.onloadedmetadata = () => res(); video.onerror = () => rej(new Error("Couldn't read this video. Try an MP4 or MOV.")); });
  const duration = video.duration;
  if (!duration || !isFinite(duration)) throw new Error("Couldn't read the video length.");
  const scale = Math.min(1, 1024 / Math.max(video.videoWidth, video.videoHeight));
  const w = Math.round(video.videoWidth * scale), h = Math.round(video.videoHeight * scale);
  const canvas = document.createElement("canvas");
  canvas.width = w; canvas.height = h;
  const ctx = canvas.getContext("2d", { willReadFrequently: true })!;
  const start = duration * 0.02, end = duration * 0.985;
  const frames: DenseFrame[] = [];
  for (let i = 0; i < count; i++) {
    const t = start + ((end - start) * i) / Math.max(1, count - 1);
    await new Promise<void>((res, rej) => {
      const to = setTimeout(() => rej(new Error("Video seek timed out")), 8000);
      video.onseeked = () => { clearTimeout(to); res(); };
      video.onerror = () => { clearTimeout(to); rej(new Error("Video decode error")); };
      video.currentTime = t;
    });
    ctx.drawImage(video, 0, 0, w, h);
    let poses: Pose[] = [];
    try { poses = await detectPoses(landmarker, canvas); } catch { poses = []; }
    const blob: Blob = await new Promise((res, rej) => canvas.toBlob((b) => (b ? res(b) : rej(new Error("encode failed"))), "image/jpeg", 0.86));
    frames.push({ index: i, timestamp: t, blob, w, h, poses });
    onProgress(i + 1, count);
  }
  URL.revokeObjectURL(url);
  return { frames, duration };
}

export function blobToImage(blob: Blob): Promise<HTMLImageElement> {
  return new Promise((res, rej) => {
    const img = new Image();
    const u = URL.createObjectURL(blob);
    img.onload = () => { URL.revokeObjectURL(u); res(img); };
    img.onerror = () => { URL.revokeObjectURL(u); rej(new Error("decode failed")); };
    img.src = u;
  });
}
