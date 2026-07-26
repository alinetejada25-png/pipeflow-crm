"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  closestCorners,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { Building2 } from "lucide-react";

import { updateDealStage } from "@/app/(dashboard)/pipeline/actions";
import { DealFormDialog } from "@/components/kanban/deal-form-dialog";
import { KanbanColumn } from "@/components/kanban/kanban-column";
import { DEAL_STAGES, DEAL_STAGE_LABELS, type Deal, type DealStage } from "@/types/deal";
import type { Lead, WorkspaceMember } from "@/types/lead";

const CURRENCY_FORMATTER = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  maximumFractionDigits: 0,
});

function groupByStage(deals: Deal[]): Record<DealStage, Deal[]> {
  const groups = Object.fromEntries(DEAL_STAGES.map((stage) => [stage, [] as Deal[]])) as Record<
    DealStage,
    Deal[]
  >;
  for (const deal of deals) {
    groups[deal.stage].push(deal);
  }
  return groups;
}

function findStageOf(columns: Record<DealStage, Deal[]>, dealId: string): DealStage | undefined {
  return DEAL_STAGES.find((stage) => columns[stage].some((deal) => deal.id === dealId));
}

interface KanbanBoardProps {
  initialDeals: Deal[];
  leads: Lead[];
  members: WorkspaceMember[];
}

export function KanbanBoard({ initialDeals, leads, members }: KanbanBoardProps) {
  const [columns, setColumns] = useState<Record<DealStage, Deal[]>>(() =>
    groupByStage(initialDeals),
  );
  const [activeDeal, setActiveDeal] = useState<Deal | null>(null);
  const [editingDeal, setEditingDeal] = useState<Deal | null>(null);
  const [newDealStage, setNewDealStage] = useState<DealStage | null>(null);
  const dragOriginStage = useRef<DealStage | null>(null);

  useEffect(() => {
    setColumns(groupByStage(initialDeals));
  }, [initialDeals]);

  const leadsById = useMemo(() => new Map(leads.map((lead) => [lead.id, lead])), [leads]);
  const membersById = useMemo(
    () => new Map(members.map((member) => [member.userId, member])),
    [members],
  );

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
  );

  function handleDragStart(event: DragStartEvent) {
    const dealId = event.active.id as string;
    dragOriginStage.current = findStageOf(columns, dealId) ?? null;
    const stage = dragOriginStage.current;
    if (stage) {
      setActiveDeal(columns[stage].find((deal) => deal.id === dealId) ?? null);
    }
  }

  function handleDragOver(event: DragOverEvent) {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    const activeStage = findStageOf(columns, activeId);
    const overStage = DEAL_STAGES.includes(overId as DealStage)
      ? (overId as DealStage)
      : findStageOf(columns, overId);

    if (!activeStage || !overStage || activeStage === overStage) return;

    setColumns((prev) => {
      const activeItems = prev[activeStage];
      const activeIndex = activeItems.findIndex((deal) => deal.id === activeId);
      const activeDealItem = activeItems[activeIndex];
      if (!activeDealItem) return prev;

      const moved = { ...activeDealItem, stage: overStage };
      const nextActive = activeItems.filter((deal) => deal.id !== activeId);

      const overItems = prev[overStage];
      const overIndex = overItems.findIndex((deal) => deal.id === overId);
      const nextOver = [...overItems];
      if (overIndex === -1) {
        nextOver.push(moved);
      } else {
        nextOver.splice(overIndex, 0, moved);
      }

      return { ...prev, [activeStage]: nextActive, [overStage]: nextOver };
    });
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active } = event;
    const activeId = active.id as string;
    const originStage = dragOriginStage.current;
    const finalStage = findStageOf(columns, activeId);

    setActiveDeal(null);
    dragOriginStage.current = null;

    if (originStage && finalStage && originStage !== finalStage) {
      void updateDealStage(activeId, finalStage);
    }
  }

  return (
    <>
      <div className="flex gap-4 overflow-x-auto pb-4">
        <DndContext
          id="pipeline-kanban-board"
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          {DEAL_STAGES.map((stage) => (
            <KanbanColumn
              key={stage}
              stage={stage}
              label={DEAL_STAGE_LABELS[stage]}
              deals={columns[stage]}
              leadsById={leadsById}
              membersById={membersById}
              onOpenDeal={setEditingDeal}
              onNewDeal={setNewDealStage}
              activeId={activeDeal?.id ?? null}
            />
          ))}

          <DragOverlay dropAnimation={{ duration: 200, easing: "ease" }}>
            {activeDeal ? (
              <div className="flex w-[280px] flex-col gap-2.5 rounded-lg border bg-card p-3 shadow-lg ring-2 ring-primary/20 rotate-2">
                <p className="text-sm font-medium leading-snug text-card-foreground">
                  {activeDeal.title}
                </p>
                {leadsById.get(activeDeal.leadId) ? (
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Building2 className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">
                      {leadsById.get(activeDeal.leadId)?.company ??
                        leadsById.get(activeDeal.leadId)?.name}
                    </span>
                  </div>
                ) : null}
                <p className="text-sm font-semibold tabular-nums text-card-foreground">
                  {CURRENCY_FORMATTER.format(activeDeal.value)}
                </p>
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>

      <DealFormDialog
        open={Boolean(editingDeal)}
        onOpenChange={(open) => !open && setEditingDeal(null)}
        deal={editingDeal ?? undefined}
        leads={leads}
        members={members}
      />

      <DealFormDialog
        open={Boolean(newDealStage)}
        onOpenChange={(open) => !open && setNewDealStage(null)}
        defaultStage={newDealStage ?? undefined}
        leads={leads}
        members={members}
      />
    </>
  );
}
