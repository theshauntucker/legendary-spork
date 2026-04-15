# Studio Dashboard — End-to-End Walkthrough

Scripted walkthrough to exercise every Studio Dashboard + Music Hub
surface end-to-end. This repo doesn't have Playwright / Cypress wired
up yet, so this is a manual runbook — each step gets an explicit
**Assert** line for what you should see.

The walkthrough runs against a dev environment with the studio feature
flag enabled. Production and preview deployments **keep the flag off**
until Shaun signs off (see `LAUNCH-CHECKLIST-STUDIO.md`).

---

## Prerequisites

- Local dev machine with `npm run dev` working.
- All migrations applied to a dev Supabase project, in order:
  1. `supabase-setup.sql`
  2. `supabase-payments.sql`
  3. `supabase-dancer-tracking.sql`
  4. `supabase-tracking-migration.sql`
  5. `supabase-affiliates.sql`
  6. `supabase-studio.sql`
  7. `supabase-studio-002-collision-rpc.sql`
  8. `supabase-studio-003-schedule.sql`
- Dev `.env.local` containing at minimum:
  ```
  NEXT_PUBLIC_STUDIO_ENABLED=true        # only in local dev
  NEXT_PUBLIC_SUPABASE_URL=…              # dev project
  NEXT_PUBLIC_SUPABASE_ANON_KEY=…
  SUPABASE_SERVICE_ROLE_KEY=…
  STRIPE_SECRET_KEY=sk_test_…
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_…
  STRIPE_WEBHOOK_SECRET=whsec_…           # from `stripe listen` output
  ANTHROPIC_API_KEY=sk-ant-…
  SPOTIFY_CLIENT_ID=…
  SPOTIFY_CLIENT_SECRET=…
  ADMIN_EMAIL=you@example.com
  NEXT_PUBLIC_BASE_URL=http://localhost:3000
  ```
- `stripe listen --forward-to localhost:3000/api/webhook` running in a
  second terminal so webhooks hit the local server.
- Two throwaway email accounts (or mail.tm aliases) — one for the owner,
  one for the choreographer.

---

## Step 0 — Flag-off smoke (runs in any environment with flag=false)

1. With `NEXT_PUBLIC_STUDIO_ENABLED=false` (default), start dev server.
2. Visit `/studio/dashboard`, `/studio/signup`, `/studio/team`,
   `/studio/music`, `/studio/schedule`, `/studio/settings`.
3. **Assert**: every page 404s.
4. Open homepage, `/pricing`, `/signup`, `/dashboard`, `/upload`,
   `/analysis/[id]`, `/dancers`, `/events`, `/admin`.
5. **Assert**: every B2C surface looks and behaves exactly as before
   studio work started. No "Studio" links anywhere in the nav or any
   surface. No new buttons, tiles, or cards.
6. Run `npm test`. **Assert**: 8/8 passing (credits regression suite).

After Step 0 passes, flip the local dev flag to `true` and continue.

---

## Step 1 — Studio signup + Stripe trial start

1. Visit `/studio/signup`.
2. **Assert**: form renders with fields: your name, studio name, state
   dropdown (51 entries), email, password.
3. Fill it in (use throwaway email A), pick e.g. `IL — Illinois`,
   submit.
4. **Assert**: UI shows "Studio Created" → redirect to Stripe Checkout.
5. In Stripe Checkout, use test card `4242 4242 4242 4242`, any future
   expiry, any CVC, any ZIP. Complete.
6. **Assert**: browser lands at `/studio/dashboard?subscribed=1`.
7. In the webhook terminal, **assert** you see:
   - `checkout.session.completed` → "Studio … trial started (pool=25, ends …)"
8. In Supabase SQL editor:
   ```sql
   select * from studios;                       -- 1 row, owner_user_id = your user
   select * from studio_members;                -- 1 row, role='owner'
   select * from studio_credits;                -- total_credits=25, status='trial'
   select * from payments where payment_type='studio_subscription'; -- 1 row
   ```
   **Assert**: every row present and matches.

## Step 2 — Dashboard landing

1. `/studio/dashboard` is the post-Stripe landing.
2. **Assert**: subscription-setup banner is **hidden** (status=trial).
3. **Assert**: pool card reads "25 / 25 analyses" with progress bar at
   0%, trial-ends date visible.
4. **Assert**: all 4 hero tiles render live (Analyze, Music Hub, Schedule,
   Team Board). No "Coming soon" microcopy on any tile.
