import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  if (
    !body ||
    !["studio", "choreographer"].includes(body.entity_type) ||
    typeof body.slug !== "string" ||
    typeof body.proof_email !== "string"
  ) {
    return NextResponse.json({ error: "Invalid payload." }, { status: 400 });
  }

  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return NextResponse.json({ error: "Sign in to claim." }, { status: 401 });

  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("user_id", auth.user.id)
    .maybeSingle();

  if (!profile) return NextResponse.json({ error: "Profile not found." }, { status: 404 });

  const { error } = await supabase.from("claim_requests").insert({
    entity_type: body.entity_type,
    slug: body.slug,
    requester_profile_id: profile.id,
    proof_email: body.proof_email,
  });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Fire-and-forget email to admin
  if (process.env.RESEND_API_KEY && process.env.OWNER_EMAIL) {
    try {
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "RoutineX <noreply@routinex.org>",
          to: process.env.OWNER_EMAIL,
          subject: `Claim request: ${body.entity_type} / ${body.slug}`,
          text: `A user (${auth.user.email}) requested to claim ${body.entity_type} page "${body.slug}". Proof email: ${body.proof_email}`,
        }),
      });
    } catch {
      // non-fatal
    }
  }

  return NextResponse.json({ ok: true });
}
