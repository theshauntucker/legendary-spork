import { redirect } from "next/navigation";
import { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";

export interface StudioMembership {
  studioId: string;
  role: "owner" | "choreographer" | "viewer";
  userId: string;
  userEmail: string;
  studio: {
    id: string;
    name: string;
    owner_user_id: string;
    invite_code: string;
    region: string | null;
  };
}

/**
 * Server-side guard used at the top of every studio page.
 *
 * Confirms: auth cookie present → load user → membership exists → studio row
 * readable under RLS. Redirects to /login (with a ?next back-link) if not
 * authenticated, or to /studio/signup if the user is authed but not yet a
 * studio member.
 *
 * Note: RLS on studios + studio_members ensures that a user only sees their
 * own studio; service-client is intentionally NOT used here.
 */
export async function requireStudioMembership(
  currentPath: string,
  minRole?: "owner"
): Promise<StudioMembership> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?next=${encodeURIComponent(currentPath)}`);
  }

  const { data: member } = await supabase
    .from("studio_members")
    .select("studio_id, role")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!member) {
    redirect("/studio/signup");
  }

  if (minRole === "owner" && member.role !== "owner") {
    redirect("/studio/team?error=owner-only");
  }

  const { data: studio } = await supabase
    .from("studios")
    .select("id, name, owner_user_id, invite_code, region")
    .eq("id", member.studio_id)
    .single();

  if (!studio) {
    // RLS stripped the row unexpectedly — treat as not-a-member
    redirect("/studio/signup");
  }

  return {
    studioId: member.studio_id,
    role: member.role as StudioMembership["role"],
    userId: user.id,
    userEmail: user.email ?? "",
    studio,
  };
}

/**
 * API-route variant: returns null on failure rather than redirecting so
 * the route can decide its own HTTP response shape.
 */
export async function loadStudioMembership(
  supabase: SupabaseClient,
  userId: string
): Promise<Pick<StudioMembership, "studioId" | "role"> | null> {
  const { data: member } = await supabase
    .from("studio_members")
    .select("studio_id, role")
    .eq("user_id", userId)
    .maybeSingle();

  if (!member) return null;

  return {
    studioId: member.studio_id,
    role: member.role as StudioMembership["role"],
  };
}
