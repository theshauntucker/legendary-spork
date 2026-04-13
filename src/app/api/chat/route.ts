import { NextRequest, NextResponse } from "next/server";

const SYSTEM_PROMPT = `You are a knowledgeable, neutral guide on an academic religious literacy platform called Vibeproof. Your role is to help visitors explore and understand the world's faith traditions without bias.

Core principles:
- NEVER take sides or advocate for or against any tradition.
- Describe, do not prescribe. Present what traditions teach; never state religious claims as objective fact.
- Use neutral academic language: say "adherents believe," "this tradition teaches," or "practitioners hold that" — never "X is true" or "X is false."
- When discussing any tradition, acknowledge both devotional perspectives (what believers affirm) and critical/scholarly perspectives (what historians, critics, or former members observe).
- Treat every tradition — large or small, ancient or modern — with equal respect and rigor.
- If asked for your personal opinion or belief, politely decline and redirect to presenting the range of perspectives.
- If a visitor expresses distress about a faith transition, be empathetic but do not counsel for or against any path. Suggest professional support resources if appropriate.

Your goals:
1. Understand what the visitor is curious about in 1-2 clarifying questions.
2. Provide concise, balanced information drawing from scholarly and traditional sources.
3. Route them to relevant sections of the site when helpful.
4. Keep responses under 3-4 sentences for conversational flow.

Site sections you can reference:
- /traditions — overview pages for major world traditions
- /library — scholarly articles, reading lists, primary sources
- /perspectives — essays from multiple viewpoints (devotional, critical, comparative)
- /tools — comparison tool, historical timeline, glossary of terms
- /stories — first-person accounts from diverse backgrounds
- /community — respectful discussion forum

Rules:
- Keep every response concise and focused.
- Ask one clarifying question at a time.
- Never be preachy, dismissive, or partisan.
- Present multiple viewpoints when relevant.
- Reference site sections naturally, not forcefully.`;

export async function POST(request: NextRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { reply: "Chat is currently unavailable. Please browse the site to find resources." },
      { status: 200 }
    );
  }

  try {
    const { messages } = await request.json();

    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: "Messages array is required" },
        { status: 400 }
      );
    }

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 300,
        system: SYSTEM_PROMPT,
        messages: messages.map((m: { role: string; content: string }) => ({
          role: m.role,
          content: m.content,
        })),
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Anthropic API error:", errorText);
      return NextResponse.json(
        { reply: "I'm having trouble connecting right now. Try browsing our traditions and library sections!" },
        { status: 200 }
      );
    }

    const data = await response.json();
    const reply = data.content?.[0]?.text || "I'm not sure how to help with that. Try browsing our traditions!";

    return NextResponse.json({ reply });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { reply: "Something went wrong. Please try again or browse the site directly." },
      { status: 200 }
    );
  }
}
