import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { generateBaydaPosts } from "@/lib/bayda-seed-posts";

export const dynamic = "force-dynamic";

/**
 * Bayda daily-posts cron job.
 *
 * Runs once per day (configured in vercel.json). Generates up to 5 Bayda-authored
 * "morning posts" from the current database state and inserts them as public
 * posts authored by the seeded `bayda` system profile. Also writes a
 * `visibility_settings` row per post so the feed query picks them up.
 *
 * Idempotent-ish: the generator always returns 5 entries (some are placeholders
 * that read the same every day). Duplicate bodies would be noisy, so we dedup
 * against any Bayda post created in the last 20 hours before inserting.
 *
 * Auth: Bearer CRON_SECRET. Vercel Cron sets this header automatically when the
 * secret is defined in the project's env vars. Unauthorized requests 401.
 */
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = await createServiceClient();

  // 1) Resolve the Bayda system profile (seeded in migration 011).
  const { data: baydaProfile, error: baydaErr } = await supabase
    .from("profiles")
    .select("id")
    .eq("handle", "bayda")
    .maybeSingle<{ id: string }>();

  if (baydaErr || !baydaProfile) {
    return NextResponse.json(
      { error: "Bayda system profile missing (migration 011 not applied?)" },
      { status: 500 }
    );
  }

  // 2) Generate today's posts from fresh Supabase data.
  const generated = await generateBaydaPosts(supabase);
  if (generated.length === 0) {
    return NextResponse.json({ ok: true, inserted: 0, reason: "no_posts_generated" });
  }

  // 3) Dedup: pull Bayda's last 20h of post bodies and skip any duplicates.
  const dedupSince = new Date(Date.now() - 20 * 60 * 60 * 1000).toISOString();
  const { data: recent } = await supabase
    .from("posts")
    .select("body")
    .eq("profile_id", baydaProfile.id)
    .gte("created_at", dedupSince);
  const recentBodies = new Set<string>((recent ?? []).map((r) => r.body ?? ""));
  const fresh = generated.filter((p) => !recentBodies.has(p.body));

  if (fresh.length === 0) {
    return NextResponse.json({ ok: true, inserted: 0, reason: "all_duplicates" });
  }

  // 4) Insert the posts.
  const { data: inserted, error: insertErr } = await supabase
    .from("posts")
    .insert(
      fresh.map((p) => ({
        profile_id: baydaProfile.id,
        post_type: "text" as const,
        body: p.body,
      }))
    )
    .select("id");

  if (insertErr) {
    return NextResponse.json({ error: insertErr.message }, { status: 500 });
  }

  // 5) Mark each Bayda post public so the fair feed picks them up.
  if (inserted && inserted.length > 0) {
    await supabase.from("visibility_settings").insert(
      inserted.map((row) => ({
        owner_profile_id: baydaProfile.id,
        item_type: "post",
        item_id: row.id,
        visibility: "public",
      }))
    );
  }

  return NextResponse.json({
    ok: true,
    inserted: inserted?.length ?? 0,
    skipped_duplicates: generated.length - fresh.length,
    kinds: fresh.map((p) => p.kind),
  });
}
