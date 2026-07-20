import { NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { notifyNewSignup } from "@/lib/notifications";
import { getUserCredits } from "@/lib/credits";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const createdAt = new Date(user.created_at).getTime();
        const isNew = Date.now() - createdAt < 60_000;
        // Create service client early — needed for credit grant and credit check
        const serviceClient = await createServiceClient();

        if (isNew) {
          notifyNewSignup(user.email || "unknown", user.id).catch((err) =>
            console.error("Signup notification failed:", err)
          );
        }

        // Free first analysis REMOVED (2026-06-30): new users must pay before analyzing.
        // Prevents throwaway-email farming of the free credit.

        // Check if user has credits — if not, check for recent payment before redirecting
        const creditStatus = await getUserCredits(
          serviceClient,
          user.id,
          user.email
        );

        if (!creditStatus.hasCredits && !creditStatus.isAdmin) {
          // Before redirecting to pricing, check if there's a recent Stripe payment
          // that the webhook hasn't processed yet (race condition)
          const { data: recentPayment } = await serviceClient
            .from("payments")
            .select("id")
            .eq("user_id", user.id)
            .eq("status", "completed")
            .limit(1)
            .single();

          if (!recentPayment) {
            // No payment found — send to pricing/checkout
            return NextResponse.redirect(`${origin}/#pricing`);
          }
          // Payment exists but credits not yet visible — let them through
        }

        // Role-based shell routing (Meta-style): pick the default product for this user.
        // If the caller passed ?next=, honor that. Otherwise inspect profile.
        if (next === "/dashboard" || next === "/") {
          const { data: profile } = await serviceClient
            .from("profiles")
            .select("profile_type, handle")
            .eq("user_id", user.id)
            .maybeSingle();

          // Coda (social) is hidden as of July 2026 — everyone lands on
          // the analyzer dashboard; studio owners on the studio board.
          // /welcome (Coda onboarding) is intentionally out of the flow.
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
