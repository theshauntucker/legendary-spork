import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Profile owner update — bio only for now. Guardrails:
 * - 280 char cap
 * - Strip zero-width junk
 * - RLS + explicit user_id check enforces ownership
 */
export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  if (!body || typeof body.bio !== "string") {
    return NextResponse.json({ error: "Invalid payload." }, { status: 400 });
  }

  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) {
    return NextResponse.json({ error: "Sign in." }, { status: 401 });
  }

  const cleanBio = body.bio
    .replace(/[\u200B-\u200D\uFEFF]/g, "")
    .slice(0, 280);

  const { error } = await supabase
    .from("profiles")
    .update({ bio: cleanBio || null })
    .eq("user_id", auth.user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
