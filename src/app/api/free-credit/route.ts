import { NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

// POST — grant 1 free credit to a new user (only works once per account)
export async function POST() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const serviceClient = await createServiceClient();

    // Check if user already has a credit record (meaning they already got free credit or purchased)
    const { data: existing } = await serviceClient
      .from("user_credits")
      .select("user_id, total_credits")
      .eq("user_id", user.id)
      .maybeSingle();

    if (existing && existing.total_credits > 0) {
      // Already has credits — don't double-grant
      return NextResponse.json({ success: true, alreadyGranted: true });
    }

    if (!existing) {
      // Create new credit record with 1 free credit
      const { error } = await serviceClient
        .from("user_credits")
        .insert({
          user_id: user.id,
          total_credits: 1,
          used_credits: 0,
          is_beta_member: false,
        });

      if (error && error.code !== "23505") {
        console.error("Free credit insert failed:", error);
        return NextResponse.json({ error: "Failed to grant credit" }, { status: 500 });
      }
    } else {
      // Row exists but 0 credits — grant 1
      const { error } = await serviceClient
        .from("user_credits")
        .update({
          total_credits: 1,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", user.id);

      if (error) {
        console.error("Free credit update failed:", error);
        return NextResponse.json({ error: "Failed to grant credit" }, { status: 500 });
      }
    }

    return NextResponse.json({ success: true, credited: 1 });
  } catch (err) {
    console.error("Free credit error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
