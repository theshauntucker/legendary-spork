import { NextRequest, NextResponse } from "next/server";
import { readFile, writeFile } from "fs/promises";
import { join } from "path";
import { getClaude } from "@/lib/claude";
import { parseAnalysisResponse } from "@/lib/parseAnalysis";
import type { UploadMetadata, ExtractedFrame } from "@/lib/types";

export const dynamic = "force-dynamic";
export const maxDuration = 120;

const STYLE_RUBRICS: Record<string, string> = {
  "Jazz": `JAZZ-SPECIFIC CRITERIA: Evaluate isolations (head, rib cage, hip), attack and sharpness of movement, stylistic clarity (classic jazz vs. commercial vs. funk), rhythmic accuracy and syncopation, tricks difficulty and execution (turns, leaps, aerials), energy projection and showmanship.`,
  "Contemporary": `CONTEMPORARY/MODERN-SPECIFIC CRITERIA: Evaluate weight shifts and use of gravity, floorwork quality and seamless transitions to/from floor, breath integration with movement, emotional authenticity and vulnerability, movement initiation points (core vs. peripheral), use of suspension and release, spiral patterns and three-dimensional movement quality.`,
  "Lyrical": `LYRICAL-SPECIFIC CRITERIA: Evaluate musicality and lyrical interpretation (does the movement match the song's emotional arc?), seamless transitions between movements, emotional storytelling clarity, balance of technical skill and artistic expression, port de bras and upper body fluidity, ability to convey narrative through movement.`,
  "Ballet": `BALLET-SPECIFIC CRITERIA: Evaluate turnout consistency, port de bras quality and épaulement, adagio control and balance, classical line and placement, pointework (if applicable), pirouette preparation and spotting, grand allégro height and landing quality, use of classical vocabulary appropriate to the level.`,
  "Hip Hop": `HIP HOP-SPECIFIC CRITERIA: Evaluate groove and bounce (the foundational pocket), musicality and hitting beats/accents, isolation sharpness and body control, stylistic authenticity (popping, locking, breaking, krumping, etc.), freestyle elements and personality, crew synchronization (if group), swagger and stage command.`,
  "Tap": `TAP-SPECIFIC CRITERIA: Evaluate clarity and crispness of sound, rhythmic complexity and musicality, weight transfer efficiency, use of dynamics (loud/soft), improvisation elements, upper body carriage while maintaining footwork, ability to create clear rhythmic patterns and phrases.`,
  "Acro": `ACRO-SPECIFIC CRITERIA: Evaluate skill difficulty and progression, seamless integration of acrobatic elements with dance, control and body awareness throughout tricks, flexibility demonstration, strength elements (handstands, press-ups), landing quality and transitions out of tricks, balance of acro and dance content.`,
  "Musical Theater": `MUSICAL THEATER-SPECIFIC CRITERIA: Evaluate character commitment and storytelling, facial expression and projection to audience, stylistic accuracy to the era/show being referenced, ability to convey emotion through both dance and theatrical performance, timing with musical phrasing, energy and entertainment value.`,
  "Pom": `POM-SPECIFIC CRITERIA: Evaluate motion placement precision, synchronization and uniformity, sharpness and clean lines, energy level and projection, use of levels and formation changes, timing accuracy with music, visual impact and crowd appeal.`,
  "Cheer": `CHEER-SPECIFIC CRITERIA: Evaluate motion technique and placement, jumps (height, form, toe touch, pike, etc.), tumbling difficulty and execution, stunts and pyramids (if applicable), crowd engagement and energy, synchronization and spacing, spirit and enthusiasm projection.`,
};

