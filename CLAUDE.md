# Religion Literacy Platform — Developer Guide

## Quick Start

```bash
# Clone (or if already cloned, just cd in)
git clone https://github.com/theshauntucker/legendary-spork.git religion-site
cd religion-site

# Switch to the feature branch
git fetch origin
git checkout claude/religion-niche-ad-site-XXupQ

# Install dependencies
npm install

# Create env file (Supabase is optional for local preview)
echo 'NEXT_PUBLIC_SUPABASE_URL=https://placeholder.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=placeholder' > .env.local

# Clear cache and run
rm -rf .next
npm run dev
```

Open **http://localhost:3000**

---

## Branch

All work lives on: **`claude/religion-niche-ad-site-XXupQ`**

The `main` branch is Routinex (a different project). Do NOT develop on main.

---

## Project Structure

```
src/
├── app/                          # Next.js App Router pages
│   ├── page.tsx                  # Home page
│   ├── layout.tsx                # Root layout (fonts, nav, footer)
│   ├── globals.css               # Color tokens, typography, article styles
│   │
│   ├── traditions/
│   │   ├── page.tsx              # All traditions grid
│   │   └── [slug]/
│   │       ├── page.tsx          # Tradition detail (overview, perspectives, resources)
│   │       └── resources/
│   │           └── [resource]/
│   │               └── page.tsx  # Resource detail with paired perspectives
│   │
│   ├── library/page.tsx          # Searchable resource library
│   ├── perspectives/page.tsx     # Cross-tradition perspective explorer
│   ├── stories/
│   │   ├── page.tsx              # Personal stories listing
│   │   ├── [slug]/page.tsx       # Individual story
│   │   └── submit/page.tsx       # Story submission form
│   ├── community/page.tsx        # Forum landing (coming soon)
│   ├── about/page.tsx            # Mission + editorial standards
│   │
│   ├── tools/
│   │   ├── page.tsx              # Tools landing
│   │   ├── belief-explorer/      # BITE Model quiz (neutrally framed)
│   │   ├── tradition-compare/    # Side-by-side comparison
│   │   └── glossary/             # Religious terms glossary
│   │
│   └── api/
│       ├── chat/route.ts         # AI chat (neutral system prompt)
│       ├── subscribe/route.ts    # Newsletter signup
│       └── stories/route.ts      # Story submission endpoint
│
├── components/
│   ├── Navbar.tsx                # Top nav (sticky, cream/teal)
│   ├── Footer.tsx                # Footer with disclaimer
│   ├── ChatWidget.tsx            # AI chat widget (bottom-right)
│   ├── EmailCapture.tsx          # Newsletter signup form
│   ├── AdUnit.tsx                # Ad placeholder (Ezoic)
│   ├── TraditionCard.tsx         # Card for traditions grid
│   ├── ResourceCard.tsx          # Card for resource listings
│   ├── PairedPerspective.tsx     # ★ SIGNATURE: side-by-side counterpart display
│   ├── StoryCard.tsx             # Card for story listings
│   ├── JourneyFilter.tsx         # Filter stories by journey type
│   └── LibraryFilter.tsx         # Filter library by tradition/type/perspective
│
├── lib/
│   ├── traditions.ts             # ★ TRADITION DATA — edit this to add/modify traditions
│   ├── resources.ts              # ★ RESOURCE DATA — edit this to add/modify resources + pairings
│   ├── stories.ts                # ★ STORY DATA — edit this to add/modify stories
│   └── supabase/                 # Supabase client (optional, for future auth/DB)
│
└── middleware.ts                  # Pass-through (Supabase auth when configured)
```

---

## How to Add Content

### Add a New Tradition

Edit **`src/lib/traditions.ts`**. Add to the `traditions` array:

```typescript
{
  slug: "hinduism",                    // URL-safe slug
  name: "Hinduism",                    // Display name
  alternateNames: ["Sanatan Dharma"],  // Other names
  adherentCount: "1.2 billion",
  foundedYear: "~1500 BCE",
  foundedLocation: "Indian subcontinent",
  summary: "A diverse family of traditions...",  // 1-2 sentences, NEUTRAL
  overviewHtml: "<p>...</p>",          // 300-400 words as HTML, NEUTRAL
  color: "orange",                     // Tailwind color for accent
  introductionLinks: [
    { label: "Find a temple", url: "https://...", description: "..." }
  ],
}
```

### Add a New Resource

Edit **`src/lib/resources.ts`**. Add to the `resources` array:

```typescript
{
  slug: "my-new-book",
  title: "My New Book",
  type: "book",                        // book | podcast | video | document | website | organization | documentary
  url: "https://...",
  author: "Author Name",
  traditionSlugs: ["latter-day-saints"], // Which traditions this relates to
  perspectiveType: "questioning",       // devotional | questioning | academic | personal
  summary: "NEUTRAL summary here...",
  hostedLocally: false,
  license: "fair-use-commentary",
  tags: ["history", "theology"],
  pairedWith: "the-counterpart-slug",   // ★ THE SIGNATURE FEATURE — pair with opposite perspective
}
```

**Important:** If you add a `pairedWith`, make sure the counterpart resource ALSO has `pairedWith` pointing back.

### Add a New Story

Edit **`src/lib/stories.ts`**. Add to the `stories` array:

```typescript
{
  slug: "my-story",
  title: "My Story Title",
  excerpt: "Brief preview...",
  journeyType: "questioning",           // entering | deepening | questioning | leaving | returning
  traditionSlug: "catholicism",
  authorName: "Anonymous",
  date: "2024-03-15",
  contentHtml: "<p>The full story as HTML...</p>",
}
```

---

## Design System

### Colors (defined in `globals.css`)
- **Primary (teal):** `primary-500` (#0d6b6b) — buttons, links, accents
- **Cream:** `cream-50` (page bg), `cream-100` (cards), `cream-200` (borders)
- **Ink:** `ink-800` (body text), `ink-500` (secondary text), `ink-400` (muted)
- **Accent (amber):** `accent-500` (#d97706) — use sparingly

### Typography
- **Headings:** `font-serif` (Fraunces) — all h1, h2, h3
- **Body:** `font-sans` (Inter) — paragraphs, UI text

### Components
- Cards: `rounded-2xl`
- Buttons: `rounded-xl`
- Primary button: `bg-primary-500 text-white hover:bg-primary-600`
- Outline button: `border-2 border-primary-500 text-primary-500`

---

## Neutrality Rules (CRITICAL)

| Never use | Use instead |
|---|---|
| "Ex-Mormon" / "Ex-Christian" | "Former member" or "Those who have left" |
| "Deconstruction" in titles | "Exploring doubts" or "Faith transitions" |
| "Apologetics" | "Devotional perspectives" |
| "Is X a cult?" | Never. Not on this site. |
| "BITE Model quiz" | "Belief Environment Explorer" |
| "Debunked" / "Proven" | "Examined" / "Explored" |
| "X is true/false" | "Adherents believe..." / "Scholars have noted..." |

**The test:** A devout member AND a former member should both feel the site treats them fairly.

---

## Brand Name

Currently **Vibeproof** throughout the codebase. When a name is chosen, find-and-replace `Vibeproof` globally.

---

## Environment Variables

| Variable | Required? | Purpose |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | No (for now) | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | No (for now) | Supabase anonymous key |
| `ANTHROPIC_API_KEY` | No | Powers the AI chat widget |
| `NEXT_PUBLIC_EZOIC_ID` | No | Ezoic ad network ID |

---

## Deployment

Designed for **Vercel**. Connect the repo, set the branch to `claude/religion-niche-ad-site-XXupQ`, and deploy.
