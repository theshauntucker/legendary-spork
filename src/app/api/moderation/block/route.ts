import { NextRequest, NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  let body: { target_user_id?: string };
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }
  const target = body?.target_user_id;
  if (!target || typeof target !== "string") {
    return NextResponse.json({ error: "target_user_id required" }, { status: 400 });
  }
  if (target === user.id) {
    return NextResponse.json({ error: "Cannot block yourself" }, { status: 400 });
  }

  const service = await createServiceClient();
  const { error } = await service
    .from("blocks")
    .upsert({ blocker_id: user.id, blocked_id: target }, { onConflict: "blocker_id,blocked_id" });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Remove any follows in both directions so block takes effect immediately
  try {
    const { data: myProfile } = await service
      .from("profiles").select("id").eq("user_id", user.id).maybeSingle();
    const { data: theirProfile } = await service
      .from("profiles").select("id").eq("user_id", target).maybeSingle();
    if (myProfile?.id && theirProfile?.id) {
      await service.from("follows")
        .delete()
        .or(
          `and(follower_id.eq.${myProfile.id},following_id.eq.${theirProfile.id}),` +
          `and(follower_id.eq.${theirProfile.id},following_id.eq.${myProfile.id})`
        );
    }
  } catch (err) {
    console.warn("follow-cleanup on block failed:", err);
  }

  return NextResponse.json({ success: true });
}

export async function DELETE(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const target = searchParams.get("target_user_id");
  if (!target) return NextResponse.json({ error: "target_user_id required" }, { status: 400 });

  const service = await createServiceClient();
  await service
    .from("blocks")
    .delete()
    .eq("blocker_id", user.id)
    .eq("blocked_id", target);

  return NextResponse.json({ success: true });
}

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { data, error } = await supabase
    .from("blocks")
    .select("blocked_id, created_at")
    .eq("blocker_id", user.id)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ blocks: data || [] });
}
