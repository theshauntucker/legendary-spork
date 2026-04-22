#!/usr/bin/env node
/**
 * seed-reviewer-account.mjs
 *
 * Creates / refreshes the Apple App Review demo account.
 * Required before submitting the iOS app — Apple reviewers sign in with these
 * credentials and must see a working product (Studio Plan, Bayda chat, sample
 * routines, roster) without hitting paywalls or empty states.
 *
 * Usage:
 *   SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... node scripts/seed-reviewer-account.mjs
 *
 * Idempotent — safe to re-run. Wipes + recreates the reviewer's data each time.
 *
 * Referenced by: SHIP_IT.md Part D, APP_STORE_LISTING_COPY.md section 7.
 */

import { createClient } from '@supabase/supabase-js';

const REVIEWER_EMAIL = 'reviewer-demo@routinex.org';
const REVIEWER_PASSWORD = 'RxReview2026!';
const REVIEWER_DISPLAY_NAME = 'App Review Demo';
const REVIEWER_STUDIO_NAME = 'App Review Studio';
const REVIEWER_STATE = 'CA';

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('[seed] Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY env vars.');
  console.error('[seed] Grab these from Vercel → routinex project → Environment Variables.');
  process.exit(1);
}

const sb = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

function log(...args) { console.log('[seed]', ...args); }
function err(...args) { console.error('[seed ERROR]', ...args); }

async function ensureUser() {
  log('Looking for existing reviewer user…');
  // Paginated admin search — filter in code since listUsers doesn't support email filter directly
  const { data: list, error: listErr } = await sb.auth.admin.listUsers({ page: 1, perPage: 200 });
  if (listErr) throw listErr;
  const existing = list.users.find(u => (u.email || '').toLowerCase() === REVIEWER_EMAIL);
  if (existing) {
    log(`Found existing user ${existing.id}. Rotating password + confirming email.`);
    const { error } = await sb.auth.admin.updateUserById(existing.id, {
      password: REVIEWER_PASSWORD,
      email_confirm: true,
      user_metadata: { display_name: REVIEWER_DISPLAY_NAME, is_reviewer: true },
    });
    if (error) throw error;
    return existing.id;
  }
  log('Creating new reviewer user…');
  const { data, error } = await sb.auth.admin.createUser({
    email: REVIEWER_EMAIL,
    password: REVIEWER_PASSWORD,
    email_confirm: true,
    user_metadata: { display_name: REVIEWER_DISPLAY_NAME, is_reviewer: true },
  });
  if (error) throw error;
  log(`Created user ${data.user.id}`);
  return data.user.id;
}

async function ensureProfile(userId) {
  log('Upserting profile…');
  const { error } = await sb.from('profiles').upsert({
    id: userId,
    email: REVIEWER_EMAIL,
    display_name: REVIEWER_DISPLAY_NAME,
    role: 'studio_owner',
    onboarding_complete: true,
    aura_preset: 'auraGold',
    glyph: 'trophy',
  }, { onConflict: 'id' });
  if (error) log('profile upsert note:', error.message);
}

async function ensureCredits(userId) {
  log('Granting reviewer 10 credits…');
  const { error } = await sb.from('user_credits').upsert({
    user_id: userId,
    credits_remaining: 10,
    credits_granted_total: 10,
    plan: 'studio',
    source: 'apple_reviewer_demo',
  }, { onConflict: 'user_id' });
  if (error) log('credits upsert note:', error.message);
}

async function ensureStudio(userId) {
  log('Creating/refreshing reviewer studio…');
  const { data: existing } = await sb.from('studios').select('id').eq('owner_id', userId).maybeSingle();
  const studioId = existing?.id;
  if (studioId) {
    await sb.from('studios').update({
      name: REVIEWER_STUDIO_NAME,
      state: REVIEWER_STATE,
      plan: 'studio',
      status: 'active',
      credits_pool: 100,
      credits_used: 0,
    }).eq('id', studioId);
    return studioId;
  }
  const { data, error } = await sb.from('studios').insert({
    owner_id: userId,
    name: REVIEWER_STUDIO_NAME,
    state: REVIEWER_STATE,
    plan: 'studio',
    status: 'active',
    credits_pool: 100,
    credits_used: 0,
  }).select('id').single();
  if (error) throw error;
  return data.id;
}

async function seedDancers(studioId) {
  log('Seeding 4 fictional dancers…');
  const dancers = [
    { first_name: 'Ava', last_name: 'Stone', age_division: 'Junior', style: 'jazz' },
    { first_name: 'Mila', last_name: 'Reyes', age_division: 'Teen', style: 'lyrical' },
    { first_name: 'Zoe', last_name: 'Park', age_division: 'Senior', style: 'contemporary' },
    { first_name: 'Rue', last_name: 'Carter', age_division: 'Teen', style: 'hiphop' },
  ];
  // Clear prior reviewer dancers idempotently
  await sb.from('studio_dancers').delete().eq('studio_id', studioId);
  const rows = dancers.map(d => ({ ...d, studio_id: studioId, status: 'active' }));
  const { error } = await sb.from('studio_dancers').insert(rows);
  if (error) log('dancers insert note:', error.message);
}

async function seedRoutines(userId, studioId) {
  log('Seeding 2 sample analyzed routines…');
  // Clear prior reviewer routines
  await sb.from('routines').delete().eq('studio_id', studioId);
  const routines = [
    {
      user_id: userId,
      studio_id: studioId,
      title: 'Mini Small Group — Contemporary',
      discipline: 'dance',
      style: 'contemporary',
      status: 'analyzed',
      visibility: 'studio',
      total_score: 284,
      award_level: 'Platinum',
      technique_score: 33,
      performance_score: 32,
      choreography_score: 18,
      overall_score: 9,
    },
    {
      user_id: userId,
      studio_id: studioId,
      title: 'Senior All-Star Cheer — Level 4',
      discipline: 'cheer',
      style: 'allstar',
      status: 'analyzed',
      visibility: 'studio',
      total_score: 293,
      award_level: 'Diamond',
      technique_score: 34,
      performance_score: 34,
      choreography_score: 19,
      overall_score: 10,
    },
  ];
  const { error } = await sb.from('routines').insert(routines);
  if (error) log('routines insert note:', error.message);
}

async function seedSubscription(userId) {
  log('Flagging simulated Studio Plan subscription (not billed)…');
  const { error } = await sb.from('subscriptions').upsert({
    user_id: userId,
    plan: 'studio',
    status: 'active',
    simulated: true,
    current_period_end: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
    source: 'apple_reviewer_demo',
  }, { onConflict: 'user_id' });
  if (error) log('subscription upsert note:', error.message);
}

async function main() {
  log('=== Apple Reviewer Seed ===');
  log(`Email:    ${REVIEWER_EMAIL}`);
  log(`Password: ${REVIEWER_PASSWORD}`);
  try {
    const userId = await ensureUser();
    await ensureProfile(userId);
    await ensureCredits(userId);
    const studioId = await ensureStudio(userId);
    await seedDancers(studioId);
    await seedRoutines(userId, studioId);
    await seedSubscription(userId);
    log('=== DONE ===');
    log('Reviewer account ready. Sign in at https://routinex.org/signin to verify before submitting to App Review.');
    log('Remember: test Bayda chat, open /studio/dashboard, open /studio/team-board, run one analysis.');
  } catch (e) {
    err(e?.message || e);
    err('Tables used: auth.users, profiles, user_credits, studios, studio_dancers, routines, subscriptions.');
    err('If a table errors, check the migration folder for schema changes and update this script accordingly.');
    process.exit(1);
  }
}

main();
