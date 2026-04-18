-- Coda migration 017: PII fix — anonymize any handle that was backfilled from the email local-part.
-- Context: migration 011 seeded `handle = split_part(email, '@', 1) || '_' || left(user_id, 6)`.
-- Anyone looking at the feed could read someone's email prefix. Not OK.
--
-- Strategy:
--   1. For every profile whose handle currently starts with the email local-part of that user's
--      email, replace the handle with a safe anonymous form: `user_<first 8 of user_id>`.
--   2. Skip the system `bayda` profile (null user_id) and any profile that has an explicitly
--      chosen handle (i.e., handle does NOT match the auto-seeded pattern).
--   3. Null out display_name on any profile where display_name equals the user's email.
--   4. Idempotent — safe to re-run.

-- 1) Rewrite auto-seeded handles.
with email_map as (
  select p.id, p.handle, u.email, p.user_id,
    lower(regexp_replace(coalesce(split_part(u.email, '@', 1), 'user'), '[^a-zA-Z0-9_]', '_', 'g'))
      || '_' || substr(p.user_id::text, 1, 6) as seeded_handle
  from public.profiles p
  join auth.users u on u.id = p.user_id
  where p.user_id is not null
)
update public.profiles p
set handle = 'user_' || substr(p.user_id::text, 1, 8)
from email_map m
where p.id = m.id
  and p.handle = m.seeded_handle
  and not exists (
    -- avoid collisions; skip if target handle already taken by someone else
    select 1 from public.profiles p2 where p2.handle = 'user_' || substr(m.user_id::text, 1, 8) and p2.id <> p.id
  );

-- 2) For any handle that still contains a recognizable email local-part pattern
--    (e.g., starts with the email's local part followed by underscore), anonymize anyway.
--    This catches rows that were edited slightly after seeding but still leak the email prefix.
with leakers as (
  select p.id, p.user_id, split_part(u.email, '@', 1) as local_part
  from public.profiles p
  join auth.users u on u.id = p.user_id
  where p.user_id is not null
    and u.email is not null
    and length(split_part(u.email, '@', 1)) >= 3
)
update public.profiles p
set handle = 'user_' || substr(p.user_id::text, 1, 8)
from leakers l
where p.id = l.id
  and lower(p.handle) like lower(regexp_replace(l.local_part, '[^a-zA-Z0-9_]', '_', 'g')) || '%'
  and not exists (
    select 1 from public.profiles p2 where p2.handle = 'user_' || substr(l.user_id::text, 1, 8) and p2.id <> p.id
  );

-- 3) Null out display_name if it equals the user's email.
update public.profiles p
set display_name = null
from auth.users u
where p.user_id = u.id
  and p.display_name is not null
  and lower(p.display_name) = lower(u.email);

-- 4) Going forward: reject emails / email-local-parts as handles at write time.
create or replace function public.prevent_email_in_handle()
returns trigger
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_email text;
  v_local text;
begin
  if new.user_id is null then
    return new;  -- system profiles (e.g. bayda) exempt
  end if;
  select email into v_email from auth.users where id = new.user_id;
  if v_email is null then return new; end if;
  v_local := lower(regexp_replace(split_part(v_email, '@', 1), '[^a-zA-Z0-9_]', '_', 'g'));
  if length(v_local) >= 3 and lower(new.handle) like v_local || '%' then
    raise exception 'handle cannot be derived from email address' using errcode = '22023';
  end if;
  if new.display_name is not null and lower(new.display_name) = lower(v_email) then
    new.display_name := null;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_prevent_email_in_handle on public.profiles;
create trigger trg_prevent_email_in_handle
  before insert or update on public.profiles
  for each row execute function public.prevent_email_in_handle();

-- Done. After this migration: feed shows opaque user_XXXXXXXX handles for anyone who never
-- explicitly picked one, emails are out of the UI, and new signups can't regress.
