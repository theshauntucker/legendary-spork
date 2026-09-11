import { NextRequest, NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { grantCredits } from "@/lib/credits";

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

  if (amount > 0) {
    // Gifts never expire — grantCredits routes them into carryover on a
    // subscription row, or revives an expired subscription row as a pack row.
    await grantCredits(serviceClient, userId, amount, false);
    return NextResponse.json({ success: true });
  }

  // Negative adjustment: take from never-expiring carryover first, then the pool.
  const { data: existing } = await serviceClient
    .from("user_credits")
    .select("total_credits, used_credits, carryover_credits")
    .eq("user_id", userId)
    .maybeSingle();
  if (existing) {
    let remove = -amount;
    const carry = existing.carryover_credits ?? 0;
    const fromCarry = Math.min(carry, remove);
    remove -= fromCarry;
    await serviceClient
      .from("user_credits")
      .update({
        carryover_credits: carry - fromCarry,
        total_credits: Math.max(0, existing.total_credits - remove),
        updated_at: new Date().toISOString(),
      })
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
    // An exact reset turns the row into a plain never-expiring pack row.
    await serviceClient
      .from("user_credits")
      .update({
        total_credits: totalCredits,
        used_credits: usedCredits ?? 0,
        carryover_credits: 0,
        credit_source: "pack",
        expires_at: null,
        billing_period_start: null,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", userId);
  }

  return NextResponse.json({ success: true });
}

