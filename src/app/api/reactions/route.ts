import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const ITEM_TYPES = new Set(["achievement", "post", "comment"]);
const EMOJI_CODES = new Set([
  "diamond","fire","crown","sparkle","heart","clap","star","trophy","microphone",
  "fire_heart","eyes","kiss","tears","bow","mind_blown","pointing","muscle","rose",
]);

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

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  if (!body || !ITEM_TYPES.has(body.post_type) || !EMOJI_CODES.has(body.emoji_code) || typeof body.post_id !== "string") {
    return NextResponse.json({ error: "Invalid payload." }, { status: 400 });
  }
  const ctx = await resolveProfileId();
  if (!("profile_id" in ctx)) return NextResponse.json({ error: ctx.error }, { status: 401 });
  const { error } = await ctx.supabase
    .from("post_reactions")
    .upsert({
      post_id: body.post_id,
      post_type: body.post_type,
      profile_id: ctx.profile_id,
      emoji_code: body.emoji_code,
    });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: Request) {
  const body = await req.json().catch(() => null);
  if (!body || typeof body.post_id !== "string" || !body.post_type || !body.emoji_code) {
    return NextResponse.json({ error: "Invalid payload." }, { status: 400 });
  }
  const ctx = await resolveProfileId();
  if (!("profile_id" in ctx)) return NextResponse.json({ error: ctx.error }, { status: 401 });
  const { error } = await ctx.supabase
    .from("post_reactions")
    .delete()
    .eq("post_id", body.post_id)
    .eq("post_type", body.post_type)
    .eq("profile_id", ctx.profile_id)
    .eq("emoji_code", body.emoji_code);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
