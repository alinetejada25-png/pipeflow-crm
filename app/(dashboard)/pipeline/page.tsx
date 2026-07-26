import { listDeals, listPipelineLeads, listPipelineMembers } from "@/app/(dashboard)/pipeline/actions";
import { KanbanBoard } from "@/components/kanban/kanban-board";
import { NewDealButton } from "@/components/kanban/new-deal-button";

export default async function PipelinePage() {
  const [deals, leads, members] = await Promise.all([
    listDeals(),
    listPipelineLeads(),
    listPipelineMembers(),
  ]);

  return (
    <div className="flex h-full flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Pipeline</h1>
          <p className="text-sm text-muted-foreground">
            Acompanhe seus negócios em cada etapa do funil.
          </p>
        </div>
        <NewDealButton leads={leads} members={members} />
      </div>

      <KanbanBoard initialDeals={deals} leads={leads} members={members} />
    </div>
  );
}
