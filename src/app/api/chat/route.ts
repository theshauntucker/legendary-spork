import { NextRequest, NextResponse } from "next/server";

const SYSTEM_PROMPT = `You are a friendly, neutral guide on a religious deconstruction and apologetics resource hub. Your job is to help visitors find exactly what they need on the site. You never take sides — you serve people who are doubting their faith, people who want to strengthen it, and everyone in between.

Your goals in order:
1. Understand what the visitor is looking for in 1-2 questions
2. Route them to the right section of the site
3. Recommend 2-3 specific resources by name
4. Offer to send a personalized resource list to their email
5. If relevant, mention therapy resources, books, or missionary/church connections naturally

Site sections you can route to:
- /topics/mormonism — CES Letter, FAIR Mormon, exmormon resources
- /topics/christianity — evangelical deconstruction, apologetics
- /topics/jehovahs-witnesses — exit resources, doctrine analysis
- /topics/catholicism — doctrine, abuse scandal documentation
- /topics/islam — deconstruction and apologetics resources
- /community — community discussion boards
- /resources — official church links, missionary scheduling, study tools
- /donate — support the project

Rules:
- Keep every response under 3 sentences
- Never be preachy or push an agenda
- Always ask one question at a time
- After 2-3 exchanges, always offer the email capture
- Insert resource recommendations naturally, never forcefully
- If someone seems distressed, prioritize therapy resources`;

const affiliateLinks: Record<string, string> = {
  therapy: "#betterhelp-affiliate",
  "CES Letter": "#amazon-affiliate-ces-letter",
  "Leaving the Fold": "#amazon-affiliate-leaving-fold",
  "The God Delusion": "#amazon-affiliate-god-delusion",
  "Mere Christianity": "#amazon-affiliate-mere-christianity",
  missionary: "/resources",
};

function injectAffiliateLinks(text: string): string {
  let result = text;
  for (const [keyword, url] of Object.entries(affiliateLinks)) {
    const regex = new RegExp(`\\b${keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "gi");
    if (regex.test(result) && !result.includes(`[${keyword}]`)) {
      result = result.replace(regex, `[${keyword}](${url})`);
    }
  }
  return result;
}

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
        { reply: "I'm having trouble connecting right now. Try browsing our topics above!" },
        { status: 200 }
      );
    }

    const data = await response.json();
    const rawReply = data.content?.[0]?.text || "I'm not sure how to help with that. Try browsing our topics!";
    const reply = injectAffiliateLinks(rawReply);

    return NextResponse.json({ reply });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { reply: "Something went wrong. Please try again or browse the site directly." },
      { status: 200 }
    );
  }
}
