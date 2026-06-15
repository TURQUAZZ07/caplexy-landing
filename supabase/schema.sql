create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text,
  created_at timestamp with time zone default now(),
  current_xp integer default 0,
  current_rank integer default 1,
  current_rank_name text default 'New User I'
);

create table if not exists public.academy_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade,
  module_slug text,
  progress integer default 0,
  completed boolean default false,
  completed_at timestamp with time zone null
);

create table if not exists public.mission_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade,
  module_slug text,
  mission_key text,
  completed boolean default false,
  xp_earned integer default 0,
  completed_at timestamp with time zone null
);

create table if not exists public.badges (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade,
  badge_key text,
  badge_name text,
  earned_at timestamp with time zone default now()
);

create table if not exists public.career_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade,
  event_type text,
  title text,
  description text,
  nm_amount integer default 0,
  module_slug text null,
  mission_key text null,
  rank_name text null,
  badge_name text null,
  created_at timestamp with time zone default now()
);

create table if not exists public.daily_voyages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade,
  voyage_date date not null,
  mission_completed boolean default false,
  nm_target_reached boolean default false,
  flashcard_target_reached boolean default false,
  reward_claimed boolean default false,
  created_at timestamp with time zone default now()
);

create table if not exists public.promotion_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade,
  current_rank integer not null,
  target_rank integer not null,
  score integer default 0,
  passed boolean default false,
  created_at timestamp with time zone default now()
);

