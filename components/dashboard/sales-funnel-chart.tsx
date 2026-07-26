"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type { FunnelStagePoint } from "@/app/(dashboard)/dashboard/actions";
import type { DealStage } from "@/types/deal";

const STAGE_COLOR: Record<DealStage, string> = {
  novo_lead: "#94a3b8",
  contato_realizado: "#94a3b8",
  proposta_enviada: "#94a3b8",
  negociacao: "#94a3b8",
  fechado_ganho: "#10b981",
  fechado_perdido: "#ef4444",
};

interface TooltipPayloadEntry {
  payload: FunnelStagePoint;
}

function FunnelTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: TooltipPayloadEntry[];
}) {
  if (!active || !payload?.length) return null;
  const point = payload[0]?.payload;
  if (!point) return null;

  return (
    <div className="rounded-md border bg-popover px-3 py-2 text-xs shadow-md">
      <p className="font-medium text-popover-foreground">{point.label}</p>
      <p className="text-muted-foreground">
        {point.count} {point.count === 1 ? "negócio" : "negócios"}
      </p>
    </div>
  );
}

export function SalesFunnelChart({ data }: { data: FunnelStagePoint[] }) {
  return (
    <div className="h-[280px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
          <CartesianGrid vertical={false} stroke="hsl(var(--border))" />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
            tickLine={false}
            axisLine={{ stroke: "hsl(var(--border))" }}
            interval={0}
            angle={-20}
            textAnchor="end"
            height={50}
          />
          <YAxis
            allowDecimals={false}
            tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
            tickLine={false}
            axisLine={false}
            width={28}
          />
          <Tooltip cursor={{ fill: "hsl(var(--muted))" }} content={<FunnelTooltip />} />
          <Bar dataKey="count" radius={[4, 4, 0, 0]} maxBarSize={56}>
            {data.map((entry) => (
              <Cell key={entry.stage} fill={STAGE_COLOR[entry.stage]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      <div className="mt-2 flex items-center gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-slate-400" />
          Em andamento
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-emerald-500" />
          Fechado Ganho
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-red-500" />
          Fechado Perdido
        </span>
      </div>
    </div>
  );
}
