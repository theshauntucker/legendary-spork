import { NextRequest, NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import type { SpotlightFrame } from "@/lib/spotlight/types";

export const dynamic = "force-dynamic";

/** POST /api/spotlight/delete { id } — removes the report, its frames and PDF. The family owns it. */
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  const { id } = await request.json().catch(() => ({}));
  const svc = await createServiceClient();
  const { data } = await svc.from("spotlight_reports").select("id, frames, pdf_path").eq("id", id).eq("user_id", user.id).maybeSingle();
  if (!data) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const paths = ((data.frames as SpotlightFrame[]) || []).map((f) => f.path).filter((p) => p && !p.startsWith("/") && !/^https?:/.test(p));
  if (data.pdf_path) paths.push(data.pdf_path);
  if (paths.length) await svc.storage.from("videos").remove(paths);
  await svc.from("spotlight_reports").delete().eq("id", id);
  return NextResponse.json({ ok: true });
}
