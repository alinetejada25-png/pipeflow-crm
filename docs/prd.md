# PRD: PipeFlow CRM — CRM Integrado com WhatsApp

## 1. Contexto & Problema

Pequenas e médias empresas, freelancers e times de vendas perdem oportunidades de
negócio por falta de organização no processo comercial. Leads são gerenciados em
planilhas, anotações soltas ou ferramentas genéricas que não oferecem visão clara
do funil de vendas.

Não há registro centralizado de interações com clientes, e quando a equipe cresce,
os dados ficam espalhados sem controle de acesso por empresa/time. As empresas
perdem vendas por não conseguir colocar os contatos do WhatsApp no CRM, e não têm
controle da data de retorno para os clientes.

Soluções como Nimochat, HubSpot e Pipedrive existem, mas são caras ou complexas
demais para quem está começando.

## 2. Solução Proposta

Construir o **PipeFlow CRM** — uma plataforma SaaS de gestão de clientes e vendas,
multi-empresa, com pipeline visual Kanban, gestão completa de leads e negócios,
registro de interações e integração de pagamento para monetização.

- CRM completo com cadastro de leads/contatos (nome, e-mail, telefone, empresa, cargo)
- Pipeline Kanban de vendas com drag-and-drop entre etapas
- Página de detalhe do lead com histórico completo de atividades
- Sistema multi-empresa com convite de colaboradores por e-mail
- Dashboard com métricas de vendas e gráfico de funil
- Monetização via planos de assinatura
- Landing page de apresentação do produto
- Sistema que envia os leads do WhatsApp para o CRM
- Retorno de mensagem automática para os clientes de dentro do sistema para o WhatsApp

## 3. Requisitos Funcionais

### 3.1 Gestão de Leads e Contatos

- Cadastro completo: nome, e-mail, telefone, empresa, cargo, status
- Listagem com busca e filtros (por status, responsável, data)
- Página de detalhe com perfil completo e timeline de atividades

### 3.2 Pipeline Kanban de Vendas

- Colunas por etapa: Novo Lead, Contato Realizado, Proposta Enviada, Negociação,
  Fechado Ganho, Fechado Perdido
- Cards de negócios com: título, valor estimado (R$), lead vinculado, responsável, prazo
- Drag-and-drop entre etapas com persistência no banco

### 3.3 Registro de Atividades

- Tipos: Ligação, E-mail, Reunião, Nota
- Campos: autor, descrição, data
- Timeline cronológica vinculada ao lead

### 3.4 Dashboard de Métricas

- Cards: total de leads, negócios abertos, valor total do pipeline, taxa de conversão
- Gráfico de funil de vendas (Recharts)
- Negócios do usuário logado com prazo próximo

### 3.5 Multi-empresa e Colaboração

- Criar workspaces (cada empresa/time = 1 workspace)
- Convite de colaboradores por e-mail (via Resend)
- Papéis: Admin (acesso total), Membro (leads e negócios)
- Alternar entre workspaces via dropdown na sidebar
- Isolamento de dados via Row Level Security (RLS) no Supabase

### 3.6 Monetização (Stripe)

- Plano Free: até 2 colaboradores e 50 leads
- Plano Pro: colaboradores e leads ilimitados (R$49/mês)
- Checkout integrado via Stripe Checkout
- Webhook para ativar/desativar plano automaticamente
- Customer Portal do Stripe para gerenciamento de assinatura

### 3.7 Landing Page

- Página pública de apresentação do PipeFlow CRM
- Seções: Hero, Funcionalidades, Planos e Preços, CTA

### 3.8 Integração WhatsApp

- Sistema que envia os leads do WhatsApp para o CRM
- Resposta automática para os clientes a partir do sistema, via WhatsApp

### 3.9 Requisitos Transversais

- Login e Autenticação
- Permissões por usuário
- Busca e filtros
- Onboarding do usuário
- Calendário
- Relatórios e exportação

## 4. Personas de Usuário

**Dono do Negócio / Empreendedor (Admin)**
Pequeno empresário que precisa organizar seu processo de vendas. Cria o workspace,
convida o time, gerencia planos e possui acesso completo às funcionalidades.

**Vendedor / Colaborador (Membro)**
Profissional de vendas que utiliza o CRM no dia a dia. Cadastra leads, move
negócios no pipeline e registra atividades. Pode participar de múltiplos workspaces.

**Freelancer / Consultor (Admin Solo)**
Profissional independente que atende vários clientes. Utiliza workspaces separados
para cada cliente/projeto. Começa no plano Free e faz upgrade conforme cresce.

## 5. Stack Técnica

- **Frontend:** Next.js 14 (App Router) + React 18 + Tailwind CSS + shadcn/ui
- **Backend/API:** Next.js API Routes / Server Components
- **Banco de Dados + Auth:** Supabase (PostgreSQL + RLS + Auth)
- **Pagamento:** Stripe (checkout + webhooks)
- **E-mail transacional:** Resend
- **Drag-and-drop:** @dnd-kit
- **Gráficos:** Recharts
- **Versionamento:** Git + GitHub
- **Deploy:** Vercel + Supabase
- **IDE:** Cursor com Claude Code no terminal
- **Linguagem:** TypeScript 5

## 6. Linguagem de Design

Referências: HubSpot CRM, Pipedrive e DataCrazy.

**HubSpot CRM** — CRM gratuito mais popular do mercado, pipeline visual, gestão de
contatos e automações de marketing. Pontos fortes: ecossistema completo, integrações
abundantes. Pontos fracos: complexo para PMEs e planos caros.
_Insight: simplificar a experiência focando apenas em vendas._

**Pipedrive** — CRM focado em vendas com pipeline visual excelente. Pontos fortes:
UX intuitiva e pipeline Kanban referência de mercado. Pontos fracos: ausência de
plano gratuito e recursos avançados caros.
_Insight: modelo freemium acessível inspirado no Pipedrive._

**Nimochat** — Automação focada em conversão de leads com integração do WhatsApp
Business com o sistema. Objetivo: não perder leads, foco em vendas.

## 7. Processo

- Quebrar a construção do app em milestones lógicos (etapas)
- Cada milestone deve ser um incremento entregável
- Priorizar funcionalidade core primeiro, depois iterar
- Testar cada milestone antes de avançar para o próximo
