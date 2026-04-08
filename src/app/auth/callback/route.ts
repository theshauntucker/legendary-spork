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
      }

      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // If something went wrong, redirect to login
  return NextResponse.redirect(`${origin}/login`);
}
