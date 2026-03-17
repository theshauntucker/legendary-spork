import { Resend } from "resend";
import type { AnalysisResult } from "./types";

let _resend: Resend | null = null;
function getResend(): Resend {
  if (!_resend) {
    _resend = new Resend(process.env.RESEND_API_KEY);
  }
  return _resend;
}

function getAwardLevel(score: number): string {
  if (score >= 290) return "Titanium";
  if (score >= 280) return "Platinum Star";
  if (score >= 265) return "Platinum";
  if (score >= 250) return "High Gold";
  return "Gold";
}

function getAwardColor(award: string): string {
  switch (award) {
    case "Titanium": return "#c4a24e";
    case "Platinum Star": return "#8b5cf6";
    case "Platinum": return "#94a3b8";
    case "High Gold": return "#eab308";
    default: return "#d97706";
  }
}

function buildEmailHtml(analysis: AnalysisResult): string {
  const award = getAwardLevel(analysis.totalScore);
  const awardColor = getAwardColor(award);
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://routinex.app";

  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Your RoutineX Analysis</title></head>
<body style="margin:0;padding:0;background:#0f0f1a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#0f0f1a;padding:40px 20px;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

<!-- Header -->
<tr><td style="text-align:center;padding:0 0 24px;">
  <span style="font-size:20px;font-weight:700;color:#fff;">Routine<span style="color:#8b5cf6;">X</span></span>
</td></tr>

<!-- Score Card -->
<tr><td style="background:linear-gradient(135deg,#1e1b4b,#312e81);border-radius:16px;padding:32px;text-align:center;">
  <p style="color:#a78bfa;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:2px;margin:0 0 8px;">Analysis Report</p>
  <h1 style="color:#fff;font-size:24px;margin:0 0 4px;">${analysis.routineName}</h1>
  <p style="color:#94a3b8;font-size:14px;margin:0 0 24px;">${analysis.dancerName} &bull; ${analysis.style} ${analysis.entryType} &bull; ${analysis.ageGroup}</p>
  <div style="font-size:56px;font-weight:800;color:#fff;line-height:1;">${analysis.totalScore}</div>
  <p style="color:#94a3b8;font-size:13px;margin:4px 0 12px;">out of 300</p>
  <span style="display:inline-block;background:${awardColor};color:#fff;padding:6px 16px;border-radius:20px;font-size:13px;font-weight:700;">${award}</span>
</td></tr>

<!-- Strengths -->
<tr><td style="padding:24px 0 0;">
  <h2 style="color:#fff;font-size:16px;margin:0 0 12px;">Top Strengths</h2>
  ${analysis.strengthsSummary.map((s) => `<div style="background:#1a1a2e;border:1px solid #22c55e33;border-radius:10px;padding:12px 16px;margin:0 0 8px;color:#94a3b8;font-size:14px;line-height:1.5;">${s}</div>`).join("")}
</td></tr>

<!-- Score Breakdown -->
<tr><td style="padding:24px 0 0;">
  <h2 style="color:#fff;font-size:16px;margin:0 0 12px;">Score Breakdown</h2>
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#1a1a2e;border-radius:10px;overflow:hidden;">
    <tr style="background:#ffffff0d;">
      <td style="padding:10px 14px;color:#94a3b8;font-size:12px;font-weight:600;">Category</td>
      <td style="padding:10px 14px;color:#94a3b8;font-size:12px;font-weight:600;text-align:center;">Average</td>
      <td style="padding:10px 14px;color:#94a3b8;font-size:12px;font-weight:600;text-align:center;">Max</td>
    </tr>
    ${analysis.judgeScores.map((r) => `<tr style="border-top:1px solid #ffffff0d;">
      <td style="padding:10px 14px;color:#fff;font-size:14px;">${r.category}</td>
      <td style="padding:10px 14px;color:#a78bfa;font-size:14px;font-weight:700;text-align:center;">${r.avg.toFixed(1)}</td>
      <td style="padding:10px 14px;color:#64748b;font-size:14px;text-align:center;">${r.max}</td>
    </tr>`).join("")}
    <tr style="border-top:2px solid #8b5cf633;">
      <td style="padding:12px 14px;color:#fff;font-size:16px;font-weight:700;">Total</td>
      <td style="padding:12px 14px;color:#8b5cf6;font-size:16px;font-weight:800;text-align:center;">${analysis.totalScore}</td>
      <td style="padding:12px 14px;color:#64748b;font-size:14px;text-align:center;">300</td>
    </tr>
  </table>
</td></tr>

<!-- Competition Comparison -->
<tr><td style="padding:24px 0 0;">
  <h2 style="color:#fff;font-size:16px;margin:0 0 12px;">How You Compare</h2>
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#1a1a2e;border-radius:10px;">
    <tr>
      <td style="padding:14px;text-align:center;width:25%;"><div style="color:#94a3b8;font-size:11px;">Your Score</div><div style="color:#fff;font-size:22px;font-weight:700;margin-top:4px;">${analysis.competitionComparison.yourScore}</div></td>
      <td style="padding:14px;text-align:center;width:25%;"><div style="color:#94a3b8;font-size:11px;">Regional Avg.</div><div style="color:#94a3b8;font-size:22px;font-weight:700;margin-top:4px;">${analysis.competitionComparison.avgRegional}</div></td>
      <td style="padding:14px;text-align:center;width:25%;"><div style="color:#94a3b8;font-size:11px;">Top 10%</div><div style="color:#c4a24e;font-size:22px;font-weight:700;margin-top:4px;">${analysis.competitionComparison.top10Threshold}</div></td>
      <td style="padding:14px;text-align:center;width:25%;"><div style="color:#94a3b8;font-size:11px;">Top 5%</div><div style="color:#8b5cf6;font-size:22px;font-weight:700;margin-top:4px;">${analysis.competitionComparison.top5Threshold}</div></td>
    </tr>
  </table>
</td></tr>

<!-- Top Improvements -->
<tr><td style="padding:24px 0 0;">
  <h2 style="color:#fff;font-size:16px;margin:0 0 12px;">Top Improvement Priorities</h2>
  ${analysis.improvementPriorities.slice(0, 3).map((p) => `<div style="background:#1a1a2e;border-radius:10px;padding:12px 16px;margin:0 0 8px;">
    <span style="display:inline-block;background:#8b5cf6;color:#fff;width:22px;height:22px;border-radius:50%;text-align:center;line-height:22px;font-size:11px;font-weight:700;margin-right:8px;">${p.priority}</span>
    <span style="color:#fff;font-size:14px;">${p.item}</span>
    <div style="color:#64748b;font-size:12px;margin-top:4px;padding-left:30px;">Impact: ${p.impact} &bull; Est. time: ${p.timeToFix}</div>
  </div>`).join("")}
</td></tr>

<!-- CTA -->
<tr><td style="padding:32px 0;text-align:center;">
  <a href="${appUrl}/upload" style="display:inline-block;background:linear-gradient(135deg,#7c3aed,#8b5cf6);color:#fff;padding:14px 32px;border-radius:30px;font-size:15px;font-weight:700;text-decoration:none;">Analyze Another Routine</a>
</td></tr>

<!-- Footer -->
<tr><td style="text-align:center;padding:16px 0 0;">
  <p style="color:#475569;font-size:12px;margin:0;">RoutineX — AI-Powered Dance Analysis</p>
</td></tr>

</table>
</td></tr>
</table>
</body></html>`;
}

export async function sendAnalysisEmail(
  to: string,
  analysis: AnalysisResult
): Promise<void> {
  const award = getAwardLevel(analysis.totalScore);

  await getResend().emails.send({
    from: process.env.RESEND_FROM_EMAIL || "RoutineX <onboarding@resend.dev>",
    to,
    subject: `Your RoutineX Report: ${analysis.routineName} — ${analysis.totalScore}/300 (${award})`,
    html: buildEmailHtml(analysis),
  });
}
