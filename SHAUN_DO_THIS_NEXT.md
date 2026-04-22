# SHAUN — iOS / App Store — next steps (Apr 22, 2026 morning)

**Overnight Claude merged the iOS Capacitor shell as additive files** — no other
parts of the repo were touched. The social platform (Coda), studio dashboard,
Bayda, and all migrations are intact.

## What landed on `main` overnight

1. `mobile/` — standalone Capacitor iOS shell (separate package.json, its own
   node_modules once installed). Includes:
   - `mobile/capacitor.config.ts` — points to `https://routinex.org`
   - `mobile/ios-config/` — AppDelegate.swift, TabBar/WebView controllers,
     Info.plist additions, PrivacyInfo.xcprivacy
   - `mobile/src/` — bridge, camera, IAP, push bindings
2. `supabase-push-notifications.sql` — migration for `device_tokens` table
3. `src/app/api/account/route.ts` — `DELETE /api/account` (App Store 5.1.1(v))
4. `src/app/api/push/register/route.ts` — device token registration
5. `src/app/api/push/send/route.ts` — internal push dispatch endpoint
6. `src/app/settings/page.tsx` + `SettingsClient.tsx` — in-app deletion UI

## Deliberately NOT landed (to protect Coda)

The upstream iOS branch `claude/plan-mobile-app-structure-2gH8n` was built on
a much older main — full merge would have deleted CLAUDE.md, all 20
`supabase-coda-*.sql` migrations, every `/studio/*` page, BaydaWidget,
TrophyWall, VisibilityPicker, gradients.ts, haptics.ts, motion.ts, the
`/coda` landing, and dozens more. **Only net-new additive files were taken.**

## What you need to do (requires your Mac + Xcode)

### 1. Apply the Supabase migration
```bash
# Option A — via Supabase dashboard
# Open https://supabase.com/dashboard/project/xkckvrbxaessudolxhte/sql/new
# Paste contents of supabase-push-notifications.sql and Run

# Option B — via GitHub Actions workflow
# Trigger the apply-migrations workflow manually with this file
```

Verify after: `select count(*) from public.device_tokens;` should return 0 rows
(table exists, empty).

### 2. Set Vercel env vars
```
INTERNAL_API_SECRET=<generate a strong random string>
APPLE_SHARED_SECRET=<from App Store Connect → In-App Purchases → App-Specific Shared Secret>
```

Set both via Vercel dashboard → routinex project → Settings → Environment
Variables (Production + Preview). Redeploy after.

### 3. Install mobile deps and add the iOS Xcode project
```bash
cd /Users/shauntucker/Desktop/03-ROUTINEX/legendary-spork/mobile
npm install              # installs Capacitor deps in mobile/node_modules
npx cap add ios          # creates mobile/ios/ Xcode project
npx cap sync ios         # copies native config
npx cap open ios         # opens in Xcode
```

### 4. In Xcode
- Set Bundle ID: `com.routinex.app`
- Set Team to your Apple Developer account
- Add capabilities: Push Notifications, In-App Purchase
- Copy the four Swift files from `mobile/ios-config/` into the Xcode project
- Merge `Info.plist.additions` keys into the generated `Info.plist`
- Add `PrivacyInfo.xcprivacy` to the app target
- Set deployment target: iOS 15.0+
- Archive → Distribute App → App Store Connect

### 5. App Store Connect setup (before archiving)
Create IAP products with these product IDs:
- `routinex_single` — $8.99 consumable (one analysis)
- `routinex_pack` — $29.99 consumable (5-pack)
- `routinex_monthly` — $12.99/mo auto-renewable subscription (10/mo)

Grab the app-specific shared secret and set it as `APPLE_SHARED_SECRET` (see step 2).

## Known blockers on your machine

**⚠ Disk nearly full (1.9 GB free of 228 GB)** — free space before `npm install`
or `pnpm install`. `du -sh ~/Library/Developer/Xcode/DerivedData` and
`~/Library/Caches/*` are usually the biggest wins.

**⚠ Local git repo pack corruption** — overnight Claude couldn't run `git log`
or `git fsck` against `/Users/shauntucker/Desktop/03-ROUTINEX/legendary-spork`
because `.git/objects/pack/pack-cca12d566f7a3630bd0dfb8270ff44546024660f.pack`
times out on read. Fix:
```bash
cd /Users/shauntucker/Desktop/03-ROUTINEX/legendary-spork
xattr -rc .git                         # strip macOS extended attrs (common cause)
# if still broken:
rm .git/objects/pack/pack-cca12d566f7a3630bd0dfb8270ff44546024660f.*
git fetch origin                       # re-downloads missing objects
git gc --prune=now
```
Then `git pull origin main` to see the overnight commits.

## Submission timeline sanity check
- Today (Apr 22): migration + env vars + Xcode setup (~2 hrs)
- Apr 23: archive, fill App Store metadata, submit for review
- Apr 23–25: Apple review (1–3 days)
- Apr 26–28: address any rejection, resubmit
- **May 7 launch target: realistic with 2 days of slack**

## References
- `OVERNIGHT_SUMMARY_2026-04-22.md` — full summary of everything overnight
  Claude did (also in repo root after morning push)
- `supabase-push-notifications.sql` — the DDL to run
- Capacitor docs: https://capacitorjs.com/docs/ios
