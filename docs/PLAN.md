# PLAN — PipeFlow CRM

Plano de execução do setup ao deploy, dividido em milestones. Ordem de construção:

1. **setup**, 2) **interface** (todas as telas funcionais com estilo neutro do
   shadcn/ui, dados reais via Supabase), 3) **backend/multi-tenant** (RLS, papéis,
   convites), 4) **brand** (aplicar identidade visual sobre a interface já pronta),
2. **monetização**, 6) **integração WhatsApp**, 7) **deploy**.

Convenção de branch: `tipo/nome-curto` (`setup/`, `feature/`, `chore/`, `release/`).
Convenção de commit final de cada milestone: [Conventional Commits](https://www.conventionalcommits.org/).
Campo **Colaborador** indica o papel responsável pela entrega (ajustar para nomes
reais da equipe quando houver mais de uma pessoa).

---

## Milestone 0 — Setup do Projeto

**Branch:** `setup/project-init`
**Objetivo:** Criar o esqueleto do projeto Next.js, configurar ferramentas de
desenvolvimento e o projeto Supabase, para que qualquer milestone seguinte possa
começar a codar sem trabalho de infraestrutura.

**Entregas:**

- [x] Inicializar Next.js 14 (App Router) + TypeScript 5 — _Colaborador: Dev (Claude Code)_
- [x] Configurar Tailwind CSS + shadcn/ui (tema padrão, sem cores de marca ainda) — _Colaborador: Dev (Claude Code)_
- [x] Configurar ESLint/Prettier e scripts de lint/format — _Colaborador: Dev (Claude Code)_
- [x] Criar projeto no Supabase (dev) e schema inicial: `workspaces`, `workspace_members`, `leads`, `deals`, `activities` — _Colaborador: Backend_
- [x] Configurar `.env.local` / `.env.example` com chaves Supabase, Stripe, Resend, WhatsApp — _Colaborador: Dev (Claude Code)_
- [x] Configurar repositório Git + primeiro push para GitHub — _Colaborador: Dev (Claude Code)_

**Commit final:** `chore: project setup (next.js, tailwind, shadcn, supabase schema)`

---

## Milestone 1 — Autenticação e Workspace Base

**Branch:** `feature/auth-workspace`
**Objetivo:** Usuário consegue criar conta, logar e ter um workspace padrão criado
automaticamente — base para todas as telas de interface seguintes.

**Entregas:**

- [ ] Telas de login/signup (`/(auth)`) usando Supabase Auth — _Colaborador: Frontend_
  - [x] UI implementada (`/(auth)/login`, `/(auth)/signup`, `/(auth)/onboarding`) com
    validação de campos, estados de loading nos botões e mensagens de erro —
    navegação ainda fake (sem integração real com Supabase Auth)
- [ ] Middleware de proteção de rotas do `/(dashboard)` — _Colaborador: Backend_
- [ ] Criação automática de workspace + registro do usuário como `admin` no signup — _Colaborador: Backend_
  - [x] Tela de onboarding (nome do workspace) implementada, redirecionando para o
    dashboard — ainda sem criação real de workspace no Supabase
- [x] Layout base do dashboard (sidebar, header, área de conteúdo) — _Colaborador: Frontend_

**Commit final:** `feat: auth flow and default workspace bootstrap`

---

## Milestone 2 — Interface: Leads e Contatos

**Branch:** `feature/leads-ui`
**Objetivo:** CRUD completo de leads funcionando na interface, com dados reais do
Supabase, ainda sem identidade visual aplicada (componentes shadcn padrão).

**Entregas:**

- [x] Listagem de leads com busca e filtros (status, responsável, data) — _Colaborador: Frontend_
  - [x] Tabela de leads com busca (nome/e-mail/empresa), filtro por status,
    responsável (membros do workspace) e por período de criação implementada
- [ ] Formulário de cadastro/edição de lead (nome, e-mail, telefone, empresa, cargo) — _Colaborador: Frontend_
  - [x] Dialog de criação/edição implementado com validação de nome/e-mail
- [ ] Página de detalhe do lead com timeline de atividades — _Colaborador: Frontend_
  - [x] Página de detalhe implementada com timeline somente leitura (registro de
    atividade é escopo da Milestone 4)
- [ ] Server Actions de CRUD de leads (isolados por `workspace_id`) — _Colaborador: Backend_
  - [x] `listLeads`/`getLead`/`createLead`/`updateLead`/`deleteLead`/`listWorkspaceMembers`
    implementados em `app/(dashboard)/leads/actions.ts` com **dados fake em memória**
    (`lib/leads/mock-data.ts`, 12 leads brasileiros) para destravar a interface sem
    depender de um projeto Supabase configurado
  - [ ] **Pendente:** trocar o data source fake pelo Supabase real (tabelas
    `leads`/`activities`/`workspace_members` filtradas por `workspace_id`) assim que
    `.env.local` tiver `NEXT_PUBLIC_SUPABASE_URL`/`NEXT_PUBLIC_SUPABASE_ANON_KEY`
    preenchidos e a Milestone 1 tiver auth real (`DEV_WORKSPACE_ID`/`DEV_USER_ID` hoje
    não são mais usados pelos leads)

**Commit final:** `feat: leads CRUD ui with search and filters`

---

## Milestone 3 — Interface: Pipeline Kanban

**Branch:** `feature/kanban-ui`
**Objetivo:** Pipeline visual funcional com drag-and-drop persistido no banco.

**Entregas:**

- [ ] Board Kanban com as 6 colunas de etapa — _Colaborador: Frontend_
- [ ] Cards de negócio (título, valor, lead vinculado, responsável, prazo) — _Colaborador: Frontend_
- [ ] Drag-and-drop com `@dnd-kit` + persistência de etapa via Server Action — _Colaborador: Frontend_
- [ ] Modal de criação/edição de negócio — _Colaborador: Frontend_

**Commit final:** `feat: kanban pipeline with drag-and-drop persistence`

---

## Milestone 4 — Interface: Atividades e Dashboard

**Branch:** `feature/activities-dashboard-ui`
**Objetivo:** Registro de atividades e visão consolidada de métricas de vendas.

**Entregas:**

- [ ] Registro de atividade (ligação, e-mail, reunião, nota) vinculado ao lead — _Colaborador: Frontend_
- [ ] Cards de métricas: total de leads, negócios abertos, valor do pipeline, taxa de conversão — _Colaborador: Frontend_
- [ ] Gráfico de funil de vendas com Recharts — _Colaborador: Frontend_
- [ ] Lista de negócios com prazo próximo do usuário logado — _Colaborador: Frontend_

**Commit final:** `feat: activity log and metrics dashboard`

---

## Milestone 5 — Multi-empresa e Permissões

**Branch:** `feature/multi-tenant`
**Objetivo:** Suporte real a múltiplos workspaces, convites e controle de acesso —
hardening de backend sobre a interface já construída.

**Entregas:**

- [ ] Políticas de Row Level Security para todas as tabelas por `workspace_id` — _Colaborador: Backend_
- [ ] Convite de colaborador por e-mail via Resend — _Colaborador: Backend_
- [ ] Papéis `admin`/`membro` com checagem no backend (Server Actions e RLS) — _Colaborador: Backend_
- [ ] Dropdown de troca de workspace na sidebar — _Colaborador: Frontend_
- [ ] Tela de configurações do workspace (membros, papéis) — _Colaborador: Frontend_

**Commit final:** `feat: multi-tenant workspaces with RLS and role-based access`

---

## Milestone 6 — Identidade Visual (Brand)

**Branch:** `feature/branding`
**Objetivo:** Aplicar a identidade visual definitiva (indigo/azul profissional)
sobre toda a interface já funcional, sem alterar comportamento.

**Entregas:**

- [ ] Definir tokens de tema shadcn (cores primária/secundária, radius, tipografia) — _Colaborador: Design_
- [ ] Aplicar paleta indigo/azul + verde (ganho) / vermelho (perdido) no Kanban — _Colaborador: Design_
- [ ] Revisão visual de todas as telas (leads, pipeline, dashboard, settings) — _Colaborador: Design_
- [ ] Ajustes de espaçamento/densidade para leitura de dados (tabelas, cards) — _Colaborador: Frontend_

**Commit final:** `style: apply PipeFlow brand identity across dashboard`

---

## Milestone 7 — Landing Page

**Branch:** `feature/landing-page`
**Objetivo:** Página pública de apresentação do produto, já com a marca aplicada.

**Entregas:**

- [x] Seção Hero — _Colaborador: Frontend_
- [x] Seção Funcionalidades — _Colaborador: Frontend_
- [x] Seção Planos e Preços — _Colaborador: Frontend_
- [x] Seção CTA + rodapé — _Colaborador: Frontend_
  - [x] Header com navegação e menu mobile, 4 números de resultado e cores
    indigo-600 aplicadas nesta página (marca completa do dashboard ainda é a
    Milestone 6)

**Commit final:** `feat: public landing page`

---

## Milestone 8 — Monetização (Stripe)

**Branch:** `feature/stripe-billing`
**Objetivo:** Cobrança recorrente funcionando, com limites do plano Free aplicados.

**Entregas:**

- [ ] Produtos/preços no Stripe (Free e Pro R$49/mês) — _Colaborador: Backend_
- [ ] Stripe Checkout a partir da tela de planos — _Colaborador: Backend_
- [ ] Webhook de ativação/desativação de plano — _Colaborador: Backend_
- [ ] Customer Portal para gerenciar assinatura — _Colaborador: Backend_
- [ ] Enforcement de limites do plano Free (2 colaboradores / 50 leads) — _Colaborador: Backend_

**Commit final:** `feat: stripe subscriptions with plan limit enforcement`

---

## Milestone 9 — Integração WhatsApp

**Branch:** `feature/whatsapp-integration`
**Objetivo:** Leads do WhatsApp entram automaticamente no CRM e é possível
responder ao cliente pelo sistema.

**Entregas:**

- [ ] Webhook de recebimento de mensagens do WhatsApp Business API — _Colaborador: Backend_
- [ ] Criação automática de lead a partir de novo contato do WhatsApp — _Colaborador: Backend_
- [ ] Envio de mensagem para o cliente a partir da timeline do lead — _Colaborador: Backend_
- [ ] Indicador de canal (WhatsApp) na timeline de atividades — _Colaborador: Frontend_

**Commit final:** `feat: whatsapp lead capture and reply integration`

---

## Milestone 10 — Deploy e Lançamento

**Branch:** `release/v1`
**Objetivo:** Aplicação em produção, monitorada e pronta para os primeiros usuários.

**Entregas:**

- [ ] Deploy do app na Vercel (produção) — _Colaborador: DevOps_
- [ ] Variáveis de ambiente de produção (Supabase, Stripe, Resend, WhatsApp) — _Colaborador: DevOps_
- [ ] Domínio próprio + SSL — _Colaborador: DevOps_
- [ ] Smoke test do fluxo completo (signup → lead → kanban → dashboard → billing) — _Colaborador: Dev (Claude Code)_
- [ ] Checklist de onboarding do usuário revisado — _Colaborador: Design_

**Commit final:** `release: v1.0.0 — PipeFlow CRM launch`
