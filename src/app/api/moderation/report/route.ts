import { NextRequest, NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { notifyAdminReport } from "@/lib/notifications";

const VALID_KINDS = new Set([
  "user", "post", "comment", "message", "studio", "choreographer", "thread", "video",
]);

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  let body: { target_kind?: string; target_id?: string; reason?: string };
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }

  const kind = typeof body.target_kind === "string" ? body.target_kind : "";
  const target = typeof body.target_id === "string" ? body.target_id : "";
  const reason = typeof body.reason === "string" ? body.reason.trim().slice(0, 500) : "";
  if (!VALID_KINDS.has(kind) || !target || reason.length < 1) {
    return NextResponse.json({ error: "Invalid report payload" }, { status: 400 });
  }

  const service = await createServiceClient();
  const { error } = await service
    .from("reports")
    .upsert(
      {
        reporter_id: user.id,
        target_kind: kind,
        target_id: target,
        reason,
        status: "open",
      },
      { onConflict: "reporter_id,target_kind,target_id" }
    );

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Best-effort admin ping
  notifyAdminReport(user.email || "unknown", kind, target, reason).catch(() => {});

  return NextResponse.json({ success: true });
}
