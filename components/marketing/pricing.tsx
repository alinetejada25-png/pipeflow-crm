import Link from "next/link";
import { Check } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const PLANS = [
  {
    name: "Grátis",
    price: "R$0",
    period: "para sempre",
    description: "Para começar a organizar seu funil de vendas.",
    features: ["Até 2 colaboradores", "Até 50 leads", "Pipeline Kanban", "Dashboard de métricas"],
    cta: "Começar grátis",
    highlighted: false,
  },
  {
    name: "Pro",
    price: "R$49",
    period: "/mês",
    description: "Para times que querem escalar sem limites.",
    features: [
      "Colaboradores ilimitados",
      "Leads ilimitados",
      "Integração com WhatsApp",
      "Suporte prioritário",
    ],
    cta: "Assinar Pro",
    highlighted: true,
  },
];

export function Pricing() {
  return (
    <section id="precos" className="container py-24 sm:py-32">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          Planos para todos os tamanhos de time
        </h2>
        <p className="mt-4 text-lg text-muted-foreground">
          Comece grátis e evolua quando precisar de mais espaço.
        </p>
      </div>

      <div className="mx-auto mt-16 grid max-w-3xl gap-6 sm:grid-cols-2">
        {PLANS.map((plan) => (
          <Card
            key={plan.name}
            className={cn(
              "flex flex-col border-border/60",
              plan.highlighted && "border-indigo-600 shadow-lg shadow-indigo-600/10",
            )}
          >
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{plan.name}</CardTitle>
                {plan.highlighted && (
                  <Badge className="bg-indigo-600 text-white hover:bg-indigo-600">
                    Mais popular
                  </Badge>
                )}
              </div>
              <CardDescription>{plan.description}</CardDescription>
              <div className="flex items-baseline gap-1 pt-2">
                <span className="text-4xl font-semibold tracking-tight">{plan.price}</span>
                <span className="text-sm text-muted-foreground">{plan.period}</span>
              </div>
            </CardHeader>
            <CardContent className="flex-1">
              <ul className="space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 shrink-0 text-indigo-500" />
                    {feature}
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <Button
                asChild
                className={cn(
                  "w-full",
                  plan.highlighted && "bg-indigo-600 text-white hover:bg-indigo-600/90",
                )}
                variant={plan.highlighted ? "default" : "outline"}
              >
                <Link href="/signup">{plan.cta}</Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </section>
  );
}
