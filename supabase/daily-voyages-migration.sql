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

create unique index if not exists daily_voyages_user_date_key
on public.daily_voyages (user_id, voyage_date);

alter table public.daily_voyages enable row level security;

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
