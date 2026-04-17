#!/usr/bin/env node
import { readFileSync } from "node:fs";
import { resolve, basename } from "node:path";
import { runSql } from "./_supabase-api.mjs";

const file = process.argv[2];
if (!file) {
  console.error("usage: node scripts/apply-migration.mjs <path-to-sql>");
  process.exit(2);
}

const path = resolve(process.cwd(), file);
const name = basename(path);
const sql = readFileSync(path, "utf8");

console.log(`[apply] ${name} (${sql.length} bytes)`);

try {
  const result = await runSql(sql);
  console.log(`[ok]    ${name}`);
  if (Array.isArray(result) && result.length && result.length <= 20) {
    console.log(JSON.stringify(result, null, 2));
  }
} catch (err) {
  console.error(`[fail]  ${name}`);
  console.error(err.message);
  process.exit(1);
}
