# Coda_14 — Social Platform Research & Best Practices
### Everything Claude Code needs to build RoutineX Coda the right way
**For:** Shaun Tucker
**Date:** April 16, 2026
**Purpose:** Research reference for the Coda social platform build. Read this alongside Coda_00 through Coda_13.

---

## 1. Architecture — How to Build a Social Platform on Next.js + Supabase

### Database Schema Design

A social platform needs these core entities, and RoutineX already has specs for most of them in Coda_02, Coda_11, and Coda_13:

**Users/Profiles:** The identity layer. RoutineX uses `profiles` with aura avatars instead of photos. Key fields: id, user_id, handle, display_name, profile_type (dancer/parent/studio/choreographer), aura_style, aura_tier, age_tier, parent_consent_verified.

**Follows:** A many-to-many relationship table (follower_id, following_id, created_at). This is the backbone of the feed. Keep it simple — no "pending" follow state for public profiles. Studios and choreographers may want an approval flow later.

**Posts/Achievements:** In RoutineX, the primary "post" is an achievement (a scored analysis). The `achievements` table links to `profiles` and `videos`. Secondary posts come from Bayda-generated content and competition check-ins.

**Reactions:** A polymorphic reaction table (post_id, post_type, profile_id, emoji_code, reacted_at). Use a composite unique constraint on (post_id, post_type, profile_id, emoji_code) to prevent duplicate reactions.

**Comments:** Threaded one level deep only. (id, post_id, post_type, profile_id, body, parent_comment_id, created_at, deleted_at). Soft delete via deleted_at — never hard-delete user content.

**Messages/DMs:** Conversation-based model (conversations, conversation_participants, messages). Tier-enforced via RLS. Full spec in Coda_11.

**Visibility Settings:** Per-item 4-way visibility (public/followers/studio/private). Enforced at the DATABASE level via RLS policies. This is non-negotiable. Full spec in Coda_02 and Coda_13 Prompt 2.

### Feed Architecture

There are two main approaches to building a social feed:

**Fan-out on write (push model):** When a user posts, the system pushes that post into every follower's pre-computed feed table. Fast reads, but expensive writes. Used by Twitter at scale.

**Fan-out on read (pull model):** When a user opens their feed, the system queries posts from all followed users in real-time. Simple to build, but slow at scale.

**RoutineX recommendation: Start with fan-out on read.** At <100K users, a well-indexed query joining achievements + follows + visibility_settings will return in <200ms. This is what Coda_13 Prompt 6 specifies. Only build a pre-computed feed table if latency becomes a problem after launch.

The query pattern:
```sql
SELECT a.*, p.handle, p.aura_style, p.aura_tier
FROM achievements a
JOIN follows f ON f.following_id = a.profile_id
JOIN visibility_settings v ON v.item_id = a.id AND v.item_type = 'achievement'
WHERE f.follower_id = :current_user_id
  AND (v.visibility = 'public'
       OR (v.visibility = 'followers' AND f.follower_id IS NOT NULL)
       OR (v.visibility = 'studio' AND p.studio_id = :viewer_studio_id))
ORDER BY a.earned_at DESC
LIMIT 20 OFFSET :page_offset;
```

Add indexes on: `follows(follower_id)`, `achievements(profile_id, earned_at DESC)`, `visibility_settings(item_type, item_id)`.

### The Fair Feed (RoutineX's Moat)

No existing social platform guarantees minimum reach. RoutineX does. Here's how it works:

1. Every post gets a **reach floor** — minimum number of unique viewers within 24 hours.
2. New users: floor = 50. Scales with account age and activity.
3. An hourly edge function checks `reach_ledger` (post_id, viewer_id, delivered_at) against each post's floor.
4. Posts below their floor get injected into other users' feeds as "Rising" or "Spotlight" items.
5. Matching logic: same age_tier > same studio > same competition region > same style > random.
6. Users see a "Your Reach Today: X" stat on their home page — always positive, always encouraging.

This is the single biggest differentiator from Instagram/TikTok. Parents feel seen. They keep posting. They invite others. Full spec in Coda_13 Prompt 15.

---

## 2. Real-Time Features — Supabase Realtime Best Practices

### What to make real-time (and what not to)

