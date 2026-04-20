import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

/**
 * Root /studio page — routes the visitor to the right place.
 *
 * - Signed out → /studio/signup (marketing + signup form)
 * - Signed in + not yet a member → /studio/signup (they'll convert)
 * - Signed in + member → /studio/dashboard
 *
 * Before this existed, hitting bare /studio returned a Next 404, which was
 * the most likely URL someone would guess if they heard about "the RoutineX
 * Studio plan" without a full link.
 */
export default async function StudioIndexPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/studio/signup");
  }

  const { data: member } = await supabase
    .from("studio_members")
    .select("studio_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (member) {
    redirect("/studio/dashboard");
  }
  redirect("/studio/signup");
}
