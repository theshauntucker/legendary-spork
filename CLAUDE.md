# RoutineX — Claude Code Project Instructions

> This file is automatically read by Claude Code at the start of every session.
> It provides full context so Shaun can request changes from anywhere (phone, tablet, etc.)
> without needing to re-explain the project.

## Project Overview

**RoutineX** is an AI-powered dance & cheer video analysis platform. Users upload a routine video, the app extracts frames, sends them to the Anthropic API for analysis, and returns competition-standard scoring with detailed feedback.

- **Owner:** Shaun Tucker (22tucker22@comcast.net)
- **Live site:** routinex.org
- **Repo:** github.com/theshauntucker/legendary-spork

## Monorepo Structure

```
legendary-spork/
├── src/                    # Web app (Next.js 16 + TypeScript + Tailwind CSS 4)
│   ├── app/                # Next.js App Router pages & API routes
│   │   ├── api/            # Backend API endpoints
│   │   │   ├── process/    # AI analysis pipeline (Anthropic API)
│   │   │   ├── upload/     # Video frame upload
│   │   │   ├── checkout/   # Stripe payment
│   │   │   ├── waitlist/   # Email waitlist
│   │   │   ├── delete-frames/  # User-triggered frame deletion
│   │   │   └── cron/       # Scheduled jobs (frame cleanup)
│   │   ├── analysis/[id]/  # Analysis report page
│   │   ├── upload/         # Upload flow page
│   │   ├── privacy/        # Privacy policy
│   │   └── signup/         # Registration with COPPA consent
│   ├── components/         # React components (Navbar, Hero, Pricing, etc.)
│   └── lib/                # Utilities (Stripe, Supabase clients)
├── mobile/                 # Mobile app (Expo / React Native)
│   ├── app/                # Expo Router (file-based routing)
│   │   ├── (auth)/         # Login, Signup (with COPPA consent)
│   │   ├── (tabs)/         # Dashboard, Upload, Profile
│   │   ├── analysis/[id]   # Analysis report
│   │   └── processing/[id] # Processing status
│   ├── components/         # RN components
│   ├── lib/                # Supabase client, auth, API helpers
│   ├── app.json            # Expo config
│   └── eas.json            # EAS Build config
├── shared/                 # Shared types & constants (web + mobile)
│   ├── types.ts            # Analysis types, API response types
│   └── constants.ts        # Scoring categories, competition types
├── CLAUDE.md               # THIS FILE — project instructions for Claude
├── CLAUDE-CODE-HANDOFF.md  # Full implementation spec (Parts 1-5)
├── package.json            # Root (web app)
├── vercel.json             # Vercel deployment config
└── tsconfig.json           # TypeScript config
```

## Tech Stack

### Web
- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS 4
- **Database:** Supabase (Postgres + Auth + Storage)
- **AI:** Anthropic Claude API (vision — frame analysis)
- **Payments:** Stripe ($2.99/video)
- **Hosting:** Vercel (auto-deploys from push)
- **Email:** Resend

### Mobile
- **Framework:** Expo (React Native) with Expo Router
- **Auth:** Supabase Auth via expo-secure-store
- **Video:** expo-video-thumbnails (native frame extraction)
- **Payments:** Stripe web checkout via expo-web-browser
- **Notifications:** expo-notifications
- **Build/Deploy:** EAS Build + EAS Submit

## Key Architecture Decisions

1. **Video never leaves the device.** Only extracted thumbnail frames are uploaded.
2. **Names are anonymized** before sending to Anthropic. "The performer" / "The studio" are used in the AI prompt, then replaced with real names in post-processing.
3. **Frames auto-delete within 24 hours.** Users can also delete immediately.
4. **Mobile app uses the same backend.** API calls go to routinex.org. Supabase is accessed directly for auth and storage.
5. **No PII sent to AI.** Dancer names, studio names stripped before API call.
6. **COPPA compliance required by April 22, 2026.** Parental consent checkboxes on signup, consent records stored in DB.

