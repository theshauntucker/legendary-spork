import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { buildFeed } from "@/lib/fair-feed";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const cursor = searchParams.get("cursor");
  const limit = Math.min(Number(searchParams.get("limit") ?? 20), 50);

  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) {
    return NextResponse.json({ items: [], nextCursor: null });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, studio_id")
    .eq("user_id", auth.user.id)
    .maybeSingle();

  if (!profile) {
    return NextResponse.json({ items: [], nextCursor: null });
  }

  const result = await buildFeed({
    viewerProfileId: profile.id,
    viewerStudioId: profile.studio_id ?? null,
    limit,
    cursor,
  });

  return NextResponse.json(result);
}
