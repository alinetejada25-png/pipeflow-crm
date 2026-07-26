import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { UpcomingDeal } from "@/app/(dashboard)/dashboard/actions";

const CURRENCY_FORMATTER = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  maximumFractionDigits: 0,
});

const DATE_FORMATTER = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short" });

export function UpcomingDealsTable({ deals }: { deals: UpcomingDeal[] }) {
  if (deals.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">Nenhum negócio em aberto com prazo definido.</p>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Negócio</TableHead>
          <TableHead>Empresa</TableHead>
          <TableHead>Etapa</TableHead>
          <TableHead>Responsável</TableHead>
          <TableHead className="text-right">Valor</TableHead>
          <TableHead className="text-right">Prazo</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {deals.map((deal) => (
          <TableRow key={deal.id}>
            <TableCell className="font-medium">{deal.title}</TableCell>
            <TableCell className="text-muted-foreground">
              {deal.lead?.company ?? deal.lead?.name ?? "—"}
            </TableCell>
            <TableCell>
              <Badge variant="secondary" className="font-normal">
                {deal.stageLabel}
              </Badge>
            </TableCell>
            <TableCell className="text-muted-foreground">{deal.owner?.name ?? "—"}</TableCell>
            <TableCell className="text-right tabular-nums">
              {CURRENCY_FORMATTER.format(deal.value)}
            </TableCell>
            <TableCell className="text-right">
              <span
                className={cn(
                  "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium tabular-nums",
                  deal.overdue
                    ? "bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-400"
                    : "bg-muted text-muted-foreground",
                )}
              >
                {DATE_FORMATTER.format(new Date(deal.dueDate))}
              </span>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
