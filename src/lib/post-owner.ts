/**
 * Resolve the author's user_id for a given (post_type, post_id) pair so
 * notification fan-out can target the right inbox.
 *
 * Returns null if the post doesn't exist, has no owner, or the type isn't
 * recognized — callers should treat that as "skip notify, not an error."
 */

import { createServiceClient } from "@/lib/supabase/server";

export interface PostOwner {
  userId: string;
  profileId: string;
  handle: string | null;
  displayName: string | null;
}

export async function lookupPostOwner(
  postType: string,
  postId: string
): Promise<PostOwner | null> {
  const service = await createServiceClient();

  // Both "achievement" and "post" currently resolve against the achievements
  // table — it is the trophy-wall post object backing the feed.
  if (postType === "achievement" || postType === "post") {
    const { data: ach } = await service
      .from("achievements")
      .select("profile_id")
      .eq("id", postId)
      .maybeSingle();
    if (!ach?.profile_id) return null;

    const { data: profile } = await service
      .from("profiles")
      .select("user_id, handle, display_name")
      .eq("id", ach.profile_id)
      .maybeSingle();
    if (!profile?.user_id) return null;
    return {
      userId: profile.user_id,
      profileId: ach.profile_id,
      handle: profile.handle ?? null,
      displayName: profile.display_name ?? null,
    };
  }

  return null;
}

export async function lookupProfileUser(profileId: string): Promise<{
  userId: string;
  handle: string | null;
  displayName: string | null;
} | null> {
  const service = await createServiceClient();
  const { data: p } = await service
    .from("profiles")
    .select("user_id, handle, display_name")
    .eq("id", profileId)
    .maybeSingle();
  if (!p?.user_id) return null;
  return {
    userId: p.user_id,
    handle: p.handle ?? null,
    displayName: p.display_name ?? null,
  };
}
