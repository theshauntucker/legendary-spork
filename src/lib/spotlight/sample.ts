/**
 * The public Spotlight sample. Produced by running the real pipeline on a
 * generated (Veo) dancer clip, so no real dancer appears on the site.
 * Frames live in /public/spotlight-sample/; the report JSON is the model's
 * actual output, unedited except for the dancer's (fictional) name.
 */
import type { SpotlightFrame, SpotlightReport } from "./types";
import data from "./sample-data.json";

type SampleData = { report: SpotlightReport | null; frames: SpotlightFrame[]; meta: { date: string; frameCount: number; trackedFrames: number } };

const typed = data as unknown as SampleData;
const urls: Record<number, string> = {};
for (const f of typed.frames) if (f.path) urls[f.i] = f.path;

export const SAMPLE = { report: typed.report, frames: typed.frames, urls, meta: typed.meta };
