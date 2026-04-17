import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { validateHandle } from "@/lib/handle-validator";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const raw = searchParams.get("h") ?? "";
  const check = validateHandle(raw);
  if (!check.valid) {
    return NextResponse.json({ available: false, reason: check.reason });
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("id")
    .ilike("handle", raw.trim())
    .maybeSingle();

  if (error) {
    return NextResponse.json({ available: false, reason: "Check failed. Try again." }, { status: 500 });
  }

  if (data) {
    return NextResponse.json({ available: false, reason: "That handle is taken." });
  }

  return NextResponse.json({ available: true });
}
