# RoutineX — Master Reference Document
**Last updated:** April 13, 2026
**Paste this at the start of any Claude session to get fully briefed.**

---

## 1. What Is RoutineX

AI-powered competitive dance & cheer video analysis. Built by a dance dad (Shaun Tucker).
- Users upload a routine video
- AI analyzes still frames and returns competition-style scoring + feedback
- Three simulated judges score Technique, Performance, Choreography, Overall
- Users get timestamped notes, improvement priorities, and award level (Gold → Diamond)
- Dancers can re-submit the same routine to track improvement over time (Season Tracker)

**Live site:** https://routinex.org
**Admin email:** 22tucker22@comcast.net (bypasses credit checks)

---

## 2. Tech Stack

| Layer | What |
|-------|------|
| Framework | Next.js 16 App Router, React 19, TypeScript |
| Styling | Tailwind CSS, framer-motion animations |
| Auth + DB | Supabase (email/password, no email confirmation required — auto-confirm ON) |
| Storage | Supabase Storage (frame images) |
| Payments | Stripe (checkout sessions + webhooks) |
| AI | Anthropic Claude Vision API |
| Deploy | Vercel → routinex.org |
| Repo | github.com/theshauntucker/legendary-spork |
| Production branch | `main` — always push here |

---

## 3. Pushing Code

When Claude makes changes, push with:
```
git push https://[GITHUB_TOKEN]@github.com/theshauntucker/legendary-spork.git [local-branch]:main
```
To get a GitHub token: Chrome → github.com/settings/tokens → create classic token with `repo` scope.

Vercel auto-deploys on every push to `main`. Deploy takes ~2 minutes.

---

## 4. Pricing (Current — April 2026)

| Tier | Price | Credits | Notes |
|------|-------|---------|-------|
| Free | $0 | 1 analysis | Granted automatically on every new signup, permanently |
| BOGO | $8.99 | 2 analyses | Buy one get one — `payment_type: "single"` in Stripe |
| **Season Member** | **$12.99/mo** | **10/month** | Recurring subscription — introductory rate, rate-locked messaging |
| Competition Pack | $29.99 | 5 analyses | `payment_type: "video_analysis"` in Stripe |

**Important:** The free credit is NOT a trial promo. It's a permanent feature — every signup always gets 1 free analysis, no card required.

**Season Member subscription:**
- Stripe `mode: "subscription"`, $12.99/month recurring
- `payment_type: "subscription"` in both session metadata AND subscription_data metadata
- First month: 10 credits granted via `checkout.session.completed` webhook
- Monthly renewals: 10 credits granted via `invoice.payment_succeeded` webhook (when `billing_reason === "subscription_cycle"`)
- Highlighted as featured tier in Pricing component (ring + glow effect + "🔒 Rate locked at intro price")

---

## 5. How Credits Work

- **`src/lib/credits.ts`** — `grantCredits()` and `getUserCredits()` and `useCredit()`
- `grantCredits(serviceClient, userId, amount, fromPayment)` — inserts into `user_credits`, uses atomic RPC fallback for race conditions
- `getUserCredits()` — returns `{ hasCredits, totalCredits, usedCredits, remainingCredits }`
- `useCredit()` — deducts 1 credit after successful analysis
- Admin email (`ADMIN_EMAIL` env var) bypasses credit checks entirely

**Free credit grant (fixed April 11, 2026):**
In `src/app/auth/callback/route.ts` — after OAuth callback, checks if `user_credits` row exists for the user. If no row exists, grants 1 free credit. Completely idempotent — safe to run multiple times. Previous implementation used a broken 60-second timer that silently failed for anyone who waited to click the confirmation email.

```js
const { data: existingCredits } = await serviceClient
  .from("user_credits")
  .select("user_id")
  .eq("user_id", user.id)
  .maybeSingle();
if (!existingCredits) {
  await grantCredits(serviceClient, user.id, 1, false);
}
```

---

## 6. Signup Flow (What Users Experience)

1. User fills out form at `/signup` — name, email, password, optional referral code
2. Account created immediately (auto-confirm ON — no email verification step)
3. User is auto-signed in
4. Redirected to `/dashboard` after 1.2 seconds
5. Auth callback at `/auth/callback` grants 1 free credit if they don't have one yet
6. Dashboard shows welcome banner + pricing options

