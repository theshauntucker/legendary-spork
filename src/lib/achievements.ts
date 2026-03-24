import { createServiceClient } from "@/lib/supabase/server";

interface AnalysisData {
  totalScore: number;
  awardLevel: string;
}

/**
 * Check and grant achievements after a new analysis completes.
 * Called from /api/process after saving the analysis record.
 */
export async function checkAndGrantAchievements(
  serviceClient: Awaited<ReturnType<typeof createServiceClient>>,
  userId: string,
  dancerName: string | null,
  newAnalysis: AnalysisData
) {
  if (!dancerName) return;

  try {
    // Fetch existing achievements for this dancer
    const { data: existingAchievements } = await serviceClient
      .from("achievements")
      .select("achievement_type, achievement_data")
      .eq("user_id", userId)
      .eq("dancer_name", dancerName);

    const hasAchievement = (type: string) =>
      existingAchievements?.some((a) => a.achievement_type === type) || false;

    const achievementsToGrant: Array<{
      user_id: string;
      dancer_name: string;
      achievement_type: string;
      achievement_data: Record<string, unknown>;
    }> = [];

    // Award-level firsts
    const awardAchievements: Record<string, string> = {
      Gold: "first_gold",
      "High Gold": "first_high_gold",
      Platinum: "first_platinum",
      Diamond: "first_diamond",
    };

    const achievementType = awardAchievements[newAnalysis.awardLevel];
    if (achievementType && !hasAchievement(achievementType)) {
      achievementsToGrant.push({
        user_id: userId,
        dancer_name: dancerName,
        achievement_type: achievementType,
        achievement_data: {
          award_level: newAnalysis.awardLevel,
          score: newAnalysis.totalScore,
        },
      });
    }

    // Fetch previous analyses for this dancer to check streaks and jumps
    const { data: previousAnalyses } = await serviceClient
      .from("videos")
      .select("analyses!inner(total_score, award_level, created_at)")
      .eq("user_id", userId)
      .eq("dancer_name", dancerName)
      .eq("status", "analyzed")
      .order("created_at", { ascending: false })
      .limit(10);

    if (previousAnalyses && previousAnalyses.length >= 2) {
      const allScores = previousAnalyses.map((v: Record<string, unknown>) => {
        const analyses = v.analyses as Array<{ total_score: number }>;
        return analyses[0].total_score;
      });

      // Check for biggest score jump (compared to immediately previous)
      const previousScore = allScores[1]; // [0] is the current one
      const scoreJump = newAnalysis.totalScore - previousScore;

      if (scoreJump >= 5 && !hasAchievement("score_jump")) {
        achievementsToGrant.push({
          user_id: userId,
          dancer_name: dancerName,
          achievement_type: "score_jump",
          achievement_data: {
            previous_score: previousScore,
            new_score: newAnalysis.totalScore,
            jump: scoreJump,
          },
        });
      }

      // Check for 3-analysis streak (3+ analyses completed)
      if (allScores.length >= 3 && !hasAchievement("analysis_streak")) {
        achievementsToGrant.push({
          user_id: userId,
          dancer_name: dancerName,
          achievement_type: "analysis_streak",
          achievement_data: {
            streak_count: allScores.length,
          },
        });
      }
    }

    // Insert all new achievements
    if (achievementsToGrant.length > 0) {
      const { error } = await serviceClient
        .from("achievements")
        .insert(achievementsToGrant);

      if (error) {
        console.warn("Failed to insert achievements:", error);
      }
    }
  } catch (err) {
    // Non-critical — don't fail the analysis
    console.warn("Achievement check failed:", err);
  }
}