const SYSTEM_PROMPT = `You are an expert panel of three elite dance competition judges analyzing a routine from video frames. You have decades of combined experience judging at top-tier events including StarQuest, Showstopper, NUVO, The Dance Awards, Star Power, JUMP, UCA, NCA, YAGP, and World of Dance.

YOUR THREE JUDGES:
- Judge 1 — "The Technician" (focuses on execution precision, body mechanics, skill difficulty, proper form): Scores technique and overall impression more critically. Notices alignment issues, landing mechanics, turnout, spotting, and extension that others might miss.
- Judge 2 — "The Artist" (prioritizes musicality, emotional connection, stage presence, performance quality): Scores performance and overall impression with an artistic eye. Looks for genuine emotional connection, dynamic range, and audience engagement.
- Judge 3 — "The Choreographer" (evaluates structure, creativity, use of space, competition readiness): Scores choreography and overall impression from a design perspective. Analyzes formations, transitions, use of levels, musicality of choreographic choices, and competitive edge.

SCORING SYSTEM (300-point scale):
- Technique (max 35 per judge, 3 judges = 105 max): body alignment, extension, control, turns, leaps, footwork precision, landing mechanics, strength, flexibility
- Performance (max 35 per judge, 3 judges = 105 max): stage presence, facial expression, musicality, energy, audience connection, emotional projection, dynamic range
- Choreography (max 20 per judge, 3 judges = 60 max): creativity, formations, use of space/levels, musical interpretation, dynamics, transitions, originality
- Overall Impression (max 10 per judge, 3 judges = 30 max): polish, competition-readiness, wow factor, costuming synergy, stage use

SCORING CALIBRATION (be realistic and honest — most routines fall in High Gold to Platinum):
- Gold (100-249): Developing skills, notable areas for growth, foundational level
- High Gold (250-264): Solid foundation, approaching competitive level, some standout moments
- Platinum (265-279): Strong competitive routine, polished execution, consistent quality
- Platinum Star (280-289): Outstanding, top-tier regional competitor, exceptional in multiple areas
- Titanium (290-300): Elite, national-level excellence, virtually flawless — reserve this for truly extraordinary performances

CRITICAL JUDGING RULES:
- Each judge scores independently based on their specialty — scores WILL differ by 1-4 points reflecting their different expertise areas
- The Technician tends to score Technique higher but be stricter on Performance
- The Artist tends to score Performance higher but may be more lenient on Technique
- The Choreographer focuses on Choreography scoring accuracy and gives balanced other scores
- Be HONEST — do not inflate scores. A good studio routine is typically High Gold to Platinum range
- Base analysis ONLY on what you can observe in the provided video frames
- Reference SPECIFIC moments visible in the frames (e.g., "In the frame at approximately 0:45, the arabesque shows...")
- Provide actionable, specific feedback that a dancer or coach can immediately work on
- Distribute timeline notes across the FULL duration of the routine`;

function getStyleRubric(style: string): string {
  return STYLE_RUBRICS[style] || "";
}

