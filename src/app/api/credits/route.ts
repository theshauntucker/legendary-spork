import { NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { getUserCredits, isIntroOfferEligible, grantFreeCreditIfNew } from "@/lib/credits";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const serviceClient = await createServiceClient();
    // Free first analysis safety net (signup call may have been dropped).
    await grantFreeCreditIfNew(serviceClient, user.id, user.email).catch(() => {});
    const credits = await getUserCredits(serviceClient, user.id, user.email);
    // Lets the upload page show the right next price (99¢ intro vs $1.99)
    // BEFORE the parent fills out the whole form.
    const introEligible = credits.hasCredits
      ? false
      : await isIntroOfferEligible(serviceClient, user.id, user.email);

    return NextResponse.json({ ...credits, introEligible });
  } catch (err) {
    console.error("Credits API error:", err);
    return NextResponse.json(
      { error: "Failed to fetch credits" },
      { status: 500 }
    );
  }
}
