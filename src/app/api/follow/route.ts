import { NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { notifyUser } from "@/lib/notify-user";

async function getFollowerProfileId() {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return { error: "Not signed in." as const, supabase };
  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("user_id", auth.user.id)
    .maybeSingle();
  if (!profile) return { error: "Profile not found." as const, supabase };
  return { follower_id: profile.id as string, supabase };
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const target = body?.target_profile_id;
  if (!target || typeof target !== "string") {
    return NextResponse.json({ error: "target_profile_id required" }, { status: 400 });
  }
  const ctx = await getFollowerProfileId();
  if (!("follower_id" in ctx)) {
    return NextResponse.json({ error: ctx.error }, { status: 401 });
  }
  if (ctx.follower_id === target) {
    return NextResponse.json({ error: "Cannot follow yourself." }, { status: 400 });
  }
  const { error } = await ctx.supabase
    .from("follows")
    .upsert({ follower_id: ctx.follower_id, following_id: target });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Fire notification to the followed user — best-effort, never block the request
  try {
    const service = await createServiceClient();
    const [{ data: targetProfile }, { data: followerProfile }] = await Promise.all([
      service.from("profiles").select("user_id, handle").eq("id", target).maybeSingle(),
      service.from("profiles").select("user_id, handle, display_name").eq("id", ctx.follower_id).maybeSingle(),
    ]);
    if (targetProfile?.user_id && targetProfile.user_id !== followerProfile?.user_id) {
      const name = followerProfile?.display_name || followerProfile?.handle || "Someone";
      await notifyUser({
        userId: targetProfile.user_id,
        kind: "follow",
        title: `${name} followed you`,
        body: "Tap to view their profile.",
        href: followerProfile?.handle ? `/u/${followerProfile.handle}` : "/home",
        actorId: followerProfile?.user_id || undefined,
      });
    }
  } catch (err) {
    console.warn("follow notify failed:", err);
  }

  return NextResponse.json({ ok: true, following: true });
}

export async function DELETE(request: Request) {
  const body = await request.json().catch(() => null);
  const target = body?.target_profile_id;
  if (!target || typeof target !== "string") {
    return NextResponse.json({ error: "target_profile_id required" }, { status: 400 });
  }
  const ctx = await getFollowerProfileId();
  if (!("follower_id" in ctx)) {
    return NextResponse.json({ error: ctx.error }, { status: 401 });
  }
  const { error } = await ctx.supabase
    .from("follows")
    .delete()
    .eq("follower_id", ctx.follower_id)
    .eq("following_id", target);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, following: false });
}
