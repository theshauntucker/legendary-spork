import { notFound } from "next/navigation";
import { requireStudioMembership } from "@/lib/studio/auth";
import { createServiceClient } from "@/lib/supabase/server";
import DancerDetailClient from "./DancerDetailClient";

export const dynamic = "force-dynamic";

export default async function StudioDancerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const membership = await requireStudioMembership(`/studio/dancer/${id}`);
  const service = await createServiceClient();

  const { data: dancer } = await service
    .from("studio_dancers")
    .select(
      "id, studio_id, name, nickname, date_of_birth, age_group, level, primary_style, notes, is_active, archived_at, created_at",
    )
    .eq("id", id)
    .eq("studio_id", membership.studioId)
    .maybeSingle();

  if (!dancer) notFound();

  const { data: videos } = await service
    .from("videos")
    .select(
      "id, routine_name, style, entry_type, competition_name, competition_date, age_group, created_at, status, analyses(id, total_score, award_level, created_at)",
    )
    .eq("studio_dancer_id", id)
    .order("created_at", { ascending: false });

  const analyzed =
    (videos ?? [])
      .filter((v) => v.status === "analyzed")
      .map((v) => {
        const aArr = Array.isArray(v.analyses)
          ? v.analyses
          : v.analyses
          ? [v.analyses]
          : [];
        return {
          videoId: v.id as string,
          routineName: (v.routine_name as string) ?? null,
          style: (v.style as string) ?? null,
          entryType: (v.entry_type as string) ?? null,
          competitionName: (v.competition_name as string) ?? null,
          competitionDate: (v.competition_date as string) ?? null,
          ageGroup: (v.age_group as string) ?? null,
          uploadedAt: v.created_at as string,
          analysisId: (aArr[0]?.id as string) ?? null,
          totalScore: (aArr[0]?.total_score as number) ?? null,
          awardLevel: (aArr[0]?.award_level as string) ?? null,
        };
      });

  const scores = analyzed
    .map((v) => v.totalScore)
    .filter((s): s is number => typeof s === "number");
  const bestScore = scores.length > 0 ? Math.max(...scores) : null;
  const avgScore =
    scores.length > 0
      ? Math.round((scores.reduce((s, n) => s + n, 0) / scores.length) * 10) /
        10
      : null;
  const latestScore = analyzed[0]?.totalScore ?? null;
  const styles = Array.from(
    new Set(analyzed.map((v) => v.style).filter((s): s is string => !!s)),
  );

  const pending = (videos ?? []).filter((v) => v.status !== "analyzed").length;

  return (
    <DancerDetailClient
      studio={membership.studio}
      role={membership.role}
      dancer={{
        id: dancer.id,
        name: dancer.name,
        nickname: dancer.nickname,
        dateOfBirth: dancer.date_of_birth,
        ageGroup: dancer.age_group,
        level: dancer.level,
        primaryStyle: dancer.primary_style,
        notes: dancer.notes,
        isActive: dancer.is_active,
        archivedAt: dancer.archived_at,
        createdAt: dancer.created_at,
      }}
      stats={{
        routineCount: analyzed.length,
        bestScore,
        avgScore,
        latestScore,
        styles,
        pendingCount: pending,
      }}
      routines={analyzed}
    />
  );
}
