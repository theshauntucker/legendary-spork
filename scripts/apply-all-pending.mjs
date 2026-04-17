#!/usr/bin/env node
import { readFileSync, readdirSync } from "node:fs";
import { resolve } from "node:path";
import { runSql } from "./_supabase-api.mjs";

const ROOT = process.cwd();
const PATTERN = /^supabase-coda-\d{3}-.*\.sql$/;

async function ensureTracker() {
  await runSql(`
    create table if not exists public._applied_migrations (
      filename text primary key,
      applied_at timestamptz not null default now()
    );
  `);
}

async function listApplied() {
  const rows = await runSql(`select filename from public._applied_migrations;`);
  return new Set((rows || []).map((r) => r.filename));
}

async function recordApplied(filename) {
  await runSql(
    `insert into public._applied_migrations (filename) values ('${filename.replace(/'/g, "''")}') on conflict (filename) do nothing;`
  );
}

async function main() {
  console.log("[tracker] ensuring public._applied_migrations");
  await ensureTracker();

  const applied = await listApplied();
  const all = readdirSync(ROOT)
    .filter((f) => PATTERN.test(f))
    .sort();

  if (all.length === 0) {
    console.log("[info] no supabase-coda-*.sql files found at repo root");
    return;
  }

  console.log(`[plan] ${all.length} candidate files, ${applied.size} already applied`);

  let successes = 0;
  let skipped = 0;
  const failures = [];

  for (const f of all) {
    if (applied.has(f)) {
      console.log(`[skip] ${f} (already applied)`);
      skipped++;
      continue;
    }
    const sql = readFileSync(resolve(ROOT, f), "utf8");
    console.log(`[apply] ${f} (${sql.length} bytes)`);
    try {
      await runSql(sql);
      await recordApplied(f);
      console.log(`[ok]    ${f}`);
      successes++;
    } catch (err) {
      console.error(`[fail]  ${f}`);
      console.error(err.message);
      failures.push({ file: f, error: err.message });
      break;
    }
  }

  console.log("\n=== summary ===");
  console.log(`applied:  ${successes}`);
  console.log(`skipped:  ${skipped}`);
  console.log(`failed:   ${failures.length}`);
  if (failures.length) {
    for (const f of failures) console.log(`  - ${f.file}: ${f.error.slice(0, 200)}`);
    process.exit(1);
  }
}

main().catch((err) => {
  console.error("[fatal]", err.message);
  process.exit(1);
});
