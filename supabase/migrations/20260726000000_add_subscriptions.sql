-- Subscriptions table for Stripe billing (Milestone 8 groundwork)
-- Source of truth for plan/status; workspaces.plan stays as a denormalized
-- cache kept in sync by the Stripe webhook handler.

create table if not exists subscriptions (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces (id) on delete cascade,
  stripe_customer_id text,
  stripe_subscription_id text unique,
  stripe_price_id text,
  plan text not null default 'free' check (plan in ('free', 'pro')),
  status text not null default 'active' check (
    status in (
      'active',
      'trialing',
      'past_due',
      'canceled',
      'incomplete',
      'incomplete_expired',
      'unpaid'
    )
  ),
  current_period_end timestamptz,
  cancel_at_period_end boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (workspace_id)
);

create index if not exists subscriptions_workspace_id_idx on subscriptions (workspace_id);
