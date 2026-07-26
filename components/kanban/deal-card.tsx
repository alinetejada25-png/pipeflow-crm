"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Building2, CalendarClock } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import type { Deal } from "@/types/deal";
import type { Lead, WorkspaceMember } from "@/types/lead";

const CURRENCY_FORMATTER = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  maximumFractionDigits: 0,
});

const DATE_FORMATTER = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short" });

function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")).toUpperCase();
}

function dueMeta(dueDate: string | null): { label: string; overdue: boolean } | null {
  if (!dueDate) return null;
  const due = new Date(dueDate);
  due.setHours(0, 0, 0, 0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const overdue = due.getTime() < today.getTime();
  return { label: DATE_FORMATTER.format(due), overdue };
}

interface DealCardProps {
  deal: Deal;
  lead?: Lead;
  owner?: WorkspaceMember;
  onOpen: () => void;
  dragging?: boolean;
}

export function DealCard({ deal, lead, owner, onOpen, dragging }: DealCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: deal.id,
    data: { stage: deal.stage },
  });

  const due = dueMeta(deal.dueDate);

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
  };

  return (
    <button
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={onOpen}
      type="button"
      className={cn(
        "group flex w-full cursor-grab flex-col gap-2.5 rounded-lg border bg-card p-3 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md active:cursor-grabbing",
        isDragging && "opacity-30",
        dragging && "rotate-2 shadow-lg ring-2 ring-primary/20",
      )}
    >
      <p className="text-sm font-medium leading-snug text-card-foreground">{deal.title}</p>

      {lead ? (
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Building2 className="h-3.5 w-3.5 shrink-0" />
          <span className="truncate">{lead.company ?? lead.name}</span>
        </div>
      ) : null}

      <p className="text-sm font-semibold tabular-nums text-card-foreground">
        {CURRENCY_FORMATTER.format(deal.value)}
      </p>

      <div className="flex items-center justify-between pt-1">
        {due ? (
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium",
              due.overdue
                ? "bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-400"
                : "bg-muted text-muted-foreground",
            )}
          >
            <CalendarClock className="h-3 w-3" />
            {due.label}
          </span>
        ) : (
          <span />
        )}

        {owner ? (
          <Avatar className="h-6 w-6 border">
            <AvatarFallback className="text-[10px]">{initials(owner.name)}</AvatarFallback>
          </Avatar>
        ) : null}
      </div>
    </button>
  );
}
