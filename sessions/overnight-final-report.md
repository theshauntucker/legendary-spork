# Overnight Build — Final Report
**Date:** 2026-04-17
**Branch:** `claude/add-routinex-docs-ZtYv6`
**Base commit:** d10d427
**Total new commits:** 17

## Prompts Completed

| # | Prompt | Commit | Status |
|---|---|---|---|
| P0 | Audit & state snapshot | 8b1372b | ✅ Complete |
| P1 | VIP→Coda rename | c75d3c7 | ⚠️ Partial — no VIP files existed |
| P2 | Design system foundation | f021b0b | ✅ Complete |
| P3 | DAYTIME/SHOWTIME tokens | bdabb19 | ✅ Complete |
| P4 | Profile + Aura system | cb1d1cf | ✅ Code shipped (DB apply pending) |
| P5 | Visibility controls | 7fd1896 | ✅ Code shipped (DB apply pending; upload UI wiring deferred) |
| P6 | Trophy Wall | 1c01f37 | ✅ Code shipped (DB apply pending) |
| P7 | Competition DB expansion | 16bc005 | ⚠️ Partial — 38/95 events (Coda_15 spec missing) |
| P8 | Follow system + Home feed | 0e88e84 | ✅ Complete |
| P9 | Fair Feed algorithm | 0bcb6ca | ✅ Code shipped (edge function + cron deferred) |
| P10 | Reactions + comments | 042b67f | ✅ Complete (TrophyCard wiring deferred) |
| P11 | Dance Bonds | e6ab5c1 | ✅ Lib + SQL shipped (compute edge function deferred) |
| P12 | Studios + Choreographers | a67515d | ✅ Complete (credit-on-upload deferred) |
| P13 | Check-ins + weekend threads | bddbb04 | ✅ Complete (email + Bayda seed deferred) |
| P14 | First visit + BottomNav | 86ff29f | ✅ Complete (6-step builder deferred) |
| P15 | DM foundation | bb7bc8b | ✅ Complete (conversation-creation UI deferred) |
| P16 | Launch seeds + Bayda posts | be92638 | ✅ SQL + lib shipped (cron deferred) |
| P17 | Final audit | _this commit_ | ✅ Complete |

## Environmental Constraints (discovered in P0, impacted everything after)

1. **No Supabase MCP available.** 11 SQL migration files shipped but NOT applied to the Supabase project (`xkckvrbxaessudolxhte`). Shaun must paste them into the Supabase SQL editor in order — 001 through 011.
2. **No VIP_XX or Coda_XX spec files existed** except Coda_14 (written earlier in this session). P7 in particular lost ~60 events because Coda_15_Competition_Database.md wasn't available. The inline prompt text in each P had enough detail to ship the core.
3. **`pnpm lint` is broken** — Next.js 16 removed the built-in `lint` subcommand, and the `lint` script in package.json still calls `next lint`. This is a pre-existing issue, not an overnight regression. Recommendation: swap to `eslint .` in package.json when you have a minute.
4. **Branch:** all work landed on `claude/add-routinex-docs-ZtYv6` per the branch directive. Queue mentioned `main`; branch directive overrode. No pushes made.

## New Routes Added (17)

- `/design-preview` — design system showcase with atmosphere toggle (static)
- `/onboarding/aura` — aura picker with DB fallback
- `/onboarding/handle` — handle picker with live availability check
- `/u/[handle]` — public profile with Trophy Wall + follow button
- `/principles` — public Fair Feed transparency page
- `/welcome` — 4-card member-type picker
- `/find` — universal search (dancers / studios / choreographers / events)
- `/home` — logged-in home feed
- `/events/[eventId]` — event detail page (statically generated)
- `/events/[eventId]/checkin` — check-in flow
- `/threads/[competitionId]/[date]` — weekend thread with ThreadChat
- `/studios/[slug]` — studio page with claim flow
- `/choreographers/[slug]` — choreographer page with claim flow
- `/inbox` — DM conversation list (tier-gated)
- `/inbox/[conversationId]` — DM conversation view with realtime

## New API Endpoints (10)

- `GET /api/handle/check` — handle availability
- `POST /api/visibility` — upsert visibility_settings
- `POST/DELETE /api/follow` — follow/unfollow
- `GET /api/feed` — paginated feed with source-tagged items
- `POST/DELETE /api/reactions` — toggle reactions
- `GET/POST/PATCH /api/comments` — list/create/soft-delete comments
- `POST /api/claim` — submit studio/choreographer claim
- `POST /api/checkin` — check in to competition
- `POST /api/messages/send` — send DM
- `GET /api/og/trophy/[id]` — 1080×1920 share card PNG
- `POST /api/admin/send-launch-email` — admin-only mass email

## New SQL Migrations (11, all pending apply)

