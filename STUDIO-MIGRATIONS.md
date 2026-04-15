# Studio migration conventions

All schema changes that belong to the Studio Dashboard + Music Hub land
in their own SQL files at the repo root. The existing B2C migrations
(`supabase-setup.sql`, `supabase-payments.sql`, `supabase-affiliates.sql`,
`supabase-dancer-tracking.sql`, `supabase-tracking-migration.sql`) are
**never edited** — studio work is strictly additive.

## Naming

```
supabase-studio-NNN-<short-slug>.sql
```

- `NNN` is a zero-padded integer that preserves lexicographic order so
  anyone running the files alphabetically applies them in dependency
  order.
- `<short-slug>` describes the change in kebab-case, ≤ 40 chars.

Example: `supabase-studio-002-collision-rpc.sql`.

## Running order

1. `supabase-studio.sql` — Phase A baseline (tables, RLS, `current_season`,
   `get_collision_counts`).
2. `supabase-studio-002-collision-rpc.sql` — Phase F `get_collision_counts`
   shape update (adds `locked_this_season_in_region`).
3. `supabase-studio-003-schedule.sql` — Phase G schedule tables.

Each file is self-contained and idempotent: `CREATE TABLE IF NOT EXISTS`,
`CREATE OR REPLACE FUNCTION`, `DROP FUNCTION IF EXISTS` before
re-declaring a function whose return shape changes.

## Guardrails

1. **Never edit an existing migration.** If a schema object needs to
   change, ship a new `supabase-studio-NNN-*.sql` that drops and
   recreates (for functions) or uses `ALTER TABLE` (for tables).
2. **All new tables get RLS.** At minimum: a "members can view" policy,
   an "appropriate writes" policy (members / owner-only as the feature
   demands), and a "service role full access" catch-all so the webhook
   + backend routes can operate.
3. **Additive columns only.** Never drop a column. If a column is
   deprecated, leave it and stop writing to it.
4. **Document in the file header.** Each migration opens with 2–5 lines
   explaining what ships and which phase it belongs to.

## Seed-of-truth locations

- Schema: the SQL files at the repo root (above).
- RPC contracts: the function bodies in whichever migration last
  created them.
- Phase context + protection rules: the full handoff pasted at the top
  of the branch's first planning session. See also `ROUTINEX-MASTER.md`
  for broader product context.