function buildUserMessage(
  metadata: UploadMetadata,
  frames: ExtractedFrame[],
  duration: string
) {
  const styleRubric = getStyleRubric(metadata.style);
  const styleSection = styleRubric ? `\n\n${styleRubric}\n` : "";

  return `Analyze this ${metadata.style} ${metadata.entryType} routine titled "${metadata.routineName}" performed by ${metadata.dancerName} in the ${metadata.ageGroup} division from ${metadata.studioName}.
${styleSection}
The video is ${duration} long. I am providing ${frames.length} frames extracted at regular intervals throughout the routine. Each frame is approximately ${Math.round(frames[frames.length - 1]?.timestamp / frames.length)}s apart.

Study each frame carefully. Pay attention to:
- Body alignment, placement, and line in every frame
- Facial expressions and performance quality
- Spacing, formations, and use of stage
- Technical elements (turns, leaps, extensions, tricks) captured mid-execution
- Transitions between movements
- Overall energy and commitment visible in body language

For timestamps in timelineNotes, distribute your observations across the full duration of the routine (${duration}). Use formats like "0:00-0:12" for ranges or "1:05" for specific moments. Reference what you actually see in specific frames.

Respond with ONLY a valid JSON object (no markdown, no code fences) matching this exact schema:
{
  "routineName": "${metadata.routineName}",
  "dancerName": "${metadata.dancerName}",
  "ageGroup": "${metadata.ageGroup}",
  "style": "${metadata.style}",
  "entryType": "${metadata.entryType}",
  "duration": "${duration}",
  "totalScore": <number between 100-300>,
  "strengthsSummary": [
    "<top strength #1 — specific and referencing what you observed>",
    "<top strength #2>",
    "<top strength #3>"
  ],
  "competitiveEdge": "<1-2 sentences about what sets this routine apart from competitors OR what's the biggest gap vs top competitors at this level>",
  "judgeScores": [
    {
      "category": "Technique",
      "max": 35,
      "judges": [<technician_score>, <artist_score>, <choreographer_score>],
      "avg": <average of 3 judges>,
      "feedback": "<3-5 sentences of detailed technique feedback referencing specific frames/moments. The Technician's perspective should lead. Include what was done well AND specific areas to improve.>"
    },
    {
      "category": "Performance",
      "max": 35,
      "judges": [<technician_score>, <artist_score>, <choreographer_score>],
      "avg": <average of 3 judges>,
      "feedback": "<3-5 sentences of detailed performance feedback. The Artist's perspective should lead. Comment on facial expression, musicality, emotional projection, energy dynamics, and audience connection.>"
    },
    {
      "category": "Choreography",
      "max": 20,
      "judges": [<technician_score>, <artist_score>, <choreographer_score>],
      "avg": <average of 3 judges>,
      "feedback": "<3-5 sentences of detailed choreography feedback. The Choreographer's perspective should lead. Discuss formations, transitions, use of space/levels, musical interpretation, and originality.>"
    },
    {
      "category": "Overall Impression",
      "max": 10,
      "judges": [<technician_score>, <artist_score>, <choreographer_score>],
      "avg": <average of 3 judges>,
      "feedback": "<3-5 sentences about overall competition readiness, polish, wow factor, and where this routine stands competitively. All three judges weigh in.>"
    }
  ],
  "timelineNotes": [
    {"time": "<timestamp>", "note": "<specific observation referencing what you see in the frame>", "type": "positive" or "improvement"},
    ... (10-15 notes spread evenly across the routine)
  ],
  "improvementPriorities": [
    {"priority": 1, "item": "<specific, actionable improvement a coach could drill in practice>", "impact": "High" or "Medium" or "Low", "timeToFix": "<realistic estimate>"},
    ... (4-6 priorities ordered by impact)
  ],
  "competitionComparison": {
    "yourScore": <same as totalScore>,
    "avgRegional": <realistic regional average for ${metadata.ageGroup} ${metadata.style}, typically 255-265>,
    "top10Threshold": <realistic top 10% threshold, typically 278-285>,
    "top5Threshold": <realistic top 5% threshold, typically 285-292>
  }
}`;
}

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.round(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export async function GET(request: NextRequest) {
  const id = request.nextUrl.searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "Missing id parameter" }, { status: 400 });
  }

  const uploadsDir = join(process.cwd(), "uploads");

  try {
    const analysisData = await readFile(
      join(uploadsDir, `${id}-analysis.json`),
      "utf-8"
    );
    return NextResponse.json({ status: "analyzed", analysis: JSON.parse(analysisData) });
  } catch {
    // Check if metadata exists at all
    try {
      const metaData = await readFile(join(uploadsDir, `${id}.json`), "utf-8");
      const metadata = JSON.parse(metaData);
      return NextResponse.json({ status: metadata.status || "processing" });
    } catch {
      return NextResponse.json({ error: "Analysis not found" }, { status: 404 });
    }
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { analysisId } = body;

    if (!analysisId) {
      return NextResponse.json(
        { error: "Missing analysisId" },
        { status: 400 }
      );
    }

    const uploadsDir = join(process.cwd(), "uploads");

    // Check if analysis already exists
    try {
      const existing = await readFile(
        join(uploadsDir, `${analysisId}-analysis.json`),
        "utf-8"
      );
      return NextResponse.json({
        status: "analyzed",
        analysis: JSON.parse(existing),
      });
    } catch {
      // Analysis doesn't exist yet, proceed
    }

    // Read metadata
    let metadata: UploadMetadata;
    try {
      const metaData = await readFile(
        join(uploadsDir, `${analysisId}.json`),
        "utf-8"
      );
      metadata = JSON.parse(metaData);
    } catch {
      return NextResponse.json(
        { error: "Upload metadata not found" },
        { status: 404 }
      );
    }

    // Read frames
    let frames: ExtractedFrame[];
    let duration: number;
    try {
      const framesData = await readFile(
        join(uploadsDir, `${analysisId}-frames.json`),
        "utf-8"
      );
      const parsed = JSON.parse(framesData);
      frames = parsed.frames;
      duration = parsed.duration;
    } catch {
      return NextResponse.json(
        { error: "Video frames not found. Please re-upload the video." },
        { status: 404 }
      );
    }

    const durationStr = formatDuration(duration);

    // Build Claude API request with image content blocks
    const imageBlocks = frames.map((frame) => {
      // dataUrl format: "data:image/jpeg;base64,<data>"
      const base64Data = frame.dataUrl.split(",")[1];
      return {
        type: "image" as const,
        source: {
          type: "base64" as const,
          media_type: "image/jpeg" as const,
          data: base64Data,
        },
      };
    });

    const claude = getClaude();
    const userMessage = buildUserMessage(metadata, frames, durationStr);

    const response = await claude.messages.create({
      model: "claude-opus-4-20250514",
      max_tokens: 8000,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: [
            ...imageBlocks,
            { type: "text" as const, text: userMessage },
          ],
        },
      ],
    });

    // Extract text response
    const textBlock = response.content.find((block) => block.type === "text");
    if (!textBlock || textBlock.type !== "text") {
      throw new Error("No text response from Claude");
    }

    // Parse and validate the analysis
    const analysis = parseAnalysisResponse(textBlock.text, analysisId);

    // Save analysis results
    await writeFile(
      join(uploadsDir, `${analysisId}-analysis.json`),
      JSON.stringify(analysis, null, 2)
    );

    // Update metadata status
    metadata.status = "analyzed";
    metadata.duration = durationStr;
    await writeFile(
      join(uploadsDir, `${analysisId}.json`),
      JSON.stringify(metadata, null, 2)
    );

    return NextResponse.json({ status: "analyzed", analysis });
  } catch (err) {
    console.error("Analysis error:", err);
    const message =
      err instanceof Error ? err.message : "Analysis failed. Please try again.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
