# Studio Dashboard — Launch Checklist

The complete runbook for flipping `NEXT_PUBLIC_STUDIO_ENABLED` to `true`
in production. **Do not skip any step.** The B2C experience must remain
byte-identical until the moment the flag flips, and every new external
dependency (Stripe product, Spotify app, Supabase tables, Claude budget)
must be provisioned before the flag goes live.

Until every box below is ticked, **leave `NEXT_PUBLIC_STUDIO_ENABLED=false`
in Vercel production and preview environments.**

---

## 1. Env vars (add to Vercel before the flag flips)

| Key | Scope | Value | Notes |
|-----|-------|-------|-------|
| `NEXT_PUBLIC_STUDIO_ENABLED` | Production + Preview | `false` (at launch: `true`) | The master gate. Flip this LAST. |
| `SPOTIFY_CLIENT_ID` | Production + Preview | from Spotify app dashboard | Required for Music Hub search + recommendations. |
| `SPOTIFY_CLIENT_SECRET` | Production + Preview | from Spotify app dashboard | Never expose client-side. |
| `STRIPE_STUDIO_PRICE_ID` | Production + Preview | `price_…` | Optional in current implementation (the checkout route uses inline price_data). If we later switch to a stored Price, add here. |

**Already present** (do NOT change): `NEXT_PUBLIC_SUPABASE_URL`,
`NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`,
`STRIPE_SECRET_KEY`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`,
`STRIPE_WEBHOOK_SECRET`, `ANTHROPIC_API_KEY`, `ADMIN_EMAIL`,
`NEXT_PUBLIC_BASE_URL`.

Checklist:
- [ ] Spotify app created at https://developer.spotify.com/dashboard
- [ ] `SPOTIFY_CLIENT_ID` and `SPOTIFY_CLIENT_SECRET` set in Vercel
      (Production **and** Preview if studios should work on preview
      deploys — default: only Production).
- [ ] **Spotify app age verified** — apps created after Nov 2024 may
      be rejected by `/v1/recommendations`. If the app is new, the
      Music Hub's "Suggest songs" button will return a 503 with a
      friendly error message. Confirm the app predates Nov 2024 OR
      accept the degraded "Similar Songs" feature in the beta.
- [ ] `ANTHROPIC_API_KEY` has budget for Claude Haiku calls (each
      lyric check ≈ 400 tokens in, 400 tokens out; platform-wide cache
      collapses duplicates).
- [ ] `NEXT_PUBLIC_STUDIO_ENABLED` is **still `false`** in Production.

---

## 2. Stripe

- [ ] In Stripe Dashboard → Products, either:
      - (a) Confirm the existing "RoutineX Studio — Beta" product with
        the $99/mo recurring + 30-day trial price works, **or**
      - (b) Let the checkout route create inline price_data at session
        creation time (this is what the current code does — no manual
        product required).
- [ ] In Stripe Dashboard → Webhooks, confirm the single webhook
      endpoint is still pointed at `https://routinex.org/api/webhook`
      with events:
      - `checkout.session.completed`
      - `invoice.payment_succeeded`
      - (plus any existing events for the B2C flow — do not remove).
- [ ] `STRIPE_WEBHOOK_SECRET` still matches the signing secret. No
      change needed unless the webhook was rotated.
- [ ] Test: in Stripe CLI, `stripe trigger checkout.session.completed
      --add checkout_session:metadata.payment_type=studio_subscription
      --add checkout_session:metadata.studio_id=<a real studios row>`
      and confirm the studio_credits row is upserted. Delete the test
      row afterwards.

---

## 3. Supabase migrations (apply IN ORDER)

Each migration is idempotent — running it twice is safe — but they must
run in lexicographic order.

- [ ] `supabase-setup.sql` (already applied in prod)
- [ ] `supabase-payments.sql` (already applied)
- [ ] `supabase-dancer-tracking.sql` (already applied)
- [ ] `supabase-tracking-migration.sql` (already applied)
- [ ] `supabase-affiliates.sql` (already applied)
- [ ] `supabase-studio.sql` **(NEW — Phase A)**
- [ ] `supabase-studio-002-collision-rpc.sql` **(NEW — Phase F)**
- [ ] `supabase-studio-003-schedule.sql` **(NEW — Phase G)**

Post-apply sanity checks in SQL editor:
```sql
-- 7 tables should exist
select table_name from information_schema.tables
where table_schema='public' and table_name like 'studio_%'
order by table_name;
-- expected: studio_analysis_links, studio_competition_entries,
-- studio_competitions, studio_credits, studio_invites,
-- studio_members, studio_music_tracks, studio_routine_music, studios

-- RPC functions
select routine_name from information_schema.routines
where specific_schema='public'
  and routine_name in ('current_season','get_collision_counts');
-- expected: current_season, get_collision_counts

-- RLS on every new table
select tablename, rowsecurity from pg_tables
where schemaname='public' and tablename like 'studio_%';
-- expected: every row has rowsecurity=true
```

---

## 4. Vercel project settings

