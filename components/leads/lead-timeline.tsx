import { Mail, MessageSquare, Phone, StickyNote } from "lucide-react";

import { ACTIVITY_TYPE_LABELS, type Activity, type ActivityType } from "@/types/lead";

const ACTIVITY_ICON: Record<ActivityType, typeof Phone> = {
  ligacao: Phone,
  email: Mail,
  reuniao: MessageSquare,
  nota: StickyNote,
};

const dateTimeFormatter = new Intl.DateTimeFormat("pt-BR", {
  dateStyle: "short",
  timeStyle: "short",
});

export function LeadTimeline({ activities }: { activities: Activity[] }) {
  if (activities.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Nenhuma atividade registrada ainda para este lead.
      </p>
    );
  }

  return (
    <ol className="flex flex-col gap-4">
      {activities.map((activity) => {
        const Icon = ACTIVITY_ICON[activity.type];
        return (
          <li key={activity.id} className="flex gap-3">
            <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted">
              <Icon className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="flex flex-col gap-0.5">
              <div className="flex items-center gap-2 text-sm">
                <span className="font-medium">{ACTIVITY_TYPE_LABELS[activity.type]}</span>
                <span className="text-xs text-muted-foreground">
                  {dateTimeFormatter.format(new Date(activity.occurredAt))}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">{activity.description}</p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
