import Anthropic from "@anthropic-ai/sdk";

let _client: Anthropic | null = null;

export function getClaude(): Anthropic {
  if (!_client) {
    const key = process.env.ANTHROPIC_API_KEY;
    if (!key) {
      throw new Error(
        "ANTHROPIC_API_KEY is not set. Add it to your .env.local file."
      );
    }
    _client = new Anthropic({ apiKey: key });
  }
  return _client;
}
