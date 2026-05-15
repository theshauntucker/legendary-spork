#!/usr/bin/env node
/**
 * Installs the App Store icon into the iOS asset catalog.
 *
 * Why this script exists:
 *   mobile/ios is gitignored. When the iOS shell is regenerated (npx cap add ios on
 *   a new machine), Capacitor writes the default blue-X placeholder into
 *   mobile/ios/App/App/Assets.xcassets/AppIcon.appiconset/AppIcon-512@2x.png.
 *
 *   The real source of truth is public/app-icon-ios-1024.png (1024x1024, opaque,
 *   sunset-X on black). This script copies it into place after every cap add/sync.
 *
 * Usage: node scripts/install-app-icon.mjs
 *
 * Add this to your iOS rebuild flow:
 *   npx cap add ios
 *   node scripts/install-app-icon.mjs
 *   npx cap sync ios
 *   npx cap open ios
 */
import { copyFile, access } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(__dirname, '..');
const src = resolve(repoRoot, 'public/app-icon-ios-1024.png');
const dst = resolve(
  repoRoot,
  'mobile/ios/App/App/Assets.xcassets/AppIcon.appiconset/AppIcon-512@2x.png',
);

try {
  await access(src);
} catch {
  console.error('Source icon missing:', src);
  process.exit(1);
}

try {
  await access(resolve(repoRoot, 'mobile/ios'));
} catch {
  console.error('mobile/ios not present — run npx cap add ios first.');
  process.exit(1);
}

await copyFile(src, dst);
console.log('Installed App Store icon ->', dst);