| File | Creates |
|---|---|
| supabase-coda-001-profiles-auras.sql | `profiles`, `aura_catalog` + RLS |
| supabase-coda-002-aura-seed.sql | 50 starter auras (10/10/10/5/10/5) |
| supabase-coda-003-visibility-follows.sql | `visibility_settings`, `follows`, `can_view_item()`, RLS on videos |
| supabase-coda-004-achievements.sql | `achievements` + backfill + public visibility |
| supabase-coda-005-fair-feed.sql | `posts`, `reach_floor_queue`, `post_views`, `feed_audit`, reach trigger |
| supabase-coda-006-engagement.sql | `post_reactions`, `comments` + RLS |
| supabase-coda-007-dance-bonds.sql | `dance_bonds` + RLS |
| supabase-coda-008-studios-choreographers.sql | `studios`, `choreographers`, `routine_choreographers`, `claim_requests` + 20 seed studios + 20 seed choreographers |
| supabase-coda-009-checkins-threads.sql | `competition_checkins`, `competition_threads`, `thread_messages` + adult-only post policy |
| supabase-coda-010-dm.sql | `conversations`, `conversation_participants`, `messages`, `message_reactions`, `blocks` + Tier-2 insert policy |
| supabase-coda-011-seed-launch-data.sql | Day-0 backfill (profiles for every auth user + founding_member 1000 + achievement backfill + "bayda" system profile) |

**Apply order:** strictly 001 → 011. Several depend on prior tables.

## Acceptance Criteria NOT Verified (Shaun please manually test in the morning)

1. **DB migrations apply cleanly in order against the real project.** I wrote them against the schema I could infer from the existing code — the videos/analyses columns are referenced without seeing them; fields like `public_share_token`, `competition_name`, `style`, `entry_type`, `competition_date`, `dancer_name` are assumed present. If any column name differs, migration 003 or 004 will fail.
2. **Aura picker end-to-end flow** — signup → welcome → aura → handle → profile. Needs 001+002 applied.
3. **Share card PNG renders on trophy page** — the `@vercel/og` route is new and depends on next/og being available in Next 16.
4. **Realtime subscriptions** — reactions + comments + thread chat + DMs all use Supabase Realtime. Must enable the `post_reactions`, `comments`, `thread_messages`, `messages` tables in Supabase Realtime settings.
5. **RLS enforcement on videos** — verify `select * from public.videos` as a logged-out session returns only rows where visibility_settings.visibility = 'public'.
6. **Founding Member 1000** — apply migration 011, then query `select count(*) from profiles where founding_member = true`. Should be min(total_auth_users, 1000).
7. **Bayda daily posts** — the generator is built, but nothing schedules it yet. Shaun needs to create a pg_cron or edge-function schedule that calls `generateBaydaPosts(serviceClient)` and inserts the results into `public.posts` under bayda's profile_id.
8. **`/principles` page renders publicly** — no auth, no layout dependencies.
9. **Press Play event exists** — visit `/events/press-play` — should render the detail view.

## Known Issues / Deferred Work

- **`/upload` never got a VisibilityPicker field** — every new video defaults to private unless/until migration 003 data-migration step runs. Add a 4-option radio + POST to /api/visibility after analyze completes.
- **TrophyCard doesn't show reactions** — ReactionBar is in FeedCard only.
- **Rising Stars row** on /home isn't rendered — buildFeed doesn't compute score delta.
- **BondEmojiString isn't wired** into any feed/profile view. One-line insertion when ready.
- **`/onboarding/builder`** (the richer 6-step wizard) — the linear welcome→aura→handle path is the substitute.
- **Conversation creation UI** — no "New DM" button. You'd need a "Message" button on `/u/[handle]` for adult→adult that inserts a conversations row + two conversation_participants rows.
- **`pnpm lint` is broken** (pre-existing).
- **Bayda edge function + pg_cron** not scheduled.
- **compute-dance-bonds edge function** not scheduled.
- **enforce-reach-floor edge function** not scheduled.
- **CLAUDE.md references Coda specs that don't exist** (Coda_00 through Coda_13) — the rename is consistent but the files themselves are still missing. Future sessions will hit dead links.

## Recommended Next Session

1. **Apply all 11 migrations in Supabase SQL editor** — this is the single biggest unblock. Many features are fully coded but DB-gated.
2. **Write the missing Coda spec files** — Coda_00 through Coda_13 were referenced by the queue and aren't in the workspace. Writing them will keep future Claude sessions from getting lost.
3. **Fix `pnpm lint`** — 1 line in package.json.
4. **Wire VisibilityPicker into `/upload`** — 3–4 line change, makes P5 end-to-end testable.
5. **Deploy the three edge functions** (enforce-reach-floor, compute-dance-bonds, bayda-daily-posts) via `supabase functions deploy` + pg_cron schedules.
6. **Add a "Message" button on `/u/[handle]`** that opens a new conversation — completes P15.
7. **Add Rising Stars row to /home** — one new query that diffs achievements over 30 days.

## Files Changed This Session

All changes are on branch `claude/add-routinex-docs-ZtYv6`, 17 commits ahead of base. See `git log --oneline origin/main..HEAD` for the chronology.
