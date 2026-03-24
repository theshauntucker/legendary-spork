import { NextRequest, NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const dancerName = searchParams.get("dancer_name");
  const routineName = searchParams.get("routine_name");

  const serviceClient = await createServiceClient();

  let query = serviceClient
    .from("videos")
    .select("id, routine_name, dancer_name, style, age_group, entry_type, created_at, analyses!inner(id, total_score, award_level, created_at)")
    .eq("user_id", user.id)
    .eq("status", "analyzed")
    .order("created_at", { ascending: true });

  if (dancerName) {
    query = query.eq("dancer_name", dancerName);
  }
  if (routineName) {
    query = query.eq("routine_name", routineName);
  }

  const { data, error } = await query;

  if (error) {
    console.error("History query error:", error);
    return NextResponse.json({ error: "Failed to fetch history" }, { status: 500 });
  }

  const history = (data || []).map((v: Record<string, unknown>) => {
    const analyses = v.analyses as Array<Record<string, unknown>>;
    const a = analyses[0];
    return {
      videoId: v.id,
      analysisId: a.id,
      routineName: v.routine_name,
      dancerName: v.dancer_name,
      style: v.style,
      ageGroup: v.age_group,
      entryType: v.entry_type,
      totalScore: a.total_score,
      awardLevel: a.award_level,
      date: v.created_at,
    };
  });

  return NextResponse.json({ history });
}
