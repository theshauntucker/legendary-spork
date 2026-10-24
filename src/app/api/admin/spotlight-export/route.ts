import { NextRequest, NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { isAdmin } from "@/lib/credits";
import type { SpotlightFrame, SpotlightRow } from "@/lib/spotlight/types";

export const dynamic = "force-dynamic";
export const maxDuration = 120;

/**
 * GET /api/admin/spotlight-export?id=…
 * Admin only. Bundles one of the admin's own finished reports — report JSON,
 * landmarks, the frames the report uses (base64) and the PDF — so it can be
 * committed as the public sample (src/lib/spotlight/sample-data.json +
 * public/spotlight-sample/). Only ever used on generated footage.
 */
export async function GET(request: NextRequest) {
  const id = request.nextUrl.searchParams.get("id") || "";
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || !isAdmin(user.email)) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const svc = await createServiceClient();
  const { data } = await svc.from("spotlight_reports").select("*").eq("id", id).eq("user_id", user.id).maybeSingle();
  const row = data as SpotlightRow | null;
  if (!row || row.status !== "ready" || !row.report) return NextResponse.json({ error: "Report not ready" }, { status: 404 });

  const frames = row.frames as SpotlightFrame[];
  const needed = new Set<number>();
  row.report.moments.forEach((m) => needed.add(m.frame));
  row.report.strengths.forEach((s) => s.frame != null && needed.add(s.frame));
  row.report.priorities.forEach((p) => p.frame != null && needed.add(p.frame));

  const round = (n: number) => Math.round(n * 10000) / 10000;
  const images: Record<string, string> = {};
  const outFrames: SpotlightFrame[] = [];
  for (const f of frames) {
    const keep = needed.has(f.i);
    let path = "";
    if (keep) {
      const { data: file } = await svc.storage.from("videos").download(f.path);
      if (file) {
        const name = `${String(f.i).padStart(3, "0")}.jpg`;
        images[name] = Buffer.from(await file.arrayBuffer()).toString("base64");
        path = `/spotlight-sample/${name}`;
      }
    }
    outFrames.push({
      i: f.i, t: round(f.t), path, w: f.w, h: f.h,
      pose: keep && f.pose ? (f.pose.map((l) => l.map(round)) as SpotlightFrame["pose"]) : null,
      metrics: keep ? f.metrics ?? null : null,
    });
  }

  let pdf: string | null = null;
  if (row.pdf_path) {
    const { data: file } = await svc.storage.from("videos").download(row.pdf_path);
    if (file) pdf = Buffer.from(await file.arrayBuffer()).toString("base64");
  }

  return NextResponse.json({
    sample: {
      report: row.report,
      frames: outFrames,
      meta: {
        date: new Date(row.ready_at || row.created_at).toLocaleDateString("en-US", { month: "long", year: "numeric", timeZone: "America/Chicago" }),
        frameCount: row.frame_count,
        trackedFrames: row.tracked_frames,
      },
    },
    images,
    pdf,
  });
}
