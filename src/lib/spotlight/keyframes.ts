/**
 * Key-moment selection for Spotlight.
 *
 * From 40–80 tracked frames we pick the dozen or so a coach would actually
 * freeze on: the apex of the jump, the fullest extension, the deepest plié
 * before take-off, the landing, the balance, the turn. Everything is scored
 * from measured landmarks; ties and gaps are filled with evenly spaced
 * frames so the whole routine is covered.
 */
import type { FrameMetrics } from "./landmarks";
import type { KeyMoment, SpotlightFrame } from "./types";

type Scored = { i: number; score: number; reason: string };

export function selectKeyMoments(frames: SpotlightFrame[], target = 14): KeyMoment[] {
  const tracked = frames.filter((f) => f.pose && f.metrics && f.metrics.confidence >= 0.45);
  if (tracked.length === 0) return [];
  const n = tracked.length;
  const M = (f: SpotlightFrame) => f.metrics as FrameMetrics;

  const hipYs = tracked.map((f) => M(f).hipY);
  const medianHip = median(hipYs);

  const picks: Scored[] = [];
  const add = (i: number, score: number, reason: string) => picks.push({ i, score, reason });

  // 1. Jump apex — hips highest (smallest y) and clearly above the median stance.
  const apexIdx = argmin(hipYs);
  if (medianHip - hipYs[apexIdx] > 0.04) {
    add(apexIdx, 100, "jump apex — hips at their highest point");
    // 1b. Landing — the first frame after apex where hips are back near/below median.
    for (let k = apexIdx + 1; k < Math.min(n, apexIdx + 6); k++) {
      if (hipYs[k] >= medianHip - 0.01) { add(k, 80, "landing after the jump"); break; }
    }
    // 1c. Preparation — deepest knee bend in the frames right before the apex.
    let prep = -1, prepKnee = 999;
    for (let k = Math.max(0, apexIdx - 5); k < apexIdx; k++) {
      const m = M(tracked[k]);
      const knee = Math.min(m.jointAngles.left_knee, m.jointAngles.right_knee);
      if (knee < prepKnee) { prepKnee = knee; prep = k; }
    }
    if (prep >= 0 && prepKnee < 150) add(prep, 60, "plié / preparation before take-off");
  }

  // 2. Fullest extension — highest leg elevation, either side.
  const extL = tracked.map((f) => M(f).legElevation.left);
  const extR = tracked.map((f) => M(f).legElevation.right);
  const eL = argmax(extL), eR = argmax(extR);
  if (extL[eL] > 45) add(eL, 90, `fullest left-leg extension (${extL[eL]}° from vertical)`);
  if (extR[eR] > 45) add(eR, 90, `fullest right-leg extension (${extR[eR]}° from vertical)`);

  // 3. Widest split / leap line.
  const splits = tracked.map((f) => M(f).splitAngle);
  const sIdx = argmax(splits);
  if (splits[sIdx] > 100) add(sIdx, 85, `widest leg line (${splits[sIdx]}° between legs)`);

  // 4. Balance — single support, other leg lifted, body not moving much.
  for (let k = 1; k < n - 1; k++) {
    const m = M(tracked[k]);
    if (m.support === "both") continue;
    const lifted = m.support === "left" ? m.legElevation.right : m.legElevation.left;
    const motion = Math.abs(hipYs[k] - hipYs[k - 1]) + Math.abs(hipYs[k] - hipYs[k + 1]);
    if (lifted > 40 && motion < 0.02) add(k, 70 + lifted / 10, `balance on the ${m.support} leg`);
  }

  // 5. Arabesque-type shape — leg lifted behind with torso tipped.
  for (let k = 0; k < n; k++) {
    const m = M(tracked[k]);
    const lifted = Math.max(m.legElevation.left, m.legElevation.right);
    if (lifted > 55 && Math.abs(m.torsoLean) > 12) add(k, 75, "arabesque / tilt line");
  }

  // 6. Port de bras — both arms high and symmetrical.
  const arms = tracked.map((f) => Math.min(M(f).armElevation.left, M(f).armElevation.right));
  const aIdx = argmax(arms);
  if (arms[aIdx] > 110) add(aIdx, 55, "arms at their highest — port de bras");

  // 7. Turning — narrowest shoulder width relative to height (profile).
  const facing = tracked.map((f) => M(f).facing);
  const fIdx = argmin(facing);
  if (facing[fIdx] < 0.12) add(fIdx, 65, "turn / profile position");

  // 8. Deepest plié overall (if not already the jump prep).
  const knees = tracked.map((f) => Math.min(M(f).jointAngles.left_knee, M(f).jointAngles.right_knee));
  const kIdx = argmin(knees);
  if (knees[kIdx] < 120) add(kIdx, 50, `deepest knee bend (${knees[kIdx]}°)`);

  // Opening and closing shapes always matter to a judge.
  add(0, 45, "opening shape");
  add(n - 1, 45, "final shape");

  // De-dupe by index (keep highest score), then enforce spacing so two
  // picks aren't the same beat, then fill to `target` with evenly spaced frames.
  const best = new Map<number, Scored>();
  for (const p of picks) {
    const cur = best.get(p.i);
    if (!cur || p.score > cur.score) best.set(p.i, p);
  }
  const ordered = [...best.values()].sort((a, b) => b.score - a.score);
  const chosen: Scored[] = [];
  const minGap = Math.max(1, Math.floor(n / (target * 1.6)));
  for (const p of ordered) {
    if (chosen.length >= target) break;
    if (chosen.some((c) => Math.abs(c.i - p.i) < minGap && c.score >= p.score)) continue;
    chosen.push(p);
  }
  if (chosen.length < target) {
    const need = target - chosen.length;
    for (let s = 0; s < need; s++) {
      const i = Math.round(((s + 0.5) / need) * (n - 1));
      if (!chosen.some((c) => Math.abs(c.i - i) < minGap)) chosen.push({ i, score: 10, reason: "routine coverage" });
    }
  }
  chosen.sort((a, b) => a.i - b.i);
  return chosen.map((c) => ({ frame: tracked[c.i].i, reason: c.reason }));
}

function argmax(a: number[]) { let b = 0; for (let i = 1; i < a.length; i++) if (a[i] > a[b]) b = i; return b; }
function argmin(a: number[]) { let b = 0; for (let i = 1; i < a.length; i++) if (a[i] < a[b]) b = i; return b; }
function median(a: number[]) { const s = [...a].sort((x, y) => x - y); return s[Math.floor(s.length / 2)]; }
