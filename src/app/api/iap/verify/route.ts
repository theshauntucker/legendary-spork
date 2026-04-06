import { NextRequest, NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { grantCredits } from "@/lib/credits";

export const dynamic = "force-dynamic";

// Product ID → credits mapping (must match App Store Connect)
const PRODUCT_CREDITS: Record<string, { credits: number; paymentType: string }> =
  {
    routinex_single: { credits: 1, paymentType: "iap_single" },
    routinex_pack: { credits: 5, paymentType: "iap_pack" },
  };

/**
 * POST /api/iap/verify
 *
 * Validates an Apple In-App Purchase receipt and grants credits.
 * Called by the mobile app after a successful IAP transaction.
 *
 * Flow:
 * 1. Mobile app completes Apple IAP purchase
 * 2. App sends receipt + productId + transactionId here
 * 3. We validate the receipt with Apple's verifyReceipt API
 * 4. If valid, we grant credits using the same grantCredits() function
 *    that the Stripe webhook uses
 * 5. We record the payment in the payments table
 * 6. App finishes the transaction with Apple
 */
export async function POST(request: NextRequest) {
  try {
    // Get authenticated user
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const body = await request.json();
    const { receipt, productId, transactionId } = body;

    if (!receipt || !productId || !transactionId) {
      return NextResponse.json(
        { error: "Missing receipt, productId, or transactionId" },
        { status: 400 }
      );
    }

    // Validate product ID
    const productConfig = PRODUCT_CREDITS[productId];
    if (!productConfig) {
      return NextResponse.json(
        { error: "Invalid product ID" },
        { status: 400 }
      );
    }

    const serviceClient = await createServiceClient();

    // Check for duplicate transaction (prevent replay attacks)
    const { data: existingPayment } = await serviceClient
      .from("payments")
      .select("id")
      .eq("stripe_session_id", `iap_${transactionId}`)
      .maybeSingle();

    if (existingPayment) {
      // Already processed this transaction — return success without double-granting
      return NextResponse.json({
        verified: true,
        alreadyProcessed: true,
        credits_granted: productConfig.credits,
      });
    }

    // Validate receipt with Apple
    const isValid = await validateAppleReceipt(receipt, productId);
    if (!isValid) {
      return NextResponse.json(
        { error: "Receipt validation failed" },
        { status: 400 }
      );
    }

    // Record the payment (using stripe_session_id column for IAP transaction ID)
    const { error: paymentError } = await serviceClient
      .from("payments")
      .insert({
        user_id: user.id,
        stripe_session_id: `iap_${transactionId}`,
        stripe_payment_intent: null,
        payment_type: productConfig.paymentType,
        amount_cents: productId === "routinex_pack" ? 2999 : 899,
        currency: "usd",
        status: "completed",
        credits_granted: productConfig.credits,
      });

    if (paymentError && paymentError.code !== "23505") {
      console.error("IAP payment insert failed:", paymentError.message);
    }

    // Grant credits using the same function Stripe uses
    await grantCredits(
      serviceClient,
      user.id,
      productConfig.credits,
      false // not a beta purchase
    );

    console.log(
      `IAP verified: Granted ${productConfig.credits} credits to ${user.id} (${productConfig.paymentType}, txn: ${transactionId})`
    );

    return NextResponse.json({
      verified: true,
      credits_granted: productConfig.credits,
    });
  } catch (err) {
    console.error("IAP verify error:", err);
    return NextResponse.json(
      { error: "Verification failed" },
      { status: 500 }
    );
  }
}

/**
 * Validate an Apple receipt with Apple's verifyReceipt API.
 * Tries production first, falls back to sandbox (Apple's recommended approach).
 */
async function validateAppleReceipt(
  receiptData: string,
  expectedProductId: string
): Promise<boolean> {
  const sharedSecret = process.env.APPLE_SHARED_SECRET;

  // If no shared secret is configured, log warning but allow in development
  if (!sharedSecret) {
    console.warn(
      "APPLE_SHARED_SECRET not set — skipping Apple receipt validation. Set this in production!"
    );
    // In development/testing, allow purchases through without Apple validation
    // In production, this MUST be set
    return process.env.NODE_ENV !== "production";
  }

  const requestBody = {
    "receipt-data": receiptData,
    password: sharedSecret,
    "exclude-old-transactions": true,
  };

  // Try production endpoint first
  let response = await fetch(
    "https://buy.itunes.apple.com/verifyReceipt",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestBody),
    }
  );

  let result = await response.json();

  // Status 21007 means this receipt is from the sandbox environment
  if (result.status === 21007) {
    response = await fetch(
      "https://sandbox.itunes.apple.com/verifyReceipt",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      }
    );
    result = await response.json();
  }

  // Status 0 = valid receipt
  if (result.status !== 0) {
    console.error("Apple receipt validation failed with status:", result.status);
    return false;
  }

  // Verify the receipt contains the expected product
  const inApp = result.receipt?.in_app || [];
  const hasProduct = inApp.some(
    (item: { product_id: string }) => item.product_id === expectedProductId
  );

  if (!hasProduct) {
    console.error(
      "Receipt does not contain expected product:",
      expectedProductId
    );
    return false;
  }

  return true;
}
