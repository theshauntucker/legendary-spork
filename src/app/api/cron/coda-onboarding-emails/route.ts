/**
 * Coda onboarding email dispatcher — hourly cron.
 *
 * Two lifecycle touches (both separate from the first-purchase welcome):
 *
 *   1. Coda welcome (T+1hr) — sent ~1 hour after signup. Frames Coda and
 *      points the user at three concrete first moves.
 *
 *   2. Profile-completion nudge (T+24hr) — sent ~24 hours after signup IF
 *      the user hasn't completed core profile moves (handle, aura, bio,
 *      first analysis).
 *
 * Idempotency: audited through the `user_email_sends` table with a
 * (user_id, email_kind) primary key. Safe to rerun; already-sent users are
 * skipped.
 *
 * Auth: CRON_SECRET bearer header, same pattern as our other crons.
 */
import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import {
  sendCodaWelcomeEmail,
  sendProfileCompletionNudge,
} from "@/lib/notifications";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

const KIND_WELCOME = "coda_welcome_v1";
const KIND_NUDGE = "coda_profile_nudge_v1";

// Windows: we run hourly, so pick users whose signup landed in the previous
// hour-window to avoid missing anyone when the cron fires slightly late.
//
// Welcome: 60-180 minutes ago (1-3h window)
// Nudge:   1440-1560 minutes ago (24-26h window)
const WELCOME_MIN_MIN = 60;
const WELCOME_MAX_MIN = 180;
const NUDGE_MIN_MIN = 24 * 60;
const NUDGE_MAX_MIN = 24 * 60 + 120;

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!process.env.RESEND_API_KEY) {
    return NextResponse.json({ error: "RESEND_API_KEY not configured" }, { status: 500 });
  }

  const supabase = await createServiceClient();

  // -------------------------------------------------------------------------
  // Pull auth users, filter in-memory for the two windows. At our current
  // scale this is one page. When we outgrow 1000 auth users we should move
  // to a SQL-side filter on the sign-in timestamps.
  // -------------------------------------------------------------------------
  const { data: usersResp, error: listErr } = await supabase.auth.admin.listUsers({
    perPage: 1000,
  });
  if (listErr) {
    return NextResponse.json({ error: listErr.message }, { status: 500 });
  }
  const users = usersResp.users ?? [];
  const nowMs = Date.now();

  const inWindow = (createdAt: string | null, minMin: number, maxMin: number) => {
    if (!createdAt) return false;
    const t = new Date(createdAt).getTime();
    if (!Number.isFinite(t)) return false;
    const ageMin = (nowMs - t) / 60000;
    return ageMin >= minMin && ageMin <= maxMin;
  };

  const welcomeCandidates = users.filter(
    (u) => u.email && inWindow(u.created_at ?? null, WELCOME_MIN_MIN, WELCOME_MAX_MIN),
  );
  const nudgeCandidates = users.filter(
    (u) => u.email && inWindow(u.created_at ?? null, NUDGE_MIN_MIN, NUDGE_MAX_MIN),
  );

  // Pull already-sent audit rows for both kinds in one round-trip.
  const relevantIds = Array.from(
    new Set([...welcomeCandidates, ...nudgeCandidates].map((u) => u.id)),
  );
  const { data: sentRows } = relevantIds.length
    ? await supabase
        .from("user_email_sends")
        .select("user_id, email_kind")
        .in("user_id", relevantIds)
        .in("email_kind", [KIND_WELCOME, KIND_NUDGE])
    : { data: [] as Array<{ user_id: string; email_kind: string }> };
  const sentSet = new Set(
    (sentRows ?? []).map((r) => `${r.user_id}::${r.email_kind}`),
  );

  // Profiles lookup for first-name hint + completion-check fields
  const { data: profileRows } = relevantIds.length
    ? await supabase
        .from("profiles")
        .select("user_id, display_name, handle, bio, aura_preset")
        .in("user_id", relevantIds)
    : {
        data: [] as Array<{
          user_id: string;
          display_name: string | null;
          handle: string | null;
          bio: string | null;
          aura_preset: string | null;
        }>,
      };
  const profileByUserId = new Map((profileRows ?? []).map((p) => [p.user_id, p]));

  // Analyses lookup for "has run first analysis" check
  const { data: analysisRows } = relevantIds.length
    ? await supabase
        .from("analyses")
        .select("user_id")
        .in("user_id", relevantIds)
    : { data: [] as Array<{ user_id: string }> };
  const hasAnalysis = new Set((analysisRows ?? []).map((r) => r.user_id));

  let welcomeSent = 0;
  let welcomeFailed = 0;
  let nudgeSent = 0;
  let nudgeSkipped = 0;
  let nudgeFailed = 0;
  const errors: Array<{ userId: string; kind: string; err: string }> = [];

  // ---- T+1hr welcome -------------------------------------------------------
  for (const u of welcomeCandidates) {
    if (sentSet.has(`${u.id}::${KIND_WELCOME}`)) continue;

    // Audit-first pattern: insert the row, PK collision = idempotent skip.
    const { error: auditErr } = await supabase.from("user_email_sends").insert({
      user_id: u.id,
      email_kind: KIND_WELCOME,
    });
    if (auditErr) {
      if (auditErr.code === "23505") continue; // already sent, fine
      errors.push({ userId: u.id, kind: KIND_WELCOME, err: auditErr.message });
      welcomeFailed += 1;
      continue;
    }

    const prof = profileByUserId.get(u.id);
    const hint =
      prof?.display_name ||
      (u.user_metadata?.first_name as string | undefined) ||
      (u.user_metadata?.name as string | undefined) ||
      null;
    try {
      await sendCodaWelcomeEmail(u.email!, hint);
      welcomeSent += 1;
    } catch (err) {
      welcomeFailed += 1;
      errors.push({
        userId: u.id,
        kind: KIND_WELCOME,
        err: err instanceof Error ? err.message : String(err),
      });
    }
  }

  // ---- T+24hr completion nudge --------------------------------------------
  for (const u of nudgeCandidates) {
    if (sentSet.has(`${u.id}::${KIND_NUDGE}`)) continue;

    const prof = profileByUserId.get(u.id);
    const needsHandle = !prof?.handle;
    const needsBio = !(prof?.bio && prof.bio.trim().length > 0);
    const needsAura = !prof?.aura_preset;
    const needsAnalysis = !hasAnalysis.has(u.id);

    const missingCount =
      (needsHandle ? 1 : 0) +
      (needsBio ? 1 : 0) +
      (needsAura ? 1 : 0) +
      (needsAnalysis ? 1 : 0);
    if (missingCount === 0) {
      nudgeSkipped += 1;
      continue;
    }

    const { error: auditErr } = await supabase.from("user_email_sends").insert({
      user_id: u.id,
      email_kind: KIND_NUDGE,
    });
    if (auditErr) {
      if (auditErr.code === "23505") continue;
      errors.push({ userId: u.id, kind: KIND_NUDGE, err: auditErr.message });
      nudgeFailed += 1;
      continue;
    }

    const hint =
      prof?.display_name ||
      (u.user_metadata?.first_name as string | undefined) ||
      (u.user_metadata?.name as string | undefined) ||
      null;
    try {
      await sendProfileCompletionNudge(u.email!, hint, {
        needsHandle,
        needsBio,
        needsAura,
        needsAnalysis,
      });
      nudgeSent += 1;
    } catch (err) {
      nudgeFailed += 1;
      errors.push({
        userId: u.id,
        kind: KIND_NUDGE,
        err: err instanceof Error ? err.message : String(err),
      });
    }
  }

  return NextResponse.json({
    ok: true,
    now: new Date().toISOString(),
    welcome_candidates: welcomeCandidates.length,
    welcome_sent: welcomeSent,
    welcome_failed: welcomeFailed,
    nudge_candidates: nudgeCandidates.length,
    nudge_sent: nudgeSent,
    nudge_skipped_completed: nudgeSkipped,
    nudge_failed: nudgeFailed,
    errors: errors.slice(0, 20),
  });
}
