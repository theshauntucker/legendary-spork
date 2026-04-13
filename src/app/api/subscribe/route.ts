import { NextRequest, NextResponse } from "next/server";

const subscribers = new Set<string>();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { error: "Email is required." },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Please enter a valid email address." },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    if (subscribers.has(normalizedEmail)) {
      return NextResponse.json(
        { message: "You're already subscribed! We'll keep you updated." },
        { status: 200 }
      );
    }

    subscribers.add(normalizedEmail);

    // TODO: Replace with Supabase insert when database is ready
    console.log(`[subscribe] New subscriber: ${normalizedEmail}`);

    return NextResponse.json(
      { message: "You're subscribed! Check your inbox for a welcome email." },
      { status: 200 }
    );
  } catch {
    return NextResponse.json(
      { error: "Invalid request body." },
      { status: 400 }
    );
  }
}
