/**
 * PATCH /api/studio/dancers/[id] — edit a roster entry
 * DELETE /api/studio/dancers/[id] — soft-delete (archive) a roster entry;
 *        videos referencing this dancer keep their link, but the dancer no
 *        longer appears in active roster lists or autocomplete.
 *
 * GET /api/studio/dancers/[id] — fetch a single roster entry with full stats
 *        (used by /studio/dancer/[id] detail page)
 */
import { NextRequest, NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { STUDIO_ENABLED } from "@/lib/studio/flag";
import { loadStudioMembership } from "@/lib/studio/auth";

export const dynamic = "force-dynamic";

const VALID_LEVELS = ["Competitive", "Recreational", "Cheer", "Other"] as const;

async function guardStudioMember(request: NextRequest) {
  if (!STUDIO_ENABLED) {
    return { error: NextResponse.json({ error: "Studio feature disabled" }, { status: 404 }) };
  }
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: NextResponse.json({ error: "Not authenticated" }, { status: 401 }) };
  const membership = await loadStudioMembership(supabase, user.id);
  if (!membership)
    return { error: NextResponse.json({ error: "Not a studio member" }, { status: 403 }) };
  return { user, membership };
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const guard = await guardStudioMember(request);
  if ("error" in guard) return guard.error;

  const service = await createServiceClient();
  const { data: dancer, error } = await service
    .from("studio_dancers")
    .select("*")
    .eq("id", id)
    .eq("studio_id", guard.membership.studioId)
    .maybeSingle();

  if (error || !dancer) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Full stats rollup
  const { data: videos } = await service
    .from("videos")
    .select(
      "id, routine_name, style, entry_type, competition_name, competition_date, age_group, created_at, status, analyses(id, total_score, award_level, created_at)",
    )
    .eq("studio_dancer_id", id)
    .order("created_at", { ascending: false });

  const analyzed =
    (videos ?? []).filter((v) => v.status === "analyzed").map((v) => {
      const aArr = Array.isArray(v.analyses) ? v.analyses : v.analyses ? [v.analyses] : [];
      return {
        videoId: v.id,
        routineName: v.routine_name,
        style: v.style,
        entryType: v.entry_type,
        competitionName: v.competition_name,
        competitionDate: v.competition_date,
        ageGroup: v.age_group,
        uploadedAt: v.created_at,
        analysisId: aArr[0]?.id ?? null,
        totalScore: aArr[0]?.total_score ?? null,
        awardLevel: aArr[0]?.award_level ?? null,
      };
    });

  const scores = analyzed.map((v) => v.totalScore).filter((s): s is number => typeof s === "number");
  const bestScore = scores.length > 0 ? Math.max(...scores) : null;
  const avgScore =
    scores.length > 0 ? Math.round((scores.reduce((s, n) => s + n, 0) / scores.length) * 10) / 10 : null;
  const latestScore = analyzed[0]?.totalScore ?? null;
  const styles = Array.from(new Set(analyzed.map((v) => v.style).filter(Boolean)));

  return NextResponse.json({
    dancer,
    stats: {
      routineCount: analyzed.length,
      bestScore,
      avgScore,
      latestScore,
      styles,
    },
    routines: analyzed,
  });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const guard = await guardStudioMember(request);
  if ("error" in guard) return guard.error;
  if (guard.membership.role === "viewer") {
    return NextResponse.json({ error: "Viewer role cannot edit roster" }, { status: 403 });
  }

  const body = await request.json().catch(() => ({}));
  const updates: Record<string, unknown> = {};

  if (typeof body.name === "string") {
    const trimmed = body.name.trim();
    if (trimmed.length < 1 || trimmed.length > 120) {
      return NextResponse.json({ error: "Name must be 1-120 chars" }, { status: 400 });
    }
    updates.name = trimmed;
  }
  if ("nickname" in body) {
    updates.nickname =
      typeof body.nickname === "string" && body.nickname.trim() ? body.nickname.trim() : null;
  }
  if ("dateOfBirth" in body) {
    updates.date_of_birth =
      typeof body.dateOfBirth === "string" && /^\d{4}-\d{2}-\d{2}$/.test(body.dateOfBirth)
        ? body.dateOfBirth
        : null;
  }
  if ("ageGroup" in body) {
    updates.age_group =
      typeof body.ageGroup === "string" && body.ageGroup.trim() ? body.ageGroup.trim() : null;
  }
  if ("level" in body) {
    updates.level =
      typeof body.level === "string" && (VALID_LEVELS as readonly string[]).includes(body.level)
        ? body.level
        : null;
  }
  if ("primaryStyle" in body) {
    updates.primary_style =
      typeof body.primaryStyle === "string" && body.primaryStyle.trim()
        ? body.primaryStyle.trim()
        : null;
  }
  if ("notes" in body) {
    updates.notes =
      typeof body.notes === "string" && body.notes.trim() ? body.notes.trim().slice(0, 2000) : null;
  }
  if ("isActive" in body && typeof body.isActive === "boolean") {
    updates.is_active = body.isActive;
    updates.archived_at = body.isActive ? null : new Date().toISOString();
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "No updates provided" }, { status: 400 });
  }

  const service = await createServiceClient();
  const { data, error } = await service
    .from("studio_dancers")
    .update(updates)
    .eq("id", id)
    .eq("studio_id", guard.membership.studioId)
    .select()
    .single();

  if (error) {
    if (error.code === "23505") {
      return NextResponse.json(
        { error: "A dancer with this name is already on your roster" },
        { status: 409 },
      );
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ dancer: data });
}

// Soft-delete: archive the dancer. Videos keep the FK; active roster and
// autocomplete hide them. Use PATCH { isActive: true } to un-archive.
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const guard = await guardStudioMember(request);
  if ("error" in guard) return guard.error;
  if (guard.membership.role === "viewer") {
    return NextResponse.json({ error: "Viewer role cannot edit roster" }, { status: 403 });
  }

  const service = await createServiceClient();
  const { error } = await service
    .from("studio_dancers")
    .update({ is_active: false, archived_at: new Date().toISOString() })
    .eq("id", id)
    .eq("studio_id", guard.membership.studioId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ archived: true });
}
