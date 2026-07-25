-- Initial schema for PipeFlow CRM
-- Tables: workspaces, workspace_members, leads, deals, activities
-- RLS policies are added in the "multi-tenant" milestone (feature/multi-tenant).

create extension if not exists "pgcrypto";

create table workspaces (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  plan text not null default 'free' check (plan in ('free', 'pro')),
  stripe_customer_id text,
  stripe_subscription_id text,
  created_at timestamptz not null default now()
);

create table workspace_members (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  role text not null default 'membro' check (role in ('admin', 'membro')),
  created_at timestamptz not null default now(),
  unique (workspace_id, user_id)
);

create table leads (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces (id) on delete cascade,
  name text not null,
  email text,
  phone text,
  company text,
  job_title text,
  status text not null default 'novo',
  owner_id uuid references auth.users (id) on delete set null,
  source text not null default 'manual' check (source in ('manual', 'whatsapp')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table deals (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces (id) on delete cascade,
  lead_id uuid not null references leads (id) on delete cascade,
  title text not null,
  value numeric(12, 2) not null default 0,
  stage text not null default 'novo_lead' check (
    stage in (
      'novo_lead',
      'contato_realizado',
      'proposta_enviada',
      'negociacao',
      'fechado_ganho',
      'fechado_perdido'
    )
  ),
  owner_id uuid references auth.users (id) on delete set null,
  due_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table activities (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces (id) on delete cascade,
  lead_id uuid not null references leads (id) on delete cascade,
  author_id uuid references auth.users (id) on delete set null,
  type text not null check (type in ('ligacao', 'email', 'reuniao', 'nota')),
  description text not null,
  occurred_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index leads_workspace_id_idx on leads (workspace_id);
create index deals_workspace_id_idx on deals (workspace_id);
create index deals_lead_id_idx on deals (lead_id);
create index activities_workspace_id_idx on activities (workspace_id);
create index activities_lead_id_idx on activities (lead_id);
create index workspace_members_workspace_id_idx on workspace_members (workspace_id);
