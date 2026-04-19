# RoutineX — Master Reference Document
**Last updated:** April 14, 2026
**Paste this at the start of any Claude session to get fully briefed.**

---

## 1. What Is RoutineX

AI-powered competitive dance & cheer video analysis. Built by dance parents (founder: Shaun Tucker; his wife is the public face and voice for the brand).
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
| AI | Anthropic Claude Vision API (analysis), Claude Haiku (chatbot — cost-efficient) |
| Deploy | Vercel → routinex.org |
| Repo | github.com/theshauntucker/legendary-spork |
| Production branch | `main` — always push here |

---

## 3. Pushing Code

```bash
cd /tmp/routinex
git config user.email "shaun@routinex.org"
git config user.name "Shaun"
git add [files]
git commit -m "your message"
git push origin main
```

GitHub token (expires ~July 2026): `ghp_YOUR_TOKEN_HERE`

Clone command:
```bash
git clone https://theshauntucker:ghp_YOUR_TOKEN_HERE@github.com/theshauntucker/legendary-spork.git routinex
```

Vercel auto-deploys on every push to `main`. Deploy takes ~2 minutes.
Multiple branches exist in the same repo (vibeproof-main, religion-niche). Only `main` deploys to routinex.org. If you see failing deployment notifications, check that they are on `main` — other branches failing is normal and irrelevant.

---

## 4. Pricing (Current — April 2026)

| Tier | Price | Credits | Notes |
|------|-------|---------|-------|
| Free | $0 | 1 analysis | Granted automatically on every new signup, permanently |
| BOGO | $8.99 | 2 analyses | Buy one get one — `payment_type: "single"` in Stripe |
| **Season Member** | **$12.99/mo** | **10/month** | Recurring subscription — introductory rate, rate-locked |
| Competition Pack | $29.99 | 5 analyses | `payment_type: "video_analysis"` in Stripe |

**Important:** The free credit is NOT a trial promo. It's a permanent feature — every signup always gets 1 free analysis, no card required.

**Season Member subscription:**
- Stripe `mode: "subscription"`, $12.99/month recurring
- `payment_type: "subscription"` in both session metadata AND subscription_data metadata
- First month: 10 credits granted via `checkout.session.completed` webhook
- Monthly renewals: 10 credits granted via `invoice.payment_succeeded` webhook (when `billing_reason === "subscription_cycle"`)
- Featured as "MOST POPULAR" in Hero and Pricing components

---

## 5. How Credits Work

- **`src/lib/credits.ts`** — `grantCredits()` and `getUserCredits()` and `useCredit()`
- `grantCredits(serviceClient, userId, amount, fromPayment)` — inserts into `user_credits`, uses atomic RPC fallback
- `getUserCredits()` — returns `{ hasCredits, totalCredits, usedCredits, remainingCredits }`
- `useCredit()` — deducts 1 credit after successful analysis
- Admin email (`ADMIN_EMAIL` env var) bypasses credit checks entirely

**Free credit grant:** In `src/app/auth/callback/route.ts` — after OAuth callback, checks if `user_credits` row exists. If no row, grants 1 free credit. Idempotent.

---

## 6. Signup Flow

1. User fills out form at `/signup` — name, email, password, optional referral code
2. Account created immediately (auto-confirm ON — no email verification)
3. User is auto-signed in → redirected to `/dashboard` after 1.2 seconds
4. Auth callback at `/auth/callback` grants 1 free credit

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
| `src/app/dashboard/DashboardClient.tsx` | Dashboard — purchase cards at TOP, always visible, then stats, then routines |
| `src/app/analysis/[id]/AnalysisReport.tsx` | Full analysis report with scores, feedback, timeline |
| `src/components/Hero.tsx` | Landing page hero — Season Member card prominently at top, then BOGO/Pack, then free link |
| `src/components/Pricing.tsx` | 4-tier pricing section (Free / BOGO / Season Member / Pack) |
| `src/components/CountdownBanner.tsx` | Fixed top banner, always exactly h-10 (40px), single row on all screens |
| `src/components/Navbar.tsx` | Fixed at `top-10` (sits directly below 40px banner) |
| `src/components/SocialProofTicker.tsx` | Bottom-left toast — "dancer from X analyzed" |
| `src/app/events/page.tsx` | Competition & convention calendar — SEO metadata, renders EventsClient |
| `src/app/events/EventsClient.tsx` | Interactive events page — search, filter by type, featured toggle |
| `src/data/competitions.ts` | 20 dance events (competitions, conventions, nationals) |
| `src/app/dancers/page.tsx` | Season Tracker hub — lists all dancers with stats |
| `src/app/dancers/[dancerName]/page.tsx` | Individual dancer season view — trophy wall, score chart |

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

