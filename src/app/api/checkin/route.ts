import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  if (!body || typeof body.competition_id !== "string" || typeof body.competition_date !== "string") {
    return NextResponse.json({ error: "Invalid payload." }, { status: 400 });
  }

  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return NextResponse.json({ error: "Sign in to check in." }, { status: 401 });

  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("user_id", auth.user.id)
    .maybeSingle();
  if (!profile) return NextResponse.json({ error: "Profile not found." }, { status: 404 });

  const { error: checkinErr } = await supabase
    .from("competition_checkins")
    .upsert({
      profile_id: profile.id,
      competition_id: body.competition_id,
      competition_date: body.competition_date,
    });
  if (checkinErr) return NextResponse.json({ error: checkinErr.message }, { status: 500 });

  // Ensure a thread row exists.
  await supabase
    .from("competition_threads")
    .upsert(
      { competition_id: body.competition_id, competition_date: body.competition_date },
      { onConflict: "competition_id,competition_date" },
    );

  return NextResponse.json({ ok: true });
}
