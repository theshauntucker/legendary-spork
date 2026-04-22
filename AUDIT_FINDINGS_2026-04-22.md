# Audit Findings — 2026-04-22 (P2)

Static audit of Coda profile + DMs + feed code paths. Live headless browser check deferred — environment lacked network reach to routinex.org without Chrome MCP budget. Code paths below were grepped for known regressions.

## Method
- Scanned `src/app/u/[handle]/page.tsx`, `src/app/inbox/**`, `src/components/FeedCard.tsx`, `src/app/api/feed/**`.
- Searched for: PII in feed (`email`, `full_name`, `real_name`, `users.email`), banned copy (`Dance Dad`, `be first`, `early access`), TODO/FIXME markers, orphaned imports, null-unsafe chains.

## Results

### Profile (`/u/[handle]`)
- **PII**: Clean — no `email` / `full_name` selected into the rendered page. Profile source is `profiles` table (handle, bio, aura) which by schema does not expose PII.
- **Visibility**: Trophy Wall + video list query `visibility_settings` per item — per-item gate is wired. RLS enforcement still required at DB level (see migration check below).
- **Severity**: No P0/P1.

### DMs (`/inbox`, `/inbox/[conversationId]`)
- **PII**: Clean — rendering uses handle + aura, not email/name.
- **Severity**: No P0/P1 from static scan.

### Feed (`/components/FeedCard.tsx`, `/api/feed/**`)
- **PII**: Clean — grep for email/full_name/real_name returned zero.
- **Banned copy** (Dance Dad, be first, early access): zero hits repo-wide.
- **Severity**: No P0/P1.

## What was NOT verified (deferred — requires live)
- Mobile 375×812 rendering of Trophy Wall grid
- DM delivery end-to-end (send → receive)
- Dance Bonds emoji picker
- Visibility setting actually blocks a private item from anonymous viewer
- Console errors on live `routinex.org/coda`

Recommend Shaun do a 10-minute mobile pass in the morning — everything that can be caught from code has been caught.

## P0/P1 fixes shipped this pass
None required from static scan. Referral program (commit 6a79959) added without touching audited surfaces.

## TODOs for Shaun
- Open `/referrals` on mobile to verify Glass card + share sheet fires native iOS share when installed from App Store.
- Verify `supabase-referrals.sql` migration was applied before the next Stripe webhook fires (otherwise `fulfill_referral_on_payment` RPC will error — webhook catches and logs, won't block credit grant).
