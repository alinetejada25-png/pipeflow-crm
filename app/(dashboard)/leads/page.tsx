import Link from "next/link";
import { Plus } from "lucide-react";

import { listLeads, listWorkspaceMembers } from "@/app/(dashboard)/leads/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DeleteLeadButton } from "@/components/leads/delete-lead-button";
import { LeadFilters } from "@/components/leads/lead-filters";
import { LeadFormDialog } from "@/components/leads/lead-form-dialog";
import { LeadStatusBadge } from "@/components/leads/lead-status-badge";
import type { LeadStatus } from "@/types/lead";

const dateFormatter = new Intl.DateTimeFormat("pt-BR", { dateStyle: "short" });

export default async function LeadsPage({
  searchParams,
}: {
  searchParams: {
    search?: string;
    status?: string;
    ownerId?: string;
    dateFrom?: string;
    dateTo?: string;
  };
}) {
  const [leads, members] = await Promise.all([
    listLeads({
      search: searchParams.search,
      status: searchParams.status as LeadStatus | undefined,
      ownerId: searchParams.ownerId,
      dateFrom: searchParams.dateFrom,
      dateTo: searchParams.dateTo,
    }),
    listWorkspaceMembers(),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Leads</h1>
          <p className="text-sm text-muted-foreground">
            Gerencie os leads captados pelo seu workspace.
          </p>
        </div>
        <LeadFormDialog
          trigger={
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Novo lead
            </Button>
          }
        />
      </div>

      <LeadFilters members={members} />

      <Card>
        <CardContent className="p-0">
          {leads.length === 0 ? (
            <div className="p-8 text-center text-sm text-muted-foreground">
              Nenhum lead encontrado.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Empresa</TableHead>
                  <TableHead>Contato</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Criado em</TableHead>
                  <TableHead className="w-24 text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {leads.map((lead) => (
                  <TableRow key={lead.id}>
                    <TableCell className="font-medium">
                      <Link href={`/leads/${lead.id}`} className="hover:underline">
                        {lead.name}
                      </Link>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {lead.company ?? "—"}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {lead.email ?? lead.phone ?? "—"}
                    </TableCell>
                    <TableCell>
                      <LeadStatusBadge status={lead.status} />
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {dateFormatter.format(new Date(lead.createdAt))}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <LeadFormDialog
                          lead={lead}
                          trigger={
                            <Button variant="ghost" size="sm">
                              Editar
                            </Button>
                          }
                        />
                        <DeleteLeadButton leadId={lead.id} leadName={lead.name} />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
