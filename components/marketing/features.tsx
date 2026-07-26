import { Kanban, Users, BarChart3, MessageCircle, Building2, ShieldCheck } from "lucide-react";

import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const FEATURES = [
  {
    icon: Kanban,
    title: "Pipeline visual em Kanban",
    description:
      "Arraste negócios entre as etapas do funil e acompanhe cada oportunidade sem sair de uma única tela.",
  },
  {
    icon: Users,
    title: "Gestão de leads e contatos",
    description:
      "Cadastre, busque e filtre leads por status, responsável e período, com timeline completa de atividades.",
  },
  {
    icon: BarChart3,
    title: "Dashboard de métricas",
    description:
      "Total de leads, valor do pipeline, taxa de conversão e funil de vendas em gráficos atualizados em tempo real.",
  },
  {
    icon: MessageCircle,
    title: "Integração com WhatsApp",
    description:
      "Receba leads e responda clientes direto pelo WhatsApp sem trocar de ferramenta.",
  },
  {
    icon: Building2,
    title: "Multi-empresa",
    description:
      "Gerencie vários workspaces com dados isolados e convide colaboradores para cada um deles.",
  },
  {
    icon: ShieldCheck,
    title: "Papéis e permissões",
    description:
      "Controle de acesso por administrador e membro, com segurança aplicada em todas as camadas do sistema.",
  },
];

export function Features() {
  return (
    <section id="funcionalidades" className="container py-24 sm:py-32">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          Tudo que seu time comercial precisa
        </h2>
        <p className="mt-4 text-lg text-muted-foreground">
          Um CRM completo, pensado para o dia a dia de quem vende.
        </p>
      </div>

      <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map((feature) => (
          <Card
            key={feature.title}
            className="border-border/60 transition-colors hover:border-indigo-600/50"
          >
            <CardHeader>
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-600/10 text-indigo-500">
                <feature.icon className="h-5 w-5" />
              </span>
              <CardTitle className="pt-4 text-lg">{feature.title}</CardTitle>
              <CardDescription>{feature.description}</CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>
    </section>
  );
}