**Note:** Success screen on signup still says "Redirecting to payment to activate your Founding Member Pass" — this is outdated copy that should be updated to "Taking you to your dashboard..."

---

## 7. Key Files & What They Do

| File | Purpose |
|------|---------|
| `src/app/auth/callback/route.ts` | OAuth callback — grants free credit on first login |
| `src/app/api/analyze/route.ts` | Main upload endpoint — fingerprint check, creates video record, fires background process |
| `src/app/api/process/route.ts` | Background AI analysis — sends frames to Claude, saves results |
| `src/app/api/checkout/route.ts` | Creates Stripe checkout session |
| `src/app/api/webhook/route.ts` | Stripe webhook — grants credits on successful payment |
| `src/app/api/verify-payment/route.ts` | Fallback payment verification if webhook fails |
| `src/lib/credits.ts` | All credit logic — grant, use, check |
| `src/app/upload/page.tsx` | Upload form — video extraction, frame sending, duplicate detection |
| `src/app/dashboard/DashboardClient.tsx` | Dashboard — shows videos, credits, purchase options |
| `src/app/analysis/[id]/AnalysisReport.tsx` | Full analysis report with scores, feedback, timeline |
| `src/components/SocialProofTicker.tsx` | Bottom-left toast showing "dancer from X analyzed" |
| `src/components/Hero.tsx` | Landing page hero — primary CTA |
| `src/components/Pricing.tsx` | 4-tier pricing section (Free / BOGO / Season Member / Pack) |
| `src/app/events/page.tsx` | Competition & convention calendar — SEO landing page (server component) |
| `src/app/events/EventsClient.tsx` | Interactive events page — search, filter by type, featured toggle |
| `src/data/competitions.ts` | 20 dance events data (competitions, conventions, nationals) |

---

## 8. Database Tables (Supabase)

| Table | Key Fields |
|-------|-----------|
| `user_credits` | user_id, total_credits, used_credits |
| `videos` | id, user_id, routine_name, dancer_name, studio_name, age_group, style, entry_type, status, frame_fingerprint, competition_name, competition_date |
| `analyses` | id, video_id, user_id, total_score, award_level, judge_scores, improvement_priorities |
| `payments` | id, user_id, stripe_session_id, amount, credits_granted, payment_type |

**Video statuses:** `processing` → `analyzed` or `error`

---

## 9. Routine Re-Submission (Season Tracking)

- Dancers can re-submit the same routine to track improvement
- Only linked via explicit `parentVideoId` URL param from "Submit Improved Routine" button
- **Auto-detect by routine name was REMOVED (April 12, 2026)** — it was causing accidental cross-linking of same-named routines
- When a routine has a parentVideoId, the AI gets full history context and scores generously
- A hardcoded score boost guarantees improvement: +2 to +8 points above best previous score

---

## 10. Duplicate Video Detection

- Frame fingerprinting: MD5 hash of first 3 frames' base64 data
- Stored in `videos.frame_fingerprint`
- On upload, checks if user has already submitted this exact video
- If duplicate detected: shows amber warning with 3 options:
  1. "View Existing Analysis →" (link to original)
  2. "Upload Different Video" (clear and reset)
  3. "Upload Anyway (testing only)" — bypasses fingerprint check, uses a credit, may produce identical score
- `forceUpload: true` in the request payload skips the check on the API side

---

## 11. Social Proof Ticker

- `src/components/SocialProofTicker.tsx`
- 250 rotating entries: 25 states × 10 dance styles × 5 age groups
- Bottom-left toast, slides in with framer-motion AnimatePresence
- Timing: 8–14s initial delay, then 18–33s gaps in afternoon/Monday, 25–45s other times
- Daily deterministic shuffle (seeded Fisher-Yates) so entries don't repeat in a session
- Added to `src/app/page.tsx`

---

## 12. Scoring System

- AI prompt instructs scoring in range 260–300
- Award levels: Gold (260–269), High Gold (270–279), Platinum (280–289), Diamond (290–300)
- Categories: Technique (max 35), Performance (max 35), Choreography (max 20), Overall (max 10)
- 3 simulated judges per category
- First submissions: AI judges authentically within 260–300 range
- Re-submissions (with parent context): get score boost guarantee + coach-style narrative

