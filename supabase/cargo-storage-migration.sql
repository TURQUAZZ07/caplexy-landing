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

create index if not exists cargo_holds_user_updated_at_idx
on public.cargo_holds (user_id, updated_at desc);

create index if not exists cargo_items_hold_created_at_idx
on public.cargo_items (hold_id, created_at asc);

create index if not exists cargo_items_user_created_at_idx
on public.cargo_items (user_id, created_at desc);

alter table public.cargo_holds enable row level security;
alter table public.cargo_items enable row level security;

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
