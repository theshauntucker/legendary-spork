import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { data, error } = await supabase
    .from("notifications")
    .select("id, kind, title, body, href, actor_id, target_id, read_at, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const unreadCount = (data || []).filter((n) => !n.read_at).length;
  return NextResponse.json({ notifications: data || [], unreadCount });
}

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  let body: { ids?: string[]; all?: boolean } = {};
  try { body = await req.json(); } catch {}

  const now = new Date().toISOString();
  if (body.all) {
    await supabase
      .from("notifications")
      .update({ read_at: now })
      .eq("user_id", user.id)
      .is("read_at", null);
  } else if (Array.isArray(body.ids) && body.ids.length) {
    await supabase
      .from("notifications")
      .update({ read_at: now })
      .eq("user_id", user.id)
      .in("id", body.ids);
  }

  return NextResponse.json({ success: true });
}
