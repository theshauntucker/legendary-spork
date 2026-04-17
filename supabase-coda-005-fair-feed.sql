-- Coda migration 005: fair-feed plumbing (posts, reach queue, view ledger, audit)

create table if not exists public.posts (
  id uuid default gen_random_uuid() primary key,
  profile_id uuid references public.profiles(id) on delete cascade not null,
  post_type text check (post_type in ('achievement','text','milestone')) not null,
  ref_id uuid,
  body text,
  created_at timestamptz default now(),
  last_boosted_at timestamptz
);
create index if not exists idx_posts_profile on public.posts(profile_id, created_at desc);

create table if not exists public.reach_floor_queue (
  post_id uuid primary key references public.posts(id) on delete cascade,
  target_views int not null default 50,
  delivered_views int default 0,
  expires_at timestamptz not null
);

create table if not exists public.post_views (
  post_id uuid references public.posts(id) on delete cascade,
  viewer_id uuid references public.profiles(id) on delete cascade,
  viewed_at timestamptz default now(),
  source text check (source in ('follow','studio','bond','event','fair_reach','discovery')),
  primary key (post_id, viewer_id)
);
create index if not exists idx_post_views_post on public.post_views(post_id);

create table if not exists public.feed_audit (
  id uuid default gen_random_uuid() primary key,
  profile_id uuid references public.profiles(id),
  served_at timestamptz default now(),
  items jsonb,
  weights jsonb
);

-- Trigger: every new post gets a reach-floor row with 50 target views / 24h expiry.
create or replace function public.create_reach_floor_row() returns trigger
language plpgsql as $$
begin
  insert into public.reach_floor_queue (post_id, target_views, expires_at)
  values (new.id, 50, now() + interval '24 hours')
  on conflict (post_id) do nothing;
  return new;
end;
$$;

drop trigger if exists trg_create_reach_floor on public.posts;
create trigger trg_create_reach_floor
  after insert on public.posts
  for each row execute function public.create_reach_floor_row();

-- Helper view: reach for a viewer in the last 24h (count of distinct posts viewed that they OWN).
create or replace view public.reach_today as
  select p.profile_id, count(*)::int as impressions
  from public.post_views v
  join public.posts p on p.id = v.post_id
  where v.viewed_at > now() - interval '24 hours'
  group by p.profile_id;

alter table public.posts enable row level security;
alter table public.post_views enable row level security;
alter table public.reach_floor_queue enable row level security;
alter table public.feed_audit enable row level security;

drop policy if exists "public posts readable" on public.posts;
create policy "public posts readable" on public.posts for select using (true);

drop policy if exists "owner writes posts" on public.posts;
create policy "owner writes posts" on public.posts for all
  using (profile_id in (select id from public.profiles where user_id = auth.uid()))
  with check (profile_id in (select id from public.profiles where user_id = auth.uid()));

drop policy if exists "signed in writes views" on public.post_views;
create policy "signed in writes views" on public.post_views for insert
  with check (viewer_id in (select id from public.profiles where user_id = auth.uid()));

drop policy if exists "owner reads own queue" on public.reach_floor_queue;
create policy "owner reads own queue" on public.reach_floor_queue for select using (true);