| Feature | Real-time? | Method |
|---|---|---|
| DM messages | Yes | Supabase Realtime (Postgres Changes on `messages` table) |
| Typing indicators | Yes | Supabase Broadcast (ephemeral, no DB writes) |
| Reaction counts on feed | Yes | Supabase Realtime with filters on `post_reactions` |
| New comments | Yes | Supabase Realtime on `comments` INSERT |
| Feed new posts | No | Pull on refresh/scroll. Real-time feed is overkill at this scale. |
| Competition thread chat | Yes | Supabase Realtime on thread messages |
| Online/offline status | No | Too expensive. Use "last seen" timestamp instead. |

### Cost optimization (critical)

One production app reduced Supabase Realtime costs from $3,600/mo to $972/mo (73% reduction) by:

1. **Enabling Realtime only on necessary tables** — don't broadcast every table change.
2. **Using filters** — subscribe to `messages` WHERE `conversation_id = X`, not all messages.
3. **Using Broadcast for ephemeral data** — typing indicators, cursor positions. No DB writes.
4. **Batching operations** — one INSERT of 10 reactions generates 1 NOTIFY event, not 10.
5. **Disabling UPDATE/DELETE events** if you only need INSERTs (most social features are INSERT-only).

### Implementation pattern

```typescript
// Subscribe to new messages in a conversation
const channel = supabase
  .channel(`conversation:${conversationId}`)
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'messages',
    filter: `conversation_id=eq.${conversationId}`
  }, (payload) => {
    addMessageToUI(payload.new);
  })
  .subscribe();

// Typing indicator via Broadcast (no DB)
const typingChannel = supabase.channel(`typing:${conversationId}`);
typingChannel.send({
  type: 'broadcast',
  event: 'typing',
  payload: { profileId: currentUser.id }
});
```

---

## 3. COPPA Compliance & Child Safety (Updated April 2026)

### The law as of 2026

The FTC published final COPPA Rule amendments on April 22, 2025, with compliance required by **April 22, 2026** (literally now). Key changes:

1. **Expanded definition of "personal information"** — now includes biometric data, photos, videos, audio, and precise geolocation.
2. **Separate verifiable parental consent required for non-integral purposes** — this includes behavioral advertising, profiling, and AI training. RoutineX does NOT do any of these, which is good.
3. **Formal information security program required** — operators must evaluate data security risks, deploy safeguards, and test them.
4. **Data retention limits** — can only retain personal info as long as reasonably necessary for the purpose collected.
5. **Enhanced parental notice** — parents must be told exactly what data is collected, how it's used, and who it's shared with.

### Beyond COPPA: State laws and AADC

Several states (California, Connecticut, Florida, Georgia, Louisiana, New York, Tennessee, Utah) have passed laws protecting minors on social platforms. The Age-Appropriate Design Code (AADC) extends protections to **all minors under 18**, not just under-13.

Key requirements across these laws:
- Default privacy settings for minors (RoutineX already does this — private by default)
- No collection of minors' precise locations
- Data protection impact assessment for products likely accessed by children
- Age verification or age estimation

### How RoutineX handles this (already designed)

RoutineX's Coda_11 tier system is ahead of the curve:

| Tier | Who | DM access | Privacy default |
|---|---|---|---|
| Tier 0 | Under 13 | No DMs at all | Everything private |
| Tier 1 | 13-17 with verified parent | Text-only DMs to studio/choreographer/studio-kin. Every message mirrored to parent's daily digest | Followers-only |
| Tier 2 | 18+ and verified studios/choreographers | Full DM access | Public |

Additional safety features already spec'd:
- **No photos of minors anywhere** (aura avatars only) — eliminates the biggest COPPA risk vector
- **Parent consent flow** with email verification (Coda_13 Prompt 13)
- **Daily parent digest** of all minor DM activity
- **"Pause all DMs" one-click button** for parents
- **Per-item visibility** enforced server-side via RLS

### What still needs to be built (not yet in Coda specs)

1. **Age verification at signup** — ask for birthdate, gate into correct tier. Consider using a third-party age estimation service for higher confidence.
2. **Privacy policy update** — must explicitly describe data collection for minors, parental consent process, and data retention policy.
3. **Data retention automation** — cron job to purge personal data of deleted accounts after 30 days.
4. **Content reporting flow** — users must be able to report inappropriate content. Auto-escalate reports involving minors.

---

## 4. Content Moderation & Trust/Safety

### The hybrid approach (automated + human)

At RoutineX's scale (launching with <10K users), full automated moderation is overkill. But you need the foundation:

