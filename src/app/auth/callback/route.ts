import { NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { notifyNewSignup } from "@/lib/notifications";
import { getUserCredits, grantCredits } from "@/lib/credits";

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

        // Grant free credit if this user has NO credits record yet.
        // Intentionally NOT tied to isNew — email confirmation can take minutes,
        // so the 60s window was silently failing for almost everyone.
        // Idempotent: if a credits row already exists (paid or previously granted), skip.
        const { data: existingCredits } = await serviceClient
          .from("user_credits")
          .select("user_id")
          .eq("user_id", user.id)
          .maybeSingle();

        if (!existingCredits) {
          try {
            await grantCredits(serviceClient, user.id, 1, false);
          } catch (err) {
            console.error("Free credit grant failed:", err);
          }
        }

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

          if (!profile) {
            return NextResponse.redirect(`${origin}/welcome`);
          }

          // Studio owners land on the studio dashboard.
          if (profile.profile_type === "studio") {
            return NextResponse.redirect(`${origin}/studio/dashboard`);
          }
          // Everyone else (dancer, parent, choreographer) lands on Coda feed.
          return NextResponse.redirect(`${origin}/home`);
        }
      }

      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // If something went wrong, redirect to login
  return NextResponse.redirect(`${origin}/login`);
}