## 9. Hero Page Layout (as of April 14, 2026)

The homepage hero has been completely redesigned. Order from top to bottom:

1. **CountdownBanner** — single 40px gradient bar at very top of page (z-index 60)
2. **Navbar** — fixed at `top-10` right below banner
3. **Hero section** (`pt-[130px]`):
   - Audience pill badge ("For competitive dancers, dance moms & studio owners")
   - Big headline: "Score Every Routine. Track the Whole Season."
   - Subtext + trust icons
   - **Green "Try it free" banner** — free first analysis card, links to /signup
   - **Season Member card** — MOST POPULAR, $12.99/mo, feature list, Subscribe button
   - **BOGO + Competition Pack** — side-by-side glass cards
   - "Already have an account? Log in" text link

**CRITICAL Tailwind rule:** Never pass Tailwind class strings as component props. They get purged at build time. Always use `variant: "gold" | "purple"` pattern with hardcoded conditional classes inside the component. This bit us before and will break again silently.

---

## 10. Dashboard Layout (as of April 14, 2026)

Order from top to bottom inside DashboardClient:
1. Welcome message
2. **SubscriptionHeroCard** — Season Member card, ALWAYS visible (no condition gate)
3. **HeroPurchaseCard x2** — BOGO (gold variant) + Competition Pack (purple variant), side by side
4. Stats row (analyses used, credits remaining, etc.)
5. Upload CTA button
6. Season Tracker section
7. Routines list

**Note:** The purchase section has NO visibility condition — it always shows regardless of credit count. Previously it was gated on `credits.total <= 1 && credits.used === 0` which hid it for paying users.

---

## 11. Routine Re-Submission (Season Tracking)

- Dancers can re-submit the same routine to track improvement
- Only linked via explicit `parentVideoId` URL param from "Submit Improved Routine" button
- Auto-detect by routine name was REMOVED — caused accidental cross-linking
- Re-submissions get: full history context, coach narrative, +2 to +8 score boost guarantee

---

## 12. Duplicate Video Detection

- Frame fingerprinting: MD5 hash of first 3 frames' base64 data
- If duplicate detected: amber warning with 3 options:
  1. "View Existing Analysis →"
  2. "Upload Different Video"
  3. "Upload Anyway (testing only)" — bypasses check, uses a credit

---

## 13. Scoring System

- Score range: 260–300
- Award levels: Gold (260–269), High Gold (270–279), Platinum (280–289), Diamond (290–300)
- Categories: Technique (max 35), Performance (max 35), Choreography (max 20), Overall (max 10)
- 3 simulated judges per category
- Re-submissions: score boost guarantee + coach-style improvement narrative

---

## 14. Events Page — Current State (`/events`)

**What exists:**
- 20 hardcoded events in `src/data/competitions.ts`
- Types: competition, convention, nationals
- Each event has: name, organizer, website, description, styles[], regions[], typicalMonths[], featured flag
- Page features: search, type filter, featured-only toggle, featured strip at top, all-events grid
- **NOT real dates** — only `typicalMonths` (e.g., [3,4,5] = "typically March–May")
- **NOT location-specific** — just regions like "Midwest", "National"
- No per-event detail pages
- No schedule/time data
- No user interaction (can't "attend", can't add schedule)

---

## 15. Features Built & Live

