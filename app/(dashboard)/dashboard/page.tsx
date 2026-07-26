import { Handshake, Percent, Users, Wallet } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MetricCard } from "@/components/dashboard/metric-card";
import { SalesFunnelChart } from "@/components/dashboard/sales-funnel-chart";
import { UpcomingDealsTable } from "@/components/dashboard/upcoming-deals-table";
import { getDashboardMetrics, getSalesFunnel, getUpcomingDeals } from "./actions";

const CURRENCY_FORMATTER = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  maximumFractionDigits: 0,
});

const PERCENT_FORMATTER = new Intl.NumberFormat("pt-BR", {
  style: "percent",
  maximumFractionDigits: 0,
});

export default async function DashboardPage() {
  const [metrics, funnel, upcomingDeals] = await Promise.all([
    getDashboardMetrics(),
    getSalesFunnel(),
    getUpcomingDeals(),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Visão geral do seu funil de vendas e dos próximos prazos.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard label="Total de Leads" value={String(metrics.totalLeads)} icon={Users} />
        <MetricCard label="Negócios Abertos" value={String(metrics.openDeals)} icon={Handshake} />
        <MetricCard
          label="Valor do Pipeline"
          value={CURRENCY_FORMATTER.format(metrics.pipelineValue)}
          icon={Wallet}
        />
        <MetricCard
          label="Taxa de Conversão"
          value={PERCENT_FORMATTER.format(metrics.conversionRate)}
          icon={Percent}
          accent="good"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Funil de Vendas</CardTitle>
        </CardHeader>
        <CardContent>
          <SalesFunnelChart data={funnel} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Próximos Prazos</CardTitle>
        </CardHeader>
        <CardContent>
          <UpcomingDealsTable deals={upcomingDeals} />
        </CardContent>
      </Card>
    </div>
  );
}
