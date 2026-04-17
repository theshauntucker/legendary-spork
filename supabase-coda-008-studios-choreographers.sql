-- Coda migration 008: studios + choreographers directory + routine credits + seeds

create table if not exists public.studios (
  id uuid default gen_random_uuid() primary key,
  slug text unique not null,
  name text not null,
  city text,
  state text,
  website text,
  logo_gradient jsonb,
  claimed_by uuid references public.profiles(id),
  verified boolean default false,
  created_at timestamptz default now()
);

create table if not exists public.choreographers (
  id uuid default gen_random_uuid() primary key,
  slug text unique not null,
  name text not null,
  bio text,
  website text,
  claimed_by uuid references public.profiles(id),
  verified boolean default false,
  created_at timestamptz default now()
);

create table if not exists public.routine_choreographers (
  video_id uuid references public.videos(id) on delete cascade,
  choreographer_id uuid references public.choreographers(id) on delete cascade,
  primary key (video_id, choreographer_id)
);

create table if not exists public.claim_requests (
  id uuid default gen_random_uuid() primary key,
  entity_type text check (entity_type in ('studio','choreographer')) not null,
  slug text not null,
  requester_profile_id uuid references public.profiles(id),
  proof_email text,
  status text check (status in ('pending','approved','rejected')) default 'pending',
  created_at timestamptz default now(),
  reviewed_at timestamptz
);

alter table public.studios enable row level security;
alter table public.choreographers enable row level security;
alter table public.routine_choreographers enable row level security;
alter table public.claim_requests enable row level security;

drop policy if exists "anyone reads studios" on public.studios;
create policy "anyone reads studios" on public.studios for select using (true);
drop policy if exists "anyone reads choreographers" on public.choreographers;
create policy "anyone reads choreographers" on public.choreographers for select using (true);
drop policy if exists "anyone reads routine_choreographers" on public.routine_choreographers;
create policy "anyone reads routine_choreographers" on public.routine_choreographers for select using (true);
drop policy if exists "users submit claims" on public.claim_requests;
create policy "users submit claims" on public.claim_requests for insert
  with check (requester_profile_id in (select id from public.profiles where user_id = auth.uid()));
drop policy if exists "users read own claims" on public.claim_requests;
create policy "users read own claims" on public.claim_requests for select
  using (requester_profile_id in (select id from public.profiles where user_id = auth.uid()));

-- Seed 20 studios
insert into public.studios (slug, name, city, state, logo_gradient) values
('club-dance-studio','Club Dance Studio','Scottsdale','AZ','["#EC4899","#F97316","#FBBF24"]'),
('the-rock-center','The Rock Center for Dance','Las Vegas','NV','["#A855F7","#EC4899","#FF6B6B"]'),
('stars-dance-studio','Stars Dance Studio','Miami','FL','["#FDE68A","#F472B6","#A78BFA"]'),
('murrieta-dance-project','Murrieta Dance Project','Murrieta','CA','["#67E8F9","#22D3EE","#7C3AED"]'),
('larkin-dance','Larkin Dance Studio','Maplewood','MN','["#FECACA","#DC2626","#450A0A"]'),
('danceology','Danceology','San Diego','CA','["#86EFAC","#22D3EE","#7C3AED"]'),
('project-21','Project 21','Yorba Linda','CA','["#C4B5FD","#67E8F9","#F0ABFC"]'),
('dance-town','Dance Town','Miami','FL','["#FBBF24","#F97316","#EC4899"]'),
('westside-dance','Westside Dance','Los Angeles','CA','["#F472B6","#7C3AED","#1E1B4B"]'),
('elite-danceforce','Elite Danceforce','Pennsauken','NJ','["#A5B4FC","#6366F1","#312E81"]'),
('summit-dance-shoppe','Summit Dance Shoppe','Plymouth','MN','["#FBCFE8","#F472B6","#BE185D"]'),
('dance-connection','Dance Connection','Roswell','GA','["#FEF3C7","#FBBF24","#D97706"]'),
('revolve-dance','Revolve Dance','Cochrane','AB','["#86EFAC","#10B981","#064E3B"]'),
('dance-precisions','Dance Precisions','Placentia','CA','["#FDA4AF","#BE123C","#4C0519"]'),
('canadian-dance-company','Canadian Dance Company','Oshawa','ON','["#7DD3FC","#0369A1","#1E1B4B"]'),
('ignite-dance-complex','Ignite Dance Complex','Fort Worth','TX','["#FBBF24","#DC2626","#450A0A"]'),
('broadway-dance-academy','Broadway Dance Academy','Portsmouth','NH','["#FCD34D","#F59E0B","#D97706"]'),
('the-pulse-on-tour','The Pulse','Los Angeles','CA','["#EC4899","#A855F7","#1E1B4B"]'),
('artists-simply-human','Artists Simply Human','Newark','CA','["#F0ABFC","#67E8F9","#FDE68A"]'),
('xtreme-dance-force','Xtreme Dance Force','Lombard','IL','["#86EFAC","#22D3EE","#7C3AED"]')
on conflict (slug) do nothing;

-- Seed 20 famous choreographers
insert into public.choreographers (slug, name, bio) values
('brian-friedman','Brian Friedman','Emmy-nominated choreographer best known for Britney Spears, The X Factor, and SYTYCD. Pulse On Tour faculty.'),
('tyce-diorio','Tyce Diorio','Emmy-winning choreographer and SYTYCD legend.'),
('travis-wall','Travis Wall','Emmy-winning contemporary choreographer, Shaping Sound co-founder, SYTYCD alum.'),
('mia-michaels','Mia Michaels','Emmy-winning contemporary and lyrical choreographer, former Radix faculty.'),
('sonya-tayeh','Sonya Tayeh','Tony-winning choreographer of Moulin Rouge! on Broadway.'),
('mandy-moore','Mandy Moore','Emmy-winning choreographer, La La Land, SYTYCD, Dancing with the Stars.'),
('talia-favia','Talia Favia','Contemporary choreographer, The Young Choreographers Project.'),
('teddy-forance','Teddy Forance','CLI Studios co-founder, Shaping Sound, Emmy-nominated.'),
('kathryn-mccormick','Kathryn McCormick','SYTYCD, Step Up: Revolution. Contemporary educator.'),
('al-blackstone','Al Blackstone','Jazz and musical theatre, Emmy-winning.'),
('stacey-tookey','Stacey Tookey','Emmy-nominated contemporary choreographer.'),
('tabitha-napoleon-dumo','Tabitha & Napoleon D''umo','NappyTabs, Emmy-winning hip hop choreographers.'),
('dee-caspary','Dee Caspary','Contemporary and commercial choreographer.'),
('tyne-stecklein','Tyne Stecklein','Michael Jackson: The Immortal World Tour, Chicago on Broadway.'),
('melinda-sullivan','Melinda Sullivan','Tap, Tony-nominated for Shuffle Along.'),
('nick-lazzarini','Nick Lazzarini','SYTYCD S1 winner, Shaping Sound co-founder.'),
('allison-holker','Allison Holker','SYTYCD all-star, dancer and choreographer.'),
('stephen-twitch-boss','Stephen ''tWitch'' Boss','SYTYCD all-star, dancer, tribute to his legacy.'),
('jaquel-knight','JaQuel Knight','Choreographer behind Beyoncé''s ''Single Ladies.'''),
('fatima-robinson','Fatima Robinson','Emmy-winning hip hop choreographer, Michael Jackson, Dreamgirls.')
on conflict (slug) do nothing;
