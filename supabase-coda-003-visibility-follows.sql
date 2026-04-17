-- Coda migration 003: per-item visibility + follows + can_view_item function
-- NON-NEGOTIABLE: enforce visibility at the database layer, not just UI.

create table if not exists public.visibility_settings (
  owner_profile_id uuid references public.profiles(id) on delete cascade not null,
  item_type text check (item_type in ('video','achievement','post','comment')) not null,
  item_id uuid not null,
  visibility text check (visibility in ('public','followers','studio','private')) not null default 'private',
  updated_at timestamptz default now(),
  primary key (item_type, item_id)
);

create index if not exists idx_visibility_owner on public.visibility_settings(owner_profile_id);

create table if not exists public.follows (
  follower_id uuid references public.profiles(id) on delete cascade not null,
  following_id uuid references public.profiles(id) on delete cascade not null,
  created_at timestamptz default now(),
  primary key (follower_id, following_id)
);

create index if not exists idx_follows_following on public.follows(following_id);

alter table public.visibility_settings enable row level security;
alter table public.follows enable row level security;

drop policy if exists "anyone reads visibility" on public.visibility_settings;
create policy "anyone reads visibility" on public.visibility_settings for select using (true);

drop policy if exists "owner writes visibility" on public.visibility_settings;
create policy "owner writes visibility" on public.visibility_settings for all
  using (owner_profile_id in (select id from public.profiles where user_id = auth.uid()))
  with check (owner_profile_id in (select id from public.profiles where user_id = auth.uid()));

drop policy if exists "anyone reads follows" on public.follows;
create policy "anyone reads follows" on public.follows for select using (true);

drop policy if exists "users manage own follows" on public.follows;
create policy "users manage own follows" on public.follows for all
  using (follower_id in (select id from public.profiles where user_id = auth.uid()))
  with check (follower_id in (select id from public.profiles where user_id = auth.uid()));

create or replace function public.can_view_item(
  viewer_user_id uuid,
  p_item_type text,
  p_item_id uuid
) returns boolean
language plpgsql
stable
security definer
as $$
declare
  vrow record;
  owner_user uuid;
  owner_studio uuid;
  viewer_profile uuid;
  viewer_studio uuid;
begin
  select v.visibility, v.owner_profile_id, p.user_id, p.studio_id
    into vrow
  from public.visibility_settings v
  join public.profiles p on p.id = v.owner_profile_id
  where v.item_type = p_item_type and v.item_id = p_item_id;

  if not found then
    -- no visibility row = private by default
    return false;
  end if;

  owner_user := vrow.user_id;
  owner_studio := vrow.studio_id;

  if vrow.visibility = 'public' then
    return true;
  end if;

  if viewer_user_id is null then
    return false;
  end if;

  if owner_user = viewer_user_id then
    return true;
  end if;

  select id, studio_id into viewer_profile, viewer_studio
  from public.profiles where user_id = viewer_user_id;

  if vrow.visibility = 'followers' then
    return exists (
      select 1 from public.follows
      where follower_id = viewer_profile and following_id = vrow.owner_profile_id
    );
  end if;

  if vrow.visibility = 'studio' then
    return owner_studio is not null and owner_studio = viewer_studio;
  end if;

  return false;
end;
$$;

-- Apply visibility to existing videos table. (If the `videos` table uses a different PK column,
-- adjust the policy predicate accordingly.)
drop policy if exists "video visibility" on public.videos;
create policy "video visibility" on public.videos for select
  using (
    public.can_view_item(auth.uid(), 'video', id)
    or exists (
      select 1 from public.profiles p
      where p.user_id = auth.uid()
        and p.id in (select owner_profile_id from public.visibility_settings where item_type = 'video' and item_id = public.videos.id)
    )
  );

-- Data migration: mark every existing video as private by default.
-- (videos table has no public_share_token column in the current schema; owners can
-- opt individual items into broader visibility via the UI after migration.)
insert into public.visibility_settings (owner_profile_id, item_type, item_id, visibility)
select p.id, 'video', v.id, 'private'
from public.videos v
join public.profiles p on p.user_id = v.user_id
where not exists (
  select 1 from public.visibility_settings x
  where x.item_type = 'video' and x.item_id = v.id
);