- [x] Video upload + frame extraction (client-side, video never leaves device)
- [x] AI analysis with Claude Vision
- [x] 3-judge scoring system with category breakdown
- [x] Timestamped feedback notes + improvement priorities
- [x] Re-submission tracking (explicit linking only)
- [x] Season Tracker dashboard (`/dancers`, `/dancers/[name]`)
- [x] Duplicate video detection + "Upload Anyway" bypass
- [x] Stripe payments (BOGO $8.99, Pack $29.99, Season Member $12.99/mo)
- [x] Free credit on every signup (permanent)
- [x] Social proof ticker (250 entries)
- [x] 4-tier pricing UI
- [x] Admin credit management (`/admin`)
- [x] Referral code system
- [x] TikTok Pixel (D7BUDSRC77UDSGCDVMLG)
- [x] Email notifications to admin on new signup/payment
- [x] Countdown banner (single-line, 40px, fixed)
- [x] Sample analysis section on landing page
- [x] Competition & convention calendar page (`/events`) — 20 events
- [x] Platform nav with Events "New" badge + Season link for logged-in users
- [x] Hero redesigned with Season Member card at top
- [x] Free first analysis card above subscription options in hero

---

## 16. Known Issues / Things To Fix

- [ ] Signup success screen still says "Redirecting to payment to activate your Founding Member Pass" — should say something about dashboard / free credit
- [ ] First-time analysis scores cluster in low 270s — consider nudging prompt to 270–300 range
- [ ] No Google Analytics / Vercel Analytics configured yet
- [ ] No Google Search Console verification yet
- [ ] Demo video (`public/demo-video.mp4`) not recorded yet
- [ ] Events page has no real dates — only "typical months"

---

## 17. User Accounts (Notable)

| Email | Notes |
|-------|-------|
| 22tucker22@comcast.net | Admin — bypasses credits |
| jayne.koehler@gmail.com | Paid $8.99, manually given 4 total credits (3 remaining) as of April 11 |

---

## 18. Bugs Fixed (Session History)

| Date | Bug | Fix |
|------|-----|-----|
| April 11, 2026 | Free credit 60s timer silently failed for email confirmation users | Replaced with DB check |
| April 11, 2026 | Auto-detect routine linking caused accidental cross-linking | Removed — parentVideoId must be explicit URL param only |
| April 12, 2026 | Duplicate video bypass didn't exist | Added "Upload Anyway" button + forceUpload API param |
| April 13, 2026 | Pricing only had 3 tiers | Added Season Member $12.99/mo as 4th tier with full Stripe subscription flow |
| April 13, 2026 | No competition info on site | Built /events page with 20 events, search/filter, SEO metadata |
| April 14, 2026 | Dashboard subscription card not showing (condition `credits.total <= 1 && credits.used === 0` excluded paying users) | Removed condition — always visible |
| April 14, 2026 | Dashboard purchase cards buried below stats | Moved to top of dashboard |
| April 14, 2026 | Countdown banner 3 lines tall on mobile, overlapping navbar | Rewrote to always be single h-10 row, short text on mobile |
| April 14, 2026 | Homepage hero "too basic" — subscription not prominent | Completely rewrote Hero.tsx with Season Member card, BOGO/Pack, and free tier all at top |
| April 14, 2026 | Tailwind dynamic class purging bug | Switched HeroPurchaseCard to variant: "gold" | "purple" pattern with hardcoded classes |

---
---

# NEXT SESSION — Events, Calendar & Bayda AI Chatbot

> **This section is the full brief for the next development session.**
> The goal: transform the `/events` page from a static reference list into a live, interactive hub that parents actually open every competition weekend. The centerpiece is **Bayda**, an AI assistant powered by Claude Haiku that answers schedule questions, explains scoring, and helps parents navigate competition day.

---

## Why This Matters

Dance moms and dads are on their phones all weekend at competitions. They need to know:
- "What time does Emma's lyrical go on?"
- "We have 3 routines today — what order?"
- "What's the difference between Platinum and Diamond?"
- "StarPower uses a 300-point system — how does that work?"
- "What does 'technique' actually mean for the judges?"

Right now there's nowhere on RoutineX to answer any of those questions. This feature closes that gap and makes RoutineX an indispensable competition-day tool — not just something you use before the competition.

---

## Feature 1: Competition Weekend Schedule ("My Schedule")

### What It Is
A per-event schedule tool where a user adds their dancer's entries for a specific competition weekend. Parents can then see everything in order, and Bayda can answer "what time is the tap solo?" instantly.