**Phase 1 (Launch):**
- **Report button** on every post, comment, and DM message
- **Reports table** (id, reporter_id, reported_item_type, reported_item_id, reason, status, reviewed_by, reviewed_at)
- **Admin dashboard** at `/admin/reports` — Shaun reviews manually
- **Auto-hide** content that receives 3+ reports (pending review)
- **Word filter** on comments and DMs — block slurs, hate speech, explicit content. Use a maintained blocklist.
- **Rate limiting** — max 10 DMs per hour, max 50 comments per hour, max 5 reports per day per user

**Phase 2 (Post-launch, when volume warrants it):**
- AI-assisted content classification (flag potential issues for human review)
- Automated action on clear violations (e.g., known CSAM hashes via PhotoDNA)
- Appeal flow for users whose content was moderated
- Transparency reporting

### RoutineX advantage: text-only + no photos = dramatically simpler moderation

Because RoutineX doesn't allow photo uploads (auras only), the most dangerous content moderation challenge (CSAM, explicit images) is eliminated by design. The moderation surface is:
- Text comments
- Text DMs
- Voice notes (Phase 2, with auto-transcription)
- Competition thread messages

This is a much smaller surface than Instagram/TikTok and can be handled by one person + basic word filtering at launch scale.

---

## 5. Monetization Strategy

### RoutineX's revenue lines (current + planned)

**Already live:**
- Individual analysis purchases (BOGO $8.99, Competition Pack $29.99)
- Season Member subscription ($12.99/mo)

**Planned with Coda (from Coda_04 execution calendar):**

| Revenue line | Price | Target launch | Projected monthly |
|---|---|---|---|
| Season Member (existing) | $12.99/mo | Live now | Growing |
| Studio Pro | $199/mo | Week 9 (Jun 12) | $1K-3K MRR at 5-15 studios |
| Choreographer Pro | $29/mo + 10% booking fee | Week 11 (Jun 26) | $500+ MRR |
| Diamond Club merch drops | 2x/year, $50-100 items | Q3 2026 | $150K/year potential |
| Convention partnerships | Custom pricing | Q3 2026 | TBD |
| Booking marketplace | 10% transaction fee | Week 12 (Jul 3) | Scales with bookings |

### Key monetization insights from research

1. **Niche communities command premium pricing.** Average membership site charges $48/month. RoutineX's $12.99 Season Member is underpriced relative to the value — room to add premium tiers later.
2. **It only takes 173 members at $48/mo to hit $100K/year.** RoutineX should target 1,000 paying members by end of Q3 2026.
3. **Multi-stream is resilient.** The combination of subscriptions (predictable) + transactions (spiky) + marketplace fees (growing) reduces risk.
4. **The creator economy favors niche.** Small, passionate audiences pay more per-head than large, generic ones. Dance parents are exactly this audience.

---

## 6. Growth Strategy — First 1,000 Users

### The RoutineX advantage: we're not starting from zero

