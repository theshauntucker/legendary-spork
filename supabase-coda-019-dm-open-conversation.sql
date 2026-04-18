-- Coda migration 019: DM — start a conversation.
--
-- Gap found in the live product: /inbox lists existing conversations and
-- /inbox/[id] lets you message inside one, but nothing in the app creates
-- a new conversation. Without this, DMs could never start.
--
-- This migration:
--   1. Adds the missing INSERT / UPDATE policies on conversations + participants.
--   2. Adds a security-definer RPC `public.open_conversation(other_profile_id)`
--      that:
--        - requires auth,
--        - requires both parties to be Tier 2 (adult OR verified studio/choreo),
--        - blocks if either party has blocked the other,
--        - dedupes: returns the existing 1:1 conversation if one exists,
--        - otherwise creates a conversation + two participant rows atomically.
--   3. Tightens the messages INSERT policy so mutual blocks are enforced even
--      inside existing conversations (blocker can't be messaged).
--   4. Adds `public.mark_conversation_read()` so the UI can update last_read_at.
--
-- Idempotent: safe to re-run.

-- 0) Make sure blocks enforcement is usable in policies. (Lightweight helper.)
create or replace function public.is_blocked_between(a_profile uuid, b_profile uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.blocks
    where (blocker_profile_id = a_profile and blocked_profile_id = b_profile)
       or (blocker_profile_id = b_profile and blocked_profile_id = a_profile)
  );
$$;

-- 1) Policies: the creator must be able to insert the conversation row and
--    the participant rows. We keep this tight — only the authenticated caller
--    can add rows on behalf of their own profile.
drop policy if exists "authenticated creates conversations" on public.conversations;
create policy "authenticated creates conversations" on public.conversations
  for insert
  with check (auth.uid() is not null);

drop policy if exists "users add self as participant" on public.conversation_participants;
create policy "users add self as participant" on public.conversation_participants
  for insert
  with check (
    profile_id in (select id from public.profiles where user_id = auth.uid())
  );

drop policy if exists "users update own participant row" on public.conversation_participants;
create policy "users update own participant row" on public.conversation_participants
  for update
  using (profile_id in (select id from public.profiles where user_id = auth.uid()))
  with check (profile_id in (select id from public.profiles where user_id = auth.uid()));

-- 2) Tighten the message INSERT policy: block if either party has blocked
--    the other. We check the *other* participant (there's exactly one in a
--    1:1 conversation) for a block relationship with the sender.
drop policy if exists "tier2 sends messages" on public.messages;
create policy "tier2 sends messages" on public.messages for insert
  with check (
    sender_profile_id in (
      select id from public.profiles
      where user_id = auth.uid()
        and (
          age_tier = 'adult'
          or (profile_type in ('studio','choreographer') and is_verified = true)
        )
    )
    and conversation_id in (
      select conversation_id from public.conversation_participants
      where profile_id in (select id from public.profiles where user_id = auth.uid())
    )
    -- no mutual block between sender and any other participant
    and not exists (
      select 1
      from public.conversation_participants cp
      join public.blocks b
        on (b.blocker_profile_id = cp.profile_id and b.blocked_profile_id = sender_profile_id)
        or (b.blocked_profile_id = cp.profile_id and b.blocker_profile_id = sender_profile_id)
      where cp.conversation_id = messages.conversation_id
        and cp.profile_id <> sender_profile_id
    )
  );

-- 3) open_conversation: find or create a 1:1 conversation between the caller
--    and another profile, enforcing Tier-2 + blocks. Returns the conversation id.
create or replace function public.open_conversation(other_profile_id uuid)
returns uuid
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_self_profile_id uuid;
  v_self_age_tier   text;
  v_self_type       text;
  v_self_verified   boolean;
  v_other_age_tier  text;
  v_other_type      text;
  v_other_verified  boolean;
  v_existing        uuid;
  v_new_conv        uuid;
begin
  if auth.uid() is null then
    raise exception 'not authenticated' using errcode = '28000';
  end if;

  -- Resolve caller's profile
  select p.id, p.age_tier, p.profile_type, p.is_verified
    into v_self_profile_id, v_self_age_tier, v_self_type, v_self_verified
  from public.profiles p
  where p.user_id = auth.uid()
  limit 1;

  if v_self_profile_id is null then
    raise exception 'no profile for caller' using errcode = '28000';
  end if;

  if v_self_profile_id = other_profile_id then
    raise exception 'cannot DM yourself' using errcode = '22023';
  end if;

  -- Tier-2 check for caller
  if not (v_self_age_tier = 'adult'
          or (v_self_type in ('studio','choreographer') and v_self_verified = true)) then
    raise exception 'sender not tier-2' using errcode = '42501';
  end if;

  -- Look up other party
  select p.age_tier, p.profile_type, p.is_verified
    into v_other_age_tier, v_other_type, v_other_verified
  from public.profiles p
  where p.id = other_profile_id
  limit 1;

  if v_other_age_tier is null then
    raise exception 'recipient not found' using errcode = '22023';
  end if;

  -- Tier-2 check for recipient
  if not (v_other_age_tier = 'adult'
          or (v_other_type in ('studio','choreographer') and v_other_verified = true)) then
    raise exception 'recipient not tier-2' using errcode = '42501';
  end if;

  -- Mutual block check
  if public.is_blocked_between(v_self_profile_id, other_profile_id) then
    raise exception 'blocked' using errcode = '42501';
  end if;

  -- Find existing 1:1 conversation (exactly two participants: self + other)
  select cp1.conversation_id
    into v_existing
  from public.conversation_participants cp1
  join public.conversation_participants cp2
    on cp2.conversation_id = cp1.conversation_id
   and cp2.profile_id = other_profile_id
  where cp1.profile_id = v_self_profile_id
    and (
      select count(*)
      from public.conversation_participants cpx
      where cpx.conversation_id = cp1.conversation_id
    ) = 2
  limit 1;

  if v_existing is not null then
    return v_existing;
  end if;

  -- Create fresh conversation + two participants
  insert into public.conversations (last_message_at)
  values (now())
  returning id into v_new_conv;

  insert into public.conversation_participants (conversation_id, profile_id)
  values (v_new_conv, v_self_profile_id),
         (v_new_conv, other_profile_id);

  return v_new_conv;
end;
$$;

grant execute on function public.open_conversation(uuid) to authenticated;

-- 4) Mark-read helper: bump last_read_at on the caller's participant row.
create or replace function public.mark_conversation_read(conv_id uuid)
returns void
language plpgsql
security definer
set search_path = public, auth
as $$
begin
  if auth.uid() is null then return; end if;
  update public.conversation_participants cp
    set last_read_at = now()
  where cp.conversation_id = conv_id
    and cp.profile_id in (select id from public.profiles where user_id = auth.uid());
end;
$$;

grant execute on function public.mark_conversation_read(uuid) to authenticated;
