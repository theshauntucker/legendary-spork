import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

/**
 * /aura — entry point referenced by marketing emails ("Pick your aura").
 * - If signed in and onboarded → /settings/profile (aura section)
 * - If signed in but no handle yet → /onboarding/aura (full first-run flow)
 * - If signed out → /login with redirect back here
 */
export const dynamic = "force-dynamic";

export default async function AuraEntryPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/settings/profile");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("handle")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!profile?.handle) {
    redirect("/onboarding/aura");
  }

  redirect("/settings/profile");
}
