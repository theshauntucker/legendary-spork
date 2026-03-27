# RoutineX — Current Development State
**Last updated:** March 27, 2026 (Friday, Launch Weekend prep)

## Source of Truth
- **GitHub repo:** github.com/theshauntucker/legendary-spork
- **Vercel project:** routinex (prj_3Df2waKNXC5XeBflBaHhTwvD45EV)
- **Vercel team:** team_6VhhY3LmjXUw5SaS8V87EPtV
- **Live domain:** routinex.org
- **Production branch:** claude/clarify-task-dsVIo
- **Production commit:** d7a4591 (Fix TypeScript build error in anonymization code)

## Branches
| Branch | Status | Purpose |
|--------|--------|---------|
| claude/clarify-task-dsVIo | PRODUCTION (live on routinex.org) | Main website code |
| feature/affiliate-tracking | LOCAL ONLY — needs push | Launch weekend: new pricing, affiliates, countdown timer, scoring fixes |
| claude/plan-mobile-app-structure-2gH8n | On GitHub (preview only) | Mobile Expo/React Native app |

## Launch Weekend Changes (feature/affiliate-tracking)
All changes compiled and build-tested. Commit 10892d0.

### What changed:
1. **Pricing:** FREE first analysis on signup, $8.99 single, $29.99 competition pack (5)
2. **Affiliate/Referral System:** Full tracking — database tables, API routes, admin dashboard, signup capture, Stripe attribution
3. **Countdown Timer:** Banner at top of landing page, deadline Monday March 30 midnight PT, auto-hides after
4. **Scoring Fix:** Removed 3.5% artificial inflation. Prompt rewritten to "encouraging judge" approach — realistic but warm
5. **Report Quality:** Doubled feedback lengths (4-6 sentences/category), always includes growth areas, actionable training tips
6. **Free Credit:** Auto-granted on signup via /api/free-credit endpoint

### Files changed (16 total):
- src/app/admin/AdminClient.tsx (affiliate tab in admin portal)
- src/app/admin/page.tsx (affiliate data fetching)
- src/app/api/admin/affiliates/route.ts (NEW — CRUD API)
- src/app/api/checkout/route.ts (new pricing, referral metadata)
- src/app/api/free-credit/route.ts (NEW — grants 1 free credit on signup)
- src/app/api/process/route.ts (scoring + report detail overhaul)
- src/app/api/referral/route.ts (NEW — records referral code)
- src/app/api/webhook/route.ts (affiliate revenue attribution)
- src/app/dashboard/DashboardClient.tsx (new pricing cards)
- src/app/page.tsx (countdown banner added)
- src/app/signup/page.tsx (referral code capture, free credit grant)
- src/components/CountdownBanner.tsx (NEW — launch weekend timer)
- src/components/Hero.tsx (CTA text + padding for banner)
- src/components/Navbar.tsx (top offset for banner)
- src/components/Pricing.tsx (3-column layout with free tier)
- supabase-affiliates.sql (NEW — database migration)

### Pre-deployment requirements:
1. Run supabase-affiliates.sql in Supabase SQL editor (creates affiliates table, adds referral columns, creates RPC functions)
2. Push feature/affiliate-tracking to GitHub
3. Verify Vercel preview deployment works
4. Promote to production when ready

### Rollback plan:
- Go to Vercel dashboard → Deployments → find dpl_2FhShg5eAxw7wvCMT89ocNbizoCq → Promote to Production
- Or revert the merge on GitHub — Vercel auto-redeploys

## Key Architecture Notes
- Next.js 16 App Router on Vercel
- Supabase for auth + database + storage
- Stripe for payments (checkout sessions + webhooks)
- Claude Vision API (claude-sonnet-4-20250514) for dance analysis
- Admin portal at /admin (email-gated)
- Referral flow: signup captures code → stored in user_credits → passed through Stripe metadata → webhook attributes revenue
