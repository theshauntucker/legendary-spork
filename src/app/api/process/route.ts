import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

// Initialize Supabase admin client
function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Missing Supabase env vars");
  return createClient(url, key);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { framePaths, metadata } = body;

    if (!framePaths || !Array.isArray(framePaths) || framePaths.length === 0) {
      return NextResponse.json(
        { error: "No frames provided" },
        { status: 400 }
      );
    }

    if (!metadata?.routineTitle || !metadata?.danceStyle) {
      return NextResponse.json(
        { error: "Missing required metadata" },
        { status: 400 }
      );
    }

    const supabase = getSupabaseAdmin();

    // Get auth token from request
    const authHeader = request.headers.get("authorization");
    const token = authHeader?.replace("Bearer ", "");

    let userId: string | null = null;
    if (token) {
      const { data: { user } } = await supabase.auth.getUser(token);
      userId = user?.id ?? null;
    }

    // Create video record in database
    const { data: video, error: dbError } = await supabase
      .from("videos")
      .insert({
        user_id: userId,
        routine_title: metadata.routineTitle,
        dancer_name: metadata.dancerName || "Unknown",
        studio_name: metadata.studioName || "Independent",
        dance_style: metadata.danceStyle,
        age_group: metadata.ageGroup || null,
        entry_type: metadata.entryType || "Solo",
        level: metadata.level || null,
        competition_type: metadata.competitionType || null,
        frame_paths: framePaths,
        status: "processing",
      })
      .select()
      .single();

    if (dbError) {
      console.error("DB insert error:", dbError);
      return NextResponse.json(
        { error: "Failed to create video record" },
        { status: 500 }
      );
    }

    // Get signed URLs for frames
    const frameUrls: string[] = [];
    for (const path of framePaths) {
      const { data } = await supabase.storage
        .from("frames")
        .createSignedUrl(path, 3600); // 1 hour expiry
      if (data?.signedUrl) {
        frameUrls.push(data.signedUrl);
      }
    }

    if (frameUrls.length === 0) {
      return NextResponse.json(
        { error: "Could not access uploaded frames" },
        { status: 500 }
      );
    }

    // Build the AI prompt — names are ANONYMIZED for privacy
    // We use "The performer" / "The studio" instead of real names
    const prompt = buildAnalysisPrompt(metadata, frameUrls.length);

    // Call Anthropic API with frame images
    const anthropicKey = process.env.ANTHROPIC_API_KEY;
    if (!anthropicKey) {
      return NextResponse.json(
        { error: "AI service not configured" },
        { status: 500 }
      );
    }

    const imageContent = frameUrls.map((url) => ({
      type: "image" as const,
      source: {
        type: "url" as const,
        url,
      },
    }));

    const anthropicResponse = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": anthropicKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 4096,
        messages: [
          {
            role: "user",
            content: [
              ...imageContent,
              {
                type: "text",
                text: prompt,
              },
            ],
          },
        ],
      }),
    });

    if (!anthropicResponse.ok) {
      const errText = await anthropicResponse.text();
      console.error("Anthropic API error:", errText);
      await supabase
        .from("videos")
        .update({ status: "error" })
        .eq("id", video.id);
      return NextResponse.json(
        { error: "AI analysis failed" },
        { status: 500 }
      );
    }

    const aiResult = await anthropicResponse.json();
    const rawText = aiResult.content?.[0]?.text || "";

    // Extract JSON from the response
    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error("Could not parse AI response as JSON");
      await supabase
        .from("videos")
        .update({ status: "error" })
        .eq("id", video.id);
      return NextResponse.json(
        { error: "Failed to parse analysis" },
        { status: 500 }
      );
    }

    let analysis;
    try {
      analysis = JSON.parse(jsonMatch[0]);
    } catch {
      console.error("Invalid JSON in AI response");
      await supabase
        .from("videos")
        .update({ status: "error" })
        .eq("id", video.id);
      return NextResponse.json(
        { error: "Failed to parse analysis" },
        { status: 500 }
      );
    }

    // Post-processing: inject dancer/studio names into analysis text
    // Names were deliberately excluded from the AI prompt for privacy
    if (metadata.dancerName || metadata.studioName) {
      const replaceName = (text: string): string => {
        if (metadata.dancerName) {
          text = text
            .replace(/\bThe performer\b/g, metadata.dancerName)
            .replace(/\bthe performer\b/g, metadata.dancerName)
            .replace(/\bThe Performer\b/g, metadata.dancerName);
        }
        if (metadata.studioName) {
          text = text
            .replace(/\bThe studio\b/g, metadata.studioName)
            .replace(/\bthe studio\b/g, metadata.studioName)
            .replace(/\bThe Studio\b/g, metadata.studioName);
        }
        return text;
      };

      if (analysis.judgeScores && Array.isArray(analysis.judgeScores)) {
        for (const category of analysis.judgeScores) {
          if (category.feedback) category.feedback = replaceName(category.feedback);
          if (category.styleNotes) category.styleNotes = replaceName(category.styleNotes);
        }
      }
      if (analysis.timelineNotes && Array.isArray(analysis.timelineNotes)) {
        for (const note of analysis.timelineNotes) {
          if (note.note) note.note = replaceName(note.note);
        }
      }
      if (analysis.improvementPriorities && Array.isArray(analysis.improvementPriorities)) {
        for (const item of analysis.improvementPriorities) {
          if (item.item) item.item = replaceName(item.item);
          if (item.trainingTip) item.trainingTip = replaceName(item.trainingTip);
        }
      }
    }

    // Save analysis results to database
    await supabase
      .from("videos")
      .update({
        status: "analyzed",
        analysis_data: analysis,
      })
      .eq("id", video.id);

    return NextResponse.json({
      success: true,
      videoId: video.id,
      analysis,
    });
  } catch (err) {
    console.error("Process error:", err);
    return NextResponse.json(
      { error: "Analysis failed. Please try again." },
      { status: 500 }
    );
  }
}

