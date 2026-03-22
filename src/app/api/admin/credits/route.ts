import { NextRequest, NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

async function verifyAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const adminEmail = process.env.ADMIN_EMAIL;
  if (!adminEmail || user.email !== adminEmail) return null;
  return user;
}

// POST — adjust credits by amount (positive or negative)
export async function POST(request: NextRequest) {
  const admin = await verifyAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  const { userId, amount } = await request.json();
  if (!userId || typeof amount !== "number" || amount === 0) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const serviceClient = await createServiceClient();

  // Upsert user_credits row if it doesn't exist
  const { data: existing } = await serviceClient
    .from("user_credits")
    .select("total_credits, used_credits")
    .eq("user_id", userId)
    .single();

  if (!existing) {
    // Create row first
    await serviceClient.from("user_credits").insert({
      user_id: userId,
      total_credits: Math.max(0, amount),
      used_credits: 0,
      is_beta_member: false,
    });
  } else {
    const newTotal = Math.max(0, existing.total_credits + amount);
    await serviceClient
      .from("user_credits")
      .update({ total_credits: newTotal, updated_at: new Date().toISOString() })
      .eq("user_id", userId);
  }

  return NextResponse.json({ success: true });
}

// PUT — reset credits to exact values
export async function PUT(request: NextRequest) {
  const admin = await verifyAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  const { userId, totalCredits, usedCredits } = await request.json();
  if (!userId || typeof totalCredits !== "number") {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const serviceClient = await createServiceClient();

  const { data: existing } = await serviceClient
    .from("user_credits")
    .select("user_id")
    .eq("user_id", userId)
    .single();

  if (!existing) {
    await serviceClient.from("user_credits").insert({
      user_id: userId,
      total_credits: totalCredits,
      used_credits: usedCredits ?? 0,
      is_beta_member: false,
    });
  } else {
    await serviceClient
      .from("user_credits")
      .update({
        total_credits: totalCredits,
        used_credits: usedCredits ?? 0,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", userId);
  }

  return NextResponse.json({ success: true });
}

