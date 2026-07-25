# PipeFlow CRM

CRM SaaS multi-empresa focado em pequenas/médias empresas e freelancers: pipeline
visual Kanban, gestão de leads, dashboard de métricas e integração com WhatsApp
para captar e responder leads sem sair do sistema. Monetização via assinatura
(Stripe). Especificação completa em [docs/prd.md](docs/prd.md).

## Stack Técnica

- **Next.js 14** (App Router) + React 18 + **TypeScript 5** (estrito, sem `any`)
- **Tailwind CSS** + **shadcn/ui**
- **Supabase** (PostgreSQL + Auth + Row Level Security)
- **Stripe** (Checkout + webhooks + Customer Portal)
- **Resend** (e-mails transacionais: convites, notificações)
- **@dnd-kit** (drag-and-drop do Kanban)
- **Recharts** (gráficos do dashboard)
- **Deploy:** Vercel (app) + Supabase (banco/auth)

## Estrutura de Pastas

```
/app
  /(marketing)/        # landing page pública (hero, features, preços, CTA)
  /(auth)/              # login, signup
  /(dashboard)/         # área autenticada
    /leads/
    /pipeline/          # Kanban
    /reports/
    /settings/          # workspace, colaboradores, plano
  /api/                 # route handlers (webhooks Stripe, webhook WhatsApp)
/components
  /ui/                  # primitives shadcn/ui
  /kanban/
  /leads/
  /dashboard/
/lib
  /supabase/            # clients (server/client), helpers de RLS
  /stripe/
  /whatsapp/            # integração WhatsApp -> CRM
/types
/docs
  prd.md
```

## Convenções de Código

- TypeScript estrito; nunca usar `any`.
- Server Components por padrão; `"use client"` apenas onde há interatividade
  (Kanban com dnd-kit, formulários, dropdowns de workspace).
- Nomes de tabelas/colunas no Supabase em `snake_case`; camelCase no código TS.
- Multi-tenancy via RLS: toda tabela isolada por `workspace_id`. Nunca confiar
  em filtro feito só no client — a política RLS é a fonte de verdade.
- Mutações de dados preferencialmente via Server Actions; API routes reservadas
  para webhooks externos (Stripe, WhatsApp).
- Papéis de usuário (`admin` / `membro`) verificados no backend, não só ocultando
  UI no client.

## Identidade Visual

- **Cor primária:** indigo/azul profissional (ex. `indigo-600` do shadcn) —
  tom sério e confiável, alinhado a CRMs B2B (Pipedrive/HubSpot), não um
  "SaaS colorido".
- **Cores de status no Kanban:** verde para "Fechado Ganho", vermelho para
  "Fechado Perdido", tons neutros para as demais etapas.
- **Tipografia:** padrão shadcn/ui (Inter ou similar).
- **Densidade:** UI limpa e densa em dados — tabelas, cards de métricas e
  timeline de atividades priorizam clareza sobre decoração.

## Processo de Desenvolvimento

Construir em milestones incrementais, testando cada um antes de avançar:

1. Core CRM (leads/contatos, auth, workspace único)
2. Pipeline Kanban (drag-and-drop + persistência)
3. Dashboard de métricas
4. Multi-empresa (workspaces, convites, papéis, RLS)
5. Monetização (Stripe: planos, checkout, webhook, portal)
6. Integração WhatsApp (entrada de leads + resposta automática)
7. Landing page