5. **Assert**: First-Run Checklist visible with 4 unchecked items.

## Step 3 — Invite a choreographer

1. Click Team Board tile → `/studio/team`.
2. **Assert**: roster lists just the owner (you), marked `(you)`.
3. In "Invite a choreographer", enter throwaway email B, role
   `Choreographer`, click **Generate invite**.
4. **Assert**: new row in "Pending invites" with Copy-link + Revoke buttons.
5. Click **Copy link**. **Assert**: link format is
   `http://localhost:3000/studio/join?code=xxxx-xxxx-xxxx`.
6. In Supabase: `select * from studio_invites where status='pending';`
   → 1 row.
7. Return to dashboard. **Assert**: "Invite your choreographers"
   checklist item is now **checked**.

## Step 4 — Choreographer joins

1. Open a fresh browser (or incognito). Paste the invite URL.
2. **Assert**: `/studio/join` renders with the code pre-filled and a
   "Create one" / "I have an account" toggle.
3. Click "Create one", enter throwaway email B + password, submit.
4. **Assert**: "You're in!" → redirect to `/studio/dashboard` as
   choreographer.
5. **Assert**: dashboard header shows the owner's studio name.
6. In Supabase: `select role from studio_members where user_id='<B>';`
   → `choreographer`. `select status from studio_invites;` → `accepted`.
7. Return to owner's browser, refresh `/studio/team`. **Assert**: roster
   now has 2 members; B appears as `choreographer`.

## Step 5 — Choreographer uploads a routine (pool draws from studio)

1. In choreographer's browser, visit `/upload`.
2. Upload any short test video; fill metadata; submit.
3. While analysis processes, in Supabase:
   ```sql
   select source from user_credits where user_id='<B>';  -- no row — good
   select used_credits, total_credits from studio_credits;
   ```
4. **Assert**: `studio_credits.used_credits` incremented from 0 to 1
   once analysis completes. `user_credits` row for B does NOT exist.
5. Return to owner's `/studio/dashboard`. **Assert**: pool card shows
   `24 / 25 analyses`, progress bar at 4%, checklist item "Upload your
   first routine" is now checked.

## Step 6 — Music Hub: search + save

1. Owner visits `/studio/music` → Music Hub.
2. Search "adele hello". **Assert**: results load within ~1s, each row
   shows album art, artist, BPM chip, energy chip, duration chip,
   explicit badge where applicable.
3. Click **+ Add** on the top result.
4. **Assert**: button flips to "Saved" and the track appears in the
   "Your library" grid below.
5. In Supabase: `select track_name, tempo_bpm from studio_music_tracks;`
   → 1 row with populated BPM.
6. Checklist item "Search your first song in the Music Hub" → checked on
   dashboard refresh.

## Step 7 — Music Hub: lyric check

1. Click the saved track → `/studio/music/[trackId]`.
2. **Assert**: Lyric safety card shows "Check lyrics" gold button.
3. Click it. Loading spinner briefly.
4. **Assert**: card now shows an `AgeRatingBadge` (All Ages / Teen+ /
   Senior Only / Flagged) with matching color, 5 flag pills, Claude's
   one-sentence note, and a confidence hint if not "high".
5. In Supabase: `select lyrics_status, age_rating, lyrics_flags
   from studio_music_tracks;` → values present.
6. Save another track then call check-lyrics on it — if it's the same
   song a second studio would check, **assert** response includes
   `fromPlatformCache: true` (check via DevTools → Network tab).

## Step 8 — Music Hub: similar songs

1. On the track detail page, scroll to "Find me something like this".
2. Click **Suggest songs** with empty filters first.
3. **Assert**: up to 20 results render with chips matching the saved
   track's BPM/energy range (Spotify seed defaults).
4. Set Min BPM 100, Max BPM 130, Target energy 0.8. Click again.
5. **Assert**: results refresh and respect the filters (BPM chips fall
   inside the range when shown).
6. **Assert**: Click **+ Add** on any result → chip flips to "Saved".

## Step 9 — Link routine + see collision banner

1. On the same track detail page, scroll to "Link to a routine".
2. Fill routine name "The Fire Within", dancer "Emma", style "Jazz",
   entry type "Solo", age division "Junior", status **Considering**.
3. Click **Link routine**.
4. **Assert**: collision banner refreshes; with no other studios
   involved yet, it should be **🟢 Clear to lock in**.
5. Linked-routines list shows the new row with a status dropdown + X.

