import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { token, platform } = await request.json();

    if (!token || typeof token !== "string") {
      return NextResponse.json(
        { error: "Missing device token" },
        { status: 400 }
      );
    }

    const { error } = await supabase.from("device_tokens").upsert(
      {
        user_id: user.id,
        token,
        platform: platform || "ios",
        is_active: true,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id,token" }
    );

    if (error) {
      console.error("Device token registration failed:", error.message);
      return NextResponse.json(
        { error: "Failed to register token" },
        { status: 500 }
      );
    }

    return NextResponse.json({ registered: true });
  } catch (err) {
    console.error("Push registration error:", err);
    return NextResponse.json(
      { error: "Failed to register token" },
      { status: 500 }
    );
  }
}
