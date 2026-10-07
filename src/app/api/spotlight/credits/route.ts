import { NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { getSpotlightCredits } from "@/lib/spotlight/fulfill";
import { isAdmin } from "@/lib/credits";

export const dynamic = "force-dynamic";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  const svc = await createServiceClient();
  const credits = await getSpotlightCredits(svc, user.id);
  const { data: reports } = await svc
    .from("spotlight_reports")
    .select("id, status, dancer_name, routine_name, style, created_at, ready_at, frame_count")
    .eq("user_id", user.id)
    .gt("frame_count", 0)
    .order("created_at", { ascending: false })
    .limit(20);
  return NextResponse.json({ credits, isAdmin: isAdmin(user.email), reports: reports ?? [] });
}
