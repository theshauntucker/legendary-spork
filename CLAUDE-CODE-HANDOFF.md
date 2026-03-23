# RoutineX — Claude Code Master Handoff
**Date:** March 23, 2026
**Owner:** Shaun Tucker (22tucker22@comcast.net)
**Repo:** github.com/theshauntucker/legendary-spork
**Branch:** claude/clarify-task-dsVIo
**Stack:** Next.js 16 + TypeScript + Tailwind CSS 4 + Supabase + Stripe + Vercel
**Live site:** routinex.org
---
## PART 1: DEPLOY THESE WEB CHANGES IMMEDIATELY
These changes are already written in the repo but need to be committed, pushed, and deployed. All changes have been audited. The Supabase SQL migration has already been run.
### Change 1: Name Anonymization in AI Prompt (`src/app/api/process/route.ts`)
**What:** Strip dancer/studio names before sending to Anthropic API, inject them back after.
**Lines ~300-301** — In the prompt template, replace the dynamic name variables:
```
- Performer: The performer
- Studio: The studio
```
(Previously these were `${metadata.dancerName}` and `${metadata.studioName}`)
**Lines ~480-521** — Post-processing block after `JSON.parse`:
```typescript
// Post-processing: inject dancer/studio names into analysis text
// Names were deliberately excluded from the AI prompt for privacy
if (metadata.dancerName || metadata.studioName) {
  const replaceName = (text: string): string => {
    if (metadata.dancerName) {
      text = text
        .replace(/\bThe performer\b/g, metadata.dancerName)
        .replace(/\bthe performer\b/g, metadata.dancerName)
        .replace(/\bThe Performer\b/g, metadata.dancerName);
    }
    if (metadata.studioName) {
      text = text
        .replace(/\bThe studio\b/g, metadata.studioName)
        .replace(/\bthe studio\b/g, metadata.studioName)
        .replace(/\bThe Studio\b/g, metadata.studioName);
    }
    return text;
  };
  if (analysis.judgeScores && Array.isArray(analysis.judgeScores)) {
    for (const category of analysis.judgeScores) {
      if (category.feedback) category.feedback = replaceName(category.feedback);
      if (category.styleNotes) category.styleNotes = replaceName(category.styleNotes);
    }
  }
  if (analysis.timelineNotes && Array.isArray(analysis.timelineNotes)) {
    for (const note of analysis.timelineNotes) {
      if (note.note) note.note = replaceName(note.note);
    }
  }
  if (analysis.improvementPriorities && Array.isArray(analysis.improvementPriorities)) {
    for (const item of analysis.improvementPriorities) {
      if (item.item) item.item = replaceName(item.item);
      if (item.trainingTip) item.trainingTip = replaceName(item.trainingTip);
    }
  }
}
```
### Change 2: Delete Frames API (`src/app/api/delete-frames/route.ts`) — NEW FILE
DELETE endpoint. Authenticated user can immediately delete all stored thumbnail frames for a video they own. Verifies auth + ownership, deletes from Supabase Storage (via frame paths AND folder listing), marks video as `frames_deleted: true`.
### Change 3: Cleanup Cron (`src/app/api/cron/cleanup-frames/route.ts`) — NEW FILE
Hourly cron. Finds analyzed videos where `frames_deleted` is null/false and `updated_at` < 24 hours ago. Processes in batches of 50. Deletes frames from storage, marks as `frames_deleted`. Protected by `CRON_SECRET` bearer token.
### Change 4: Vercel Cron Config (`vercel.json`)
Added:
```json
{ "path": "/api/cron/cleanup-frames", "schedule": "0 * * * *" }
```
### Change 5: AnalysisReport UI (`src/app/analysis/[id]/AnalysisReport.tsx`)
Added privacy features to the analysis report page:
- Green privacy banner with Shield icon: "Thumbnail images will be automatically removed within 24 hours"
- Download Report PDF button
- Delete Thumbnails Now button (greyed out for 60 seconds with timer)
- Confirmation modal with "Keep Thumbnails" / "Delete Now"
- Green "frames deleted" confirmation banner with Lock icon
- Modified thumbnail display: shows Lock icon + "Removed for privacy" when deleted
New state: `framesDeleted`, `showDeleteConfirm`, `deleting`, `bannerReady`
New props in AnalysisData interface: `framesDeleted?: boolean`, `videoId?: string`
### Change 6: Analysis Page Data Pass (`src/app/analysis/[id]/page.tsx`)
Now passes to AnalysisReport:
- `frames: video.frames_deleted ? [] : frameUrls`
- `framesDeleted: video.frames_deleted ?? false`
- `videoId: video.id`
### Change 7: Privacy Page (`src/app/privacy/page.tsx`)
FULL REPLACEMENT. The new version has 15 sections (up from 10). Key additions:
- "How Video Analysis Works" — video never leaves device, only frames
- "Anonymous AI Analysis" — no PII sent to AI
- "No Human Review"
- "Thumbnail Auto-Deletion" — 24hr auto-delete + instant option
- "Anthropic Data Policy" — 30-day retention, no training, with link
- "Data Sharing & Selling" — no ads, no trackers, no data sales
- "Children's Privacy & COPPA Compliance" — parental consent, data minimization, parental rights
- Updated third-party services with privacy details
### Supabase Migration (ALREADY RUN)
```sql
ALTER TABLE videos ADD COLUMN frames_deleted boolean DEFAULT false;
ALTER TABLE videos ADD COLUMN frames_deleted_at timestamptz;
CREATE INDEX idx_videos_frames_cleanup ON videos (status, frames_deleted, updated_at);
```
### Environment Variable Needed
`CRON_SECRET` — Set in Vercel environment variables. Any secure random string. Used to authenticate the cleanup cron endpoint.
### Deploy Steps
1. Commit all changes on `claude/clarify-task-dsVIo` branch
2. Push to GitHub
3. Set `CRON_SECRET` env var in Vercel dashboard if not already set
4. Vercel auto-deploys from push
5. Verify deployment succeeds (previous ERROR state was a build failure)
---
## PART 2: COPPA CONSENT FLOW (NEW — NOT YET CODED)
**Deadline: April 22, 2026** (amended COPPA Rule compliance)
### What's Needed
Add parental consent checkboxes to the signup/registration flow. When a parent creates an account, they must confirm:
1. They are the parent/legal guardian of any minor whose routines will be analyzed
2. They consent to temporary processing of still-frame images by our AI provider
3. They understand they can delete data at any time
### Implementation
Add to `src/app/signup/page.tsx` (or wherever registration form lives):
```tsx
// COPPA consent checkboxes — required before account creation
<div className="space-y-3 mt-4 text-sm text-surface-300">
  <label className="flex items-start gap-2">
    <input type="checkbox" required className="mt-1"
      checked={parentConsent} onChange={(e) => setParentConsent(e.target.checked)} />
    <span>I am the parent or legal guardian of any minor whose dance/cheer routines
    will be submitted for analysis through RoutineX.</span>
  </label>
  <label className="flex items-start gap-2">
    <input type="checkbox" required className="mt-1"
      checked={dataConsent} onChange={(e) => setDataConsent(e.target.checked)} />
    <span>I consent to the temporary processing of still-frame images extracted from
    my child's routine video by our AI analysis provider (Anthropic). These images are
    analyzed anonymously and automatically deleted from our servers within 24 hours.</span>
  </label>
</div>
```
### Store Consent Records
Add to the user profile or a new `consent_records` table:
```sql
CREATE TABLE consent_records (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id),
  consent_type text NOT NULL, -- 'coppa_parent', 'coppa_data_processing'
  consent_version text NOT NULL, -- 'v1.0'
  consented_at timestamptz DEFAULT now(),
  ip_address text,
  user_agent text
);
```
Block account creation until both checkboxes are checked. Store the consent record on successful signup.
---
## PART 3: BUILD ROUTINEX EXPO (REACT NATIVE) APP
### Overview
Build a native iOS + Android app using Expo (React Native) that replicates the RoutineX web app experience. The app should use the SAME Supabase backend and API endpoints — just a different frontend.
### Why Expo
- One codebase → iOS + Android
- Expo handles certificates, signing, App Store submissions (EAS Build + Submit)
- Over-the-air updates for JS changes (no App Store review for minor fixes)
- Native camera/video APIs for better privacy (video never leaves device natively)
- Supabase has official React Native support (`@supabase/supabase-js` works in RN)
### App Architecture
```
mobile/
├── app/                          # Expo Router (file-based routing)
│   ├── (auth)/                   # Auth group
│   │   ├── login.tsx
│   │   ├── signup.tsx            # With COPPA consent checkboxes
│   │   └── _layout.tsx
│   ├── (tabs)/                   # Main app tabs
│   │   ├── index.tsx             # Dashboard — list of analyses
│   │   ├── upload.tsx            # Record/select video → extract frames → upload
│   │   ├── profile.tsx           # Account settings, privacy info
│   │   └── _layout.tsx
│   ├── analysis/[id].tsx         # Full analysis report view
│   ├── processing/[id].tsx       # Processing status screen
│   └── _layout.tsx               # Root layout with auth provider
├── components/
│   ├── AnalysisReport.tsx        # Port from web — the main report UI
│   ├── PrivacyBanner.tsx         # "Thumbnails auto-delete" banner
│   ├── DeleteFramesModal.tsx     # Confirmation modal
│   ├── VideoFrameExtractor.tsx   # Native frame extraction from video
│   └── ui/                       # Shared UI components
├── lib/
│   ├── supabase.ts               # Supabase client for React Native
│   ├── auth.tsx                  # Auth context provider
│   ├── api.ts                    # API calls to existing Next.js endpoints
│   └── storage.ts                # Secure storage (expo-secure-store)
├── app.json                      # Expo config
├── eas.json                      # EAS Build config
└── package.json
```
### Key Technical Details
#### Supabase Auth in React Native
```typescript
import { createClient } from '@supabase/supabase-js'
import * as SecureStore from 'expo-secure-store'
const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL!,
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      storage: {
        getItem: (key) => SecureStore.getItemAsync(key),
        setItem: (key, value) => SecureStore.setItemAsync(key, value),
        removeItem: (key) => SecureStore.deleteItemAsync(key),
      },
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  }
)
```
#### Video Frame Extraction (Native)
Instead of canvas-based extraction (web), use `expo-video-thumbnails`:
```typescript
import * as VideoThumbnails from 'expo-video-thumbnails';
async function extractFrames(videoUri: string, timestamps: number[]) {
  const frames = [];
  for (const time of timestamps) {
    const { uri } = await VideoThumbnails.getThumbnailAsync(videoUri, {
      time: time * 1000, // ms
      quality: 0.8,
    });
    frames.push({ timestamp: time, uri });
  }
  return frames;
}
```
#### API Calls
The app calls the SAME Next.js API endpoints on routinex.org:
```typescript
const API_BASE = 'https://routinex.org';
// Upload frames
const uploadFrames = async (frames, metadata, token) => {
  // Upload each frame to Supabase Storage directly
  // Then call /api/process with the metadata
};
// Get analysis
const getAnalysis = async (videoId, token) => {
  const res = await fetch(`${API_BASE}/api/videos/${videoId}/status`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.json();
};
```
#### Stripe In-App Payments
Use `@stripe/stripe-react-native` for in-app purchases or redirect to Stripe Checkout via `expo-web-browser`.
Note: Apple takes 30% commission on in-app purchases. Consider using Stripe web checkout (opened in browser) to avoid the Apple tax — this is what most SaaS apps do.
#### Push Notifications
Use `expo-notifications` + Supabase Edge Functions to notify when analysis is complete.
### Expo Dependencies
```bash
npx expo install @supabase/supabase-js expo-secure-store expo-video-thumbnails expo-image-picker expo-camera expo-notifications expo-web-browser @stripe/stripe-react-native expo-file-system
```
### App Store Submission Checklist
1. Apple Developer Account — $99/year at developer.apple.com
2. EAS Build setup — `npx eas-cli login` + `eas build:configure`
3. App metadata — Name: "RoutineX", description, screenshots, category (Sports or Education)
4. Privacy Nutrition Labels
5. Age Rating — 4+
6. App Privacy Policy URL — routinex.org/privacy
7. Build & submit: `eas build --platform ios` → `eas submit --platform ios`
### Screens to Build (Priority Order)
1. Login/Signup with COPPA consent
2. Dashboard — past analyses list
3. Upload Flow — pick/record video → extract frames → metadata → pay → submit
4. Processing — status screen
5. Analysis Report — port from web
6. Profile — account settings, privacy, delete account
---
## PART 4: ENV VARIABLES NEEDED
### Web (Vercel) — Existing
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `ANTHROPIC_API_KEY`
- `STRIPE_SECRET_KEY`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `RESEND_API_KEY`
### Web (Vercel) — New
- `CRON_SECRET` — any secure random string for cron auth
### Expo App — New
- `EXPO_PUBLIC_SUPABASE_URL` — same as web
- `EXPO_PUBLIC_SUPABASE_ANON_KEY` — same as web
- `EXPO_PUBLIC_API_BASE` — `https://routinex.org`
- `EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY` — same as web
---
## PART 5: PRIORITY ORDER
1. **NOW:** Deploy Part 1 (web changes — privacy features, name anonymization, auto-delete, privacy page)
2. **THIS WEEK:** Code Part 2 (COPPA consent flow on registration)
3. **THIS WEEK:** Start Part 3 (Expo app scaffolding, auth, dashboard)
4. **NEXT WEEK:** Complete Part 3 (upload flow, analysis report, payment)
5. **WEEK 3:** TestFlight beta → App Store submission
6. **BY APRIL 22:** COPPA compliance complete across web + app
