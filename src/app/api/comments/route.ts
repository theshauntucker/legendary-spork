import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { lookupPostOwner, lookupProfileUser } from "@/lib/post-owner";
import { notifyUser } from "@/lib/notify-user";

const ITEM_TYPES = new Set(["achievement", "post"]);

async function resolveProfileId() {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return { error: "Not signed in." as const, supabase };
  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("user_id", auth.user.id)
    .maybeSingle();
  if (!profile) return { error: "Profile not found." as const, supabase };
  return { profile_id: profile.id as string, supabase };
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const post_id = searchParams.get("post_id");
  const post_type = searchParams.get("post_type") ?? "achievement";
  if (!post_id) return NextResponse.json({ error: "post_id required" }, { status: 400 });
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("comments")
    .select("id, body, profile_id, parent_comment_id, created_at")
    .eq("post_id", post_id)
    .eq("post_type", post_type)
    .is("deleted_at", null)
    .order("created_at", { ascending: true });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ items: data ?? [] });
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  if (
    !body ||
    typeof body.post_id !== "string" ||
    !ITEM_TYPES.has(body.post_type) ||
    typeof body.body !== "string" ||
    !body.body.trim()
  ) {
    return NextResponse.json({ error: "Invalid payload." }, { status: 400 });
  }
  const ctx = await resolveProfileId();
  if (!("profile_id" in ctx)) return NextResponse.json({ error: ctx.error }, { status: 401 });
  const { data, error } = await ctx.supabase
    .from("comments")
    .insert({
      post_id: body.post_id,
      post_type: body.post_type,
      profile_id: ctx.profile_id,
      body: body.body.trim().slice(0, 1000),
      parent_comment_id: body.parent_comment_id ?? null,
    })
    .select("id, body, profile_id, parent_comment_id, created_at")
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Fire notifications — best effort. A reply notifies the comment author;
  // a top-level comment notifies the post owner.
  const commenterProfileId = ctx.profile_id as string;
  try {
    const commenter = await lookupProfileUser(commenterProfileId);
    const snippet = body.body.trim().slice(0, 80);
    if (body.parent_comment_id) {
      const { createServiceClient } = await import("@/lib/supabase/server");
      const s = await createServiceClient();
      const { data: parentRow } = await s
        .from("comments")
        .select("profile_id")
        .eq("id", body.parent_comment_id)
        .maybeSingle();
      if (parentRow?.profile_id && parentRow.profile_id !== commenterProfileId) {
        const parentOwner = await lookupProfileUser(parentRow.profile_id);
        if (parentOwner) {
          await notifyUser({
            userId: parentOwner.userId,
            kind: "comment",
            title: `${commenter?.displayName || commenter?.handle || "Someone"} replied to your comment`,
            body: snippet,
            href: `/home`,
            actorId: commenter?.userId,
            targetId: body.post_id,
          });
        }
      }
    } else {
      const owner = await lookupPostOwner(body.post_type, body.post_id);
      if (owner && owner.profileId !== commenterProfileId) {
        await notifyUser({
          userId: owner.userId,
          kind: "comment",
          title: `${commenter?.displayName || commenter?.handle || "Someone"} commented on your post`,
          body: snippet,
          href: owner.handle ? `/u/${owner.handle}` : "/home",
          actorId: commenter?.userId,
          targetId: body.post_id,
        });
      }
    }
  } catch (err) {
    console.warn("comment notify failed:", err);
  }

  return NextResponse.json({ comment: data });
}

export async function PATCH(req: Request) {
  const body = await req.json().catch(() => null);
  if (!body || typeof body.id !== "string") {
    return NextResponse.json({ error: "id required" }, { status: 400 });
  }
  const ctx = await resolveProfileId();
  if (!("profile_id" in ctx)) return NextResponse.json({ error: ctx.error }, { status: 401 });
  const { error } = await ctx.supabase
    .from("comments")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", body.id)
    .eq("profile_id", ctx.profile_id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
