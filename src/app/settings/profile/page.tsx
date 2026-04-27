import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ProfileEditorClient from "./ProfileEditorClient";

export const dynamic = "force-dynamic";

type ProfileRow = {
  id: string;
  user_id: string;
  handle: string | null;
  display_name: string | null;
  bio: string | null;
  aura_style: string | null;
  aura_stops: string[] | null;
  aura_tier: "starter" | "gold" | "platinum" | "diamond" | null;
  glyph: string | null;
};

export default async function ProfileSettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profileRow } = await supabase
    .from("profiles")
    .select(
      "id,user_id,handle,display_name,bio,aura_style,aura_stops,aura_tier,glyph",
    )
    .eq("user_id", user.id)
    .maybeSingle();

  // First-time profile: route into onboarding to set everything up cleanly.
  if (!profileRow || !profileRow.handle) {
    redirect("/onboarding/aura");
  }

  const profile = profileRow as ProfileRow;

  return (
    <ProfileEditorClient
      profile={{
        id: profile.id,
        handle: profile.handle ?? "",
        display_name: profile.display_name ?? "",
        bio: profile.bio ?? "",
        aura_style: profile.aura_style ?? null,
        aura_stops: profile.aura_stops ?? null,
        aura_tier: profile.aura_tier ?? "starter",
        glyph: profile.glyph ?? null,
      }}
    />
  );
}
