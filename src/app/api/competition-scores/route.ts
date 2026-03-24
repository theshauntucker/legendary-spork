import { NextRequest, NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const analysisId = searchParams.get("analysis_id");

  const serviceClient = await createServiceClient();

  let query = serviceClient
    .from("competition_scores")
    .select("*")
    .eq("user_id", user.id)
    .order("competition_date", { ascending: false });

  if (analysisId) {
    query = query.eq("analysis_id", analysisId);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Competition scores query error:", error);
    return NextResponse.json({ error: "Failed to fetch scores" }, { status: 500 });
  }

  return NextResponse.json({ scores: data || [] });
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { analysisId, videoId, competitionName, competitionDate, actualScore, actualAwardLevel, placement, notes } = body;

  if (!analysisId || !videoId || !competitionName || !competitionDate) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const serviceClient = await createServiceClient();

  const { data, error } = await serviceClient
    .from("competition_scores")
    .insert({
      user_id: user.id,
      analysis_id: analysisId,
      video_id: videoId,
      competition_name: competitionName,
      competition_date: competitionDate,
      actual_score: actualScore || null,
      actual_award_level: actualAwardLevel || null,
      placement: placement || null,
      notes: notes || null,
    })
    .select("*")
    .single();

  if (error) {
    console.error("Competition score insert error:", error);
    return NextResponse.json({ error: "Failed to save score" }, { status: 500 });
  }

  return NextResponse.json({ score: data });
}

export async function PUT(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { id, competitionName, competitionDate, actualScore, actualAwardLevel, placement, notes } = body;

  if (!id) {
    return NextResponse.json({ error: "Missing score ID" }, { status: 400 });
  }

  const serviceClient = await createServiceClient();

  const { data, error } = await serviceClient
    .from("competition_scores")
    .update({
      competition_name: competitionName,
      competition_date: competitionDate,
      actual_score: actualScore || null,
      actual_award_level: actualAwardLevel || null,
      placement: placement || null,
      notes: notes || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("user_id", user.id)
    .select("*")
    .single();

  if (error) {
    console.error("Competition score update error:", error);
    return NextResponse.json({ error: "Failed to update score" }, { status: 500 });
  }

  return NextResponse.json({ score: data });
}

export async function DELETE(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "Missing score ID" }, { status: 400 });
  }

  const serviceClient = await createServiceClient();

  const { error } = await serviceClient
    .from("competition_scores")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    console.error("Competition score delete error:", error);
    return NextResponse.json({ error: "Failed to delete score" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
