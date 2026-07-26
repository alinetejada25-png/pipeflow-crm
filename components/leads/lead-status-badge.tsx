import { Badge } from "@/components/ui/badge";
import { LEAD_STATUS_LABELS, type LeadStatus } from "@/types/lead";

const STATUS_CLASSES: Record<LeadStatus, string> = {
  novo: "border-transparent bg-blue-100 text-blue-700 hover:bg-blue-100 dark:bg-blue-500/15 dark:text-blue-400",
  contatado:
    "border-transparent bg-amber-100 text-amber-700 hover:bg-amber-100 dark:bg-amber-500/15 dark:text-amber-400",
  qualificado:
    "border-transparent bg-purple-100 text-purple-700 hover:bg-purple-100 dark:bg-purple-500/15 dark:text-purple-400",
  desqualificado:
    "border-transparent bg-red-100 text-red-700 hover:bg-red-100 dark:bg-red-500/15 dark:text-red-400",
  convertido:
    "border-transparent bg-green-100 text-green-700 hover:bg-green-100 dark:bg-green-500/15 dark:text-green-400",
};

export function LeadStatusBadge({ status }: { status: LeadStatus }) {
  return <Badge className={STATUS_CLASSES[status]}>{LEAD_STATUS_LABELS[status]}</Badge>;
}
