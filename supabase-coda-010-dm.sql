-- Coda migration 010: DM foundation (Tier 2 text only)

create table if not exists public.conversations (
  id uuid default gen_random_uuid() primary key,
  created_at timestamptz default now(),
  last_message_at timestamptz default now()
);

create table if not exists public.conversation_participants (
  conversation_id uuid references public.conversations(id) on delete cascade,
  profile_id uuid references public.profiles(id) on delete cascade,
  joined_at timestamptz default now(),
  last_read_at timestamptz default now(),
  primary key (conversation_id, profile_id)
);

create table if not exists public.messages (
  id uuid default gen_random_uuid() primary key,
  conversation_id uuid references public.conversations(id) on delete cascade not null,
  sender_profile_id uuid references public.profiles(id) on delete cascade not null,
  body text not null,
  created_at timestamptz default now()
);
create index if not exists idx_messages_conv on public.messages(conversation_id, created_at);

create table if not exists public.message_reactions (
  message_id uuid references public.messages(id) on delete cascade,
  profile_id uuid references public.profiles(id) on delete cascade,
  emoji_code text not null,
  reacted_at timestamptz default now(),
  primary key (message_id, profile_id, emoji_code)
);

create table if not exists public.blocks (
  blocker_profile_id uuid references public.profiles(id) on delete cascade,
  blocked_profile_id uuid references public.profiles(id) on delete cascade,
  created_at timestamptz default now(),
  primary key (blocker_profile_id, blocked_profile_id)
);

alter table public.conversations enable row level security;
alter table public.conversation_participants enable row level security;
alter table public.messages enable row level security;
alter table public.message_reactions enable row level security;
alter table public.blocks enable row level security;

drop policy if exists "participants read convs" on public.conversations;
create policy "participants read convs" on public.conversations for select
  using (
    id in (
      select conversation_id from public.conversation_participants
      where profile_id in (select id from public.profiles where user_id = auth.uid())
    )
  );

drop policy if exists "participants read participants" on public.conversation_participants;
create policy "participants read participants" on public.conversation_participants for select
  using (
    conversation_id in (
      select conversation_id from public.conversation_participants
      where profile_id in (select id from public.profiles where user_id = auth.uid())
    )
  );

drop policy if exists "participants read messages" on public.messages;
create policy "participants read messages" on public.messages for select
  using (
    conversation_id in (
      select conversation_id from public.conversation_participants
      where profile_id in (select id from public.profiles where user_id = auth.uid())
    )
  );

-- Tier-2 insert: the sender must be an adult OR verified studio/choreographer.
-- Minors (age_tier in 'minor','teen') are blocked here. A later migration will
-- add a Tier-1 carve-out for verified studio/choreographer recipients only.
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
  );

drop policy if exists "anyone reads msg reactions" on public.message_reactions;
create policy "anyone reads msg reactions" on public.message_reactions for select using (true);
drop policy if exists "users react to msgs" on public.message_reactions;
create policy "users react to msgs" on public.message_reactions for all
  using (profile_id in (select id from public.profiles where user_id = auth.uid()))
  with check (profile_id in (select id from public.profiles where user_id = auth.uid()));

drop policy if exists "users manage own blocks" on public.blocks;
create policy "users manage own blocks" on public.blocks for all
  using (blocker_profile_id in (select id from public.profiles where user_id = auth.uid()))
  with check (blocker_profile_id in (select id from public.profiles where user_id = auth.uid()));
