select
  trigger_name,
  event_manipulation,
  event_object_schema,
  event_object_table,
  action_statement
from information_schema.triggers
where event_object_schema = 'auth'
  and event_object_table = 'users'
  and trigger_name = 'on_auth_user_created';

select
  (select count(*) from auth.users) as auth_users_count,
  (select count(*) from public.profiles) as profiles_count;

select
  users.id,
  users.email,
  users.raw_user_meta_data ->> 'username' as signup_username
from auth.users as users
left join public.profiles as profiles on profiles.id = users.id
where profiles.id is null;

select
  id,
  username,
  current_xp,
  current_rank,
  current_rank_name,
  created_at
from public.profiles
order by created_at desc
limit 20;
