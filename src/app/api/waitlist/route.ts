import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// In-memory waitlist store (persists across requests in the same serverless instance)
// For production, replace with a database (Supabase, PlanetScale, etc.)
const waitlistEntries: Array<{ email: string; name: string; role: string; joinedAt: string }> = [];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, name, role } = body;

    if (!email || !email.includes("@")) {
      return NextResponse.json(
        { error: "Please enter a valid email address." },
        { status: 400 }
      );
    }

    // Check for duplicates
    if (waitlistEntries.some((entry) => entry.email.toLowerCase() === email.toLowerCase())) {
      return NextResponse.json(
        { error: "This email is already on the waitlist!", alreadyJoined: true },
        { status: 409 }
      );
    }

    waitlistEntries.push({
      email: email.toLowerCase().trim(),
      name: name || "",
      role: role || "parent",
      joinedAt: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      position: waitlistEntries.length,
      message: `You're #${waitlistEntries.length} on the waitlist!`,
    });
  } catch (err) {
    console.error("Waitlist error:", err);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({ count: waitlistEntries.length });
}
