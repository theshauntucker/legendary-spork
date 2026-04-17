-- Coda migration 006: reactions + threaded comments

create table if not exists public.post_reactions (
  post_id uuid not null,
  post_type text not null,
  profile_id uuid references public.profiles(id) on delete cascade not null,
  emoji_code text not null,
  reacted_at timestamptz default now(),
  primary key (post_id, post_type, profile_id, emoji_code)
);
create index if not exists idx_reactions_post on public.post_reactions(post_id, post_type);

create table if not exists public.comments (
  id uuid default gen_random_uuid() primary key,
  post_id uuid not null,
  post_type text not null,
  profile_id uuid references public.profiles(id) on delete cascade not null,
  body text not null,
  parent_comment_id uuid references public.comments(id) on delete cascade,
  created_at timestamptz default now(),
  deleted_at timestamptz
);
create index if not exists idx_comments_post on public.comments(post_id, post_type, created_at);

alter table public.post_reactions enable row level security;
alter table public.comments enable row level security;

drop policy if exists "anyone reads reactions" on public.post_reactions;
create policy "anyone reads reactions" on public.post_reactions for select using (true);

drop policy if exists "users react" on public.post_reactions;
create policy "users react" on public.post_reactions for insert
  with check (profile_id in (select id from public.profiles where user_id = auth.uid()));

drop policy if exists "users unreact" on public.post_reactions;
create policy "users unreact" on public.post_reactions for delete
  using (profile_id in (select id from public.profiles where user_id = auth.uid()));

drop policy if exists "visible comments readable" on public.comments;
create policy "visible comments readable" on public.comments for select
  using (deleted_at is null);

drop policy if exists "users comment" on public.comments;
create policy "users comment" on public.comments for insert
  with check (profile_id in (select id from public.profiles where user_id = auth.uid()));

drop policy if exists "users soft-delete own comments" on public.comments;
create policy "users soft-delete own comments" on public.comments for update
  using (profile_id in (select id from public.profiles where user_id = auth.uid()))
  with check (profile_id in (select id from public.profiles where user_id = auth.uid()));
