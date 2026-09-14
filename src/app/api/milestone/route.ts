import { NextRequest, NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { clientKey, rateLimit } from "@/lib/internal-auth";

export const dynamic = "force-dynamic";

/**
 * Milestone celebrations fire once per account and then never again.
 *
 * GET  ?keys=a,b,c → { seen: ["a"] } so the client knows what's already fired.
 * POST { key }     → marks it fired.
 */

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ seen: [] });

  const keys = (request.nextUrl.searchParams.get("keys") || "")
    .split(",")
    .map((k) => k.trim())
    .filter(Boolean)
    .slice(0, 12);

  if (!keys.length) return NextResponse.json({ seen: [] });

  const serviceClient = await createServiceClient();
  const { data } = await serviceClient
    .from("milestone_events")
    .select("milestone_key")
    .eq("user_id", user.id)
    .in("milestone_key", keys);

  return NextResponse.json({ seen: (data || []).map((r) => r.milestone_key) });
}

export async function POST(request: NextRequest) {
  const limit = rateLimit(clientKey(request, "milestone"), { max: 40, windowMs: 10 * 60 * 1000 });
  if (!limit.ok) return NextResponse.json({ error: "Too many requests" }, { status: 429 });

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { key, videoId } = (await request.json().catch(() => ({}))) as {
    key?: string;
    videoId?: string;
  };
  if (!key || typeof key !== "string") {
    return NextResponse.json({ error: "Missing key" }, { status: 400 });
  }

  const serviceClient = await createServiceClient();
  await serviceClient
    .from("milestone_events")
    .upsert(
      { user_id: user.id, milestone_key: key.slice(0, 60), video_id: videoId || null },
      { onConflict: "user_id,milestone_key" },
    );

  return NextResponse.json({ ok: true });
}
