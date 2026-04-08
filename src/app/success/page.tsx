import { redirect } from "next/navigation";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { grantCredits, hasCreditsInDb, BETA_CREDITS } from "@/lib/credits";
import { getStripe } from "@/lib/stripe";
import SuccessClient from "./SuccessClient";

export default async function SuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const params = await searchParams;
  const sessionId =
    typeof params.session_id === "string" ? params.session_id : undefined;

  // Verify payment with Stripe and grant credits as webhook fallback
  if (sessionId) {
    try {
      const serviceClient = await createServiceClient();

      const { data: existingPayment } = await serviceClient
        .from("payments")
        .select("id")
        .eq("stripe_session_id", sessionId)
        .maybeSingle();

      if (existingPayment) {
        // Payment recorded — but were credits actually granted?
        const hasCredits = await hasCreditsInDb(serviceClient, user.id);
        if (!hasCredits) {
          // Look up the actual payment to grant the correct number of credits
          const { data: paymentRow } = await serviceClient
            .from("payments")
            .select("payment_type, credits_granted")
            .eq("stripe_session_id", sessionId)
            .maybeSingle();
          const recoveryType = paymentRow?.payment_type || "beta_access";
          const isBetaRecovery = recoveryType === "beta_access";
          const recoveryCredits =
            paymentRow?.credits_granted ||
            (isBetaRecovery ? BETA_CREDITS : recoveryType === "video_analysis" ? 5 : 1);
          await grantCredits(serviceClient, user.id, recoveryCredits, isBetaRecovery);
          console.log(`Success page: Recovered ${recoveryCredits} missing credits for ${user.id}`);
        }
      } else {
        // Not yet processed by webhook — verify with Stripe and grant credits
        const stripe = getStripe();
        const session = await stripe.checkout.sessions.retrieve(sessionId);

        if (
          session.payment_status === "paid" &&
          session.metadata?.user_id === user.id
        ) {
          const paymentType =
            session.metadata?.payment_type || "beta_access";
          const referralCode = session.metadata?.referral_code || null;
          const isBeta = paymentType === "beta_access";
          const isPack = paymentType === "video_analysis";
          const creditsToGrant = isBeta ? BETA_CREDITS : isPack ? 5 : 1;
          const amountFallback = isPack ? 2999 : isBeta ? 999 : 899;

          const { error: insertError } = await serviceClient
            .from("payments")
            .insert({
              user_id: user.id,
              stripe_session_id: sessionId,
              stripe_payment_intent:
                typeof session.payment_intent === "string"
                  ? session.payment_intent
                  : null,
              payment_type: paymentType,
              amount_cents: session.amount_total || amountFallback,
              currency: session.currency || "usd",
              status: "completed",
              credits_granted: creditsToGrant,
              referral_code: referralCode,
            });

          if (insertError && insertError.code !== "23505") {
            console.error("Success page: Payment insert failed:", insertError.message);
          }

          // Always try to grant credits — even if payment insert was a duplicate.
          await grantCredits(serviceClient, user.id, creditsToGrant, isBeta);
          console.log(
            `Success page: Granted ${creditsToGrant} credits to ${user.id} (${paymentType} — webhook fallback)`
          );
        }
      }
    } catch (err) {
      console.error("Success page: Payment verification failed:", err);
    }
  }

  return <SuccessClient sessionId={sessionId} />;
}
