"use client";

import { motion } from "framer-motion";
import { TrendingUp } from "lucide-react";

interface ScorePoint {
  videoId: string;
  analysisId: string;
  totalScore: number;
  awardLevel: string;
  date: string;
  routineName?: string;
}

const awardBands = [
  { label: "Gold", min: 260, max: 269, color: "rgba(202, 138, 4, 0.15)" },
  { label: "High Gold", min: 270, max: 279, color: "rgba(234, 179, 8, 0.15)" },
  { label: "Platinum", min: 280, max: 289, color: "rgba(168, 85, 247, 0.15)" },
  { label: "Diamond", min: 290, max: 300, color: "rgba(251, 191, 36, 0.2)" },
];

function getAwardColor(level: string): string {
  switch (level) {
    case "Diamond": return "#fbbf24";
    case "Platinum": return "#a855f7";
    case "High Gold": return "#eab308";
    default: return "#ca8a04";
  }
}

export default function ScoreHistoryChart({
  scores,
  title = "Progress Over Time",
  compact = false,
}: {
  scores: ScorePoint[];
  title?: string;
  compact?: boolean;
}) {
  if (scores.length < 2) return null;

  const chartWidth = compact ? 300 : 600;
  const chartHeight = compact ? 120 : 200;
  const padding = { top: 20, right: 30, bottom: 30, left: 40 };
  const innerWidth = chartWidth - padding.left - padding.right;
  const innerHeight = chartHeight - padding.top - padding.bottom;

  const minScore = 255;
  const maxScore = 305;
  const scoreRange = maxScore - minScore;

  const xScale = (i: number) => padding.left + (i / (scores.length - 1)) * innerWidth;
  const yScale = (score: number) =>
    padding.top + innerHeight - ((score - minScore) / scoreRange) * innerHeight;

  // Build line path
  const linePath = scores
    .map((s, i) => `${i === 0 ? "M" : "L"} ${xScale(i)} ${yScale(s.totalScore)}`)
    .join(" ");

  // Gradient area path
  const areaPath = `${linePath} L ${xScale(scores.length - 1)} ${yScale(minScore)} L ${xScale(0)} ${yScale(minScore)} Z`;

  // Score change
  const firstScore = scores[0].totalScore;
  const lastScore = scores[scores.length - 1].totalScore;
  const diff = lastScore - firstScore;
  const diffText = diff > 0 ? `+${diff}` : `${diff}`;
  const diffColor = diff > 0 ? "text-green-400" : diff < 0 ? "text-red-400" : "text-surface-200";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-2xl bg-white/5 ${compact ? "p-3" : "p-5"}`}
    >
      {!compact && (
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-primary-400" />
            <h3 className="font-bold text-sm">{title}</h3>
          </div>
          <span className={`text-sm font-bold ${diffColor}`}>
            {diffText} pts
          </span>
        </div>
      )}

      <svg
        viewBox={`0 0 ${chartWidth} ${chartHeight}`}
        className="w-full"
        style={{ maxHeight: compact ? 120 : 200 }}
      >
        <defs>
          <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#9333ea" />
            <stop offset="50%" stopColor="#ec4899" />
            <stop offset="100%" stopColor="#f59e0b" />
          </linearGradient>
          <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#9333ea" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#9333ea" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Award level bands */}
        {!compact && awardBands.map((band) => (
          <rect
            key={band.label}
            x={padding.left}
            y={yScale(band.max)}
            width={innerWidth}
            height={yScale(band.min) - yScale(band.max)}
            fill={band.color}
            rx={2}
          />
        ))}

        {/* Award level labels */}
        {!compact && awardBands.map((band) => (
          <text
            key={`label-${band.label}`}
            x={chartWidth - padding.right + 4}
            y={yScale((band.min + band.max) / 2) + 3}
            fontSize="7"
            fill="rgba(255,255,255,0.3)"
            textAnchor="start"
          >
            {band.label === "High Gold" ? "HG" : band.label.charAt(0)}
          </text>
        ))}

        {/* Grid lines */}
        {[260, 270, 280, 290, 300].map((score) => (
          <line
            key={score}
            x1={padding.left}
            y1={yScale(score)}
            x2={padding.left + innerWidth}
            y2={yScale(score)}
            stroke="rgba(255,255,255,0.08)"
            strokeDasharray="3 3"
          />
        ))}

        {/* Y-axis labels */}
        {!compact && [260, 270, 280, 290, 300].map((score) => (
          <text
            key={`y-${score}`}
            x={padding.left - 6}
            y={yScale(score) + 3}
            fontSize="8"
            fill="rgba(255,255,255,0.4)"
            textAnchor="end"
          >
            {score}
          </text>
        ))}

        {/* Area fill */}
        <path d={areaPath} fill="url(#areaGrad)" />

        {/* Line */}
        <path
          d={linePath}
          fill="none"
          stroke="url(#lineGrad)"
          strokeWidth={compact ? 2 : 2.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Dots */}
        {scores.map((s, i) => (
          <g key={i}>
            <a href={`/analysis/${s.videoId}`}>
              <circle
                cx={xScale(i)}
                cy={yScale(s.totalScore)}
                r={compact ? 3 : 5}
                fill={getAwardColor(s.awardLevel)}
                stroke="rgba(0,0,0,0.5)"
                strokeWidth={1.5}
                className="cursor-pointer"
              />
              {/* Score label */}
              {!compact && (
                <text
                  x={xScale(i)}
                  y={yScale(s.totalScore) - 10}
                  fontSize="9"
                  fill="white"
                  textAnchor="middle"
                  fontWeight="bold"
                >
                  {s.totalScore}
                </text>
              )}
            </a>

            {/* Date label */}
            {!compact && (
              <text
                x={xScale(i)}
                y={chartHeight - 5}
                fontSize="7"
                fill="rgba(255,255,255,0.4)"
                textAnchor="middle"
              >
                {new Date(s.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
              </text>
            )}
          </g>
        ))}
      </svg>

      {compact && (
        <div className="flex items-center justify-between mt-1">
          <span className="text-[10px] text-surface-200">{scores.length} analyses</span>
          <span className={`text-[10px] font-bold ${diffColor}`}>{diffText} pts</span>
        </div>
      )}
    </motion.div>
  );
}
