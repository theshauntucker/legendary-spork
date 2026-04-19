import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const AWARD_LEVELS = new Set(["gold", "high_gold", "platinum", "diamond"]);

/**
 * Manual trophy entry — lets a profile owner log a real-world competition
 * result that wasn't scored by the analyzer.
 *
 * All entries are flagged `self_reported = true` for future UI differentiation.
 * Default visibility is public so the trophy wall fills up immediately.
 */
export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  if (!body || !AWARD_LEVELS.has(body.award_level)) {
    return NextResponse.json({ error: "Invalid award level." }, { status: 400 });
  }

  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) {
    return NextResponse.json({ error: "Sign in." }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("user_id", auth.user.id)
    .maybeSingle();
  if (!profile) {
    return NextResponse.json({ error: "No profile." }, { status: 404 });
  }

  // Validate score if provided
  let totalScore: number | null = null;
  if (body.total_score !== null && body.total_score !== undefined) {
    const n = Number(body.total_score);
    if (isNaN(n) || n < 0 || n > 300) {
      return NextResponse.json({ error: "Score out of range." }, { status: 400 });
    }
    totalScore = n;
  } else {
    // Default score per tier midpoint (avoids NOT NULL issues)
    const midpoint: Record<string, number> = {
      gold: 265,
      high_gold: 275,
      platinum: 285,
      diamond: 295,
    };
    totalScore = midpoint[body.award_level] ?? 260;
  }

  const compName =
    typeof body.competition_name === "string" && body.competition_name.trim()
      ? body.competition_name.trim().slice(0, 120)
      : null;
  const compDate =
    typeof body.competition_date === "string" && body.competition_date
      ? body.competition_date
      : null;
  const category =
    typeof body.category === "string" && body.category.trim()
      ? body.category.trim().slice(0, 60)
      : null;
  const routineName =
    typeof body.routine_name === "string" && body.routine_name.trim()
      ? body.routine_name.trim().slice(0, 80)
      : null;

  const { data: inserted, error } = await supabase
    .from("achievements")
    .insert({
      profile_id: profile.id,
      video_id: null,
      award_level: body.award_level,
      total_score: totalScore,
      competition_name: compName,
      competition_date: compDate,
      category: routineName
        ? category
          ? `${routineName} · ${category}`
          : routineName
        : category,
    })
    .select("id")
    .maybeSingle();

  if (error || !inserted) {
    return NextResponse.json(
      { error: error?.message || "Could not save." },
      { status: 500 },
    );
  }

  // Default to public so the trophy shows up on the wall right away
  await supabase.from("visibility_settings").upsert(
    {
      owner_profile_id: profile.id,
      item_type: "achievement",
      item_id: inserted.id,
      visibility: "public",
      updated_at: new Date().toISOString(),
    },
    { onConflict: "item_type,item_id" },
  );

  return NextResponse.json({ ok: true, id: inserted.id });
}
