# RoutineX — Claude Code Context

## What This Is
RoutineX is an AI-powered video analysis platform for competitive dancers and cheerleaders, evolving into a full social platform ("the Instagram of the dance community"). Built by Shaun Tucker (Founder). Live at routinex.org.

## Tech Stack
- **Framework:** Next.js (App Router, `src/app/`)
- **Database:** Supabase (project ID: `xkckvrbxaessudolxhte`)
- **Hosting:** Vercel (auto-deploys from `main` branch)
- **AI:** Anthropic Claude (Haiku 4.5 for Bayda chat, Vision API for video analysis)
- **Payments:** Stripe
- **Email:** Resend
- **Repo:** `theshauntucker/legendary-spork` on GitHub

## Current Product (Live)
- Users upload a routine video -> AI analyzes still frames -> returns competition-style scoring + feedback
- Three simulated judges score: Technique (max 35), Performance (max 35), Choreography (max 20), Overall Impression (max 10)
- Total score range: 260-300. Award levels: Gold (260-269), High Gold (270-279), Platinum (280-289), Diamond (290-300)
- Works for dance AND cheer (separate rubrics in `src/lib/dance-criteria.ts`)
- Bayda AI chat widget on every page (`src/components/BaydaWidget.tsx`, API at `src/app/api/bayda/route.ts`)
- Pricing: Free (1 analysis), BOGO ($8.99/2), Season Member ($12.99/mo for 10), Competition Pack ($29.99/5)

## What We're Building Now: Coda Social Platform
The social platform is the body of the product. The analyzer, Bayda, and Studio Plan hang off it. Read the Coda docs in the repo root for full specs:

- `Coda_00_North_Star.md` — Overall vision and thesis (READ THIS FIRST)
- `Coda_01_Master_Plan.md` — Strategic blueprint
- `Coda_02_Trophy_Wall_Spec.md` — Trophy Wall feature spec
- `Coda_04_Execution_Calendar.md` — 13-week execution plan
- `Coda_10_Stolen_Mechanics.md` — Research on mechanics borrowed from other platforms
- `Coda_11_DM_And_Dance_Bonds.md` — DM system + Dance Bonds (relationship emojis)
- `Coda_12_Expensive_Design_System.md` — Full design system spec (motion, haptics, gradients, glass)
- `Coda_13_Claude_Code_Build_Kit.md` — 16 copy-paste prompts in execution order
- `Coda_14_Research_And_Best_Practices.md` — Architecture, COPPA, moderation, growth

## NON-NEGOTIABLE CONSTRAINTS
1. **NO PHOTOS OF DANCERS ANYWHERE.** Identity = auras (gradient avatars), glyphs, badges, score iconography. Never real faces. This is both safety AND brand.
2. **Granular per-item visibility control.** Every score, trophy, routine, post has 4-way visibility: public / followers / studio / private. Enforced at DATABASE level via RLS, not just UI.
3. **Cheer is a first-class citizen.** Every feature, copy, and UI must speak to both dance AND cheer audiences.

## Design System Rules
All new components MUST use the shared design primitives:
- `src/lib/motion.ts` — framer-motion primitives (springOut, tapScale, fadeLift, stagger)
- `src/lib/haptics.ts` — navigator.vibrate wrappers
- `src/lib/gradients.ts` — gradient library (sunset, magentaRush, auraGold, auraDiamond, glass, etc.)
- `src/components/ui/Glass.tsx` — glass card component
- `src/components/ui/GradientText.tsx` — gradient text with WCAG fallback
- `src/components/ui/Button.tsx` — primary/secondary/ghost with tapScale + haptic

No one-off transitions. No custom colors outside the gradient library. Consistency = expensive feel.

## Build Process
1. Before writing code, read the referenced Coda_XX.md files
2. Match existing patterns in `src/` — don't invent new architectural styles
3. After changes: run `pnpm build`, fix errors, then `pnpm lint`
4. Create commits with descriptive messages. Do NOT push until reviewed.
5. After committing, write a 3-sentence summary of what changed

## Key Files
- `src/lib/dance-criteria.ts` — Scoring rubrics (dance + cheer)
- `src/lib/notifications.ts` — Email notifications (uses OWNER_EMAIL env var)
- `src/app/upload/page.tsx` — Video upload flow
- `src/components/BaydaWidget.tsx` — AI chat widget
- `src/app/api/bayda/route.ts` — Bayda API (Claude Haiku)

## Environment Variables (on Vercel `routinex` project)
- `ANTHROPIC_API_KEY` — for Claude API calls
- `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Supabase
- `SUPABASE_SERVICE_ROLE_KEY` — server-side Supabase
- `STRIPE_SECRET_KEY` / `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` — payments
- `RESEND_API_KEY` — email
- `OWNER_EMAIL` — notification recipient (22tucker22@comcast.net)

## Execution Order
Follow Coda_13_Claude_Code_Build_Kit.md prompts 0-15 in order. They build on each other. One prompt per session. Target: May 7, 2026 launch.