### Database Changes Needed

```sql
-- New table: user_event_schedules
-- Each row = one competition the user is attending
CREATE TABLE user_event_schedules (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  competition_name TEXT NOT NULL,
  competition_date DATE NOT NULL,
  venue_name TEXT,
  venue_city TEXT,
  venue_state TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- New table: schedule_entries
-- Each row = one routine/entry in a user's schedule
CREATE TABLE schedule_entries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  schedule_id UUID REFERENCES user_event_schedules(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  dancer_name TEXT NOT NULL,
  routine_name TEXT NOT NULL,
  style TEXT,                    -- Jazz, Lyrical, Tap, Hip Hop, etc.
  entry_type TEXT,               -- Solo, Duo, Trio, Small Group, Large Group, Production
  division TEXT,                 -- Mini, Petite, Junior, Teen, Senior
  performance_time TIME,         -- e.g. 10:30 AM
  performance_day TEXT,          -- Saturday, Sunday
  stage_number INT,              -- Stage 1, Stage 2, etc. (some venues have multiple)
  notes TEXT,                    -- Any extra notes (costume color, warm-up time, etc.)
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE user_event_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE schedule_entries ENABLE ROW LEVEL SECURITY;

-- Policies: users can only see/edit their own data
CREATE POLICY "Users manage own schedules" ON user_event_schedules
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users manage own entries" ON schedule_entries
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
```

### New Pages/Components

**`src/app/schedule/page.tsx`** — "My Competition Schedule" (behind auth)
- Lists all the user's upcoming competition weekends
- "Add Competition Weekend" button → modal form
- Each competition card shows: name, date, venue, # entries, "View Schedule" link

**`src/app/schedule/[scheduleId]/page.tsx`** — Individual weekend view
- Day-by-day timeline (Saturday / Sunday)
- Each entry shows: time, stage, dancer name, routine name, style, entry type
- "Add Entry" button (inline form, no page navigate)
- Printable view (print stylesheet)
- "Ask Bayda" button opens chatbot with full schedule context pre-loaded

### UI Pattern
- Clean card list sorted by time within each day
- Color-code by dancer name if multiple dancers (e.g. family with 3 kids)
- Mobile-first — parents are on phones at the venue

---

## Feature 2: Bayda — AI Competition Assistant

### What Is Bayda?
Bayda is RoutineX's AI chatbot, powered by **Claude Haiku** (cheap, fast — perfect for Q&A). She lives as a chat widget accessible from the events page, schedule page, and potentially the dashboard.

**Name:** Bayda (means "white/bright" — a nod to stage spotlights)
**Personality:** Warm, knowledgeable dance mom energy. Encouraging, never condescending. Uses dance competition vocabulary naturally. Knows she's an AI but acts like a seasoned dance parent who's been doing this for 15 years.

### What Bayda Knows (Context Sources)

1. **Competition schedule** — if the user has entries added, Bayda gets the full schedule injected into her system prompt
2. **RoutineX scoring system** — knows how the Gold/High Gold/Platinum/Diamond award levels work, what each category means
3. **General dance competition knowledge** — how real competitions are judged, what score ranges mean, technique terminology, glossary of styles
4. **Events database** — knows all 20 events in `src/data/competitions.ts` (name, typical dates, regions, styles, website)

### Example Conversations

```
Parent: "What time is Emma's lyrical solo?"
Bayda: "Emma's lyrical solo is scheduled for Saturday at 11:20 AM on Stage 2. 
        You've got about 45 minutes if you're at check-in now. 
        Want me to show you the full Saturday lineup?"

Parent: "We got Platinum — is that good?"
Bayda: "Platinum is excellent! That puts you in the 280–289 range out of 300, 
        which means the judges see real competition-ready quality. 
        Diamond (290–300) is the top tier — you're very close. 
        What category scored highest?"

Parent: "What does technique mean to a judge?"
Bayda: "Technique is about the physical execution of the dance — clean lines, 
        proper footwork, body alignment, and whether the skills are performed 
        with control and precision. Think: are the turns completed cleanly? 
        Are the jumps landing softly with good form? 
        It's worth 35 out of 100 points per judge in RoutineX's system."

Parent: "When is Jump Dance Convention usually in Chicago?"
Bayda: "Jump Dance Convention typically hits major cities September through May. 
        Chicago is one of their regular stops — usually in the fall or spring. 
        For exact 2026 dates, I'd check jumpdance.com directly since they 
        release city schedules a few months out. Want me to pull up all their details?"
```

