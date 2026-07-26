import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { getLead, getLeadActivities } from "@/app/(dashboard)/leads/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DeleteLeadButton } from "@/components/leads/delete-lead-button";
import { LeadFormDialog } from "@/components/leads/lead-form-dialog";
import { LeadStatusBadge } from "@/components/leads/lead-status-badge";
import { LeadTimeline } from "@/components/leads/lead-timeline";

export default async function LeadDetailPage({ params }: { params: { id: string } }) {
  const lead = await getLead(params.id);
  if (!lead) notFound();

  const activities = await getLeadActivities(lead.id);

  const fields: { label: string; value: string }[] = [
    { label: "E-mail", value: lead.email ?? "—" },
    { label: "Telefone", value: lead.phone ?? "—" },
    { label: "Empresa", value: lead.company ?? "—" },
    { label: "Cargo", value: lead.jobTitle ?? "—" },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" className="gap-2" asChild>
          <Link href="/leads">
            <ArrowLeft className="h-4 w-4" />
            Voltar para leads
          </Link>
        </Button>
        <div className="flex gap-2">
          <LeadFormDialog
            lead={lead}
            trigger={<Button variant="outline">Editar</Button>}
          />
          <DeleteLeadButton leadId={lead.id} leadName={lead.name} redirectTo="/leads" />
        </div>
      </div>

      <div>
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-semibold tracking-tight">{lead.name}</h1>
          <LeadStatusBadge status={lead.status} />
        </div>
        {lead.company ? (
          <p className="text-sm text-muted-foreground">
            {lead.jobTitle ? `${lead.jobTitle} · ` : ""}
            {lead.company}
          </p>
        ) : null}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-base">Dados do lead</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {fields.map((field) => (
              <div key={field.label} className="flex flex-col gap-0.5">
                <span className="text-xs text-muted-foreground">{field.label}</span>
                <span className="text-sm">{field.value}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Timeline de atividades</CardTitle>
          </CardHeader>
          <CardContent>
            <LeadTimeline activities={activities} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
