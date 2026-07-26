"use server";

import { createClient } from "@/lib/supabase/server";
import { getCurrentWorkspace, listWorkspaceMembers } from "@/lib/supabase/workspace";
import { DEAL_STAGES, DEAL_STAGE_LABELS, type Deal, type DealStage } from "@/types/deal";
import type { Lead, WorkspaceMember } from "@/types/lead";
import type { Database } from "@/types/supabase";

type DealRow = Database["public"]["Tables"]["deals"]["Row"];
type LeadRow = Database["public"]["Tables"]["leads"]["Row"];

const CLOSED_STAGES: DealStage[] = ["fechado_ganho", "fechado_perdido"];

export interface DashboardMetrics {
  totalLeads: number;
  openDeals: number;
  pipelineValue: number;
  conversionRate: number;
}

export interface FunnelStagePoint {
  stage: DealStage;
  label: string;
  count: number;
}

export interface UpcomingDeal {
  id: string;
  title: string;
  value: number;
  stage: DealStage;
  stageLabel: string;
  dueDate: string;
  overdue: boolean;
  lead?: Lead;
  owner?: WorkspaceMember;
}

function toDeal(row: DealRow): Deal {
  return {
    id: row.id,
    workspaceId: row.workspace_id,
    title: row.title,
    value: Number(row.value),
    leadId: row.lead_id,
    ownerId: row.owner_id,
    stage: row.stage,
    dueDate: row.due_date,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function toLead(row: LeadRow): Lead {
  return {
    id: row.id,
    workspaceId: row.workspace_id,
    name: row.name,
    email: row.email,
    phone: row.phone,
    company: row.company,
    jobTitle: row.job_title,
    status: row.status as Lead["status"],
    ownerId: row.owner_id,
    source: row.source,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

async function loadDeals(): Promise<Deal[]> {
  const supabase = await createClient();
  const { workspaceId } = await getCurrentWorkspace();

  const { data, error } = await supabase.from("deals").select("*").eq("workspace_id", workspaceId);
  if (error) throw new Error(error.message);

  return (data ?? []).map(toDeal);
}

export async function getDashboardMetrics(): Promise<DashboardMetrics> {
  const supabase = await createClient();
  const { workspaceId } = await getCurrentWorkspace();

  const [{ count: totalLeads, error: leadsError }, deals] = await Promise.all([
    supabase
      .from("leads")
      .select("id", { count: "exact", head: true })
      .eq("workspace_id", workspaceId),
    loadDeals(),
  ]);

  if (leadsError) throw new Error(leadsError.message);

  const openDeals = deals.filter((deal) => !CLOSED_STAGES.includes(deal.stage));
  const wonDeals = deals.filter((deal) => deal.stage === "fechado_ganho");
  const closedDeals = deals.filter((deal) => CLOSED_STAGES.includes(deal.stage));

  return {
    totalLeads: totalLeads ?? 0,
    openDeals: openDeals.length,
    pipelineValue: openDeals.reduce((sum, deal) => sum + deal.value, 0),
    conversionRate: closedDeals.length > 0 ? wonDeals.length / closedDeals.length : 0,
  };
}

export async function getSalesFunnel(): Promise<FunnelStagePoint[]> {
  const deals = await loadDeals();

  return DEAL_STAGES.map((stage) => ({
    stage,
    label: DEAL_STAGE_LABELS[stage],
    count: deals.filter((deal) => deal.stage === stage).length,
  }));
}

export async function getUpcomingDeals(): Promise<UpcomingDeal[]> {
  const [deals, members] = await Promise.all([loadDeals(), listWorkspaceMembers()]);

  const supabase = await createClient();
  const { workspaceId } = await getCurrentWorkspace();
  const leadIds = [...new Set(deals.map((deal) => deal.leadId))];

  const { data: leadRows, error } =
    leadIds.length > 0
      ? await supabase
          .from("leads")
          .select("*")
          .eq("workspace_id", workspaceId)
          .in("id", leadIds)
      : { data: [] as LeadRow[], error: null };

  if (error) throw new Error(error.message);

  const leadsById = new Map((leadRows ?? []).map((row) => [row.id, toLead(row)]));
  const membersById = new Map(members.map((member) => [member.userId, member]));
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return deals
    .filter((deal) => !CLOSED_STAGES.includes(deal.stage) && deal.dueDate)
    .map((deal) => {
      const due = new Date(deal.dueDate as string);
      due.setHours(0, 0, 0, 0);

      return {
        id: deal.id,
        title: deal.title,
        value: deal.value,
        stage: deal.stage,
        stageLabel: DEAL_STAGE_LABELS[deal.stage],
        dueDate: deal.dueDate as string,
        overdue: due.getTime() < today.getTime(),
        lead: leadsById.get(deal.leadId),
        owner: deal.ownerId ? membersById.get(deal.ownerId) : undefined,
      };
    })
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
    .slice(0, 6);
}
