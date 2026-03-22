import { NextRequest, NextResponse } from "next/server";
import { notifyNewSignup } from "@/lib/notifications";

export const dynamic = "force-dynamic";

// Generic admin notification endpoint — called from client-side flows
// where server-side notification isn't possible (e.g. email/password signup)
export async function POST(request: NextRequest) {
  try {
    const { type, email, name } = await request.json();

    if (type === "signup" && email) {
      await notifyNewSignup(email, name || "Unknown");
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: true }); // never fail
  }
}
