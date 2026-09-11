import { NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { notifyNewSignup } from "@/lib/notifications";
import { grantFreeCreditIfNew } from "@/lib/credits";

/** Only same-site relative paths — never let ?next= bounce users off-site. */
function safeNext(raw: string | null): string {
  if (!raw || !raw.startsWith("/") || raw.startsWith("//") || raw.startsWith("/\\")) {
    return "/dashboard";
  }
  return raw;
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = safeNext(searchParams.get("next"));

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const serviceClient = await createServiceClient();

        const isNew = Date.now() - new Date(user.created_at).getTime() < 60_000;
        if (isNew) {
          notifyNewSignup(user.email || "unknown", user.id).catch((err) =>
            console.error("Signup notification failed:", err)
          );
        }

        // Free first analysis (reinstated 2026-09-09). Anyone arriving through
        // an email link without a credits row gets it here, same as /signup.
        // Users who are out of credits are NOT bounced to pricing any more —
        // the dashboard shows the right offer (99¢ intro, then regular).
        await grantFreeCreditIfNew(serviceClient, user.id, user.email).catch((err) =>
          console.error("auth/callback free credit failed:", err)
        );

        if (next === "/dashboard" || next === "/") {
          const { data: profile } = await serviceClient
            .from("profiles")
            .select("profile_type")
            .eq("user_id", user.id)
            .maybeSingle();
          // Studio owners land on the studio board; everyone else on the dashboard.
          if (profile?.profile_type === "studio") {
            return NextResponse.redirect(`${origin}/studio/dashboard`);
          }
          return NextResponse.redirect(`${origin}/dashboard`);
        }
      }

      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // If something went wrong, redirect to login
  return NextResponse.redirect(`${origin}/login`);
}
