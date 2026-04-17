import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  if (!body || typeof body.conversation_id !== "string" || typeof body.body !== "string" || !body.body.trim()) {
    return NextResponse.json({ error: "Invalid payload." }, { status: 400 });
  }

  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return NextResponse.json({ error: "Sign in." }, { status: 401 });

  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("user_id", auth.user.id)
    .maybeSingle();
  if (!profile) return NextResponse.json({ error: "No profile." }, { status: 404 });

  const { error } = await supabase.from("messages").insert({
    conversation_id: body.conversation_id,
    sender_profile_id: profile.id,
    body: body.body.trim().slice(0, 2000),
  });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await supabase
    .from("conversations")
    .update({ last_message_at: new Date().toISOString() })
    .eq("id", body.conversation_id);

  return NextResponse.json({ ok: true });
}
