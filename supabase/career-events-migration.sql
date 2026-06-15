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

create index if not exists career_events_user_created_at_idx
on public.career_events (user_id, created_at desc);

alter table public.career_events enable row level security;

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
