# RoutineX — Complete Launch Guide (Step by Step)

No coding needed. Just follow along in order.

---

## STEP 1: Record Your Demo Video (15 minutes)

The site now has a video player section. You just need to record the video.

### How to Screen Record:
- **iPhone**: Settings → Control Center → add "Screen Recording". Then swipe down and tap the record button.
- **Mac**: Press Cmd + Shift + 5, click "Record Entire Screen"
- **Windows**: Press Win + G, click the record button
- **Android**: Swipe down notification panel → "Screen Recorder"

### What to Record (read this script while scrolling through the site):

> "Let me show you how RoutineX works."
> [Scroll slowly through the landing page]
>
> "You upload your dancer's routine video..."
> [Click on the Upload page, show the drag-and-drop area]
>
> "Fill in your routine details — name, age division, style..."
> [Show the form fields]
>
> "In under 5 minutes, you get a full competition-standard analysis."
> [Go to the sample analysis section, scroll through it slowly]
>
> "Scores from three simulated judges... detailed feedback on technique, performance, and choreography..."
> [Pause on the score breakdown table]
>
> "Timestamped notes telling you exactly what to fix at each moment..."
> [Scroll through timeline notes]
>
> "And a prioritized improvement roadmap."
> [Show improvement priorities]
>
> "All for $2.99 per video. Beta members get 3 free."
> [Show pricing section]

Keep it 30-60 seconds. Save as MP4.

### After Recording:
1. Name the file **`demo-video.mp4`**
2. Put it in the **`public/`** folder of your project

**If your video is .MOV** (common on iPhone/Mac):
- Go to cloudconvert.com → upload your .MOV → convert to MP4 → download
- Or just rename the extension from .mov to .mp4

---

## STEP 2: Create a Share Image in Canva (Optional — 5 minutes)

When someone shares your link on Facebook, iMessage, or Twitter, a preview image shows. One is already auto-generated, but a custom Canva one looks way better.

### Canva Steps:
1. Go to **canva.com** (free account works)
2. Click **"Create a design"** → **"Custom size"** → type **1200 x 630** → click Create
3. Pick a dark background (black or dark purple)
4. Add this text:
   - **Big text**: "Your Dancer's Secret Weapon"
   - **Small text**: "AI-Powered Dance & Cheer Video Analysis"
   - **Bottom**: "routinex.app — Join the Beta $9.99"
5. Take a screenshot of your sample analysis section and paste it in the corner
6. Download as PNG
7. Rename to **`og-image.png`**
8. Put it in the **`public/`** folder

### Or Use This AI Prompt (paste into ChatGPT, Midjourney, or Canva AI):
```
Create a sleek promotional banner for "RoutineX" — an AI-powered dance
and cheer video analysis app. Dark background with purple and pink
gradient accents. Main headline: "Your Dancer's Secret Weapon". Show a
mockup scoring dashboard with 274/300 and category bars for Technique,
Performance, Choreography. Premium SaaS style. 1200x630 pixels.
```

---

## STEP 3: Deploy to Vercel (10 minutes, one-time)

This puts your site live on the internet.

### First Time Setup:
1. Go to **vercel.com** → Sign up with your **GitHub account**
2. Click **"Add New..."** → **"Project"**
3. Find **legendary-spork** in the list → click **Import**
4. Vercel auto-detects Next.js — all good
5. **Before clicking Deploy**, click **"Environment Variables"** and add these:

| Name | Value |
|------|-------|
| `STRIPE_SECRET_KEY` | Your Stripe secret key (`sk_test_...` or `sk_live_...`) |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Your Stripe publishable key (`pk_test_...` or `pk_live_...`) |
| `NEXT_PUBLIC_BASE_URL` | Your domain (e.g., `https://routinex.app`) |

6. Click **Deploy**
7. Wait 1-2 minutes — you'll get a URL like `legendary-spork.vercel.app`

### Already Deployed?
Just push code to GitHub. Vercel auto-deploys every push.

### Connect Your Domain:
1. Vercel dashboard → your project → **Settings** → **Domains**
2. Type your domain (e.g., `routinex.app`) → click Add
3. Vercel shows you DNS records — add them at your domain registrar (GoDaddy, Namecheap, etc.)
4. Wait 5-30 minutes. Done.

---

## STEP 4: Submit to Google (5 minutes)

Without this step, Google doesn't know your site exists.

1. Go to **https://search.google.com/search-console**
2. Sign in with Google
3. Click **"Add Property"** → choose **"URL Prefix"**
4. Enter your URL: `https://routinex.app` (or your domain)
5. Choose **"HTML tag"** verification method
6. Google gives you a code like: `google1234567890abcdef`
7. **Text me that code or paste it here** — I'll add it to the site code
8. After verified, click **"Sitemaps"** in the left menu
9. Type `sitemap.xml` → click **Submit**
10. Google starts indexing in 2-7 days

