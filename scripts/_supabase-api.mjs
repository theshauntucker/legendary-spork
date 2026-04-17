import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

const ENV_PATH = resolve(process.cwd(), ".env.local");
if (existsSync(ENV_PATH)) {
  for (const line of readFileSync(ENV_PATH, "utf8").split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
}

const TOKEN = process.env.SUPABASE_ACCESS_TOKEN;
const PROJECT = process.env.SUPABASE_PROJECT_REF;
if (!TOKEN) throw new Error("SUPABASE_ACCESS_TOKEN missing from env / .env.local");
if (!PROJECT) throw new Error("SUPABASE_PROJECT_REF missing from env / .env.local");

const ENDPOINT = `https://api.supabase.com/v1/projects/${PROJECT}/database/query`;

export async function runSql(query) {
  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query }),
  });
  const text = await res.text();
  let body;
  try { body = JSON.parse(text); } catch { body = text; }
  if (!res.ok) {
    const msg = typeof body === "object" ? JSON.stringify(body) : body;
    throw new Error(`Supabase API ${res.status}: ${msg}`);
  }
  return body;
}

export { TOKEN, PROJECT, ENDPOINT };
