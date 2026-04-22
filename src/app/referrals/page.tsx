import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ReferralsClient from "./ReferralsClient";

export const metadata: Metadata = {
  title: "Invite friends — RoutineX",
  description:
    "Share RoutineX with a dance or cheer friend. You both earn a free credit when they sign up.",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function ReferralsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/referrals");
  }

  return <ReferralsClient />;
}
