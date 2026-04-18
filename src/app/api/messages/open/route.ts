import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * POST /api/messages/open
 * Body: { profile_id: string }
 * Returns: { conversation_id: string }
 *
 * Opens (or reuses) a 1:1 conversation between the authenticated caller and
 * the target profile. All Tier-2 + block checks happen in the Postgres RPC
 * `public.open_conversation`; this route is a thin wrapper + error mapping.
 */
export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  if (!body || typeof body.profile_id !== "string") {
    return NextResponse.json({ error: "profile_id required" }, { status: 400 });
  }

  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) {
    return NextResponse.json({ error: "sign in" }, { status: 401 });
  }

  const { data, error } = await supabase.rpc("open_conversation", {
    other_profile_id: body.profile_id,
  });

  if (error) {
    const code = error.code;
    // Map Postgres codes to HTTP: auth → 401, permission → 403, bad data → 400
    const status =
      code === "28000" ? 401 : code === "42501" ? 403 : code === "22023" ? 400 : 500;
    return NextResponse.json({ error: error.message }, { status });
  }

  if (!data) {
    return NextResponse.json({ error: "no conversation returned" }, { status: 500 });
  }

  return NextResponse.json({ conversation_id: data });
}
