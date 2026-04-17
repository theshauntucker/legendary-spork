import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { buildLaunchEmail } from "@/lib/launch-email";

const ADMIN_EMAIL = process.env.OWNER_EMAIL ?? "22tucker22@comcast.net";

export async function POST(req: Request) {
  const headerEmail = req.headers.get("x-admin-email");
  if (headerEmail !== ADMIN_EMAIL) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  if (!process.env.RESEND_API_KEY) {
    return NextResponse.json({ error: "RESEND_API_KEY not configured." }, { status: 500 });
  }

  const supabase = await createServiceClient();
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, handle, founding_member, user_id");

  if (!profiles?.length) return NextResponse.json({ sent: 0 });

  const ids = profiles.map((p) => p.user_id).filter((x): x is string => !!x);
  const { data: users } = await supabase.auth.admin.listUsers({ perPage: 1000 });
  const emailByUserId = new Map<string, string>();
  for (const u of users.users ?? []) {
    if (u.email && ids.includes(u.id)) emailByUserId.set(u.id, u.email);
  }

  let sent = 0;
  for (const profile of profiles) {
    const email = profile.user_id ? emailByUserId.get(profile.user_id) : null;
    if (!email) continue;
    const { subject, html, text } = buildLaunchEmail({
      handle: profile.handle,
      foundingMember: !!profile.founding_member,
    });
    try {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "RoutineX <noreply@routinex.org>",
          to: email,
          subject,
          html,
          text,
        }),
      });
      if (res.ok) sent += 1;
    } catch {
      // skip this user
    }
  }

  return NextResponse.json({ sent });
}
