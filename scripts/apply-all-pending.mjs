#!/usr/bin/env node
import { readFileSync, readdirSync, createWriteStream } from "node:fs";
import { resolve } from "node:path";
import { runSql } from "./_supabase-api.mjs";

const ROOT = process.cwd();
const PATTERN = /^supabase-coda-\d{3}-.*\.sql$/;
const LOG_PATH = resolve(ROOT, "apply-migrations.log");
const log = createWriteStream(LOG_PATH, { flags: "w" });

function emit(entry) {
  const line = JSON.stringify({ ts: new Date().toISOString(), ...entry });
  process.stdout.write(line + "\n");
  log.write(line + "\n");
}

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
  emit({ event: "start", pattern: PATTERN.source });

  try {
    await ensureTracker();
    emit({ event: "tracker_ready" });
  } catch (err) {
    emit({ event: "tracker_error", error: err.message });
    throw err;
  }

  const applied = await listApplied();
  const all = readdirSync(ROOT)
    .filter((f) => PATTERN.test(f))
    .sort();

  emit({ event: "plan", total: all.length, already_applied: applied.size });

  if (all.length === 0) {
    emit({ event: "done", applied: 0, skipped: 0, failed: 0, note: "no migrations found" });
    log.end();
    return;
  }

  let successes = 0;
  let skipped = 0;
  const failures = [];

  for (const f of all) {
    if (applied.has(f)) {
      emit({ event: "skip", file: f, reason: "already_applied" });
      skipped++;
      continue;
    }
    const sql = readFileSync(resolve(ROOT, f), "utf8");
    emit({ event: "apply_start", file: f, bytes: sql.length });
    try {
      const result = await runSql(sql);
      const rowCount = Array.isArray(result) ? result.length : null;
      await recordApplied(f);
      emit({ event: "apply_ok", file: f, row_count: rowCount });
      successes++;
    } catch (err) {
      emit({ event: "apply_fail", file: f, error: err.message });
      failures.push({ file: f, error: err.message });
      break;
    }
  }

  emit({
    event: "done",
    applied: successes,
    skipped,
    failed: failures.length,
    failures,
  });

  log.end();

  if (failures.length) process.exit(1);
}

main().catch((err) => {
  emit({ event: "fatal", error: err.message });
  log.end();
  process.exit(1);
});
