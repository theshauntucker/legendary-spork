# Overnight Build — Prompt 0 Audit
**Timestamp:** 2026-04-17 (session start)
**Branch:** `claude/add-routinex-docs-ZtYv6`
**Base:** Last commit `d10d427 feat: add cheer-specific knowledge to Bayda`

---

## Code files present
None of the audited Coda-era files exist yet. Existing libs:
- `src/lib/credits.ts`
- `src/lib/dance-criteria.ts`
- `src/lib/notifications.ts`
- `src/lib/stripe.ts`
- `src/lib/supabase/` (directory)
- `src/lib/video-processor.ts`
- `src/lib/studio/` (directory)

Existing components (all pre-Coda): `BaydaWidget, Competitions, CountdownBanner, FAQ, Features, Footer, Hero, HowItWorks, Navbar, Pricing, PrivacyTrust, SampleAnalysis, SocialProofTicker, StickyBottomCTA, Testimonials, UploadTrustBadge, VideoDemo`.

Existing top-level routes: `about, admin, analysis, api, auth, contact, dancers, dashboard, events, faq, login, opengraph-image, our-approach, pricing, privacy, processing, routines, sample-analysis, signup, studio, success, terms, upload`.

Existing API routes: `admin, analyze, bayda, checkout, contact, credits, cron, delete-frames, free-credit, notify-admin, preprocess, process, referral, studio, upload, verify-payment, videos, waitlist, webhook`.

## Code files missing (all 17 audited)
- `src/lib/motion.ts`
- `src/lib/haptics.ts`
- `src/lib/gradients.ts`
- `src/components/ui/Glass.tsx`
- `src/components/ui/GradientText.tsx`
- `src/components/ui/Button.tsx`
- `src/app/u/[handle]/page.tsx`
- `src/app/onboarding/aura/page.tsx`
- `src/components/Aura.tsx`
- `src/components/TrophyCard.tsx`
- `src/components/VisibilityPicker.tsx`
- `src/lib/visibility.ts`
- `src/lib/dance-bonds.ts`
- `src/app/inbox/page.tsx`
- `src/app/home/page.tsx`
- `src/app/api/feed/route.ts`
- `src/lib/fair-feed.ts`

## Supabase tables present / missing
**UNABLE TO VERIFY.** No Supabase MCP tools are available in this session. The queue's Context section assumes `list_tables` and `apply_migration` MCP endpoints; these are not loaded and not findable via ToolSearch. Deferred tools list shows only `mcp__github__*` integrations.

Impact: prompts P4, P5, P6, P9, P10, P11, P12, P13, P15, P16 that call for `apply_migration` will need to write SQL files to the repo (matching the existing pattern of `supabase-*.sql` files in the repo root) and flag the migration as requiring manual apply by Shaun. No live DB verification is possible during this session.

## Spec file availability
**Major finding:** None of the VIP_XX or Coda_XX spec files referenced by the queue exist in the repo. Only present: `Coda_14_Research_And_Best_Practices.md` (written earlier in this session, untracked).

Missing (VIP_XX to be renamed):
- VIP_00_North_Star, VIP_01_Master_Plan, VIP_02_Trophy_Wall_Spec, VIP_03, VIP_04_Execution_Calendar, VIP_10_Stolen_Mechanics, VIP_11_DM_And_Dance_Bonds, VIP_12_Expensive_Design_System, VIP_13_Claude_Code_Build_Kit

Missing (Coda_XX to be committed):
- Coda_05_First_Visit_Experience, Coda_06_Fair_Feed_Algorithm, Coda_07_Four_Niches_Detail, Coda_15_Competition_Database, Coda_16_Hotel_And_Travel_Integration, Coda_17_Affiliate_Program_Playbook, Coda_18_Aesthetic_And_Brightness_Audit, Coda_19_Studio_Owner_Game_Changer_Audit, Coda_Launch_Day_Kit

Impact: every P2-P16 Context reference ("read Coda_XX") will resolve to a missing file. The prompts include enough inline detail to proceed for design primitives (P2, P3) and most schema (P4, P5, P10). Prompts depending primarily on external spec content — P6 (Trophy Wall UX), P7 (95-event DB copy-paste), P9 (Fair Feed weights), P14 (First Visit spine), Coda_15 competitions body — will have to rely on the inline prompt text alone, which is thinner than the referenced specs.

## Working-tree state
- Current branch: `claude/add-routinex-docs-ZtYv6` (per branch instructions; queue mentions `main` but branch directive overrides)
- Untracked: `CLAUDE.md`, `Coda_14_Research_And_Best_Practices.md`
- `node_modules/` not installed — `pnpm install` needed before first `pnpm build`
- No `supabase/` directory; migrations live as top-level `supabase-*.sql`

## Recent commits (last 30)
```
d10d427 feat: add cheer-specific knowledge to Bayda
1d6adbd feat: add cheer throughout site
d0a735d feat: add features prompt to Bayda
602f27a feat: rebuild Bayda knowledge base
48f55c0 feat: add Bayda AI chat widget
c835c83 fix(layout): countdown banner replacement
10fd184 feat(studio/music): Spotify preview playback
d408e7a feat(studio): homepage Studio advertising
a485498 Merge PR #5
52fef56 docs(studio): LAUNCH-CHECKLIST-STUDIO.md
3400db9 docs(studio): E2E walkthrough runbook
a0f3a82 feat(studio): Schedule tile + studio_competitions
c264b06 feat(studio): /studio/schedule pages
8cb4617 feat(studio): schedule CRUD API
df13eaa feat(studio): Phase G migration
8e6c9bf feat(studio): library grid
01ea49c feat(studio): collision banner
47d5004 feat(studio): collision API
f22ff89 feat(studio): Check Lyrics + Similar Songs
1433b4e feat(studio): /api/studio/music/similar
5a6fb9b feat(studio): check-lyrics + age-rating
ccefd99 feat(studio): un-disable Music Hub tile
9f51f3a feat(studio): /studio/music/[trackId]
8617e1b feat(studio): /studio/music page
9510ef2 feat(studio): music save/CRUD
af2f082 feat(studio): Spotify Client Credentials
a9f3919 feat(studio): post-signup home
fb09d21 feat(studio): /studio/dashboard
e1fe2d7 feat(studio): /studio/settings
82b55dd feat(studio): /studio/team
```
