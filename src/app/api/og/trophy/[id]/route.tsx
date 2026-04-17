import { ImageResponse } from "next/og";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const tierGradient: Record<string, string> = {
  gold: "linear-gradient(135deg, #FCD34D, #F59E0B, #D97706)",
  high_gold: "linear-gradient(135deg, #FEF3C7, #F59E0B, #92400E)",
  platinum: "linear-gradient(135deg, #E5E7EB, #9CA3AF, #4B5563)",
  diamond: "linear-gradient(135deg, #C4B5FD, #67E8F9, #F0ABFC)",
};

function formatDate(iso: string | null) {
  if (!iso) return "";
  try {
    const d = new Date(iso);
    return d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
  } catch {
    return "";
  }
}

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id } = await ctx.params;
  const supabase = await createClient();

  const { data: trophy } = await supabase
    .from("achievements")
    .select("id, award_level, total_score, competition_name, competition_date, category, profile_id")
    .eq("id", id)
    .maybeSingle();

  const profile = trophy
    ? (
        await supabase
          .from("profiles")
          .select("handle, display_name, aura_stops")
          .eq("id", trophy.profile_id)
          .maybeSingle()
      ).data
    : null;

  const level = (trophy?.award_level as keyof typeof tierGradient) ?? "gold";
  const stops: string[] = (profile?.aura_stops as string[] | null) ?? ["#C4B5FD", "#67E8F9", "#F0ABFC"];

  return new ImageResponse(
    (
      <div
        style={{
          width: "1080px",
          height: "1920px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "space-between",
          background: "#09090B",
          color: "#fff",
          padding: "80px",
          fontFamily: "serif",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 40 }}>
          <div
            style={{
              width: 360,
              height: 360,
              borderRadius: "50%",
              background: `linear-gradient(135deg, ${stops[0]}, ${stops[1]}, ${stops[2]})`,
              boxShadow: "0 40px 120px -30px rgba(0,0,0,0.8)",
            }}
          />
          <div style={{ fontSize: 56, fontWeight: 700, display: "flex" }}>
            @{profile?.handle ?? "you"} earned
          </div>
          <div
            style={{
              fontSize: 88,
              fontWeight: 800,
              padding: "16px 36px",
              borderRadius: 24,
              background: tierGradient[level],
              color: "#1A1A1F",
              display: "flex",
            }}
          >
            {level.replace("_", " ").toUpperCase()}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
          <div style={{ fontSize: 260, fontWeight: 800, lineHeight: 1, display: "flex" }}>
            {Math.round(trophy?.total_score ?? 0)}
          </div>
          <div style={{ fontSize: 40, opacity: 0.85, display: "flex" }}>
            {trophy?.competition_name ?? ""} {trophy?.competition_date ? `· ${formatDate(trophy.competition_date as string)}` : ""}
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 16, fontSize: 36, opacity: 0.9 }}>
          <span>RoutineX</span>
          <span style={{ opacity: 0.4 }}>·</span>
          <span>Coda</span>
        </div>
      </div>
    ),
    { width: 1080, height: 1920 },
  );
}
