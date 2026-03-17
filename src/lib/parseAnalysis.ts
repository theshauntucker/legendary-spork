import { AnalysisResult } from "./types";

function getAwardLevel(score: number): AnalysisResult["awardLevel"] {
  if (score >= 290) return "Titanium";
  if (score >= 280) return "Platinum Star";
  if (score >= 265) return "Platinum";
  if (score >= 250) return "High Gold";
  return "Gold";
}

export function parseAnalysisResponse(raw: string, id: string): AnalysisResult {
  // Strip markdown code fences if present
  let cleaned = raw.trim();
  if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
  }

  const parsed = JSON.parse(cleaned);

  // Ensure id is set
  parsed.id = id;

  // Compute totalScore from judge averages if not present or seems wrong
  if (!parsed.totalScore && parsed.judgeScores) {
    parsed.totalScore = Math.round(
      parsed.judgeScores.reduce(
        (sum: number, s: { avg: number }) => sum + s.avg,
        0
      ) * 10
    ) / 10;
  }

  // Compute award level from total score
  if (parsed.totalScore) {
    parsed.awardLevel = getAwardLevel(parsed.totalScore);
  }

  // Ensure competitionComparison.yourScore matches totalScore
  if (parsed.competitionComparison) {
    parsed.competitionComparison.yourScore = parsed.totalScore;
  }

  return parsed as AnalysisResult;
}
