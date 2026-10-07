import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import ReportView from "@/components/spotlight/ReportView";
import ProcessingView from "@/components/spotlight/ProcessingView";
import type { SpotlightFrame, SpotlightRow } from "@/lib/spotlight/types";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Your Spotlight report — RoutineX", robots: { index: false, follow: false } };

export default async function SpotlightReportPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect(`/login?next=/spotlight/${id}`);

  const svc = await createServiceClient();
  const { data } = await svc.from("spotlight_reports").select("*").eq("id", id).eq("user_id", user.id).maybeSingle();
  const row = data as SpotlightRow | null;
  if (!row) redirect("/dashboard");

  if (row.status !== "ready" || !row.report) {
    return <ProcessingView id={row.id} dancerName={row.dancer_name} status={row.status} error={row.error} />;
  }

  const frames = row.frames as SpotlightFrame[];
  const needed = new Set<number>();
  row.report.moments.forEach((m) => needed.add(m.frame));
  row.report.strengths.forEach((s) => s.frame != null && needed.add(s.frame));
  const urls: Record<number, string> = {};
  for (const i of needed) {
    const f = frames[i];
    if (!f) continue;
    const { data: signed } = await svc.storage.from("videos").createSignedUrl(f.path, 60 * 60 * 6);
    if (signed?.signedUrl) urls[i] = signed.signedUrl;
  }
  const date = new Date(row.ready_at || row.created_at).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });

  return (
    <main className="min-h-screen bg-[#09090B] pt-16">
      <ReportView
        report={row.report}
        frames={frames}
        urls={urls}
        meta={{ date, frameCount: row.frame_count, trackedFrames: row.tracked_frames }}
        actions={
          <>
            <a href={`/api/spotlight/pdf?id=${row.id}&dl=1`} className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-purple-600 via-pink-500 to-amber-500 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-pink-500/20">Download the PDF</a>
            <Link href="/spotlight/new" className="inline-flex items-center rounded-full border border-white/15 px-5 py-2.5 text-sm font-semibold text-white hover:bg-white/5">Another dancer</Link>
          </>
        }
      />
      <footer className="mx-auto max-w-5xl px-5 pb-16 text-xs text-zinc-600 sm:px-8">
        This report and its frames belong to you. <Link href={`/spotlight/${row.id}/delete`} className="underline hover:text-zinc-400">Delete it permanently</Link>.
      </footer>
    </main>
  );
}
