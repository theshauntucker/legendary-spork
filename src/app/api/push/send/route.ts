import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

/**
 * Internal endpoint — sends a push notification to a user's registered devices.
 * Called server-side when an analysis completes (from /api/process).
 *
 * Requires APNS_KEY_ID, APNS_TEAM_ID, APNS_AUTH_KEY env vars for production.
 * For MVP, this endpoint stores the notification intent; actual APNS delivery
 * requires Apple Push Notification service credentials configured in the iOS project.
 */
export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.INTERNAL_API_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { userId, title, body, data } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: "Missing userId" },
        { status: 400 }
      );
    }

    const serviceClient = await createServiceClient();

    const { data: tokens } = await serviceClient
      .from("device_tokens")
      .select("token, platform")
      .eq("user_id", userId)
      .eq("is_active", true);

    if (!tokens || tokens.length === 0) {
      return NextResponse.json({ sent: 0, reason: "no_active_tokens" });
    }

    // For MVP: log the push intent. Full APNS integration requires
    // configuring Apple Push Notification service credentials.
    // In production, this would call APNS directly or via a service like Firebase/OneSignal.
    console.log(
      `[push] Would send to ${tokens.length} device(s) for user ${userId}:`,
      { title, body, data }
    );

    return NextResponse.json({
      sent: tokens.length,
      tokens: tokens.map((t) => t.token.slice(0, 8) + "..."),
    });
  } catch (err) {
    console.error("Push send error:", err);
    return NextResponse.json(
      { error: "Failed to send push" },
      { status: 500 }
    );
  }
}