---

## 13. Features Built & Live

- [x] Video upload + frame extraction (client-side, video never leaves device)
- [x] AI analysis with Claude Vision
- [x] 3-judge scoring system with category breakdown
- [x] Timestamped feedback notes
- [x] Improvement priorities
- [x] Re-submission tracking (explicit linking only)
- [x] Season Tracker dashboard (`/dancers`, `/dancers/[name]`)
- [x] Duplicate video detection + "Upload Anyway" bypass
- [x] Stripe payments (BOGO $8.99, Pack $29.99)
- [x] Free credit on every signup (permanent)
- [x] Social proof ticker (250 entries)
- [x] 4-tier pricing UI (Free / BOGO / Season Member $12.99/mo / Pack)
- [x] Admin credit management (`/admin`)
- [x] Referral code system
- [x] TikTok Pixel (D7BUDSRC77UDSGCDVMLG)
- [x] Email notifications to admin on new signup/payment
- [x] Competition name + date fields on upload (feeds Season Tracker)
- [x] Countdown banner
- [x] Sample analysis section on landing page
- [x] Season Member subscription tier ($12.99/mo, 10 analyses/month, recurring via Stripe)
- [x] Webhook handler for monthly subscription renewals (`invoice.payment_succeeded`)
- [x] Competition & convention calendar page (`/events`) — 20 events, searchable/filterable
- [x] Platform-style nav (Events with "New" badge, Season link for logged-in users)
- [x] Google AdSense placeholder in layout.tsx (commented out — needs publisher ID)

---

## 14. Known Issues / Things To Fix

- [ ] Signup success screen still says "Redirecting to payment to activate your Founding Member Pass" — should say something about dashboard / free credit
- [ ] First-time analysis scores cluster in low 270s — consider nudging scoring prompt to be slightly more generous (change range from "260-300" to "270-300" or add encouraging language)
- [ ] No Google Analytics / Vercel Analytics configured yet
- [ ] No Google Search Console verification yet
- [ ] Demo video (`public/demo-video.mp4`) not recorded yet

---

## 15. Ideas / Future Features

- ~~Competition calendar integration~~ ✅ DONE — `/events` page with 20 events
- Expand competition calendar with real date/location data (currently shows typical months only)
- Coaches Corner — dedicated coach account type with multi-dancer management
- Group/duo/trio scoring differences (already partially in prompt via entryType)
- Email digest: weekly summary of dancer progress
- Share report feature (public link to analysis)
- Affiliate/referral tracking for dance studios
- Side-by-side comparison of two submissions

---

## 16. User Accounts (Notable)

| Email | Notes |
|-------|-------|
| 22tucker22@comcast.net | Admin — bypasses credits |
| jayne.koehler@gmail.com | Paid $8.99, manually given 4 total credits (3 remaining) as of April 11 |

---

## 17. Bugs Fixed (Session History)

| Date | Bug | Fix |
|------|-----|-----|
| April 11, 2026 | Free credit 60s timer silently failed for email confirmation users | Replaced with DB check — if no user_credits row, grant 1 credit |
| April 11, 2026 | Auto-detect routine linking by name (ilike) caused accidental cross-linking | Removed entirely — parentVideoId must be explicit URL param only |
| April 11, 2026 | Two Roxanne uploads stuck in "error" status | Direct SQL UPDATE to set status="analyzed" with correct analysis_id |
| April 11, 2026 | Dashboard BOGO card showed "1 analysis for $8.99" | Fixed to "BOGO — 2 Analyses for $8.99" |
| April 11, 2026 | Jayne's account missing free credit | Manually granted via SQL, then +1 extra |
| April 12, 2026 | Auto-detect code still in file after previous edit didn't persist | Removed again, pushed to main |
| April 12, 2026 | Duplicate video bypass didn't exist for testing | Added "Upload Anyway" button + forceUpload API param |
| April 13, 2026 | Pricing only had 3 tiers, no subscription option | Added Season Member $12.99/mo as 4th tier with full Stripe subscription flow |
| April 13, 2026 | No competition/convention information on site | Built /events page with 20 events, search/filter, SEO metadata |
| April 13, 2026 | Nav felt like a simple landing page | Reorganized to platform nav with Events badge, Season tracker link |
