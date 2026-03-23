"use client";

import { useParams } from "next/navigation";
import { Sparkles, ArrowLeft } from "lucide-react";
import AnalysisReport from "./AnalysisReport";

// Simulated AI analysis data — in production this comes from Supabase
function generateAnalysis(id: string) {
  const seed = id.charCodeAt(0) + (id.charCodeAt(1) || 0);
  const variation = (base: number, range: number) =>
    Math.round((base + ((seed % range) - range / 2) * 0.1) * 10) / 10;

  return {
    id,
    routineName: "Uploaded Routine",
    dancerName: "Dancer",
    ageGroup: "Teen (12-15)",
    style: "Jazz",
    entryType: "Solo",
    duration: "2:45",
    totalScore: variation(274, 20),
    judgeScores: [
      {
        category: "Technique",
        max: 35,
        judges: [variation(32.5, 10), variation(31.0, 10), variation(33.0, 10)],
        avg: variation(32.2, 10),
        feedback:
          "Solid foundational technique with good body placement and alignment throughout. Extension in leaps shows strong flexibility. Pirouette sequence shows promise — focus on consistent spotting to maintain clean rotations. Footwork in jazz isolations is sharp and precise. Recommend targeted work on landing control after aerial skills.",
      },
      {
        category: "Performance",
        max: 35,
        judges: [variation(33.0, 10), variation(32.5, 10), variation(34.0, 10)],
        avg: variation(33.2, 10),
        feedback:
          "Strong stage presence with genuine connection to the music. Facial expressions are authentic and engaging — this is a standout quality. Energy is mostly consistent but watch for slight drops during transitional phrases. Eye focus is intentional and draws the audience in. Work on maintaining peak performance energy in the final 30 seconds when fatigue may set in.",
      },
      {
        category: "Choreography",
        max: 20,
        judges: [variation(18.5, 8), variation(17.5, 8), variation(19.0, 8)],
        avg: variation(18.3, 8),
        feedback:
          "Well-constructed routine with a clear narrative arc. Effective use of space and levels. Formation changes (if group) are smooth and purposeful. Music interpretation is strong — choreography matches the dynamics of the track. Consider adding more contrast between high-energy sections and lyrical moments for greater impact. The ending is strong and memorable.",
      },
      {
        category: "Overall Impression",
        max: 10,
        judges: [variation(9.0, 4), variation(8.5, 4), variation(9.5, 4)],
        avg: variation(9.0, 4),
        feedback:
          "A polished, competition-ready routine that demonstrates strong training and preparation. The dancer shows maturity and artistry beyond their age division. Costuming and music selection complement the choreography well. This routine has strong potential for advancement at regional and national level competitions.",
      },
    ],
    timelineNotes: [
      { time: "0:00–0:12", note: "Strong opening — immediate energy and audience engagement", type: "positive" as const },
      { time: "0:25", note: "Leap combination: good height and split, watch back foot on landing", type: "improvement" as const },
      { time: "0:45", note: "Jazz isolations: sharp, clean, and well-timed with the music", type: "positive" as const },
      { time: "1:05", note: "Turn sequence: good preparation, focus on spotting consistency", type: "improvement" as const },
      { time: "1:30", note: "Floor work section: creative and well-executed", type: "positive" as const },
      { time: "1:55", note: "Transitional phrase: energy dipped slightly — maintain intensity", type: "improvement" as const },
      { time: "2:10", note: "Acro/trick element: clean execution with solid landing", type: "positive" as const },
      { time: "2:30–2:45", note: "Finale: powerful ending pose, strong audience impact", type: "positive" as const },
    ],
    improvementPriorities: [
      { priority: 1, item: "Landing control after leaps and jumps", impact: "High", timeToFix: "2–3 weeks" },
      { priority: 2, item: "Spotting consistency in turn sequences", impact: "High", timeToFix: "1–2 weeks" },
      { priority: 3, item: "Energy maintenance in transitional phrases", impact: "Medium", timeToFix: "2–3 rehearsals" },
      { priority: 4, item: "Dynamic contrast between sections", impact: "Medium", timeToFix: "1 rehearsal" },
      { priority: 5, item: "Final 30-second stamina and peak energy", impact: "Medium", timeToFix: "Conditioning focus" },
    ],
    competitionComparison: {
      yourScore: variation(274, 20),
      avgRegional: 261,
      top10Threshold: 282,
      top5Threshold: 288,
    },
    // Privacy props — in production these come from Supabase video record
    frames: [] as string[],
    framesDeleted: false,
    videoId: id,
  };
}

export default function AnalysisPage() {
  const params = useParams();
  const id = params.id as string;
  const analysis = generateAnalysis(id);

  return (
    <div className="min-h-screen py-12 px-4">
      {/* Background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-primary-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/3 w-96 h-96 bg-accent-500/10 rounded-full blur-3xl" />
      </div>

      <div className="mx-auto max-w-4xl">
        {/* Top Bar */}
        <div className="flex items-center justify-between mb-8">
          <a
            href="/upload"
            className="inline-flex items-center gap-2 text-sm text-surface-200 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Upload Another
          </a>
          <a href="/" className="inline-flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary-400" />
            <span className="font-bold">
              Routine<span className="gradient-text">X</span>
            </span>
          </a>
          <div className="w-20" /> {/* Spacer for centering */}
        </div>

        <AnalysisReport analysis={analysis} />
      </div>
    </div>
  );
}