### Technical Implementation

**`src/app/api/bayda/route.ts`** — API route
```typescript
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

export async function POST(req: Request) {
  const { messages, scheduleContext, userId } = await req.json();

  // Build system prompt with context
  const systemPrompt = buildBaydaSystemPrompt(scheduleContext);

  const response = await client.messages.create({
    model: "claude-haiku-4-5-20251001",  // Cheap, fast
    max_tokens: 400,                      // Keep responses concise
    system: systemPrompt,
    messages: messages,                   // Pass full conversation history
  });

  return Response.json({ 
    reply: response.content[0].text 
  });
}

function buildBaydaSystemPrompt(scheduleContext?: ScheduleContext) {
  let prompt = `You are Bayda, RoutineX's AI competition assistant. 
You have the energy and knowledge of a seasoned dance competition parent — warm, 
encouraging, and genuinely helpful. You've been going to competitions for 15 years.

ROUTINEX SCORING SYSTEM:
- Total score: 260–300 points
- Award levels: Gold (260–269), High Gold (270–279), Platinum (280–289), Diamond (290–300)
- Score categories per judge: Technique (max 35), Performance (max 35), Choreography (max 20), Overall Impression (max 10)
- 3 judges per entry — scores are averaged
- Technique: physical execution, clean lines, control, proper form
- Performance: stage presence, facials, connection with audience
- Choreography: creativity, use of space, musicality, transitions
- Overall Impression: full package impact on the judges

COMPETITION KNOWLEDGE:
[full events list injected here from competitions.ts]

Keep answers short (2–4 sentences usually). If you don't know something specific 
(like exact 2026 dates for a competition), say so and point them to the official website. 
Never make up specific dates, venues, or times you don't actually have.`;

  if (scheduleContext) {
    prompt += `\n\nTHIS USER'S COMPETITION SCHEDULE FOR ${scheduleContext.competitionName} (${scheduleContext.date}):
Venue: ${scheduleContext.venue}
${scheduleContext.entries.map(e => 
  `- ${e.dancerName}: ${e.routineName} (${e.style} ${e.entryType}) — ${e.performanceDay} at ${e.performanceTime}, Stage ${e.stageNumber}`
).join('\n')}`;
  }

  return prompt;
}
```

**`src/components/BaydaWidget.tsx`** — Chat bubble component
- Floating chat button (bottom right), purple gradient, "✨ Ask Bayda" label
- Click opens a slide-up chat panel
- Shows conversation history
- Typing indicator while waiting for response
- Auto-scrolls to latest message
- Works on mobile (full-screen on small viewports)
- Can be placed on: events page, schedule page, dashboard

### Bayda Widget States
1. **Closed** — small floating button, bottom-right, "✨ Ask Bayda" or just a sparkle icon on mobile
2. **Open** — 380px wide × 520px tall panel, slides up from button
3. **Loading** — animated typing dots while Claude Haiku responds
4. **Context-aware** — shows "I have your [Competition Name] schedule loaded ✓" when schedule context is present

---

## Feature 3: Enhanced Event Detail Pages

Right now there are no individual event pages. Every event just shows a card with a description.

### New: `/events/[eventId]` — Event Detail Page

Each event gets its own SEO-friendly page. Example: `/events/starpower`

**Content sections:**
- Header: event name, type badge (competition/convention/nationals), organizer, website link
- About: full description
- What to Expect: judging format, award levels, typical vibe
- Styles offered
- Typical season months (calendar visual)
- Regions / cities where it typically appears
- **"Prep for this competition" CTA** — links to /signup with `?ref=events-{eventId}` for tracking
- **Ask Bayda about this event** — opens Bayda widget pre-loaded with event context

**Static generation** — use `generateStaticParams()` to pre-build all 20 event pages at deploy time. Great for SEO.

```typescript
// src/app/events/[eventId]/page.tsx
export async function generateStaticParams() {
  return DANCE_EVENTS.map(event => ({ eventId: event.id }));
}

