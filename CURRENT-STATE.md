# RoutineX — Current Development State
**Last updated:** April 7, 2026

## Source of Truth
- **GitHub repo:** github.com/theshauntucker/legendary-spork
- **Vercel project:** routinex (prj_3Df2waKNXC5XeBflBaHhTwvD45EV)
- **Vercel team:** team_6VhhY3LmjXUw5SaS8V87EPtV
- **Live domain:** routinex.org
- **Production branch:** `main` — always work here, always push here

## Branches
| Branch | Status | Purpose |
|--------|--------|---------|
| main | PRODUCTION (live on routinex.org) | All work goes here |

---

## 🏆 DANCER SEASON TRACKING — Ready to Deploy (NOT PUSHED YET)

All files written locally. Awaiting review + push approval from Shaun.

### What was built:
A full **Season Tracking Portal** for dance moms and dancers to track every score,
award, and improvement across the entire competition season.

### New Files
| File | Purpose |
|------|---------|
| `supabase-dancer-tracking.sql` | DB migration — run in Supabase before pushing |
| `src/app/dancers/page.tsx` | Season Tracker hub — lists all dancers with stats |
| `src/app/dancers/[dancerName]/page.tsx` | Individual dancer season view — trophy wall, score chart, full competition history |

### Modified Files
| File | Change |
|------|--------|
| `src/app/upload/page.tsx` | Added "Competition Info" section — competition name (with autocomplete) + competition date |
| `src/app/api/analyze/route.ts` | Saves `competition_name` and `competition_date` to `videos` table |
| `src/app/dashboard/DashboardClient.tsx` | Added Season Tracker card with trophy icon, shows dancer count |

### Database Changes (supabase-dancer-tracking.sql)
- `ALTER TABLE videos ADD COLUMN competition_name TEXT`
- `ALTER TABLE videos ADD COLUMN competition_date DATE`
- `CREATE TABLE dancers` — optional dancer profiles
- Performance indexes on `dancer_name`, `competition_name/date`, `analyses.created_at`

### Deployment Steps (when ready)
1. **Run SQL migration first:** Supabase Dashboard → SQL Editor → paste supabase-dancer-tracking.sql → Run
2. **Review all changed files** (git diff)
3. **Commit:** `git add -A && git commit -m "feat: full dancer season tracking system"`
4. **Push:** `git push origin claude/clarify-task-dsVIo`
5. Vercel auto-deploys to routinex.org

---

## Feature: Season Tracker — Full Details

### Entry Point
- Dashboard now shows a gold **Season Tracker** card that links to `/dancers`
- Shows live count of dancers being tracked

### /dancers — Season Hub
- Stats: Dancers tracked, Total analyses, Season best score, Styles covered
- Each dancer card shows: name, studio, age group, styles, best score bar, best award badge, trend (↑+12 pts)
- Empty state CTA if no analyses yet

### /dancers/[name] — Dancer Season Page
- **Hero header:** Full name, studio, age group, best award badge, season progress trend
- **Award Journey strip:** Visual progression e.g. Gold → High Gold → Platinum
- **Stats grid:** Season best score, average score, total analyses, competitions attended
- **Score Timeline:** SVG bar chart (no external deps) showing scores across competitions
- **Category Averages:** Technique, Performance, Choreography, Overall — with color-coded progress bars and labels (🔥 Excellent / ✨ Strong / 📈 Growing / 💪 Focus Area)
- **Competition History:** Full table (desktop) + cards (mobile) with date, competition, routine, style, score, award, link to full report
- **Focus for Next Competition:** Top improvement priorities from latest analysis
- **Actions:** Analyze another routine / View best performance

### Upload Page — Competition Info Section
- New gold-bordered section: "Competition Info — Tracked in your Season Tracker"
- Competition Name field with autocomplete (15 popular competitions pre-loaded)
- Competition Date field (date picker)
- Helper text explaining why it matters

---

## Architecture Notes
- Next.js 16 App Router on Vercel
- Supabase for auth + database + storage
- Stripe for payments (checkout sessions + webhooks)
- Claude Vision API for dance analysis
- Admin portal at /admin (email-gated)

## Pricing (current — as of April 2026)
- **Free:** 1 analysis — granted automatically on every new signup (permanent, not a promo)
- **BOGO:** $8.99 = 2 analyses (buy one get one) — `payment_type: "single"` in Stripe
- **Competition Pack:** $29.99 = 5 analyses ($6 each) — `payment_type: "video_analysis"` in Stripe

**Last updated:** April 11, 2026
