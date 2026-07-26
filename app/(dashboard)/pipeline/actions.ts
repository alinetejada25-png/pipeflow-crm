"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import { getCurrentWorkspace, listWorkspaceMembers } from "@/lib/supabase/workspace";
import type { Lead, WorkspaceMember } from "@/types/lead";
import { DEAL_STAGES, type Deal, type DealInput, type DealStage } from "@/types/deal";
import type { Database } from "@/types/supabase";

type DealRow = Database["public"]["Tables"]["deals"]["Row"];
type LeadRow = Database["public"]["Tables"]["leads"]["Row"];

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

export async function listDeals(): Promise<Deal[]> {
  const supabase = await createClient();
  const { workspaceId } = await getCurrentWorkspace();

  const { data, error } = await supabase
    .from("deals")
    .select("*")
    .eq("workspace_id", workspaceId)
    .order("updated_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []).map(toDeal);
}

export async function listPipelineLeads(): Promise<Lead[]> {
  const supabase = await createClient();
  const { workspaceId } = await getCurrentWorkspace();

  const { data, error } = await supabase
    .from("leads")
    .select("*")
    .eq("workspace_id", workspaceId)
    .order("name", { ascending: true });

  if (error) throw new Error(error.message);
  return (data ?? []).map(toLead);
}

export async function listPipelineMembers(): Promise<WorkspaceMember[]> {
  return listWorkspaceMembers();
}

export async function createDeal(input: DealInput): Promise<{ id: string }> {
  const supabase = await createClient();
  const { workspaceId } = await getCurrentWorkspace();

  const { data, error } = await supabase
    .from("deals")
    .insert({
      workspace_id: workspaceId,
      title: input.title,
      value: input.value,
      lead_id: input.leadId,
      owner_id: input.ownerId || null,
      stage: input.stage,
      due_date: input.dueDate || null,
    })
    .select("id")
    .single();

  if (error) throw new Error(error.message);

  revalidatePath("/pipeline");
  return { id: data.id };
}

export async function updateDeal(id: string, input: DealInput): Promise<void> {
  const supabase = await createClient();
  const { workspaceId } = await getCurrentWorkspace();

  const { error } = await supabase
    .from("deals")
    .update({
      title: input.title,
      value: input.value,
      lead_id: input.leadId,
      owner_id: input.ownerId || null,
      stage: input.stage,
      due_date: input.dueDate || null,
      updated_at: new Date().toISOString(),
    })
    .eq("workspace_id", workspaceId)
    .eq("id", id);

  if (error) throw new Error(error.message);

  revalidatePath("/pipeline");
}

export async function updateDealStage(id: string, stage: DealStage): Promise<void> {
  if (!DEAL_STAGES.includes(stage)) throw new Error("Etapa inválida.");

  const supabase = await createClient();
  const { workspaceId } = await getCurrentWorkspace();

  const { error } = await supabase
    .from("deals")
    .update({ stage, updated_at: new Date().toISOString() })
    .eq("workspace_id", workspaceId)
    .eq("id", id);

  if (error) throw new Error(error.message);

  revalidatePath("/pipeline");
}

export async function deleteDeal(id: string): Promise<void> {
  const supabase = await createClient();
  const { workspaceId } = await getCurrentWorkspace();

  const { error } = await supabase
    .from("deals")
    .delete()
    .eq("workspace_id", workspaceId)
    .eq("id", id);

  if (error) throw new Error(error.message);

  revalidatePath("/pipeline");
}