### Manufacturing a collision (optional but recommended)

To verify the 🟡/🔴 states without a second real studio, run this in
the Supabase SQL editor — it seeds a fake competing studio + link:

```sql
-- Fake studio in the SAME region as your test studio (adjust if not IL)
insert into studios (id, name, owner_user_id, invite_code, region)
values (gen_random_uuid(), 'Other Studio Test',
        (select id from auth.users limit 1),
        'other-test-000', 'IL')
returning id;
-- grab that id as $OTHER_STUDIO

-- Save the SAME Spotify track into the other studio's library
insert into studio_music_tracks (studio_id, spotify_track_id, track_name, artist_name)
values ('$OTHER_STUDIO', '<paste the spotify_track_id>', 'Hello', 'Adele')
returning id;
-- grab that id as $OTHER_TRACK

-- Link it to a routine, status='locked_in'
insert into studio_routine_music
  (studio_id, music_track_id, routine_name, season, status, region)
values
  ('$OTHER_STUDIO', '$OTHER_TRACK', 'Rival Routine',
   (select current_season()), 'locked_in', 'IL');
```

Refresh the track detail page.
**Assert**: banner flips to **🔴 Another studio in your region has
locked this song in** with count of 1 lock-in.
**Assert**: the UI does NOT show the other studio's name, the dancer
name, or the routine name. Only the count + region label.

Change the other studio's `region` to 'NY' and refresh.
**Assert**: banner flips to **🟡 Being considered elsewhere, but not
near you**.

Clean up by deleting those rows.

## Step 10 — Library grid collision dots

1. Navigate to `/studio/music`.
2. **Assert**: every library tile shows a small colored dot in the
   top-right corner (green for uninvolved songs, red for the rival-
   locked song if you kept the Step-9 fixtures).
3. Hover the dot. **Assert**: title tooltip explains the state.
4. In DevTools → Network: one POST to `/api/studio/music/collisions/batch`
   with all library track IDs in the body.
5. **Assert**: response contains `{ results: {...}, region: "IL" }`
   with no studio/dancer/routine names.

## Step 11 — Season Schedule: add competition

1. Visit `/studio/schedule`.
2. Add a competition: name "Energy Nationals", date 3 months from
   today, location "Chicago, IL". Click **Add competition**.
3. **Assert**: row appears in the list; entry count = 0.
4. Dashboard checklist "Load your competition schedule" → checked on
   refresh.

## Step 12 — Link routine to competition

1. Click **Manage** on the competition row → detail page.
2. In "Available routines" find the routine you linked in Step 9.
3. Click **Add**.
4. **Assert**: it moves to the "Entries you're bringing" list.
5. In Supabase: `select competition_names from studio_routine_music
   where routine_name='The Fire Within';`
   → array containing `"Energy Nationals"`.
6. Rename the competition to "Energy Nationals 2026" (edit form → Save).
7. **Assert**: the same SQL shows the array updated to the new name.
8. Remove the entry via **Remove**. **Assert**: SQL shows
   `competition_names` is now `null` (or empty array).

## Step 13 — Delete competition cascades cleanly

1. Delete the competition via the Danger Zone.
2. **Assert**: list shows 0 competitions; dashboard checklist for
   schedule flips back to unchecked.
3. `select * from studio_competition_entries;` → 0 rows.
4. `select competition_names from studio_routine_music;` → no stale
   names.

## Step 14 — Owner settings + billing retry

1. `/studio/settings`.
2. **Assert**: Subscription card shows status=trial, trial end date,
   pool 24/25.
3. Change studio name + state; Save.
4. **Assert**: green "Saved" chip appears; banner updated in
   `/studio/team` on next visit.

## Step 15 — Final audits

1. In owner's DevTools → Network, load every `/studio/*` page. For
   each collision / member / invite API call, expand the response
   body.
2. **Assert**: no response ever contains another studio's `name`,
   `owner_user_id`, dancer name, or routine name.
3. Run `npm test` again. **Assert**: 8/8 still passing.
4. `git diff main -- src/lib/credits.ts` — **assert** only additive
   branches inside existing functions; two comment rewrites; no
   functional deletions.
5. `git diff main -- src/app/api/webhook/route.ts` — **assert** 122
   insertions, 0 deletions.

When all 15 steps pass, Phase H E2E is complete. Flip the local dev
flag back to `false`, remove fixture rows, and the branch is ready for
Shaun's final review.
