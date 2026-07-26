"use client";

import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { DealCard } from "@/components/kanban/deal-card";
import { cn } from "@/lib/utils";
import type { Deal, DealStage } from "@/types/deal";
import type { Lead, WorkspaceMember } from "@/types/lead";

const CURRENCY_FORMATTER = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  maximumFractionDigits: 0,
});

const STAGE_ACCENT: Record<DealStage, string> = {
  novo_lead: "before:bg-slate-300 dark:before:bg-slate-600",
  contato_realizado: "before:bg-slate-300 dark:before:bg-slate-600",
  proposta_enviada: "before:bg-slate-300 dark:before:bg-slate-600",
  negociacao: "before:bg-slate-300 dark:before:bg-slate-600",
  fechado_ganho: "before:bg-emerald-500",
  fechado_perdido: "before:bg-red-500",
};

interface KanbanColumnProps {
  stage: DealStage;
  label: string;
  deals: Deal[];
  leadsById: Map<string, Lead>;
  membersById: Map<string, WorkspaceMember>;
  onOpenDeal: (deal: Deal) => void;
  onNewDeal: (stage: DealStage) => void;
  activeId: string | null;
}

export function KanbanColumn({
  stage,
  label,
  deals,
  leadsById,
  membersById,
  onOpenDeal,
  onNewDeal,
  activeId,
}: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: stage, data: { stage } });
  const total = deals.reduce((sum, deal) => sum + deal.value, 0);

  return (
    <div className="flex w-[300px] shrink-0 flex-col">
      <div
        className={cn(
          "relative mb-3 flex items-center justify-between rounded-md px-1 pb-2 pt-1 before:absolute before:inset-x-0 before:top-0 before:h-0.5 before:rounded-full",
          STAGE_ACCENT[stage],
        )}
      >
        <div>
          <h2 className="text-sm font-semibold text-foreground">{label}</h2>
          <p className="text-xs text-muted-foreground">
            {deals.length} · {CURRENCY_FORMATTER.format(total)}
          </p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-muted-foreground hover:text-foreground"
          onClick={() => onNewDeal(stage)}
          aria-label={`Novo negócio em ${label}`}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      <div
        ref={setNodeRef}
        className={cn(
          "flex min-h-[120px] flex-1 flex-col gap-2 rounded-lg border border-dashed border-transparent p-1.5 transition-colors",
          isOver && "border-primary/40 bg-muted/50",
        )}
      >
        <SortableContext items={deals.map((deal) => deal.id)} strategy={verticalListSortingStrategy}>
          {deals.map((deal) => (
            <DealCard
              key={deal.id}
              deal={deal}
              lead={leadsById.get(deal.leadId)}
              owner={deal.ownerId ? membersById.get(deal.ownerId) : undefined}
              onOpen={() => onOpenDeal(deal)}
              dragging={activeId === deal.id}
            />
          ))}
        </SortableContext>
      </div>
    </div>
  );
}
