import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

export const maxDuration = 300; // Allow up to 5 minutes for video processing

export async function POST(request: NextRequest) {
  try {
    const { videoId, internalSecret } = await request.json();

    // Basic auth check — only allow internal calls
    const expectedSecret = process.env.SUPABASE_SERVICE_ROLE_KEY?.slice(0, 20);
    if (!internalSecret || internalSecret !== expectedSecret) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!videoId) {
      return NextResponse.json({ error: "Missing videoId" }, { status: 400 });
    }

    const supabase = await createServiceClient();

    // Get the video record
    const { data: video, error: fetchError } = await supabase
      .from("videos")
      .select("*")
      .eq("id", videoId)
      .single();

    if (fetchError || !video) {
      console.error("Video not found:", fetchError);
      return NextResponse.json({ error: "Video not found" }, { status: 404 });
    }

    // Update status to processing
    await supabase
      .from("videos")
      .update({ status: "processing", updated_at: new Date().toISOString() })
      .eq("id", videoId);

    try {
      // Download video from Supabase Storage to get basic info
      const { data: fileData, error: downloadError } = await supabase.storage
        .from("videos")
        .download(video.storage_path);

      if (downloadError || !fileData) {
        throw new Error(`Failed to download video: ${downloadError?.message}`);
      }

      // Get file info
      const fileBuffer = Buffer.from(await fileData.arrayBuffer());
      const fileSizeMB = (fileBuffer.length / (1024 * 1024)).toFixed(1);

      // Generate a basic thumbnail placeholder
      // In production, this would use FFmpeg for real frame extraction
      const thumbnailPath = `${video.user_id}/${videoId}/thumbnail.jpg`;

      // Store preprocessing metadata
      const preprocessingMetadata = {
        originalSize: fileBuffer.length,
        originalSizeMB: fileSizeMB,
        processedAt: new Date().toISOString(),
        format: video.filename.split(".").pop()?.toLowerCase() || "unknown",
        // In production with FFmpeg: duration, resolution, codec, extracted frames
        status: "basic_processing_complete",
        note: "Full frame extraction requires FFmpeg (available in production deployment)",
      };

      // Update video record as ready
      await supabase
        .from("videos")
        .update({
          status: "ready",
          thumbnail_path: thumbnailPath,
          preprocessing_metadata: preprocessingMetadata,
          updated_at: new Date().toISOString(),
        })
        .eq("id", videoId);

      // Now generate the simulated analysis (in production, this would be the real AI call)
      const analysis = generateAnalysis(videoId, video);

      const { data: analysisRecord, error: analysisError } = await supabase
        .from("analyses")
        .insert({
          video_id: videoId,
          user_id: video.user_id,
          total_score: analysis.totalScore,
          award_level: analysis.awardLevel,
          judge_scores: analysis.judgeScores,
          timeline_notes: analysis.timelineNotes,
          improvement_priorities: analysis.improvementPriorities,
          competition_comparison: analysis.competitionComparison,
        })
        .select("id")
        .single();

      if (analysisError) {
        console.error("Analysis insert error:", analysisError);
        throw new Error("Failed to save analysis");
      }

      // Update video status to analyzed and link analysis
      await supabase
        .from("videos")
        .update({
          status: "analyzed",
          analysis_id: analysisRecord!.id,
          updated_at: new Date().toISOString(),
        })
        .eq("id", videoId);

      return NextResponse.json({
        success: true,
        videoId,
        analysisId: analysisRecord!.id,
        status: "analyzed",
      });
    } catch (processingError) {
      console.error("Processing error:", processingError);

      // Mark video as error
      await supabase
        .from("videos")
        .update({
          status: "error",
          updated_at: new Date().toISOString(),
        })
        .eq("id", videoId);

      return NextResponse.json(
        { error: "Processing failed" },
        { status: 500 }
      );
    }
  } catch (err) {
    console.error("Preprocess route error:", err);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}

