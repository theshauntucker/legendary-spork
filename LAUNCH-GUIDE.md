# RoutineX — Launch Guide (Step by Step)

## STEP 1: Deploy Your Site (FREE — 5 minutes)

This puts your landing page live on the internet so people can visit it.

1. Go to **https://vercel.com** in your browser
2. Click **"Sign Up"** → Choose **"Continue with GitHub"**
3. Log into your GitHub account (the one that owns this repo)
4. Once logged in, click **"Add New..."** → **"Project"**
5. Find **"legendary-spork"** in the list and click **"Import"**
6. **IMPORTANT**: Under "Framework Preset", make sure it says **"Next.js"**
7. Click **"Deploy"**
8. Wait 1-2 minutes — Vercel will build and deploy your site
9. You'll get a URL like `legendary-spork.vercel.app` — **this is your live site!**

Your landing page is now live. People can visit it and join the FREE waitlist.
The paid $9.99 button won't work yet — that needs Stripe (Step 2).

---

## STEP 2: Set Up Stripe (Gets you PAID — 10 minutes)

This lets you collect the $9.99 join fee from people.

1. Go to **https://stripe.com** in your browser
2. Click **"Start now"** → Create an account with your email
3. Fill in your business info (you can use your name as business name)
4. Once in the Stripe Dashboard, look at the top right — make sure it says **"Test mode"** (orange toggle). We'll switch to real money later.
5. Click **"Developers"** in the left sidebar
6. Click **"API keys"**
7. You'll see two keys:
   - **Publishable key** — starts with `pk_test_...`
   - **Secret key** — click "Reveal" — starts with `sk_test_...`
8. Copy both of these keys (keep this tab open)

### Add Keys to Vercel:
1. Go back to **vercel.com** → Click on your **"legendary-spork"** project
2. Click **"Settings"** (tab at the top)
3. Click **"Environment Variables"** in the left sidebar
4. Add these 3 variables one by one:

| Name | Value |
|------|-------|
| `STRIPE_SECRET_KEY` | `sk_test_...` (paste your secret key) |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | `pk_test_...` (paste your publishable key) |
| `NEXT_PUBLIC_BASE_URL` | `https://your-site.vercel.app` (your Vercel URL from Step 1) |

5. Click **"Save"** after each one
6. Go to **"Deployments"** tab → Click the **"..."** menu on the latest deployment → Click **"Redeploy"**

Now the $9.99 payment button works! (In test mode — no real charges yet)

---

## STEP 3: Get a Custom Domain (Optional — $10-15/year)

Instead of `legendary-spork.vercel.app`, get a real domain like `routinex.com`.

1. Go to **https://namecheap.com** or **https://godaddy.com**
2. Search for your domain (try: `getroutinex.com`, `routinex.app`, `routinexdance.com`)
3. Buy it (usually $10-15/year)
4. Go back to **Vercel** → Your project → **"Settings"** → **"Domains"**
5. Type your new domain and click **"Add"**
6. Vercel will show you DNS settings — follow the instructions on screen to point your domain to Vercel
7. Update your `NEXT_PUBLIC_BASE_URL` in Vercel env vars to your new domain

---

## STEP 4: Go Live with REAL Payments

Once you've tested everything and you're ready for real money:

1. Go to **Stripe Dashboard** → Toggle OFF "Test mode" (top right)
2. Complete Stripe's verification (they'll ask for ID and bank info — this is normal and required)
3. Go to **Developers** → **API Keys** again
4. Copy the new LIVE keys (they start with `pk_live_` and `sk_live_`)
5. Go to **Vercel** → Settings → Environment Variables
6. Update `STRIPE_SECRET_KEY` and `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` with the live keys
7. Redeploy

**You are now collecting real money!**

---

## STEP 5: Start Getting Customers

### Where Dance Parents Hang Out:
- **Facebook Groups**: Search "competitive dance moms", "dance comp parents", "[your state] dance moms"
- **Instagram**: Use hashtags like #competitivedance #dancemom #dancecompetition #allstarcheer #dancestudio
- **TikTok**: Short video showing the sample analysis — parents will share like crazy
- **Dance Studio Owners**: DM them directly on Instagram, offer them a free demo

### What to Post:
"Finally — AI that scores your dancer's routine like a real competition judge. Get detailed feedback on technique, performance & choreography for just $2.99/video. Join the waitlist → [your link]"

---

## How to Check Who Signed Up

### Free Waitlist Signups:
- Stored in the `data/waitlist.json` file on your server
- On Vercel, you can check via the Vercel logs

### Paid Signups ($9.99):
- Go to **stripe.com** → **Payments** tab
- You'll see every payment with the customer's email
- Stripe deposits money into your bank account automatically (usually 2-3 days after payment)

---

## Quick Reference

| What | Where |
|------|-------|
| Your live site | `https://your-domain.vercel.app` |
| Stripe dashboard | `https://dashboard.stripe.com` |
| Vercel dashboard | `https://vercel.com` |
| Free waitlist data | `data/waitlist.json` on server |
| Paid customer data | Stripe dashboard → Payments |

---

## Revenue Goals

| Milestone | How |
|-----------|-----|
| First $100 | 10 paid waitlist signups |
| First $1,000 | 100 paid waitlist signups |
| First $10,000 | 1,000 waitlist + video uploads at launch |
| $100,000 | 10,000 users × $9.99 join fee + ongoing $2.99 uploads |

You got this! 🚀