## Environment Variables

### Web (set in Vercel dashboard)
- `NEXT_PUBLIC_SUPABASE_URL` — Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Supabase anon/public key
- `SUPABASE_SERVICE_ROLE_KEY` — Supabase service role (server-side only)
- `ANTHROPIC_API_KEY` — Claude API key
- `STRIPE_SECRET_KEY` — Stripe secret key
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` — Stripe publishable key
- `RESEND_API_KEY` — Email service
- `CRON_SECRET` — Auth token for cron endpoints

### Mobile (set in Expo / eas.json)
- `EXPO_PUBLIC_SUPABASE_URL` — same Supabase URL
- `EXPO_PUBLIC_SUPABASE_ANON_KEY` — same anon key
- `EXPO_PUBLIC_API_BASE` — `https://routinex.org`
- `EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY` — same Stripe publishable key

## Database Schema (Supabase)

### Key Tables
- `videos` — uploaded video metadata, analysis status, `frames_deleted` flag
- `consent_records` — COPPA consent tracking (user_id, consent_type, version, timestamp, IP)
- Supabase Storage bucket: `frames` — thumbnail images (auto-deleted after 24hrs)

## Common Tasks

### Deploy web changes
```bash
git add -A && git commit -m "description" && git push
# Vercel auto-deploys from the push
```

### Run web locally
```bash
npm run dev  # runs on localhost:3000
```

### Run mobile locally
```bash
cd mobile && npx expo start
```

### Build mobile for App Store
```bash
cd mobile
eas build --platform ios
eas submit --platform ios
```

### Build mobile for Google Play
```bash
cd mobile
eas build --platform android
eas submit --platform android
```

## Implementation Status

### Part 1: Web Privacy Features — COMPLETE
- [x] `src/app/api/process/route.ts` — name anonymization in AI prompt
- [x] `src/app/api/delete-frames/route.ts` — user frame deletion endpoint
- [x] `src/app/api/cron/cleanup-frames/route.ts` — 24hr auto-cleanup cron
- [x] `src/app/analysis/[id]/AnalysisReport.tsx` — privacy UI (banners, delete button)
- [x] `src/app/analysis/[id]/page.tsx` — pass framesDeleted/videoId to report
- [x] `src/app/privacy/page.tsx` — full privacy policy (15 sections)
- [x] `vercel.json` — add cron schedule

### Part 2: COPPA Consent Flow — COMPLETE
- [x] `src/app/signup/page.tsx` — registration with consent checkboxes
- [x] `src/app/login/page.tsx` — login page with Supabase Auth
- [x] `src/lib/supabase.ts` — shared Supabase client helpers
- [ ] `consent_records` table in Supabase — SQL ready, needs to be run manually
- [x] Block signup until consent given

### Part 3: Mobile App — SCREENS BUILT
- [x] Expo project scaffolded in `mobile/`
- [x] Auth (login/signup with COPPA)
- [x] Dashboard (past analyses with scores, pull-to-refresh)
- [x] Upload flow (video pick/record → frame extract → metadata → pay → submit)
- [x] Analysis report (full port from web — scores, timeline, improvement roadmap, delete frames)
- [x] Processing status (animated progress steps, polling)
- [x] Profile & settings (privacy info, sign out, delete account)
- [ ] Push notifications
- [ ] App Store submission (requires Apple Developer Account)

### Part 3: Mobile App — NOT YET BUILT
- [ ] Expo project scaffolded in `mobile/`
- [ ] Auth (login/signup with COPPA)
- [ ] Dashboard (past analyses)
- [ ] Upload flow (video → frames → metadata → pay → submit)
- [ ] Analysis report (port from web)
- [ ] Profile & settings
- [ ] Push notifications
- [ ] App Store submission

## Apple Developer Account
Shaun needs to create this manually at developer.apple.com ($99/year). Claude Code cannot do this. Required before App Store submission.