function buildAnalysisPrompt(metadata: Record<string, string>, frameCount: number): string {
  return `You are an expert dance and cheer competition judge with 20+ years of experience. Analyze this routine based on the ${frameCount} frames extracted from the performance video.

## Routine Details
- Style: ${metadata.danceStyle}
- Entry Type: ${metadata.entryType || "Solo"}
- Age Group: ${metadata.ageGroup || "Not specified"}
- Level: ${metadata.level || "Competitive"}
- Competition Type: ${metadata.competitionType || "General"}
- Performer: The performer
- Studio: The studio

## Scoring Instructions
Score the routine on a competition-standard scale. Return your analysis as a JSON object with this exact structure:

{
  "overallScore": <number 0-300>,
  "judgeScores": [
    {
      "category": "Technique",
      "score": <number>,
      "maxScore": 35,
      "feedback": "<detailed feedback>",
      "styleNotes": "<style-specific observations>"
    },
    {
      "category": "Performance/Execution",
      "score": <number>,
      "maxScore": 35,
      "feedback": "<detailed feedback>",
      "styleNotes": "<style-specific observations>"
    },
    {
      "category": "Choreography",
      "score": <number>,
      "maxScore": 20,
      "feedback": "<detailed feedback>",
      "styleNotes": "<style-specific observations>"
    },
    {
      "category": "Musicality",
      "score": <number>,
      "maxScore": 10,
      "feedback": "<detailed feedback>"
    },
    {
      "category": "Staging/Formations",
      "score": <number>,
      "maxScore": 10,
      "feedback": "<detailed feedback>"
    },
    {
      "category": "Overall Effect",
      "score": <number>,
      "maxScore": 10,
      "feedback": "<detailed feedback>"
    }
  ],
  "timelineNotes": [
    {
      "timestamp": <frame number or approximate seconds>,
      "note": "<observation>",
      "type": "strength" | "improvement" | "technique" | "performance"
    }
  ],
  "improvementPriorities": [
    {
      "rank": <1-5>,
      "item": "<what to improve>",
      "trainingTip": "<specific drill or exercise>",
      "impact": "high" | "medium" | "low"
    }
  ]
}

Be specific, constructive, and encouraging. Reference "The performer" when discussing the dancer and "The studio" when discussing training. Provide actionable feedback that a coach or parent could use to improve the routine. Return ONLY the JSON object, no other text.`;
}
