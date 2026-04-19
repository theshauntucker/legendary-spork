/**
 * Coda launch — combined credit grant + announcement email.
 *
 * Gated to the admin email header. Walks every confirmed auth user, and for
 * each one:
 *   1. Checks public.credit_bonus_grants — skip if already granted for this slug
 *   2. Grants +1 credit (INSERT user_credits row OR UPDATE existing via RPC)
 *   3. Writes audit row into credit_bonus_grants (the idempotency anchor)
 *   4. Sends the Coda launch announcement email
 *
 * Idempotent by design — safe to rerun. The credit_bonus_grants primary key
 * (user_id, bonus_slug) is the gate.
 *
 * Exclusions:
 *   - 22tucker22@comcast.net (Shaun wants to experience as a real user)
 *   - Any email matched by the admin filter at send-time
 *
 * Supports:
 *   - dryRun=true query param → counts only, no writes, no emails
 *   - limit=N → processes at most N new users (for batching)
 */
import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { sendCodaLaunchEmail } from "@/lib/notifications";

const ADMIN_EMAIL = (process.env.OWNER_EMAIL ?? "22tucker22@comcast.net").toLowerCase();
const BONUS_SLUG = "coda_launch_2026_04";
const EXCLUDE_EMAILS = new Set<string>([ADMIN_EMAIL]);

export const maxDuration = 300; // up to 5 min for larger cohorts

export async function POST(req: Request) {
  const headerEmail = req.headers.get("x-admin-email");
  if (!headerEmail || headerEmail.toLowerCase() !== ADMIN_EMAIL) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  if (!process.env.RESEND_API_KEY) {
    return NextResponse.json(
      { error: "RESEND_API_KEY not configured." },
      { status: 500 },
    );
  }

  const url = new URL(req.url);
  const dryRun = url.searchParams.get("dryRun") === "true";
  const limitRaw = Number(url.searchParams.get("limit") ?? "500");
  const limit = Number.isFinite(limitRaw) && limitRaw > 0 ? Math.min(limitRaw, 1000) : 500;

  const supabase = await createServiceClient();

  // Pull every confirmed auth user (paged). Listed in one pass up to 1000.
  // At our current scale this is a single page; if/when we exceed 1000 this
  // should be reworked to iterate pages.
  const { data: users, error: listErr } = await supabase.auth.admin.listUsers({
    perPage: 1000,
  });
  if (listErr) {
    return NextResponse.json({ error: listErr.message }, { status: 500 });
  }

  // Load already-granted user_ids for this slug so we skip them without
  // relying on insert-conflict errors.
  const { data: alreadyRows } = await supabase
    .from("credit_bonus_grants")
    .select("user_id")
    .eq("bonus_slug", BONUS_SLUG);
  const alreadyGranted = new Set((alreadyRows ?? []).map((r) => r.user_id));

  const allUsers = users.users ?? [];
  const eligible = allUsers.filter((u) => {
    if (!u.email) return false;
    if (EXCLUDE_EMAILS.has(u.email.toLowerCase())) return false;
    if (alreadyGranted.has(u.id)) return false;
    // Require a confirmed email
    if (!u.email_confirmed_at && !u.confirmed_at) return false;
    return true;
  });

  const targets = eligible.slice(0, limit);

  if (dryRun) {
    return NextResponse.json({
      dryRun: true,
      total_users: allUsers.length,
      already_granted: alreadyGranted.size,
      eligible_now: eligible.length,
      would_process: targets.length,
      excluded_emails: Array.from(EXCLUDE_EMAILS),
      bonus_slug: BONUS_SLUG,
    });
  }

  // Pull a first-name hint from profiles for a nicer greeting
  const userIds = targets.map((u) => u.id);
  const { data: profileRows } = userIds.length
    ? await supabase
        .from("profiles")
        .select("user_id, display_name, handle")
        .in("user_id", userIds)
    : { data: [] as Array<{ user_id: string; display_name: string | null; handle: string | null }> };
  const profileByUserId = new Map(
    (profileRows ?? []).map((p) => [p.user_id, p]),
  );

  let granted = 0;
  let emailed = 0;
  let grantFailures = 0;
  let emailFailures = 0;
  const errors: Array<{ userId: string; stage: string; err: string }> = [];

  for (const u of targets) {
    // Skip safety re-check (in case of concurrent runs)
    if (alreadyGranted.has(u.id)) continue;

    // 1. Write the audit row first — primary key collision is the idempotency gate.
    const { error: auditErr } = await supabase
      .from("credit_bonus_grants")
      .insert({
        user_id: u.id,
        bonus_slug: BONUS_SLUG,
        credits_granted: 1,
      });
    if (auditErr) {
      // 23505 = unique violation → someone else claimed it first, skip
      if (auditErr.code !== "23505") {
        grantFailures += 1;
        errors.push({ userId: u.id, stage: "audit", err: auditErr.message });
      }
      continue;
    }

    // 2. Grant +1 credit. If the user has no user_credits row, insert.
    //    Otherwise add_credits RPC.
    const { data: existing } = await supabase
      .from("user_credits")
      .select("user_id")
      .eq("user_id", u.id)
      .maybeSingle();

    if (!existing) {
      const { error: insertErr } = await supabase.from("user_credits").insert({
        user_id: u.id,
        total_credits: 1,
        used_credits: 0,
        is_beta_member: false,
        credit_source: "trial",
      });
      if (insertErr) {
        grantFailures += 1;
        errors.push({ userId: u.id, stage: "insert_credits", err: insertErr.message });
        continue;
      }
    } else {
      const { error: rpcErr } = await supabase.rpc("add_credits", {
        p_user_id: u.id,
        p_credits: 1,
        p_is_beta: false,
      });
      if (rpcErr) {
        grantFailures += 1;
        errors.push({ userId: u.id, stage: "add_credits", err: rpcErr.message });
        continue;
      }
    }
    granted += 1;

    // 3. Send the announcement email (best-effort; a send failure does NOT
    //    roll back the credit — user still got the value).
    const prof = profileByUserId.get(u.id);
    const firstHint =
      prof?.display_name ||
      (u.user_metadata?.first_name as string | undefined) ||
      (u.user_metadata?.name as string | undefined) ||
      null;
    try {
      await sendCodaLaunchEmail(u.email!, firstHint);
      emailed += 1;
    } catch (err) {
      emailFailures += 1;
      errors.push({
        userId: u.id,
        stage: "email",
        err: err instanceof Error ? err.message : String(err),
      });
    }
  }

  return NextResponse.json({
    ok: true,
    dryRun: false,
    bonus_slug: BONUS_SLUG,
    total_users: allUsers.length,
    already_granted_before: alreadyGranted.size,
    eligible_now: eligible.length,
    processed: targets.length,
    granted,
    emailed,
    grant_failures: grantFailures,
    email_failures: emailFailures,
    errors: errors.slice(0, 20), // cap response size
  });
}
