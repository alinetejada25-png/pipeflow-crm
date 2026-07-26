"use server";

import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";

import { MOCK_DEALS } from "@/lib/deals/mock-data";
import { MOCK_LEADS, MOCK_MEMBERS } from "@/lib/leads/mock-data";
import type { Lead, WorkspaceMember } from "@/types/lead";
import { DEAL_STAGES, type Deal, type DealInput, type DealStage } from "@/types/deal";

/**
 * Dados fake em memória para a fase de interface (Milestone 3), no mesmo padrão
 * de app/(dashboard)/leads/actions.ts. Quando a integração real entrar, estas
 * funções passam a consultar a tabela `deals` filtrada por `workspace_id`,
 * mantendo as mesmas assinaturas.
 */
const dealsStore: Deal[] = MOCK_DEALS.map((deal) => ({ ...deal }));

export async function listDeals(): Promise<Deal[]> {
  return [...dealsStore].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
  );
}

export async function listPipelineLeads(): Promise<Lead[]> {
  return MOCK_LEADS;
}

export async function listPipelineMembers(): Promise<WorkspaceMember[]> {
  return MOCK_MEMBERS;
}

export async function createDeal(input: DealInput): Promise<{ id: string }> {
  const now = new Date().toISOString();
  const deal: Deal = {
    id: randomUUID(),
    workspaceId: "mock-workspace",
    title: input.title,
    value: input.value,
    leadId: input.leadId,
    ownerId: input.ownerId || null,
    stage: input.stage,
    dueDate: input.dueDate || null,
    createdAt: now,
    updatedAt: now,
  };

  dealsStore.unshift(deal);

  revalidatePath("/pipeline");
  return { id: deal.id };
}

export async function updateDeal(id: string, input: DealInput): Promise<void> {
  const deal = dealsStore.find((item) => item.id === id);
  if (!deal) throw new Error("Negócio não encontrado.");

  deal.title = input.title;
  deal.value = input.value;
  deal.leadId = input.leadId;
  deal.ownerId = input.ownerId || null;
  deal.stage = input.stage;
  deal.dueDate = input.dueDate || null;
  deal.updatedAt = new Date().toISOString();

  revalidatePath("/pipeline");
}

export async function updateDealStage(id: string, stage: DealStage): Promise<void> {
  if (!DEAL_STAGES.includes(stage)) throw new Error("Etapa inválida.");

  const deal = dealsStore.find((item) => item.id === id);
  if (!deal) throw new Error("Negócio não encontrado.");

  deal.stage = stage;
  deal.updatedAt = new Date().toISOString();

  revalidatePath("/pipeline");
}

export async function deleteDeal(id: string): Promise<void> {
  const index = dealsStore.findIndex((deal) => deal.id === id);
  if (index === -1) throw new Error("Negócio não encontrado.");

  dealsStore.splice(index, 1);

  revalidatePath("/pipeline");
}
