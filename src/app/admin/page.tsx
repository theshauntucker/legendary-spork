import { redirect } from "next/navigation";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { createClient as createRawSupabaseClient } from "@supabase/supabase-js";
import AdminClient from "./AdminClient";

export default async function AdminPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const adminEmail = process.env.ADMIN_EMAIL;
  if (!adminEmail || user.email?.toLowerCase() !== adminEmail.toLowerCase()) {
    redirect("/dashboard");
  }

  const serviceClient = await createServiceClient();
  const adminClient = createRawSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Fetch all data in parallel
  const [
    { data: credits },
    { data: payments },
    { data: videos },
    { data: analyses },
    { data: authUsers },
    { data: affiliates },
  ] = await Promise.all([
    serviceClient.from("user_credits").select("*").order("created_at", { ascending: false }),
    serviceClient.from("payments").select("*").order("created_at", { ascending: false }),
    serviceClient.from("videos").select("id, user_id, routine_name, style, entry_type, status, created_at").order("created_at", { ascending: false }),
    serviceClient.from("analyses").select("id, video_id, user_id, total_score, award_level, created_at").order("created_at", { ascending: false }),
    adminClient.auth.admin.listUsers(),
    serviceClient.from("affiliates").select("*").order("created_at", { ascending: false }),
  ]);

  const allUsers = authUsers?.users ?? [];
  const allPayments = payments ?? [];
  const allVideos = videos ?? [];
  const allAnalyses = analyses ?? [];

  // Build user records
  const userRecords = allUsers.map((u) => {
    const credit = (credits ?? []).find((c) => c.user_id === u.id);
    const userPayments = allPayments.filter((p) => p.user_id === u.id);
    const userVideos = allVideos.filter((v) => v.user_id === u.id);
    const userAnalyses = allAnalyses.filter((a) => a.user_id === u.id);
    return {
      id: u.id,
      email: u.email ?? "",
      name: u.user_metadata?.full_name ?? "",
      createdAt: u.created_at,
      lastSignIn: u.last_sign_in_at ?? null,
      totalCredits: credit?.total_credits ?? 0,
      usedCredits: credit?.used_credits ?? 0,
      remaining: (credit?.total_credits ?? 0) - (credit?.used_credits ?? 0),
      isBeta: credit?.is_beta_member ?? false,
      totalPaid: userPayments.reduce((s: number, p: { amount_cents: number }) => s + p.amount_cents, 0),
      payments: userPayments,
      videoCount: userVideos.length,
      analysisCount: userAnalyses.length,
      hasConverted: userPayments.length > 0,
    };
  });

  // Stats
  const totalRevenue = allPayments.reduce((s, p) => s + p.amount_cents, 0);
  const singleRevenue = allPayments.filter(p => p.payment_type === "single" || p.payment_type === "trial").reduce((s, p) => s + p.amount_cents, 0);
  const packRevenue = allPayments.filter(p => p.payment_type === "video_analysis" || p.payment_type === "beta_access").reduce((s, p) => s + p.amount_cents, 0);
  const singleCount = allPayments.filter(p => p.payment_type === "single" || p.payment_type === "trial").length;
  const packCount = allPayments.filter(p => p.payment_type === "video_analysis" || p.payment_type === "beta_access").length;
  const convertedUsers = userRecords.filter(u => u.hasConverted).length;
  const conversionRate = allUsers.length > 0 ? Math.round((convertedUsers / allUsers.length) * 100) : 0;

  // Recent activity (last 10 events combined)
  const recentPayments = allPayments.slice(0, 10).map(p => ({
    type: "payment" as const,
    date: p.created_at,
    userId: p.user_id,
    detail: `${p.payment_type === "single" || p.payment_type === "trial" ? `$${(p.amount_cents/100).toFixed(2)} Single` : `$${(p.amount_cents/100).toFixed(2)} Pack`} — ${p.credits_granted} credits`,
    amount: p.amount_cents,
  }));

  const recentSignups = allUsers.slice(0, 10).map(u => ({
    type: "signup" as const,
    date: u.created_at,
    userId: u.id,
    detail: u.email ?? "Unknown",
    amount: 0,
  }));

  const recentActivity = [...recentPayments, ...recentSignups]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 15);

  // Build affiliate records with referred users
  const allAffiliates = (affiliates ?? []).map((a) => {
    const referredUsers = userRecords.filter((u) => {
      const creditRow = (credits ?? []).find((c) => c.user_id === u.id);
      return creditRow?.referral_code === a.code;
    });
    const referredPayments = allPayments.filter((p) => p.referral_code === a.code);
    const actualRevenue = referredPayments.reduce((s: number, p: { amount_cents: number }) => s + p.amount_cents, 0);
    return {
      ...a,
      referredUsers: referredUsers.map((u) => ({ email: u.email, name: u.name, totalPaid: u.totalPaid })),
      actualRevenue,
      owedAmount: Math.round(actualRevenue * (a.revenue_share_pct / 100)),
    };
  });

  return (
    <AdminClient
      users={userRecords}
      payments={allPayments}
      affiliates={allAffiliates}
      analyses={allAnalyses.map(a => ({
        id: a.id,
        videoId: a.video_id,
        userId: a.user_id,
        totalScore: a.total_score,
        awardLevel: a.award_level,
        createdAt: a.created_at,
      }))}
      recentActivity={recentActivity}
      stats={{
        totalRevenue,
        singleRevenue,
        packRevenue,
        singleCount,
        packCount,
        totalMembers: allUsers.length,
        convertedMembers: convertedUsers,
        conversionRate,
        totalAnalyses: allAnalyses.length,
        totalVideos: allVideos.length,
      }}
    />
  );
}

