-- Colaboração: convites de workspace por e-mail (Milestone 5).
--
-- O aceite de convite acontece via RPC SECURITY DEFINER em vez de policies
-- públicas na tabela, pelo mesmo motivo de create_workspace() em
-- 20260726010000_enable_rls.sql: quem aceita ainda não é membro do
-- workspace, então nenhuma policy "normal" cobriria a leitura/inserção sem
-- vazar a tabela inteira de convites para qualquer usuário autenticado.

create table if not exists public.workspace_invites (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces (id) on delete cascade,
  email text not null,
  role text not null default 'membro' check (role in ('admin', 'membro')),
  -- gen_random_uuid() é núcleo do Postgres 13+ (schema public); gen_random_bytes()
  -- viria do pgcrypto, instalado no schema "extensions" no Supabase e fora do
  -- search_path padrão, então evitamos essa dependência aqui.
  token text not null unique default replace(gen_random_uuid()::text || gen_random_uuid()::text, '-', ''),
  invited_by uuid references auth.users (id) on delete set null,
  status text not null default 'pending' check (status in ('pending', 'accepted', 'revoked')),
  expires_at timestamptz not null default (now() + interval '7 days'),
  created_at timestamptz not null default now()
);

-- Evita dois convites pendentes para o mesmo e-mail no mesmo workspace.
create unique index if not exists workspace_invites_pending_email_idx
  on public.workspace_invites (workspace_id, lower(email))
  where status = 'pending';

create index if not exists workspace_invites_workspace_id_idx
  on public.workspace_invites (workspace_id);

alter table public.workspace_invites enable row level security;

-- Só admins do workspace veem/gerenciam os convites (criar, cancelar, reenviar).
drop policy if exists "workspace_invites_select_admin" on public.workspace_invites;
create policy "workspace_invites_select_admin" on public.workspace_invites
  for select
  using (public.is_workspace_admin(workspace_id));

drop policy if exists "workspace_invites_insert_admin" on public.workspace_invites;
create policy "workspace_invites_insert_admin" on public.workspace_invites
  for insert
  with check (public.is_workspace_admin(workspace_id));

drop policy if exists "workspace_invites_update_admin" on public.workspace_invites;
create policy "workspace_invites_update_admin" on public.workspace_invites
  for update
  using (public.is_workspace_admin(workspace_id))
  with check (public.is_workspace_admin(workspace_id));

drop policy if exists "workspace_invites_delete_admin" on public.workspace_invites;
create policy "workspace_invites_delete_admin" on public.workspace_invites
  for delete
  using (public.is_workspace_admin(workspace_id));

-- Preview público (por token) para a tela de aceite, antes do usuário logar.
-- Só expõe o necessário para a UI decidir o que mostrar — nunca a tabela toda.
create or replace function public.get_invite_preview(p_token text)
returns table (
  workspace_name text,
  email text,
  role text,
  is_valid boolean,
  reason text
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_invite workspace_invites;
  v_workspace_name text;
begin
  select * into v_invite from workspace_invites where token = p_token;

  if v_invite is null then
    return query select null::text, null::text, null::text, false, 'not_found'::text;
    return;
  end if;

  select w.name into v_workspace_name from workspaces w where w.id = v_invite.workspace_id;

  if v_invite.status <> 'pending' then
    return query select v_workspace_name, v_invite.email, v_invite.role, false, 'used'::text;
    return;
  end if;

  if v_invite.expires_at < now() then
    return query select v_workspace_name, v_invite.email, v_invite.role, false, 'expired'::text;
    return;
  end if;

  return query select v_workspace_name, v_invite.email, v_invite.role, true, null::text;
end;
$$;

grant execute on function public.get_invite_preview(text) to anon, authenticated;

-- Aceite do convite: valida token/expiração/e-mail/limite do plano Free e
-- insere o usuário logado em workspace_members atomicamente.
create or replace function public.accept_workspace_invite(p_token text)
returns workspace_members
language plpgsql
security definer
set search_path = public
as $$
declare
  v_invite workspace_invites;
  v_user_email text;
  v_member_count int;
  v_plan text;
  v_member workspace_members;
begin
  select * into v_invite from workspace_invites where token = p_token for update;

  if v_invite is null then
    raise exception 'Convite não encontrado.';
  end if;

  if v_invite.status <> 'pending' then
    raise exception 'Este convite já foi utilizado ou cancelado.';
  end if;

  if v_invite.expires_at < now() then
    raise exception 'Este convite expirou.';
  end if;

  select email into v_user_email from auth.users where id = auth.uid();

  if v_user_email is null or lower(v_user_email) <> lower(v_invite.email) then
    raise exception 'Este convite foi enviado para outro e-mail.';
  end if;

  select plan into v_plan from workspaces where id = v_invite.workspace_id;
  select count(*) into v_member_count
    from workspace_members where workspace_id = v_invite.workspace_id;

  if v_plan = 'free' and v_member_count >= 2 then
    raise exception 'O workspace atingiu o limite de colaboradores do plano Free.';
  end if;

  insert into workspace_members (workspace_id, user_id, role)
    values (v_invite.workspace_id, auth.uid(), v_invite.role)
    on conflict (workspace_id, user_id) do update set role = excluded.role
    returning * into v_member;

  update workspace_invites set status = 'accepted' where id = v_invite.id;

  return v_member;
end;
$$;

grant execute on function public.accept_workspace_invite(text) to authenticated;
