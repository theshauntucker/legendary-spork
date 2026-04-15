import { requireStudioMembership } from "@/lib/studio/auth";
import { createServiceClient } from "@/lib/supabase/server";
import TeamClient from "./TeamClient";

export const dynamic = "force-dynamic";

export default async function StudioTeamPage() {
  const membership = await requireStudioMembership("/studio/team");

  // Use the service client to pull roster + invites in one place. RLS on
  // studio_members/studio_invites still restricts non-service queries to
  // members-of-this-studio (verified via requireStudioMembership above).
  const service = await createServiceClient();

  const { data: members } = await service
    .from("studio_members")
    .select("id, user_id, role, joined_at")
    .eq("studio_id", membership.studioId)
    .order("joined_at", { ascending: true });

  const { data: invites } = await service
    .from("studio_invites")
    .select("id, email, role, code, status, expires_at, created_at")
    .eq("studio_id", membership.studioId)
    .order("created_at", { ascending: false });

  // Best-effort enrich members with email from auth.users (service role only)
  const userIds = (members ?? []).map((m) => m.user_id);
  const emailsById: Record<string, string> = {};
  if (userIds.length > 0) {
    const { data: authData } = await service.auth.admin.listUsers();
    for (const u of authData?.users ?? []) {
      if (userIds.includes(u.id) && u.email) {
        emailsById[u.id] = u.email;
      }
    }
  }

  const enrichedMembers = (members ?? []).map((m) => ({
    id: m.id,
    userId: m.user_id,
    role: m.role as "owner" | "choreographer" | "viewer",
    joinedAt: m.joined_at,
    email: emailsById[m.user_id] ?? null,
    isCurrentUser: m.user_id === membership.userId,
  }));

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://routinex.org";

  return (
    <TeamClient
      studio={membership.studio}
      currentRole={membership.role}
      currentUserId={membership.userId}
      members={enrichedMembers}
      invites={(invites ?? []).map((i) => ({
        id: i.id,
        email: i.email,
        role: i.role,
        code: i.code,
        status: i.status,
        expiresAt: i.expires_at,
        createdAt: i.created_at,
        joinUrl: `${baseUrl}/studio/join?code=${encodeURIComponent(i.code)}`,
      }))}
    />
  );
}
