-- Coda migration 007: dance bonds (relationship emojis, cached)

create table if not exists public.dance_bonds (
  profile_a_id uuid references public.profiles(id) on delete cascade,
  profile_b_id uuid references public.profiles(id) on delete cascade,
  bond_types text[] not null,
  computed_at timestamptz default now(),
  primary key (profile_a_id, profile_b_id),
  check (profile_a_id < profile_b_id)
);
create index if not exists idx_bonds_a on public.dance_bonds(profile_a_id);
create index if not exists idx_bonds_b on public.dance_bonds(profile_b_id);

alter table public.dance_bonds enable row level security;

drop policy if exists "anyone reads bonds" on public.dance_bonds;
create policy "anyone reads bonds" on public.dance_bonds for select using (true);