- [ ] Production deploys are locked to `main` (existing behavior — do
      not change).
- [ ] No custom Node version pin required; current Node 20+ runtime
      handles `crypto.getRandomValues` + Buffer-based base64 OK.
- [ ] No new domains needed.
- [ ] Serverless function memory/timeout limits are unchanged. The
      batch collision endpoint caps at 100 trackIds × concurrency 8
      which fits comfortably inside the 10s default.

---

## 5. Pre-flip regression audit (on a preview deploy with flag=true)

Only after steps 1–4 are complete, enable the flag **on a single
preview deploy** (not production) and run:

- [ ] `STUDIO-E2E-WALKTHROUGH.md` steps 1 through 15. Every Assert
      passes.
- [ ] `npm test` — 8/8 passing on that preview build.
- [ ] Smoke the B2C flow on the same preview: `/signup` → `/dashboard`
      → `/upload` → `/pricing` → Stripe BOGO checkout → `/success` →
      `/analysis/[id]`. Every screen byte-identical to production.
- [ ] Smoke the Season Member subscription flow: subscribe → verify
      webhook grants 10 credits on session.completed and then grants
      10 on first `invoice.payment_succeeded` with billing_reason=
      subscription_cycle.
- [ ] Privacy audit: in DevTools Network tab, confirm no collision
      response body contains another studio's name, dancer name, or
      routine name.

---

## 6. Flip day

Order of operations on flip day, from safest to riskiest:

1. **Announce** the window (Slack / email to founding studios).
2. Apply the three new migrations to **production Supabase**.
3. Run the post-apply sanity SQL block from Section 3.
4. In Vercel → Environment Variables → Production, set
   `NEXT_PUBLIC_STUDIO_ENABLED=true`. Also ensure `SPOTIFY_CLIENT_ID`
   and `SPOTIFY_CLIENT_SECRET` are set.
5. Trigger a production redeploy (Vercel → Deployments →
   "Redeploy latest").
6. Once the deploy is live:
   - [ ] B2C smoke (from a signed-out browser): visit home page,
         `/signup`, `/dashboard`, `/pricing`. Everything still loads.
   - [ ] Studio smoke: visit `/studio/signup` — form renders (now
         public).
7. Announce launch.

## 7. Rollback plan

If anything goes wrong after flip:

1. In Vercel → Env Vars → set `NEXT_PUBLIC_STUDIO_ENABLED=false`.
2. Redeploy production. `/studio/*` goes back to 404 within ~1 minute.
3. The B2C experience is byte-identical in this state — no DB rollback
   is needed because every new table is additive and unread by B2C code
   paths.
4. Investigate at leisure. The underlying data remains in place for
   any studio that already signed up during the incident window.

To fully roll back the schema (only if absolutely required):
```sql
drop table if exists public.studio_competition_entries cascade;
drop table if exists public.studio_competitions cascade;
drop table if exists public.studio_routine_music cascade;
drop table if exists public.studio_music_tracks cascade;
drop table if exists public.studio_analysis_links cascade;
drop table if exists public.studio_credits cascade;
drop table if exists public.studio_invites cascade;
drop table if exists public.studio_members cascade;
drop table if exists public.studios cascade;
drop function if exists public.get_collision_counts(text, uuid, text);
drop function if exists public.current_season();
```
**Do not run this unless a senior is watching.** Existing studios will
lose their data.

---

## 8. Known limitations at v1 launch

- **Email delivery for invites is manual.** The owner copies the invite
  URL and sends it through their own channel. Automated email ships in
  a later iteration.
- **`/v1/recommendations` may 503** for Spotify apps created post-Nov-
  2024. The UI shows a friendly error; the rest of the Music Hub is
  unaffected.
- **Batch collision API caps at 100 trackIds.** A studio with > 100
  saved songs sees dots only on the first 100. Client-side pagination
  is a v1.1 task.
- **`competition_names[]` is app-maintained** rather than trigger-driven.
  Direct DB edits to `studio_competition_entries` require a manual
  `rebuildCompetitionNames` call or the column drifts.
- **`studio_analysis_links` audit rows are NOT yet written.** The
  `useCredit()` studio branch decrements the pool but does not
  currently insert into `studio_analysis_links` (keeping the signature
  strictly intact was prioritized). Phase B+1 can wire this when
  `process/route.ts` is updated to pass video context.
- **Admin bypass** in credits.ts still short-circuits — an admin who
  also belongs to a studio will not draw from the studio pool. Current
  behavior; documented.

---

## 9. Final quick-reference

- **Flag**: `NEXT_PUBLIC_STUDIO_ENABLED` — leave `false` until launch.
- **Branch**: `claude/update-routinex-website-eWAd0` — final phase H
  commits are local-only per the plan; do not merge to `main` without
  Shaun's explicit sign-off.
- **Docs**: `STUDIO-MIGRATIONS.md` (migration conventions),
  `STUDIO-E2E-WALKTHROUGH.md` (runbook), this file.
- **Commits**: `git log --oneline main..HEAD` on the branch shows all
  A–H commits.
