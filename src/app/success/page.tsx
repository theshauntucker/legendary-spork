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
          const paymentType = "beta_access"; // safe default for recovery
          const isBeta = true;
          const creditsToGrant = BETA_CREDITS;
          await grantCredits(serviceClient, user.id, creditsToGrant, isBeta);
          console.log(
            `Success page: Recovered missing credits for ${user.id}`
          );
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
          const isBeta = paymentType === "beta_access";
          const creditsToGrant = isBeta ? BETA_CREDITS : 1;

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
              amount_cents: session.amount_total || (isBeta ? 999 : 399),
              currency: session.currency || "usd",
              status: "completed",
              credits_granted: creditsToGrant,
            });

          if (insertError) {
            console.error("Success page: Payment insert failed:", insertError.message);
          } else {
            await grantCredits(serviceClient, user.id, creditsToGrant, isBeta);
            console.log(
              `Success page: Granted ${creditsToGrant} credits to ${user.id} (webhook fallback)`
            );
          }
        }
      }
    } catch (err) {
      console.error("Success page: Payment verification failed:", err);
    }
  }

  return <SuccessClient sessionId={sessionId} />;
}