Every existing RoutineX user (anyone who's ever run an analysis) gets auto-backfilled into the social platform with:
- A profile (random starter aura, pick their own later)
- Their achievements already on their Trophy Wall
- Founding Member badge if they're in the first 1,000

This means Day 1 is NOT an empty room. It's a room with history.

### Growth levers specific to RoutineX

1. **Share Cards** — every achievement generates a poster-grade PNG. Parents post to Facebook. Other parents sign up to get one. This is the primary viral loop.
2. **Studio Tag** — when a dancer links to their studio, the unclaimed studio page becomes visible. Studio owners get an email: "Claim your page." Pull-in mechanic.
3. **Competition Check-In** — at every competition, RoutineX users checking in creates FOMO for non-users watching. Weekend gravity.
4. **Fair Feed** — the guaranteed reach floor means every user feels seen. No "I posted and got zero likes" deflation that kills retention on other platforms.
5. **Bayda** — the AI chat widget on every page answers questions, guides signups, and creates a feeling of aliveness.

### Launch sequence (from Coda_00)

- Week 1-2: Build the platform
- Week 3 (May 7): GO LIVE. Founding 1000 announced. Launch email to all existing users.
- Week 4: Stabilize + listen
- Weeks 5-8: Ship follow system, feed, competition check-ins, reactions
- Weeks 9-12: Studio Pro + Choreographer Pro + marketplace

### Growth tactics from research

- **Invite-only energy without actual restriction.** The "Founding Member" badge creates scarcity without gatekeeping. Anyone can join, but early adopters get permanent status.
- **Leverage existing dance community hubs.** 5 strategic Facebook group posts by Shaun on launch day. Not spammy — genuine founder story.
- **Micro-influencer seeding.** Identify 10-20 active dance parents/coaches with 1K-5K followers on Instagram. Offer them free Season Memberships in exchange for posting their RoutineX share card.
- **Competition weekend pushes.** Every major competition weekend is a growth opportunity. Check-in feature creates real-time FOMO.

---

## 7. Technical Decisions Summary

| Decision | Choice | Why |
|---|---|---|
| Feed model | Fan-out on read | Simple, fast enough at <100K users, avoids premature optimization |
| Real-time | Supabase Realtime for DMs + reactions; Broadcast for typing | Cost-effective, built into existing stack |
| Image hosting | None (auras only) | Eliminates CSAM risk, storage costs, and moderation complexity |
| Age verification | Birthdate at signup + tier gating | Meets COPPA requirements without expensive third-party verification |
| Content moderation | Report + word filter + manual review | Right-sized for launch scale |
| Notifications | Supabase Edge Functions + Resend email | Already in stack, no new dependencies |
| Share cards | @vercel/og edge function | Fast PNG generation, no server-side rendering needed |
| Voice notes | Supabase Storage + OpenAI Whisper | 30s cap + 7-day TTL keeps costs low |
| Payment processing | Stripe (existing) | Already integrated, handles subscriptions + marketplace |

---

## 8. Risk Register

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Empty room on launch day | Low (backfill solves) | Critical | Auto-backfill all existing users + achievements. Bayda daily posts. |
| COPPA violation | Medium | Critical | No photos, tier-gated DMs, parent consent flow, age verification at signup |
| Supabase Realtime costs spike | Medium | Medium | Selective subscriptions, filters, Broadcast for ephemeral data |
| Low studio adoption of Pro tier | Medium | Medium | Seed 20 studios, personal outreach from Shaun, demonstrate ROI via recruitment funnel |
| Content moderation overwhelm | Low (text-only) | Medium | Word filter + rate limiting + manual review. Hire mod at 10K users. |
| Competitor copies Fair Feed | Low | Low | The scoring data underneath is the real moat, not the algorithm |
| May 7 deadline missed | Medium | Medium | Prioritize core loop (profiles + trophy wall + share cards). Everything else can ship post-launch. |

---

## Sources

- [How to Build a Social Learning Platform using Next.js, Stream, and Supabase](https://www.freecodecamp.org/news/how-to-build-a-social-learning-platform-using-nextjs-stream-and-supabase/)
- [Designing a Database for Social Media Platform](https://www.geeksforgeeks.org/sql/how-to-design-database-for-social-media-platform/)
- [Social Media Feed System Design](https://javatechonline.com/social-media-feed-system-design/)
- [Designing a Scalable News Feed System](https://blog.algomaster.io/p/designing-a-scalable-news-feed-system)
- [Supabase Realtime Docs](https://supabase.com/docs/guides/realtime)
- [Reducing Supabase Realtime Costs by 73%](https://techsynth.tech/blog/reducing-supabase-realtime-costs-by-73-percent/)
- [Supabase Realtime Best Practices](https://www.leanware.co/insights/supabase-best-practices)
- [COPPA Compliance in 2025](https://blog.promise.legal/startup-central/coppa-compliance-in-2025-a-practical-guide-for-tech-edtech-and-kids-apps/)
- [COPPA Compliance: Key Requirements for 2026](https://usercentrics.com/knowledge-hub/coppa-compliance/)
- [Children's Online Privacy in 2025: The Amended COPPA Rule](https://www.loeb.com/en/insights/publications/2025/05/childrens-online-privacy-in-2025-the-amended-coppa-rule)
- [U.S. Social Media Regulations for Minors](https://govfacts.org/tech-innovation/digital-rights-privacy/online-child-safety/u-s-social-media-regulations-for-minors/)
- [Social Media Algorithms in 2026](https://blog.hootsuite.com/social-media-algorithm/)
- [How to Grow Your Social Network Community from 0 to 1000](https://socialengine.com/blog/how-to-grow-your-social-network-community-from-0-to-1000/)
- [Why Niche Social Networks Are Winning in 2025](https://webmobtech.com/blog/niche-social-networks-winning-2025-ideas/)
- [Best Monetization Models For Social Media Platforms 2026](https://oyelabs.com/best-monetization-models-for-social-media-platforms/)
- [How to Monetize a Community: Ultimate Guide 2026](https://whop.com/blog/monetize-a-community/)
- [Social Media Content Moderation: Complete Guide 2025](https://www.enrichlabs.ai/blog/social-media-content-moderation-complete-guide)
- [Bluesky 2025 Transparency Report](https://bsky.social/about/blog/01-29-2026-transparency-report-2025)
