import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

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

    const supabase = await createServiceClient();

    const { data, error } = await supabase
      .from("waitlist")
      .insert({
        email: email.toLowerCase().trim(),
        name: name || "",
        role: role || "parent",
      })
      .select("id")
      .single();

    if (error) {
      // Unique constraint violation = already on waitlist
      if (error.code === "23505") {
        return NextResponse.json(
          { error: "This email is already on the waitlist!", alreadyJoined: true },
          { status: 409 }
        );
      }
      throw error;
    }

    // Get total count for position
    const { count } = await supabase
      .from("waitlist")
      .select("*", { count: "exact", head: true });

    return NextResponse.json({
      success: true,
      position: count ?? 1,
      message: `You're #${count} on the waitlist!`,
      id: data.id,
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
  try {
    const supabase = await createServiceClient();
    const { count } = await supabase
      .from("waitlist")
      .select("*", { count: "exact", head: true });

    return NextResponse.json({ count: count ?? 0 });
  } catch {
    return NextResponse.json({ count: 0 });
  }
}
