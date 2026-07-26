-- Row Level Security: every workspace only ever sees/touches its own data.
--
-- Helper functions are SECURITY DEFINER + owned by the migration role
-- (postgres in Supabase), which owns these tables and therefore bypasses RLS
-- by default (table owners are exempt from RLS unless FORCE ROW LEVEL
-- SECURITY is set). This lets us query workspace_members from inside a
-- workspace_members policy itself without infinite recursion.

create or replace function public.is_workspace_member(p_workspace_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from workspace_members
    where workspace_id = p_workspace_id
      and user_id = auth.uid()
  );
$$;

create or replace function public.is_workspace_admin(p_workspace_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from workspace_members
    where workspace_id = p_workspace_id
      and user_id = auth.uid()
      and role = 'admin'
  );
$$;

grant execute on function public.is_workspace_member(uuid) to authenticated;
grant execute on function public.is_workspace_admin(uuid) to authenticated;

-- Onboarding needs to insert a workspace and its first admin member in one
-- shot, before any workspace_members row exists to satisfy the "admin only"
-- insert policy below. A SECURITY DEFINER RPC (same owner-bypasses-RLS
-- reasoning as above) is the standard way to do that atomically.
create or replace function public.create_workspace(p_name text)
returns workspaces
language plpgsql
security definer
set search_path = public
as $$
declare
  v_workspace workspaces;
begin
  insert into workspaces (name) values (p_name) returning * into v_workspace;
  insert into workspace_members (workspace_id, user_id, role)
    values (v_workspace.id, auth.uid(), 'admin');
  return v_workspace;
end;
$$;

grant execute on function public.create_workspace(text) to authenticated;

alter table workspaces enable row level security;
alter table workspace_members enable row level security;
alter table leads enable row level security;
alter table deals enable row level security;
alter table activities enable row level security;
alter table subscriptions enable row level security;

-- workspaces: members read, admins manage. Creation goes through
-- create_workspace() above, not a client-facing insert policy.
drop policy if exists "workspaces_select_member" on workspaces;
create policy "workspaces_select_member" on workspaces
  for select
  using (public.is_workspace_member(id));

drop policy if exists "workspaces_update_admin" on workspaces;
create policy "workspaces_update_admin" on workspaces
  for update
  using (public.is_workspace_admin(id))
  with check (public.is_workspace_admin(id));

drop policy if exists "workspaces_delete_admin" on workspaces;
create policy "workspaces_delete_admin" on workspaces
  for delete
  using (public.is_workspace_admin(id));

-- workspace_members: members read the roster, admins manage collaborators.
drop policy if exists "workspace_members_select_member" on workspace_members;
create policy "workspace_members_select_member" on workspace_members
  for select
  using (public.is_workspace_member(workspace_id));

drop policy if exists "workspace_members_insert_admin" on workspace_members;
create policy "workspace_members_insert_admin" on workspace_members
  for insert
  with check (public.is_workspace_admin(workspace_id));

drop policy if exists "workspace_members_update_admin" on workspace_members;
create policy "workspace_members_update_admin" on workspace_members
  for update
  using (public.is_workspace_admin(workspace_id))
  with check (public.is_workspace_admin(workspace_id));

drop policy if exists "workspace_members_delete_admin" on workspace_members;
create policy "workspace_members_delete_admin" on workspace_members
  for delete
  using (public.is_workspace_admin(workspace_id));

-- leads / deals / activities: any workspace member has full CRUD.
-- Finer-grained admin-vs-membro rules are Milestone 5 RBAC, not RLS.
drop policy if exists "leads_all_member" on leads;
create policy "leads_all_member" on leads
  for all
  using (public.is_workspace_member(workspace_id))
  with check (public.is_workspace_member(workspace_id));

drop policy if exists "deals_all_member" on deals;
create policy "deals_all_member" on deals
  for all
  using (public.is_workspace_member(workspace_id))
  with check (public.is_workspace_member(workspace_id));

drop policy if exists "activities_all_member" on activities;
create policy "activities_all_member" on activities
  for all
  using (public.is_workspace_member(workspace_id))
  with check (public.is_workspace_member(workspace_id));

-- subscriptions: members can read their plan/status; writes only happen via
-- the Stripe webhook using the service_role key, which bypasses RLS entirely.
-- No insert/update/delete policy is intentionally exposed to authenticated users.
drop policy if exists "subscriptions_select_member" on subscriptions;
create policy "subscriptions_select_member" on subscriptions
  for select
  using (public.is_workspace_member(workspace_id));
