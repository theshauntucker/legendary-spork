import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { Visibility } from "@/lib/visibility";

const ITEM_TYPES = new Set(["video", "achievement", "post", "comment"]);
const VISIBILITIES = new Set<Visibility>(["public", "followers", "studio", "private"]);

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  if (
    !body ||
    typeof body.item_id !== "string" ||
    !ITEM_TYPES.has(body.item_type) ||
    !VISIBILITIES.has(body.visibility)
  ) {
    return NextResponse.json({ error: "Invalid payload." }, { status: 400 });
  }

  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("user_id", auth.user.id)
    .maybeSingle();

  if (!profile) {
    return NextResponse.json({ error: "Profile not found." }, { status: 404 });
  }

  const { error } = await supabase
    .from("visibility_settings")
    .upsert(
      {
        owner_profile_id: profile.id,
        item_type: body.item_type,
        item_id: body.item_id,
        visibility: body.visibility,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "item_type,item_id" },
    );

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