### Also Submit to Bing (2 extra minutes):
1. Go to **https://www.bing.com/webmasters**
2. Sign in with Microsoft/Outlook account
3. Click **"Import from Google Search Console"** (easiest)
4. Done

---

## STEP 5: Post to Social Media (Same Day You Deploy)

### Instagram / TikTok Caption (copy & paste):
```
Just launched something for the dance & cheer world...

RoutineX uses AI to score your dancer's routine — just like a real competition judge.

Upload any video. Get a full scorecard with:
→ Technique, Performance & Choreography scores
→ Timestamped feedback on every key moment
→ A prioritized improvement plan

First 500 beta members get early access for $9.99 + 3 free analyses.

Link in bio

#competitivedance #dancecomp #dancemom #cheermom #dancestudio
#dancelife #competitivecheer #starpower #jumpdance
#dancecompetition #dancetechnique #cheer #allstarcheer
#dancerecital #danceparent #cheercoach #dancecoach
```

### Facebook Post for Dance Parent Groups:
```
Hey dance fam!

My team just launched RoutineX — it's an AI tool that watches your
dancer's routine video and gives a full competition-style analysis.

Think of it like having a judge score your routine BEFORE the actual
competition. You get:

✅ Scores for Technique, Performance, Choreography & Overall
✅ Timestamped notes (like "0:32 — great leap, watch left arm")
✅ A ranked list of what to fix first

We're in beta — only 500 spots at $9.99 (includes 3 free video analyses).

Check it out → [YOUR URL]

Would love to hear what you think!
```

### Email to Your Waitlist:
```
Subject: RoutineX Beta is LIVE — Your spot is waiting

Hey [Name],

You signed up for the RoutineX waitlist, and we're live!

Here's what you can do right now:

1. Lock in your beta spot for $9.99 (includes 3 free video analyses)
2. Upload your first routine
3. Get a full AI-powered analysis in under 5 minutes

Your analysis includes competition-standard scoring, timestamped
feedback, and a prioritized improvement roadmap.

Only 153 beta spots left.

→ [YOUR URL]

— The RoutineX Team
```

### Facebook Groups to Join & Post In:
Search Facebook for these groups and request to join. Once approved, share your post:
- "Competitive Dance Moms"
- "Dance Competition Parents"
- "[Your State] Dance Moms"
- "Dance Studio Owners Network"
- "Cheer Parents"
- "All Star Cheer Moms"

---

## STEP 6: Go Live with Real Payments

When you're ready to collect real money:

1. Go to **Stripe Dashboard** → toggle OFF "Test mode" (top right)
2. Complete Stripe verification (ID + bank info — totally normal)
3. Go to **Developers** → **API Keys**
4. Copy the LIVE keys (`pk_live_...` and `sk_live_...`)
5. Update them in **Vercel** → Settings → Environment Variables
6. Redeploy

**You're now collecting real money!**

---

## How to Check Who Signed Up

| What | Where to Look |
|------|--------------|
| Free waitlist signups | `data/waitlist.json` on your server |
| Paid $9.99 signups | Stripe.com → Payments tab |
| Total site visitors | Vercel.com → Analytics (or add Google Analytics) |

Stripe deposits money to your bank automatically (2-3 business days after payment).

---

## Files Already Set Up For You

| What | File | Status |
|------|------|--------|
| Logo | `public/logo.svg` | Done |
| Favicon (browser tab icon) | `public/favicon.svg` | Done |
| Video poster (thumbnail) | `public/demo-poster.svg` | Done |
| Share image (auto-generated) | `src/app/opengraph-image/route.tsx` | Done |
| Share image (SVG fallback) | `public/og-image.svg` | Done |
| Sitemap for Google | `src/app/sitemap.ts` → `/sitemap.xml` | Done |
| Robots.txt | `src/app/robots.ts` → `/robots.txt` | Done |
| SEO metadata + structured data | `src/app/layout.tsx` | Done |
| Mobile-safe video player | `src/components/VideoDemo.tsx` | Done |

## Files YOU Need to Add

| What | Where to Put It | How to Get It |
|------|-----------------|---------------|
| Demo video | `public/demo-video.mp4` | Screen record (Step 1) |
| Custom share image (optional) | `public/og-image.png` | Canva (Step 2) |

---

## Revenue Goals

| Milestone | How |
|-----------|-----|
| First $100 | 10 beta signups |
| First $1,000 | 100 beta signups |
| First $10,000 | 1,000 waitlist + video uploads at launch |

You got this!
