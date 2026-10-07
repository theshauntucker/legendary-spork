import type { ChainName, FrameMetrics, JointName, LandmarkName, Pose } from "./landmarks";

/** One extracted frame as stored on a spotlight_reports row. */
export interface SpotlightFrame {
  /** Index in the extraction order. */
  i: number;
  /** Seconds into the video. */
  t: number;
  /** Storage path inside the `videos` bucket, or an absolute URL for the public sample. */
  path: string;
  w: number;
  h: number;
  /** Tracked dancer's 33 landmarks (normalized), or null when the dancer wasn't found. */
  pose: Pose | null;
  metrics?: FrameMetrics | null;
}

export type AnnotationStatus = "good" | "fix" | "note";

/**
 * What a coach would draw on the frame. The MODEL picks these; the GEOMETRY
 * (where the lines go, what the angle measures) comes from the landmarks.
 */
export type Annotation =
  | { type: "angle"; joint: JointName; status: AnnotationStatus; label?: string; ideal?: number }
  | { type: "line"; from: LandmarkName; to: LandmarkName; status: AnnotationStatus; label?: string }
  | { type: "plumb"; at: LandmarkName | "hip_center" | "shoulder_center"; status: AnnotationStatus; label?: string }
  | { type: "level"; pair: "shoulders" | "hips"; status: AnnotationStatus; label?: string }
  | { type: "extend"; chain: ChainName; status: AnnotationStatus; label?: string }
  | { type: "callout"; at: LandmarkName; text: string; status: AnnotationStatus }
  | { type: "arrow"; at: LandmarkName; dir: "up" | "down" | "left" | "right"; text: string; status: AnnotationStatus }
  /**
   * The corrected limb, drawn translucent next to the real one so the dancer
   * sees the difference: the chain is straightened and lifted to
   * `targetElevation` degrees from straight-down (0 = hanging, 90 = horizontal,
   * 180 = straight up) on the same side of the body it currently sits.
   */
  | { type: "ghost"; chain: ChainName; targetElevation: number; status: AnnotationStatus; label?: string };

export interface KeyMoment {
  /** Index into frames[]. */
  frame: number;
  /** Why the selector flagged it, e.g. "jump apex", "max extension (left)". */
  reason: string;
}

export interface SpotlightMoment {
  frame: number;
  title: string;
  /** What the dancer is doing at this instant, one line. */
  skill: string;
  /** 2–4 sentences: what a pro sees, what is working, what to change. */
  analysis: string;
  working: string[];
  fix: string[];
  annotations: Annotation[];
  /** Measured by us — surfaced for the model and the PDF. */
  measurements?: Array<{ label: string; value: string }>;
}

export interface SpotlightCategory {
  key: "lines" | "alignment" | "jumps" | "turns" | "arms" | "feet" | "presence";
  name: string;
  /** 1–10, honest. */
  score: number;
  summary: string;
}

export interface SpotlightDrill {
  name: string;
  targets: string;
  how: string;
  dose: string;
  cue: string;
}

export interface SpotlightWeek {
  week: number;
  focus: string;
  plan: string[];
}

/** One line of a real judge's card, as this routine would read on it. */
export interface JudgesCardLine {
  category: "technique" | "execution" | "performance" | "choreography" | "presentation" | "overall";
  name: string;
  /** Typical weight on a 100-point sheet (e.g. 40, 30, 15, 10, 5). */
  weight: number;
  /** Honest 1–10 for this dancer, scaled by the renderer. */
  score: number;
  /** The sentence a judge would actually say into the mic. */
  note: string;
}

export interface SpotlightReport {
  version: 1;
  dancer: { name: string; style: string; division?: string; level?: string; routine?: string };
  headline: string;
  opening: string;
  verdict: { current: string; potential: string; timeline: string };
  categories: SpotlightCategory[];
  strengths: Array<{ title: string; detail: string; frame?: number }>;
  priorities: Array<{ rank: number; title: string; why: string; cue: string; frame?: number }>;
  moments: SpotlightMoment[];
  drills: SpotlightDrill[];
  plan: SpotlightWeek[];
  closing: string;
  glossary: Array<{ term: string; meaning: string }>;
  /** Optional sections (v1.1 reports). */
  judgesCard?: JudgesCardLine[];
  /** "Next time on stage" — competition-day cues written to the dancer. */
  onStage?: Array<{ moment: "walk-on" | "first-8" | "the-hard-part" | "recovery" | "finish" | "after"; title: string; cue: string }>;
  /** Short, plain notes for the parent — what to say and when. */
  forParent?: string[];
}

export type SpotlightStatus = "processing" | "ready" | "error";

export interface SpotlightRow {
  id: string;
  user_id: string;
  status: SpotlightStatus;
  dancer_name: string;
  routine_name: string | null;
  style: string;
  age_division: string | null;
  level: string | null;
  focus_note: string | null;
  frame_count: number;
  tracked_frames: number;
  video_duration: number | null;
  frames: SpotlightFrame[];
  key_frames: KeyMoment[] | null;
  report: SpotlightReport | null;
  model: string | null;
  error: string | null;
  pdf_path: string | null;
  created_at: string;
  ready_at: string | null;
}