export async function generateMetadata({ params }) {
  const event = DANCE_EVENTS.find(e => e.id === params.eventId);
  return {
    title: `${event.name} — Dance Competition Guide | RoutineX`,
    description: `Everything you need to know about ${event.name}. Styles, scoring, typical schedule, and how to prep your routine with AI analysis.`,
  };
}
```

---

## Feature 4: "My Events" Dashboard Widget

Add a section to the dashboard (below the purchase cards, above the routines list) showing upcoming competitions the user has added to their schedule.

```
┌─────────────────────────────────────────────────────┐
│  🗓️  Your Upcoming Competitions                       │
│                                                      │
│  StarPower — Chicago     May 3–4       3 entries     │
│  Energy Nationals        June 14–16    1 entry       │
│                                                      │
│  [+ Add Competition Weekend]                         │
└─────────────────────────────────────────────────────┘
```

- Links to `/schedule/[scheduleId]` for each
- "Add Competition Weekend" opens the same add modal as the schedule page
- Empty state: "Track your competition schedule and get day-of help from Bayda →"

---

## Feature 5: Scoring Education / FAQ Section

A dedicated section on the events page (or its own `/scoring` page) that explains how competitive dance scoring works. This is evergreen SEO content AND what Bayda draws from.

**Content blocks:**
- Award levels explained (Gold → Diamond with RoutineX score ranges, plus how real competitions compare)
- Category breakdown (Technique, Performance, Choreography, Overall — what judges actually look for in each)
- Scoring glossary (definitions of terms judges use: lines, extension, dynamics, projection, etc.)
- FAQ: "Why did we get Platinum but another group got Diamond?" / "Can we argue a score?" / "What's the difference between lyrical and contemporary judging?"

**Page:** `src/app/scoring/page.tsx`
**Nav link:** Add "Scoring Guide" to the nav (or nest under Events)

---

## Implementation Priority Order

1. **Bayda API + Widget** (biggest impact, most exciting) — build the `/api/bayda` route and `BaydaWidget.tsx` component first. Place it on the events page. Even without schedule data, she can answer scoring questions and event questions immediately.

2. **My Schedule — Add Weekend form** — simple modal/form on the schedule page. Users can add a competition and then add entries. Requires the two new DB tables.

3. **Schedule detail page** — `/schedule/[scheduleId]` with day-by-day timeline. Wire Bayda to load with schedule context.

4. **Dashboard "My Events" widget** — surface the schedule entries on the dashboard.

5. **Event detail pages** — `/events/[eventId]` static pages with SEO. Low dev effort, high SEO value.

6. **Scoring Guide page** — `/scoring` — content page, pure HTML/SEO, no dynamic logic.

---

## Design Notes

- **Bayda's color:** Use the existing `primary` purple gradient. Her avatar could be a simple sparkle ✨ or a stylized "B" in a circle.
- **Schedule page:** Keep it clean, mobile-first. Parents are looking at this at the venue on their phone. Big text, high contrast, easy to scan.
- **Event detail pages:** Match the `/events` page glassmorphism style. Use framer-motion fade-in.
- **Bayda responses:** Always short. Target 2–4 sentences. Users at competitions are distracted — they want the answer fast.

---

## Technical Notes for Next Session

- Claude Haiku model string: `claude-haiku-4-5-20251001`
- Keep Bayda `max_tokens: 400` — short answers, fast response, cheap
- Store chat history in React state only (no DB needed for chat history — session-only)
- Schedule data from DB should be fetched server-side and passed as props to Bayda widget
- Use Supabase RLS — users only see their own schedule data
- All new pages need Navbar and layout — follow the same pattern as `/events/page.tsx`

---

## Env Variables Already Set in Vercel

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET
ANTHROPIC_API_KEY
ADMIN_EMAIL=22tucker22@comcast.net
NEXT_PUBLIC_SITE_URL=https://routinex.org
```

No new env variables needed — `ANTHROPIC_API_KEY` is already there for Bayda.

---

*End of document. Paste the full contents into a new Claude session to get fully briefed.*
