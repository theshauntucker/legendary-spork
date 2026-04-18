-- Coda migration 018: Admin Ghost Mode.
--
-- Goal: the founder/admin can use the live product to add studios, dancers,
-- test posts, etc. without any of it polluting real community metrics, feeds,
-- or payment flows. Real users never see test data.
--
-- Primitives:
--   1. public.admin_ghosts table — explicit allowlist of user_ids in ghost mode.
--      Adding a row = that user's writes are marked is_test=true and are hidden
--      from the public feed/leaderboards/search.
--   2. is_test column added to: profiles, videos, achievements, posts,
--      studios, studio_members, studio_roster, comments, reactions.
--      Default false. Anything written by an admin ghost gets true.
--   3. public.is_admin_ghost(uuid) helper.
--   4. Triggers on each table that auto-set is_test when inserted by a ghost.
--   5. Views / RLS helpers to hide is_test=true from non-admin reads.
--
-- Safe to re-run: every DDL guarded, every column add is IF NOT EXISTS.

-- 1) allowlist table
create table if not exists public.admin_ghosts (
  user_id    uuid primary key references auth.users(id) on delete cascade,
  reason     text,
  added_at   timestamptz not null default now()
);

comment on table public.admin_ghosts is
  'Users whose writes are treated as test data (is_test=true). Hidden from public feeds.';

-- Seed the founder
insert into public.admin_ghosts (user_id, reason)
select u.id, 'founder'
from auth.users u
where lower(u.email) = '22tucker22@comcast.net'
  and not exists (select 1 from public.admin_ghosts g where g.user_id = u.id);

-- 2) helper function (stable — safe in policies)
create or replace function public.is_admin_ghost(uid uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.admin_ghosts g where g.user_id = uid);
$$;

-- 3) add is_test column to every content table that feeds public surfaces
do $$
declare
  t text;
  targets text[] := array[
    'profiles','videos','achievements','posts',
    'studios','studio_members','studio_roster',
    'comments','reactions','check_ins','threads'
  ];
begin
  foreach t in array targets loop
    if exists (select 1 from information_schema.tables where table_schema='public' and table_name=t) then
      execute format(
        'alter table public.%I add column if not exists is_test boolean not null default false',
        t
      );
      execute format(
        'create index if not exists idx_%I_is_test on public.%I (is_test) where is_test = false',
        t, t
      );
    end if;
  end loop;
end $$;

-- 4) one generic trigger function: if the row's user_id (or owner_user_id, or
--    profile owner) is an admin ghost, flip is_test to true on insert.
create or replace function public.mark_test_if_ghost()
returns trigger
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_uid uuid;
begin
  -- Try common columns that represent the writer.
  begin v_uid := (to_jsonb(new)->>'user_id')::uuid; exception when others then v_uid := null; end;
  if v_uid is null then
    begin v_uid := (to_jsonb(new)->>'owner_user_id')::uuid; exception when others then v_uid := null; end;
  end if;
  if v_uid is null then
    -- For rows keyed by profile_id, resolve profile -> user_id.
    begin
      v_uid := (select p.user_id from public.profiles p where p.id = (to_jsonb(new)->>'profile_id')::uuid);
    exception when others then v_uid := null; end;
  end if;
  if v_uid is null then
    v_uid := auth.uid();
  end if;
  if v_uid is not null and public.is_admin_ghost(v_uid) then
    new.is_test := true;
  end if;
  return new;
end;
$$;

-- 5) attach the trigger to every content table (idempotent)
do $$
declare
  t text;
  targets text[] := array[
    'profiles','videos','achievements','posts',
    'studios','studio_members','studio_roster',
    'comments','reactions','check_ins','threads'
  ];
begin
  foreach t in array targets loop
    if exists (select 1 from information_schema.tables where table_schema='public' and table_name=t) then
      execute format('drop trigger if exists trg_mark_test_if_ghost on public.%I', t);
      execute format(
        'create trigger trg_mark_test_if_ghost before insert on public.%I for each row execute function public.mark_test_if_ghost()',
        t
      );
    end if;
  end loop;
end $$;

-- 6) retro-flag: mark existing rows owned by the founder as test data so the
--    current feed stops showing them to real users.
do $$
declare
  fid uuid := (select user_id from public.admin_ghosts limit 1);
begin
  if fid is null then return; end if;
  update public.profiles       set is_test = true where user_id = fid and not is_test;
  update public.videos         set is_test = true where user_id = fid and not is_test;
  update public.achievements   set is_test = true where profile_id in (select id from public.profiles where user_id = fid) and not is_test;
  if exists (select 1 from information_schema.tables where table_schema='public' and table_name='posts') then
    execute 'update public.posts set is_test = true where owner_profile_id in (select id from public.profiles where user_id = $1) and not is_test' using fid;
  end if;
end $$;

-- 7) helpful read-side view: public_feed_profiles = profiles minus test rows.
create or replace view public.v_public_profiles as
  select * from public.profiles where is_test = false;

comment on view public.v_public_profiles is
  'Profiles minus admin-ghost/test rows. Use this in public feed queries.';
