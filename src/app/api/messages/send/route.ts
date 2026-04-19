import { NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { notifyUser } from "@/lib/notify-user";

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
    .select("id, display_name, handle")
    .eq("user_id", auth.user.id)
    .maybeSingle();
  if (!profile) return NextResponse.json({ error: "No profile." }, { status: 404 });

  const messageBody = body.body.trim().slice(0, 2000);

  const { error } = await supabase.from("messages").insert({
    conversation_id: body.conversation_id,
    sender_profile_id: profile.id,
    body: messageBody,
  });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await supabase
    .from("conversations")
    .update({ last_message_at: new Date().toISOString() })
    .eq("id", body.conversation_id);

  // Fire push + bell notification to the other participants. Fire-and-forget
  // so a push failure never blocks the send response.
  (async () => {
    try {
      const service = await createServiceClient();
      const { data: otherParticipants } = await service
        .from("conversation_participants")
        .select("profile_id, profiles:profile_id (user_id)")
        .eq("conversation_id", body.conversation_id)
        .neq("profile_id", profile.id);

      const senderLabel = profile.display_name || `@${profile.handle}`;
      const preview = messageBody.length > 80
        ? `${messageBody.slice(0, 77)}...`
        : messageBody;

      for (const p of (otherParticipants ?? []) as Array<{
        profile_id: string;
        profiles: { user_id: string } | { user_id: string }[] | null;
      }>) {
        const userIdRaw = Array.isArray(p.profiles)
          ? p.profiles[0]?.user_id
          : p.profiles?.user_id;
        if (!userIdRaw) continue;
        await notifyUser({
          userId: userIdRaw,
          kind: "message",
          title: `New message from ${senderLabel}`,
          body: preview,
          href: `/inbox/${body.conversation_id}`,
          actorId: profile.id,
          targetId: body.conversation_id,
        });
      }
    } catch (err) {
      console.error("DM push fan-out failed:", err);
    }
  })().catch(() => {});

  return NextResponse.json({ ok: true });
}
