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

// GET — list all affiliates
export async function GET() {
  const admin = await verifyAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  const serviceClient = await createServiceClient();
  const { data: affiliates, error } = await serviceClient
    .from("affiliates")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ affiliates: affiliates ?? [] });
}

// POST — create a new affiliate
export async function POST(request: NextRequest) {
  const admin = await verifyAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  const body = await request.json();
  const { code, name, email, revenueSharePct, notes } = body;

  if (!code || !name) {
    return NextResponse.json({ error: "Code and name are required" }, { status: 400 });
  }

  const serviceClient = await createServiceClient();

  // Check for duplicate code
  const { data: existing } = await serviceClient
    .from("affiliates")
    .select("id")
    .eq("code", code.toUpperCase())
    .maybeSingle();

  if (existing) {
    return NextResponse.json({ error: "Affiliate code already exists" }, { status: 409 });
  }

  const { data: affiliate, error } = await serviceClient
    .from("affiliates")
    .insert({
      code: code.toUpperCase().replace(/[^A-Z0-9_-]/g, ""),
      name,
      email: email || null,
      revenue_share_pct: revenueSharePct ?? 20,
      notes: notes || null,
      status: "active",
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ affiliate });
}

// PUT — update an affiliate
export async function PUT(request: NextRequest) {
  const admin = await verifyAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  const body = await request.json();
  const { id, name, email, revenueSharePct, status, notes, totalPayoutCents } = body;

  if (!id) {
    return NextResponse.json({ error: "Affiliate ID is required" }, { status: 400 });
  }

  const serviceClient = await createServiceClient();

  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (name !== undefined) updates.name = name;
  if (email !== undefined) updates.email = email;
  if (revenueSharePct !== undefined) updates.revenue_share_pct = revenueSharePct;
  if (status !== undefined) updates.status = status;
  if (notes !== undefined) updates.notes = notes;
  if (totalPayoutCents !== undefined) updates.total_payout_cents = totalPayoutCents;

  const { error } = await serviceClient
    .from("affiliates")
    .update(updates)
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

// DELETE — remove an affiliate
export async function DELETE(request: NextRequest) {
  const admin = await verifyAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "Affiliate ID is required" }, { status: 400 });
  }

  const serviceClient = await createServiceClient();
  const { error } = await serviceClient
    .from("affiliates")
    .delete()
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