create table if not exists public.cargo_holds (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade,
  title text not null,
  description text default '',
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

create table if not exists public.cargo_items (
  id uuid primary key default gen_random_uuid(),
  hold_id uuid references public.cargo_holds(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete cascade,
  english_word text not null,
  native_meaning text not null,
  example_sentence text default '',
  pronunciation text default '',
  note text default '',
  created_at timestamp with time zone default now()
);

create unique index if not exists academy_progress_user_module_key
on public.academy_progress (user_id, module_slug);

create unique index if not exists mission_progress_user_module_mission_key
on public.mission_progress (user_id, module_slug, mission_key);

create unique index if not exists badges_user_badge_key
on public.badges (user_id, badge_key);

create unique index if not exists daily_voyages_user_date_key
on public.daily_voyages (user_id, voyage_date);

create index if not exists career_events_user_created_at_idx
on public.career_events (user_id, created_at desc);

create index if not exists promotion_attempts_user_created_at_idx
on public.promotion_attempts (user_id, created_at desc);

create index if not exists cargo_holds_user_updated_at_idx
on public.cargo_holds (user_id, updated_at desc);

create index if not exists cargo_items_hold_created_at_idx
on public.cargo_items (hold_id, created_at asc);

create index if not exists cargo_items_user_created_at_idx
on public.cargo_items (user_id, created_at desc);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (
    id,
    username,
    current_xp,
    current_rank,
    current_rank_name
  )
  values (
    new.id,
    coalesce(
      nullif(trim(new.raw_user_meta_data ->> 'username'), ''),
      split_part(new.email, '@', 1),
      'New User'
    ),
    0,
    1,
    'New User I'
  )
  on conflict (id) do update
  set username = coalesce(public.profiles.username, excluded.username);

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

insert into public.profiles (
  id,
  username,
  current_xp,
  current_rank,
  current_rank_name
)
select
  users.id,
  coalesce(
    nullif(trim(users.raw_user_meta_data ->> 'username'), ''),
    split_part(users.email, '@', 1),
    'New User'
  ) as username,
  0 as current_xp,
  1 as current_rank,
  'New User I' as current_rank_name
from auth.users as users
left join public.profiles as profiles on profiles.id = users.id
where profiles.id is null;

alter table public.profiles enable row level security;
alter table public.academy_progress enable row level security;
alter table public.mission_progress enable row level security;
alter table public.badges enable row level security;
alter table public.career_events enable row level security;
alter table public.daily_voyages enable row level security;
alter table public.promotion_attempts enable row level security;
alter table public.cargo_holds enable row level security;
alter table public.cargo_items enable row level security;

drop policy if exists "Users can read own profile" on public.profiles;
create policy "Users can read own profile"
on public.profiles for select
using (auth.uid() = id);

drop policy if exists "Users can insert own profile" on public.profiles;
create policy "Users can insert own profile"
on public.profiles for insert
with check (auth.uid() = id);

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile"
on public.profiles for update
using (auth.uid() = id)
with check (auth.uid() = id);

drop policy if exists "Users can read own academy progress" on public.academy_progress;
create policy "Users can read own academy progress"
on public.academy_progress for select
using (auth.uid() = user_id);

drop policy if exists "Users can insert own academy progress" on public.academy_progress;
create policy "Users can insert own academy progress"
on public.academy_progress for insert
with check (auth.uid() = user_id);

drop policy if exists "Users can update own academy progress" on public.academy_progress;
create policy "Users can update own academy progress"
on public.academy_progress for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can read own mission progress" on public.mission_progress;
create policy "Users can read own mission progress"
on public.mission_progress for select
using (auth.uid() = user_id);

drop policy if exists "Users can insert own mission progress" on public.mission_progress;
create policy "Users can insert own mission progress"
on public.mission_progress for insert
with check (auth.uid() = user_id);

drop policy if exists "Users can update own mission progress" on public.mission_progress;
create policy "Users can update own mission progress"
on public.mission_progress for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can read own badges" on public.badges;
create policy "Users can read own badges"
on public.badges for select
using (auth.uid() = user_id);

drop policy if exists "Users can insert own badges" on public.badges;
create policy "Users can insert own badges"
on public.badges for insert
with check (auth.uid() = user_id);

drop policy if exists "Users can update own badges" on public.badges;
create policy "Users can update own badges"
on public.badges for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can read own career events" on public.career_events;
create policy "Users can read own career events"
on public.career_events for select
using (auth.uid() = user_id);

drop policy if exists "Users can insert own career events" on public.career_events;
create policy "Users can insert own career events"
on public.career_events for insert
with check (auth.uid() = user_id);

drop policy if exists "Users can update own career events" on public.career_events;
create policy "Users can update own career events"
on public.career_events for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can read own daily voyages" on public.daily_voyages;
create policy "Users can read own daily voyages"
on public.daily_voyages for select
using (auth.uid() = user_id);

drop policy if exists "Users can insert own daily voyages" on public.daily_voyages;
create policy "Users can insert own daily voyages"
on public.daily_voyages for insert
with check (auth.uid() = user_id);

drop policy if exists "Users can update own daily voyages" on public.daily_voyages;
create policy "Users can update own daily voyages"
on public.daily_voyages for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can read own promotion attempts" on public.promotion_attempts;
create policy "Users can read own promotion attempts"
on public.promotion_attempts for select
using (auth.uid() = user_id);

drop policy if exists "Users can insert own promotion attempts" on public.promotion_attempts;
create policy "Users can insert own promotion attempts"
on public.promotion_attempts for insert
with check (auth.uid() = user_id);

drop policy if exists "Users can update own promotion attempts" on public.promotion_attempts;
create policy "Users can update own promotion attempts"
on public.promotion_attempts for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can read own cargo holds" on public.cargo_holds;
create policy "Users can read own cargo holds"
on public.cargo_holds for select
using (auth.uid() = user_id);

drop policy if exists "Users can insert own cargo holds" on public.cargo_holds;
create policy "Users can insert own cargo holds"
on public.cargo_holds for insert
with check (auth.uid() = user_id);

drop policy if exists "Users can update own cargo holds" on public.cargo_holds;
create policy "Users can update own cargo holds"
on public.cargo_holds for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can delete own cargo holds" on public.cargo_holds;
create policy "Users can delete own cargo holds"
on public.cargo_holds for delete
using (auth.uid() = user_id);

drop policy if exists "Users can read own cargo items" on public.cargo_items;
create policy "Users can read own cargo items"
on public.cargo_items for select
using (auth.uid() = user_id);

drop policy if exists "Users can insert own cargo items" on public.cargo_items;
create policy "Users can insert own cargo items"
on public.cargo_items for insert
with check (auth.uid() = user_id);

drop policy if exists "Users can update own cargo items" on public.cargo_items;
create policy "Users can update own cargo items"
on public.cargo_items for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can delete own cargo items" on public.cargo_items;
create policy "Users can delete own cargo items"
on public.cargo_items for delete
using (auth.uid() = user_id);
