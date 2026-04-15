import { NextRequest, NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { STUDIO_ENABLED } from "@/lib/studio/flag";
import { loadStudioMembership } from "@/lib/studio/auth";

export const dynamic = "force-dynamic";

/**
 * POST /api/studio/schedule
 * Body: { name: string, competition_date?: string (YYYY-MM-DD), location?: string, notes?: string }
 *
 * Any studio member can create a competition row for their studio.
 */
export async function POST(request: NextRequest) {
  if (!STUDIO_ENABLED) {
    return NextResponse.json({ error: "Studio feature disabled" }, { status: 404 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  const membership = await loadStudioMembership(supabase, user.id);
  if (!membership) return NextResponse.json({ error: "Not a studio member" }, { status: 403 });

  const body = await request.json().catch(() => ({}));
  const name = typeof body.name === "string" ? body.name.trim() : "";
  if (!name || name.length < 2) {
    return NextResponse.json({ error: "name (min 2 chars) required" }, { status: 400 });
  }

  const competitionDate =
    typeof body.competition_date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(body.competition_date)
      ? body.competition_date
      : null;
  const location =
    typeof body.location === "string" && body.location.trim().length > 0
      ? body.location.trim().slice(0, 200)
      : null;
  const notes =
    typeof body.notes === "string" && body.notes.trim().length > 0
      ? body.notes.trim().slice(0, 2000)
      : null;

  const service = await createServiceClient();
  const { data, error } = await service
    .from("studio_competitions")
    .insert({
      studio_id: membership.studioId,
      name: name.slice(0, 200),
      competition_date: competitionDate,
      location,
      notes,
    })
    .select("id, name, competition_date, location, notes, created_at")
    .single();

  if (error) {
    console.error("studio_competitions insert failed:", error);
    return NextResponse.json({ error: "Create failed" }, { status: 500 });
  }
  return NextResponse.json({ competition: data });
}
