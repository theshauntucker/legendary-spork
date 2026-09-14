import { NextRequest, NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

async function verifyAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const adminEmail = process.env.ADMIN_EMAIL;
  if (!adminEmail || user.email?.toLowerCase() !== adminEmail.toLowerCase()) return null;
  return user;
}

/** POST { id, approved } — publish or unpublish a captured testimonial. */
export async function POST(request: NextRequest) {
  const admin = await verifyAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  const { id, approved } = (await request.json().catch(() => ({}))) as {
    id?: string;
    approved?: boolean;
  };
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const serviceClient = await createServiceClient();
  const { error } = await serviceClient
    .from("testimonials")
    .update({ approved: !!approved })
    .eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
