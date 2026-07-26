"use server";

import { MOCK_DEALS } from "@/lib/deals/mock-data";
import { MOCK_LEADS, MOCK_MEMBERS } from "@/lib/leads/mock-data";
import { DEAL_STAGES, DEAL_STAGE_LABELS, type DealStage } from "@/types/deal";
import type { Lead, WorkspaceMember } from "@/types/lead";

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

export async function getDashboardMetrics(): Promise<DashboardMetrics> {
  const openDeals = MOCK_DEALS.filter((deal) => !CLOSED_STAGES.includes(deal.stage));
  const wonDeals = MOCK_DEALS.filter((deal) => deal.stage === "fechado_ganho");
  const closedDeals = MOCK_DEALS.filter((deal) => CLOSED_STAGES.includes(deal.stage));

  return {
    totalLeads: MOCK_LEADS.length,
    openDeals: openDeals.length,
    pipelineValue: openDeals.reduce((sum, deal) => sum + deal.value, 0),
    conversionRate: closedDeals.length > 0 ? wonDeals.length / closedDeals.length : 0,
  };
}

export async function getSalesFunnel(): Promise<FunnelStagePoint[]> {
  return DEAL_STAGES.map((stage) => ({
    stage,
    label: DEAL_STAGE_LABELS[stage],
    count: MOCK_DEALS.filter((deal) => deal.stage === stage).length,
  }));
}

export async function getUpcomingDeals(): Promise<UpcomingDeal[]> {
  const leadsById = new Map(MOCK_LEADS.map((lead) => [lead.id, lead]));
  const membersById = new Map(MOCK_MEMBERS.map((member) => [member.userId, member]));
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return MOCK_DEALS.filter((deal) => !CLOSED_STAGES.includes(deal.stage) && deal.dueDate)
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
