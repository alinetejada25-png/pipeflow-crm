-- Profile mirror of auth.users, so client code can read collaborator names
-- without service-role access. Kept in sync via a trigger on auth.users.

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  name text not null,
  email text not null,
  created_at timestamptz not null default now()
);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, name, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'name', new.email),
    new.email
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

insert into public.profiles (id, name, email)
select id, coalesce(raw_user_meta_data ->> 'name', email), email
from auth.users
on conflict (id) do nothing;

alter table public.profiles enable row level security;

-- A member can see the profile of anyone who shares a workspace with them.
drop policy if exists "profiles_select_workspace_member" on public.profiles;
create policy "profiles_select_workspace_member" on public.profiles
  for select
  using (
    exists (
      select 1
      from workspace_members mine
      join workspace_members theirs on theirs.workspace_id = mine.workspace_id
      where mine.user_id = auth.uid()
        and theirs.user_id = profiles.id
    )
  );