// Simulated analysis generator — replace with real AI API call in production
function generateAnalysis(
  videoId: string,
  video: { routine_name: string; dancer_name: string; age_group: string; style: string; entry_type: string }
) {
  const seed = videoId.charCodeAt(0) + (videoId.charCodeAt(1) || 0);
  const v = (base: number, range: number) =>
    Math.round((base + ((seed % range) - range / 2) * 0.1) * 10) / 10;

  const totalScore = v(274, 20);

  let awardLevel = "Gold";
  if (totalScore >= 290) awardLevel = "Titanium";
  else if (totalScore >= 280) awardLevel = "Platinum Star";
  else if (totalScore >= 265) awardLevel = "Platinum";
  else if (totalScore >= 250) awardLevel = "High Gold";

  return {
    totalScore,
    awardLevel,
    judgeScores: [
      {
        category: "Technique",
        max: 35,
        judges: [v(32.5, 10), v(31.0, 10), v(33.0, 10)],
        avg: v(32.2, 10),
        feedback: `Solid foundational technique with good body placement throughout. Extension in leaps shows strong flexibility. Focus on consistent spotting to maintain clean rotations. Footwork in ${video.style.toLowerCase()} isolations is sharp.`,
      },
      {
        category: "Performance",
        max: 35,
        judges: [v(33.0, 10), v(32.5, 10), v(34.0, 10)],
        avg: v(33.2, 10),
        feedback: "Strong stage presence with genuine connection to the music. Facial expressions are authentic and engaging. Energy is mostly consistent but watch for slight drops during transitional phrases.",
      },
      {
        category: "Choreography",
        max: 20,
        judges: [v(18.5, 8), v(17.5, 8), v(19.0, 8)],
        avg: v(18.3, 8),
        feedback: "Well-constructed routine with a clear narrative arc. Effective use of space and levels. Music interpretation is strong. Consider adding more contrast between high-energy sections and lyrical moments.",
      },
      {
        category: "Overall Impression",
        max: 10,
        judges: [v(9.0, 4), v(8.5, 4), v(9.5, 4)],
        avg: v(9.0, 4),
        feedback: `A polished, competition-ready ${video.entry_type.toLowerCase()} routine. ${video.dancer_name || "The dancer"} shows maturity and artistry. Strong potential for advancement at regional and national competitions.`,
      },
    ],
    timelineNotes: [
      { time: "0:00–0:12", note: "Strong opening — immediate energy and audience engagement", type: "positive" },
      { time: "0:25", note: "Leap combination: good height and split, watch back foot on landing", type: "improvement" },
      { time: "0:45", note: `${video.style} isolations: sharp, clean, and well-timed`, type: "positive" },
      { time: "1:05", note: "Turn sequence: good preparation, focus on spotting consistency", type: "improvement" },
      { time: "1:30", note: "Floor work section: creative and well-executed", type: "positive" },
      { time: "1:55", note: "Transitional phrase: energy dipped slightly — maintain intensity", type: "improvement" },
      { time: "2:10", note: "Trick element: clean execution with solid landing", type: "positive" },
      { time: "2:30–2:45", note: "Finale: powerful ending pose, strong audience impact", type: "positive" },
    ],
    improvementPriorities: [
      { priority: 1, item: "Landing control after leaps and jumps", impact: "High", timeToFix: "2–3 weeks" },
      { priority: 2, item: "Spotting consistency in turn sequences", impact: "High", timeToFix: "1–2 weeks" },
      { priority: 3, item: "Energy maintenance in transitional phrases", impact: "Medium", timeToFix: "2–3 rehearsals" },
      { priority: 4, item: "Dynamic contrast between sections", impact: "Medium", timeToFix: "1 rehearsal" },
      { priority: 5, item: "Final 30-second stamina and peak energy", impact: "Medium", timeToFix: "Conditioning focus" },
    ],
    competitionComparison: {
      yourScore: totalScore,
      avgRegional: 261,
      top10Threshold: 282,
      top5Threshold: 288,
    },
  };
}
