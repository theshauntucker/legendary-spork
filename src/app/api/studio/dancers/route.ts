/**
 * GET  /api/studio/dancers — list the studio's roster (active by default)
 * POST /api/studio/dancers — create a new dancer on the studio's roster
 *
 * Owner and choreographer can write; viewer is read-only. Enforced by both
 * the RLS policy on studio_dancers and this route's membership check.
 */
import { NextRequest, NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { STUDIO_ENABLED } from "@/lib/studio/flag";
import { loadStudioMembership } from "@/lib/studio/auth";

export const dynamic = "force-dynamic";

const VALID_LEVELS = ["Competitive", "Recreational", "Cheer", "Other"] as const;

export async function GET(request: NextRequest) {
  if (!STUDIO_ENABLED) {
    return NextResponse.json({ error: "Studio feature disabled" }, { status: 404 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const membership = await loadStudioMembership(supabase, user.id);
  if (!membership) {
    return NextResponse.json({ error: "Not a studio member" }, { status: 403 });
  }

  const url = new URL(request.url);
  const includeArchived = url.searchParams.get("includeArchived") === "true";

  const service = await createServiceClient();
  let query = service
    .from("studio_dancers")
    .select(
      "id, studio_id, name, nickname, date_of_birth, age_group, level, primary_style, notes, is_active, archived_at, created_at, updated_at",
    )
    .eq("studio_id", membership.studioId)
    .order("name", { ascending: true });

  if (!includeArchived) query = query.eq("is_active", true);

  const { data, error } = await query;
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Attach routine counts + best score per dancer (lightweight rollup for the list view)
  const dancerIds = (data ?? []).map((d) => d.id);
  let statsByDancer: Record<string, { routineCount: number; bestScore: number | null }> = {};

  if (dancerIds.length > 0) {
    const { data: vids } = await service
      .from("videos")
      .select("id, studio_dancer_id, analyses(total_score)")
      .in("studio_dancer_id", dancerIds)
      .eq("status", "analyzed");

    for (const v of vids ?? []) {
      if (!v.studio_dancer_id) continue;
      // supabase returns analyses as an array even for to-one; normalize
      const aArr = Array.isArray(v.analyses) ? v.analyses : v.analyses ? [v.analyses] : [];
      const score: number | null = aArr[0]?.total_score ?? null;
      const bucket = statsByDancer[v.studio_dancer_id] ?? { routineCount: 0, bestScore: null };
      bucket.routineCount += 1;
      if (score != null && (bucket.bestScore == null || score > bucket.bestScore)) {
        bucket.bestScore = score;
      }
      statsByDancer[v.studio_dancer_id] = bucket;
    }
  }

  const dancers = (data ?? []).map((d) => ({
    ...d,
    routineCount: statsByDancer[d.id]?.routineCount ?? 0,
    bestScore: statsByDancer[d.id]?.bestScore ?? null,
  }));

  return NextResponse.json({ dancers });
}

export async function POST(request: NextRequest) {
  if (!STUDIO_ENABLED) {
    return NextResponse.json({ error: "Studio feature disabled" }, { status: 404 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const membership = await loadStudioMembership(supabase, user.id);
  if (!membership) {
    return NextResponse.json({ error: "Not a studio member" }, { status: 403 });
  }
  if (membership.role === "viewer") {
    return NextResponse.json({ error: "Viewer role cannot edit roster" }, { status: 403 });
  }

  const body = await request.json().catch(() => ({}));
  const name = typeof body.name === "string" ? body.name.trim() : "";
  if (name.length < 1 || name.length > 120) {
    return NextResponse.json({ error: "Name is required (1-120 chars)" }, { status: 400 });
  }

  const level =
    typeof body.level === "string" && (VALID_LEVELS as readonly string[]).includes(body.level)
      ? body.level
      : null;

  const dateOfBirth =
    typeof body.dateOfBirth === "string" && /^\d{4}-\d{2}-\d{2}$/.test(body.dateOfBirth)
      ? body.dateOfBirth
      : null;

  const insert: Record<string, unknown> = {
    studio_id: membership.studioId,
    name,
    nickname: typeof body.nickname === "string" && body.nickname.trim() ? body.nickname.trim() : null,
    date_of_birth: dateOfBirth,
    age_group: typeof body.ageGroup === "string" && body.ageGroup.trim() ? body.ageGroup.trim() : null,
    level,
    primary_style:
      typeof body.primaryStyle === "string" && body.primaryStyle.trim() ? body.primaryStyle.trim() : null,
    notes: typeof body.notes === "string" && body.notes.trim() ? body.notes.trim().slice(0, 2000) : null,
  };

  const service = await createServiceClient();
  const { data, error } = await service.from("studio_dancers").insert(insert).select().single();

  if (error) {
    // 23505 unique constraint = dancer with this name already exists for this studio
    if (error.code === "23505") {
      return NextResponse.json(
        { error: "A dancer with this name is already on your roster" },
        { status: 409 },
      );
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ dancer: data }, { status: 201 });
}
