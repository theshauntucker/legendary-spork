import { NextRequest, NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { getSpotlightCredits } from "@/lib/spotlight/fulfill";
import { isAdmin } from "@/lib/credits";
import { clientKey, rateLimit } from "@/lib/internal-auth";

export const dynamic = "force-dynamic";

const STYLES = ["Jazz", "Contemporary", "Lyrical", "Hip Hop", "Tap", "Ballet", "Musical Theater", "Pom", "Acro", "Cheer", "Open", "Clogging", "Pointe", "Character", "Improvisation", "Other"];

/**
 * POST /api/spotlight/start
 * Body: { dancerName, routineName?, style, ageDivision?, level?, focusNote?, frameCount, duration }
 * Creates the report shell and returns signed upload URLs for every frame.
 * The Spotlight credit is NOT consumed here — only when /complete succeeds,
 * so an abandoned upload never costs the family anything.
 */
export async function POST(request: NextRequest) {
  try {
    const limit = rateLimit(clientKey(request, "spotlight-start"), { max: 20, windowMs: 60 * 60 * 1000 });
    if (!limit.ok) return NextResponse.json({ error: "Too many requests" }, { status: 429 });

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

    const body = await request.json().catch(() => ({}));
    const dancerName = String(body.dancerName || "").trim().slice(0, 60);
    const style = STYLES.includes(body.style) ? body.style : "Other";
    const frameCount = Math.min(96, Math.max(12, parseInt(body.frameCount, 10) || 0));
    if (!dancerName) return NextResponse.json({ error: "Dancer's first name is required" }, { status: 400 });
    if (!frameCount) return NextResponse.json({ error: "No frames" }, { status: 400 });

    const svc = await createServiceClient();
    if (!isAdmin(user.email)) {
      const credits = await getSpotlightCredits(svc, user.id);
      if (credits.remaining <= 0) {
        return NextResponse.json({ error: "No Spotlight credit on this account", code: "NO_CREDIT" }, { status: 402 });
      }
    }

    const { data: row, error } = await svc
      .from("spotlight_reports")
      .insert({
        user_id: user.id,
        status: "processing",
        dancer_name: dancerName,
        routine_name: body.routineName ? String(body.routineName).trim().slice(0, 80) : null,
        style,
        age_division: body.ageDivision ? String(body.ageDivision).slice(0, 30) : null,
        level: body.level ? String(body.level).slice(0, 30) : null,
        focus_note: body.focusNote ? String(body.focusNote).trim().slice(0, 500) : null,
        video_duration: typeof body.duration === "number" ? body.duration : null,
        frame_count: 0,
      })
      .select("id")
      .single();
    if (error || !row) throw new Error(error?.message || "insert failed");

    const uploads: Array<{ i: number; path: string; token: string; signedUrl: string }> = [];
    for (let i = 0; i < frameCount; i++) {
      const path = `spotlight/${user.id}/${row.id}/${String(i).padStart(3, "0")}.jpg`;
      const { data: signed, error: signErr } = await svc.storage.from("videos").createSignedUploadUrl(path, { upsert: true });
      if (signErr || !signed) throw new Error(signErr?.message || "sign failed");
      uploads.push({ i, path, token: signed.token, signedUrl: signed.signedUrl });
    }
    return NextResponse.json({ reportId: row.id, uploads });
  } catch (err) {
    console.error("spotlight/start error:", err);
    return NextResponse.json({ error: "Could not start the report" }, { status: 500 });
  }
}
