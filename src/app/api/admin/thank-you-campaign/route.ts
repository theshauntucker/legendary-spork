import { NextRequest, NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { isAdmin } from "@/lib/credits";
import { isInternalRequest } from "@/lib/internal-auth";
import { sendThankYouCreditEmail } from "@/lib/notifications";

export const dynamic = "force-dynamic";
export const maxDuration = 120;

/**
 * POST /api/admin/thank-you-campaign
 *
 * September 2026 "thank you + free analysis" campaign, sent from Shaun.
 *
 * Auth: admin session (ADMIN_EMAIL) OR the x-routinex-internal secret.
 *
 * Body:
 *   { mode: "preview" }                 → recipient list + counts, sends nothing
 *   { mode: "test", testTo: "you@x" }   → one email to testTo, no credit grant
 *   { mode: "send", limit?: 40 }        → for each recipient not yet sent:
 *                                          +1 credit (topped up so ≥1 is usable),
 *                                          log in user_email_sends, send email.
 *                                          Returns `remaining` — call again until 0.
 *
 * Idempotent per user via user_email_sends(email_kind = EMAIL_KIND).
 */
const EMAIL_KIND = "thank_you_credit_2026_09";
const DELAY_MS = 600; // Resend default throttle is 2 req/s

type Recipient = {
  userId: string;
  email: string;
  firstName: string | null;
  total: number;
  used: number;
  hasRow: boolean;
};

async function authorize(request: NextRequest): Promise<boolean> {
  if (isInternalRequest(request)) return true;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return !!user && isAdmin(user.email);
}

async function loadRecipients(): Promise<Recipient[]> {
  const svc = await createServiceClient();
  const adminEmail = (process.env.ADMIN_EMAIL || "22tucker22@comcast.net").toLowerCase();

  const { data: userPage, error } = await svc.auth.admin.listUsers({ perPage: 1000 });
  if (error) throw new Error(`listUsers failed: ${error.message}`);

  const [{ data: sends }, { data: credits }, { data: testProfiles }] = await Promise.all([
    svc.from("user_email_sends").select("user_id").eq("email_kind", EMAIL_KIND),
    svc.from("user_credits").select("user_id, total_credits, used_credits"),
    svc.from("profiles").select("user_id").eq("is_test", true),
  ]);
  const alreadySent = new Set((sends ?? []).map((s) => s.user_id));
  const testIds = new Set((testProfiles ?? []).map((p) => p.user_id));
  const creditById = new Map(
    (credits ?? []).map((c) => [c.user_id, { total: c.total_credits ?? 0, used: c.used_credits ?? 0 }])
  );

  const out: Recipient[] = [];
  for (const u of userPage.users ?? []) {
    const email = (u.email || "").toLowerCase();
    if (!email || email === adminEmail) continue;
    if (alreadySent.has(u.id) || testIds.has(u.id)) continue;
    const c = creditById.get(u.id);
    const meta = (u.user_metadata ?? {}) as { full_name?: string; name?: string };
    out.push({
      userId: u.id,
      email,
      firstName: (meta.full_name || meta.name || "").split(" ")[0] || null,
      total: c?.total ?? 0,
      used: c?.used ?? 0,
      hasRow: !!c,
    });
  }
  out.sort((a, b) => a.email.localeCompare(b.email));
  return out;
}

/** +1, topped up so the account ends with at least one usable credit. */
function grantAmount(r: Recipient): number {
  const remaining = r.total - r.used;
  return remaining >= 0 ? 1 : 1 - remaining; // overdrawn rows (total < used) get lifted to +1
}

export async function POST(request: NextRequest) {
  if (!(await authorize(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }
  const body = (await request.json().catch(() => ({}))) as {
    mode?: string;
    testTo?: string;
    limit?: number;
  };
  const mode = body.mode || "preview";

  if (mode === "test") {
    if (!body.testTo) return NextResponse.json({ error: "testTo required" }, { status: 400 });
    await sendThankYouCreditEmail(body.testTo, { firstName: "Shaun", creditsAvailable: 1 });
    return NextResponse.json({ ok: true, sentTo: body.testTo });
  }

  const recipients = await loadRecipients();

  if (mode === "preview") {
    return NextResponse.json({
      mode,
      count: recipients.length,
      recipients: recipients.map((r) => ({
        email: r.email,
        firstName: r.firstName,
        creditsNow: r.total - r.used,
        willGrant: grantAmount(r),
      })),
    });
  }

  if (mode !== "send") return NextResponse.json({ error: "Unknown mode" }, { status: 400 });

  const limit = Math.max(1, Math.min(200, Number(body.limit) || 40));
  const batch = recipients.slice(0, limit);
  const svc = await createServiceClient();
  const results: Array<{ email: string; granted: number; ok: boolean; error?: string }> = [];

  for (const r of batch) {
    const amount = grantAmount(r);
    try {
      // 1. Credit — insert for accounts with no row, atomic RPC otherwise.
      if (!r.hasRow) {
        const { error } = await svc.from("user_credits").insert({
          user_id: r.userId,
          total_credits: amount,
          used_credits: 0,
          is_beta_member: false,
          credit_source: "gift",
        });
        if (error && error.code !== "23505") throw new Error(`insert: ${error.message}`);
        if (error?.code === "23505") {
          const { error: rpcErr } = await svc.rpc("add_credits", {
            p_user_id: r.userId,
            p_credits: amount,
            p_is_beta: false,
          });
          if (rpcErr) throw new Error(`add_credits: ${rpcErr.message}`);
        }
      } else {
        const { error: rpcErr } = await svc.rpc("add_credits", {
          p_user_id: r.userId,
          p_credits: amount,
          p_is_beta: false,
        });
        if (rpcErr) throw new Error(`add_credits: ${rpcErr.message}`);
      }

      // 2. Mark sent BEFORE sending so a retry can never double-grant.
      const { error: logErr } = await svc
        .from("user_email_sends")
        .insert({ user_id: r.userId, email_kind: EMAIL_KIND, sent_at: new Date().toISOString() });
      if (logErr) throw new Error(`user_email_sends: ${logErr.message}`);

      // 3. Email — say the real number they can use right now.
      const creditsAvailable = Math.max(1, r.total - r.used + amount);
      await sendThankYouCreditEmail(r.email, { firstName: r.firstName, creditsAvailable });

      results.push({ email: r.email, granted: amount, ok: true });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`thank-you-campaign: ${r.email} failed: ${msg}`);
      results.push({ email: r.email, granted: 0, ok: false, error: msg });
    }
    await new Promise((res) => setTimeout(res, DELAY_MS));
  }

  return NextResponse.json({
    mode,
    processed: results.length,
    succeeded: results.filter((x) => x.ok).length,
    failed: results.filter((x) => !x.ok),
    remaining: recipients.length - batch.length,
    results,
  });
}
