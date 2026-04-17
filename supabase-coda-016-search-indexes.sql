-- supabase-coda-016-search-indexes.sql
-- Discovery search performance: trigram indexes on handles/names so the
-- /find page's `ilike '%q%'` queries stop hitting a sequential scan as the
-- tables grow.

begin;

create extension if not exists pg_trgm;

-- profiles: handle + display_name
create index if not exists profiles_handle_trgm_idx
  on public.profiles using gin (handle gin_trgm_ops);

create index if not exists profiles_display_name_trgm_idx
  on public.profiles using gin (display_name gin_trgm_ops);

-- studios: name + city
create index if not exists studios_name_trgm_idx
  on public.studios using gin (name gin_trgm_ops);

create index if not exists studios_city_trgm_idx
  on public.studios using gin (city gin_trgm_ops);

-- choreographers: name
create index if not exists choreographers_name_trgm_idx
  on public.choreographers using gin (name gin_trgm_ops);

commit;
