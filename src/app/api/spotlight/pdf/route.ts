import { NextRequest, NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { renderSpotlightPdf } from "@/lib/spotlight/pdf";
import type { SpotlightRow } from "@/lib/spotlight/types";

export const dynamic = "force-dynamic";
export const maxDuration = 120;

/**
 * GET /api/spotlight/pdf?id=…
 * Streams the stored PDF; renders and stores it first if it is missing.
 */
export async function GET(request: NextRequest) {
  const id = request.nextUrl.searchParams.get("id") || "";
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.redirect(new URL(`/login?next=/spotlight/${id}`, request.url));

  const svc = await createServiceClient();
  const { data } = await svc.from("spotlight_reports").select("*").eq("id", id).eq("user_id", user.id).maybeSingle();
  const row = data as SpotlightRow | null;
  if (!row || row.status !== "ready" || !row.report) return NextResponse.json({ error: "Report not ready" }, { status: 404 });

  let pdfPath = row.pdf_path;
  let bytes: Buffer | null = null;
  if (pdfPath) {
    const { data: file } = await svc.storage.from("videos").download(pdfPath);
    if (file) bytes = Buffer.from(await file.arrayBuffer());
  }
  if (!bytes) {
    bytes = await renderSpotlightPdf(row, svc);
    pdfPath = `spotlight/${row.user_id}/${row.id}/RoutineX-Spotlight-${row.dancer_name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.pdf`;
    await svc.storage.from("videos").upload(pdfPath, bytes, { contentType: "application/pdf", upsert: true });
    await svc.from("spotlight_reports").update({ pdf_path: pdfPath }).eq("id", id);
  }
  const filename = `RoutineX-Spotlight-${row.dancer_name.replace(/[^A-Za-z0-9]+/g, "-")}.pdf`;
  return new NextResponse(new Uint8Array(bytes), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `${request.nextUrl.searchParams.get("dl") ? "attachment" : "inline"}; filename="${filename}"`,
      "Cache-Control": "private, max-age=0",
    },
  });
}
