create table if not exists public.promotion_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade,
  current_rank integer not null,
  target_rank integer not null,
  score integer default 0,
  passed boolean default false,
  created_at timestamp with time zone default now()
);

create index if not exists promotion_attempts_user_created_at_idx
on public.promotion_attempts (user_id, created_at desc);

alter table public.promotion_attempts enable row level security;

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
