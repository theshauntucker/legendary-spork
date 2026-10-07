import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { isInternalRequest } from "@/lib/internal-auth";
import { SPOTLIGHT_SYSTEM, SPOTLIGHT_TOOL, buildUserText } from "@/lib/spotlight/prompt";
import { formatTime } from "@/lib/spotlight/landmarks";
import type { KeyMoment, SpotlightFrame, SpotlightReport, SpotlightRow } from "@/lib/spotlight/types";
import { refundSpotlightCredit } from "@/lib/spotlight/fulfill";
import { renderSpotlightPdf } from "@/lib/spotlight/pdf";
import { sendSpotlightReadyEmail, notifyCritical } from "@/lib/notifications";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

/**
 * Spotlight engine. Tried in order until one answers — SPOTLIGHT_MODEL in
 * Vercel goes first so the model can be swapped without a deploy.
 */
const MODELS = Array.from(
  new Set([process.env.SPOTLIGHT_MODEL, "claude-opus-5-5", "claude-opus-4-8", "claude-sonnet-5-5"].filter(Boolean))
) as string[];

export async function POST(request: NextRequest) {
  if (!isInternalRequest(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { reportId } = await request.json().catch(() => ({}));
  if (!reportId) return NextResponse.json({ error: "Missing reportId" }, { status: 400 });

  const svc = await createServiceClient();
  const { data: row } = await svc.from("spotlight_reports").select("*").eq("id", reportId).maybeSingle();
  if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const report = row as SpotlightRow & { attempts: number };
  if (report.status === "ready") return NextResponse.json({ ok: true, already: true });
  if (report.attempts >= 3) return NextResponse.json({ error: "Too many attempts" }, { status: 409 });
  await svc.from("spotlight_reports").update({ attempts: report.attempts + 1 }).eq("id", reportId);

  try {
    const frames = report.frames as SpotlightFrame[];
    const keyFrames = (report.key_frames ?? []) as KeyMoment[];
    if (!frames.length || !keyFrames.length) throw new Error("No frames to analyze");

    // ── Pull the key frames from storage ──────────────────────────────────
    const images: Array<{ frame: number; base64: string }> = [];
    for (const k of keyFrames) {
      const f = frames[k.frame];
      const { data, error } = await svc.storage.from("videos").download(f.path);
      if (error || !data) { console.warn("spotlight: frame download failed", f.path, error?.message); continue; }
      images.push({ frame: k.frame, base64: Buffer.from(await data.arrayBuffer()).toString("base64") });
    }
    if (images.length < 6) throw new Error(`Only ${images.length} key frames could be loaded`);
    const usable = keyFrames.filter((k) => images.some((im) => im.frame === k.frame));

    // ── Build the message ─────────────────────────────────────────────────
    const text = buildUserText({
      dancerName: report.dancer_name, style: report.style, division: report.age_division, level: report.level,
      routine: report.routine_name, focusNote: report.focus_note, duration: report.video_duration ? Number(report.video_duration) : null,
      frames, keyMoments: usable,
    });
    const content: Array<Record<string, unknown>> = [{ type: "text", text }];
    for (const im of images) {
      content.push({ type: "text", text: `frame ${im.frame} · ${formatTime(frames[im.frame].t)}` });
      content.push({ type: "image", source: { type: "base64", media_type: "image/jpeg", data: im.base64 } });
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) throw new Error("ANTHROPIC_API_KEY missing");

    let parsed: SpotlightReport | null = null;
    let usedModel = "";
    let lastErr = "";
    for (const model of MODELS) {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-api-key": apiKey, "anthropic-version": "2023-06-01" },
        body: JSON.stringify({
          model,
          max_tokens: 16000,
          system: SPOTLIGHT_SYSTEM,
          tools: [SPOTLIGHT_TOOL],
          tool_choice: { type: "tool", name: SPOTLIGHT_TOOL.name },
          messages: [{ role: "user", content }],
        }),
      });
      if (!res.ok) {
        lastErr = `${model} → ${res.status}: ${(await res.text()).slice(0, 300)}`;
        console.error("spotlight: model error", lastErr);
        if (res.status === 429 || res.status >= 500 || res.status === 404 || res.status === 400) continue;
        break;
      }
      const data = await res.json();
      const toolUse = (data.content as Array<{ type: string; name?: string; input?: unknown }>).find((c) => c.type === "tool_use");
      if (!toolUse?.input) { lastErr = `${model} returned no tool call`; continue; }
      parsed = sanitize(toolUse.input as Partial<SpotlightReport>, report, usable.map((k) => k.frame));
      usedModel = model;
      console.log("spotlight: report generated", { reportId, model, in: data.usage?.input_tokens, out: data.usage?.output_tokens });
      break;
    }
    if (!parsed) throw new Error(`Spotlight model failed: ${lastErr}`);

    // ── Save, then render the PDF ─────────────────────────────────────────
    await svc.from("spotlight_reports").update({ report: parsed, model: usedModel }).eq("id", reportId);

    let pdfPath: string | null = null;
    try {
      const pdf = await renderSpotlightPdf({ ...report, report: parsed, model: usedModel } as SpotlightRow, svc);
      pdfPath = `spotlight/${report.user_id}/${reportId}/RoutineX-Spotlight-${slug(report.dancer_name)}.pdf`;
      const { error: upErr } = await svc.storage.from("videos").upload(pdfPath, pdf, { contentType: "application/pdf", upsert: true });
      if (upErr) { console.error("spotlight: pdf upload failed", upErr.message); pdfPath = null; }
    } catch (err) {
      console.error("spotlight: pdf render failed (report still delivered on the web)", err);
    }

    await svc
      .from("spotlight_reports")
      .update({ status: "ready", ready_at: new Date().toISOString(), pdf_path: pdfPath, error: null })
      .eq("id", reportId);

    // ── Privacy: drop every frame the report doesn't use ──────────────────
    const keep = new Set(parsed.moments.map((m) => frames[m.frame]?.path).concat(parsed.strengths.map((s) => (s.frame != null ? frames[s.frame]?.path : "")), parsed.priorities.map((p) => (p.frame != null ? frames[p.frame]?.path : ""))));
    const remove = frames.map((f) => f.path).filter((p) => p && !keep.has(p));
    if (remove.length) await svc.storage.from("videos").remove(remove).then(({ error }) => error && console.warn("spotlight cleanup", error.message));

    // ── Tell the family ───────────────────────────────────────────────────
    const { data: userRes } = await svc.auth.admin.getUserById(report.user_id);
    const email = userRes?.user?.email;
    if (email) await sendSpotlightReadyEmail(email, { dancerName: report.dancer_name, reportId, headline: parsed.headline });

    return NextResponse.json({ ok: true, model: usedModel, pdf: !!pdfPath });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("spotlight/process failed:", reportId, msg);
    const final = report.attempts + 1 >= 3;
    await svc
      .from("spotlight_reports")
      .update({ status: final ? "error" : "processing", error: msg.slice(0, 500) })
      .eq("id", reportId);
    if (final) {
      await refundSpotlightCredit(svc, report.user_id).catch(() => {});
      notifyCritical("Spotlight report failed 3× — credit refunded", `report ${reportId}\n${msg}`).catch(() => {});
    }
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

function slug(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "dancer";
}

/** Keep the model honest: frame refs must exist, counts stay in range, names are the dancer's. */
function sanitize(input: Partial<SpotlightReport>, row: SpotlightRow, validFrames: number[]): SpotlightReport {
  const valid = new Set(validFrames);
  const fixFrame = (n: unknown): number | undefined => (typeof n === "number" && valid.has(n) ? n : undefined);
  const moments = (input.moments ?? [])
    .filter((m) => typeof m.frame === "number" && valid.has(m.frame))
    .map((m) => ({
      ...m,
      working: Array.isArray(m.working) ? m.working.slice(0, 3) : [],
      fix: Array.isArray(m.fix) ? m.fix.slice(0, 3) : [],
      annotations: Array.isArray(m.annotations) ? m.annotations.slice(0, 3) : [],
    }))
    .sort((a, b) => a.frame - b.frame);
  // one moment per frame
  const seen = new Set<number>();
  const uniq = moments.filter((m) => (seen.has(m.frame) ? false : (seen.add(m.frame), true)));
  return {
    version: 1,
    dancer: { name: row.dancer_name, style: row.style, division: row.age_division ?? undefined, level: row.level ?? undefined, routine: row.routine_name ?? undefined },
    headline: input.headline ?? "",
    opening: input.opening ?? "",
    verdict: input.verdict ?? { current: "", potential: "", timeline: "" },
    categories: (input.categories ?? []).map((c) => ({ ...c, score: Math.max(1, Math.min(10, Math.round(Number(c.score) * 10) / 10)) })),
    strengths: (input.strengths ?? []).map((s) => ({ ...s, frame: fixFrame(s.frame) })),
    priorities: (input.priorities ?? []).map((p, i) => ({ ...p, rank: i + 1, frame: fixFrame(p.frame) })),
    moments: uniq,
    drills: input.drills ?? [],
    plan: input.plan ?? [],
    closing: input.closing ?? "",
    glossary: input.glossary ?? [],
  };
}
