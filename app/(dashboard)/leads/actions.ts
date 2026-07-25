"use server";

import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";

import { MOCK_ACTIVITIES, MOCK_LEADS, MOCK_MEMBERS } from "@/lib/leads/mock-data";
import type { Activity, Lead, LeadFilters, LeadInput, WorkspaceMember } from "@/types/lead";

/**
 * Dados fake em memória para a fase de interface (Milestone 2), sem depender de
 * um projeto Supabase configurado. Quando a integração real entrar, estas
 * funções passam a consultar as tabelas `leads`/`activities` filtradas por
 * `workspace_id`, mantendo as mesmas assinaturas.
 */
const leadsStore: Lead[] = MOCK_LEADS.map((lead) => ({ ...lead }));
const activitiesStore: Record<string, Activity[]> = Object.fromEntries(
  Object.entries(MOCK_ACTIVITIES).map(([leadId, activities]) => [
    leadId,
    activities.map((activity) => ({ ...activity })),
  ]),
);

function matchesSearch(lead: Lead, term: string): boolean {
  const normalized = term.trim().toLowerCase();
  if (!normalized) return true;
  return (
    lead.name.toLowerCase().includes(normalized) ||
    (lead.email?.toLowerCase().includes(normalized) ?? false) ||
    (lead.company?.toLowerCase().includes(normalized) ?? false)
  );
}

export async function listLeads(filters: LeadFilters = {}): Promise<Lead[]> {
  let result = [...leadsStore];

  if (filters.status) {
    result = result.filter((lead) => lead.status === filters.status);
  }

  if (filters.ownerId) {
    result = result.filter((lead) => lead.ownerId === filters.ownerId);
  }

  if (filters.dateFrom) {
    const from = new Date(`${filters.dateFrom}T00:00:00.000Z`).getTime();
    result = result.filter((lead) => new Date(lead.createdAt).getTime() >= from);
  }

  if (filters.dateTo) {
    const to = new Date(`${filters.dateTo}T23:59:59.999Z`).getTime();
    result = result.filter((lead) => new Date(lead.createdAt).getTime() <= to);
  }

  if (filters.search) {
    result = result.filter((lead) => matchesSearch(lead, filters.search!));
  }

  return result.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}

export async function listWorkspaceMembers(): Promise<WorkspaceMember[]> {
  return MOCK_MEMBERS;
}

export async function getLead(id: string): Promise<Lead | null> {
  return leadsStore.find((lead) => lead.id === id) ?? null;
}

export async function getLeadActivities(leadId: string): Promise<Activity[]> {
  const activities = activitiesStore[leadId] ?? [];
  return [...activities].sort(
    (a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime(),
  );
}

export async function createLead(input: LeadInput): Promise<{ id: string }> {
  const now = new Date().toISOString();
  const lead: Lead = {
    id: randomUUID(),
    workspaceId: "mock-workspace",
    name: input.name,
    email: input.email || null,
    phone: input.phone || null,
    company: input.company || null,
    jobTitle: input.jobTitle || null,
    status: input.status,
    ownerId: input.ownerId || null,
    source: "manual",
    createdAt: now,
    updatedAt: now,
  };

  leadsStore.unshift(lead);
  activitiesStore[lead.id] = [];

  revalidatePath("/leads");
  return { id: lead.id };
}

export async function updateLead(id: string, input: LeadInput): Promise<void> {
  const lead = leadsStore.find((item) => item.id === id);
  if (!lead) throw new Error("Lead não encontrado.");

  lead.name = input.name;
  lead.email = input.email || null;
  lead.phone = input.phone || null;
  lead.company = input.company || null;
  lead.jobTitle = input.jobTitle || null;
  lead.status = input.status;
  lead.ownerId = input.ownerId || null;
  lead.updatedAt = new Date().toISOString();

  revalidatePath("/leads");
  revalidatePath(`/leads/${id}`);
}

export async function deleteLead(id: string): Promise<void> {
  const index = leadsStore.findIndex((lead) => lead.id === id);
  if (index === -1) throw new Error("Lead não encontrado.");

  leadsStore.splice(index, 1);
  delete activitiesStore[id];

  revalidatePath("/leads");
}
