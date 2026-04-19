/**
 * In-app + web-push notification fan-out.
 *
 * Server-side helper — call from API routes to deliver a notification to a
 * single user. Writes a row to public.notifications (the bell icon feed) and
 * fires a web push (best effort) to every active subscription. Dead endpoints
 * are pruned inline.
 */

import { createServiceClient } from "@/lib/supabase/server";
import { sendPush } from "@/lib/push";

export type NotificationKind =
  | "follow"
  | "comment"
  | "reaction"
  | "bond"
  | "checkin"
  | "thread"
  | "message"
  | "system";

export interface NotifyOptions {
  userId: string;
  kind: NotificationKind;
  title: string;
  body?: string;
  href?: string;
  actorId?: string;
  targetId?: string;
}

export async function notifyUser(opts: NotifyOptions): Promise<void> {
  const service = await createServiceClient();

  const { error: insertErr } = await service.from("notifications").insert({
    user_id: opts.userId,
    kind: opts.kind,
    title: opts.title,
    body: opts.body || null,
    href: opts.href || null,
    actor_id: opts.actorId || null,
    target_id: opts.targetId || null,
  });
  if (insertErr) {
    console.error("notify insert failed:", insertErr);
  }

  const { data: subs } = await service
    .from("push_subscriptions")
    .select("endpoint, p256dh, auth")
    .eq("user_id", opts.userId);

  if (!subs || subs.length === 0) return;

  const dead: string[] = [];
  await Promise.all(
    subs.map(async (s) => {
      const res = await sendPush(
        { endpoint: s.endpoint, p256dh: s.p256dh, auth: s.auth },
        {
          title: opts.title,
          body: opts.body,
          href: opts.href,
          tag: opts.kind,
        }
      );
      if (!res.ok && res.gone) dead.push(s.endpoint);
    })
  );

  if (dead.length) {
    await service.from("push_subscriptions").delete().in("endpoint", dead);
  }
}
