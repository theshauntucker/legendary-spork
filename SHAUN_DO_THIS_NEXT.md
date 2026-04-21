# SHAUN DO THIS NEXT

Everything below is blocked on you. Claude Code cannot do these from the remote sandbox.

---

## STEP 1 — Land patches on main (5 min)

Your Mac has two patch files that need to go to `main`. Claude Code runs on a Linux sandbox with no access to `/Users/shauntucker/...`.

```bash
cd ~/path/to/legendary-spork
git checkout main && git pull origin main

# Apply studio features patch
git am ~/Documents/Claude/Projects/RoutineX/STUDIO_FEATURES_28593e4.patch

# Apply support page patch
git am ~/Documents/Claude/Projects/RoutineX/SUPPORT_PAGE_5c1237a.patch

# Verify build
pnpm install && pnpm build

# Push
git push origin main
```

If `git am` fails (patch conflicts), try:
```bash
git apply --3way ~/Documents/Claude/Projects/RoutineX/STUDIO_FEATURES_28593e4.patch
git add -A && git commit -m "Add studio dashboard features"
# repeat for support page patch
```

---

## STEP 2 — Merge Capacitor branch into main (2 min)

The Capacitor shell + web infrastructure is on `claude/plan-mobile-app-structure-2gH8n`. After Step 1:

```bash
git checkout main
git merge claude/plan-mobile-app-structure-2gH8n
# resolve any conflicts (unlikely — different files)
git push origin main
```

---

## STEP 3 — Initialize Capacitor iOS project (5 min)

```bash
cd mobile
npm install
npx cap add ios
npx cap sync ios
```

Then apply the native Swift customizations:
```bash
# Copy custom Swift files into the Xcode project
cp ios-config/AppDelegate.swift ios/App/App/AppDelegate.swift
cp ios-config/RoutineXTabBarController.swift ios/App/App/RoutineXTabBarController.swift
cp ios-config/RoutineXWebViewController.swift ios/App/App/RoutineXWebViewController.swift
cp ios-config/PrivacyInfo.xcprivacy ios/App/App/PrivacyInfo.xcprivacy
```

Then open Xcode:
```bash
npx cap open ios
```

In Xcode:
1. Add the 3 new Swift files to the project navigator (drag from Finder if needed)
2. Add entries from `ios-config/Info.plist.additions` to `ios/App/App/Info.plist`
3. Set deployment target to iOS 16.0
4. Set Bundle ID to `com.routinex.app`
5. Select your Apple Developer signing team

---

## STEP 4 — Run Supabase migration (2 min)

Go to Supabase Dashboard → SQL Editor → paste contents of `supabase-push-notifications.sql` → Run.

This creates the `device_tokens` table for push notifications.

---

## STEP 5 — Set environment variables (3 min)

In Vercel (routinex.org project → Settings → Environment Variables), add:
- `APPLE_SHARED_SECRET` — from App Store Connect → Your App → App-Specific Shared Secret
- `INTERNAL_API_SECRET` — generate a random string (used for server-to-server push endpoint auth)

Redeploy production after adding.

---

## STEP 6 — App Store Connect setup (30 min)

1. Apple Developer → Membership → copy **Team ID**
2. App Store Connect → My Apps → **+** → New App → iOS → Bundle ID `com.routinex.app`
3. Copy the numeric **Apple ID** from App Information
4. Create IAP products (exact IDs):
   - `routinex_single` — Consumable — $8.99
   - `routinex_pack` — Consumable — $29.99
   - `routinex_monthly` — Auto-Renewable Subscription — $12.99/mo (create Subscription Group "RoutineX Pro" first)
5. App Privacy form: Email (linked, not tracking), Purchase History (linked, not tracking), User Content (linked, not tracking)
6. Age Rating questionnaire: no violence, no mature content → 4+
7. Review Information: demo account credentials, notes about how to test

---

## STEP 7 — Build and submit (20 min)

In Xcode:
1. Product → Archive
2. Distribute App → App Store Connect
3. Upload

OR via command line:
```bash
cd mobile
npx cap sync ios
# Then build in Xcode: Product → Archive → Distribute
```

In App Store Connect:
- Select the uploaded build
- Add screenshots (1290×2796 for 6.7" iPhone, 3-5 images, NO dancer faces)
- Use APP_STORE_LISTING_COPY.md for all listing text
- Submit for Review

---

## STEP 8 — Clean up desktop (30 sec)

Once patches are applied and everything is merged:
```bash
rm ~/Documents/Claude/Projects/RoutineX/STUDIO_FEATURES_28593e4.patch
rm ~/Documents/Claude/Projects/RoutineX/SUPPORT_PAGE_5c1237a.patch
rm ~/Documents/Claude/Projects/RoutineX/SUPPORT_PAGE_5c1237a.patch
rm ~/Documents/Claude/Projects/RoutineX/APP_STORE_LISTING_COPY.md
rm ~/Documents/Claude/Projects/RoutineX/CLAUDE_CODE_PIVOT_PROMPT.md
rm ~/Documents/Claude/Projects/RoutineX/CLAUDE.md
rm ~/Documents/Claude/Projects/RoutineX/PUSH_SUPPORT_PAGE.md
```

And in the repo:
```bash
rm SHAUN_DO_THIS_NEXT.md
rm -rf mobile-expo-archive/
git add -A && git commit -m "Clean up handoff files and archived Expo app"
git push origin main
```

---

## AFTER YOU'RE BACK — Tell Claude Code to:

Once patches are on main and Capacitor is initialized, come back and ask Claude Code to:
1. **Audit studio pages at 390px** — responsive polish for /studio/dashboard, /studio/team-board, /studio/playbook, /studio/music, /studio/roster, /studio/schedule
2. **Wire IAP into the web upload flow** — detect Capacitor, show native purchase instead of Stripe checkout
3. **Test the native tab bar** — may need Swift adjustments depending on how Capacitor's CAPBridgeViewController subclassing works in practice

---

## What Claude Code already built (on `claude/plan-mobile-app-structure-2gH8n`):

| Component | Status |
|---|---|
| Capacitor config (server.url → routinex.org) | Done |
| Native Swift UITabBarController (4 tabs) | Done (needs Xcode compilation) |
| Shared WKProcessPool for cookie continuity | Done |
| StoreKit IAP bridge (3 products + receipt verify) | Done |
| Native camera/video picker bridge | Done |
| Push notification bridge + registration | Done |
| POST /api/push/register endpoint | Done |
| POST /api/push/send endpoint | Done |
| device_tokens SQL migration | Done |
| /settings page with account deletion | Done |
| DELETE /api/account endpoint | Done |
| PrivacyInfo.xcprivacy | Done |
| Info.plist entries (camera, photos, mic, export) | Done |
| Capacitor-aware CSS (hide web nav in native shell) | Done |
| Bridge script (window.RoutineX namespace) | Done |
| .env.example updated with APPLE_SHARED_SECRET | Done |
