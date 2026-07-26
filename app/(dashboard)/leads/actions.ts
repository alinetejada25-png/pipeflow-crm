"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import { getCurrentWorkspace, listWorkspaceMembers } from "@/lib/supabase/workspace";
import type { Activity, Lead, LeadFilters, LeadInput } from "@/types/lead";
import type { Database } from "@/types/supabase";

type LeadRow = Database["public"]["Tables"]["leads"]["Row"];
type ActivityRow = Database["public"]["Tables"]["activities"]["Row"];

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

function toActivity(row: ActivityRow): Activity {
  return {
    id: row.id,
    workspaceId: row.workspace_id,
    leadId: row.lead_id,
    authorId: row.author_id,
    type: row.type,
    description: row.description,
    occurredAt: row.occurred_at,
    createdAt: row.created_at,
  };
}

export async function listLeads(filters: LeadFilters = {}): Promise<Lead[]> {
  const supabase = await createClient();
  const { workspaceId } = await getCurrentWorkspace();

  let query = supabase
    .from("leads")
    .select("*")
    .eq("workspace_id", workspaceId)
    .order("created_at", { ascending: false });

  if (filters.status) {
    query = query.eq("status", filters.status);
  }

  if (filters.ownerId) {
    query = query.eq("owner_id", filters.ownerId);
  }

  if (filters.dateFrom) {
    query = query.gte("created_at", `${filters.dateFrom}T00:00:00.000Z`);
  }

  if (filters.dateTo) {
    query = query.lte("created_at", `${filters.dateTo}T23:59:59.999Z`);
  }

  if (filters.search) {
    const term = filters.search.trim();
    if (term) {
      query = query.or(`name.ilike.%${term}%,email.ilike.%${term}%,company.ilike.%${term}%`);
    }
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);

  return (data ?? []).map(toLead);
}

export { listWorkspaceMembers };

export async function getLead(id: string): Promise<Lead | null> {
  const supabase = await createClient();
  const { workspaceId } = await getCurrentWorkspace();

  const { data, error } = await supabase
    .from("leads")
    .select("*")
    .eq("workspace_id", workspaceId)
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data ? toLead(data) : null;
}

export async function getLeadActivities(leadId: string): Promise<Activity[]> {
  const supabase = await createClient();
  const { workspaceId } = await getCurrentWorkspace();

  const { data, error } = await supabase
    .from("activities")
    .select("*")
    .eq("workspace_id", workspaceId)
    .eq("lead_id", leadId)
    .order("occurred_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []).map(toActivity);
}

export async function createLead(input: LeadInput): Promise<{ id: string }> {
  const supabase = await createClient();
  const { workspaceId } = await getCurrentWorkspace();

  const { data, error } = await supabase
    .from("leads")
    .insert({
      workspace_id: workspaceId,
      name: input.name,
      email: input.email || null,
      phone: input.phone || null,
      company: input.company || null,
      job_title: input.jobTitle || null,
      status: input.status,
      owner_id: input.ownerId || null,
      source: "manual",
    })
    .select("id")
    .single();

  if (error) throw new Error(error.message);

  revalidatePath("/leads");
  return { id: data.id };
}

export async function updateLead(id: string, input: LeadInput): Promise<void> {
  const supabase = await createClient();
  const { workspaceId } = await getCurrentWorkspace();

  const { error } = await supabase
    .from("leads")
    .update({
      name: input.name,
      email: input.email || null,
      phone: input.phone || null,
      company: input.company || null,
      job_title: input.jobTitle || null,
      status: input.status,
      owner_id: input.ownerId || null,
      updated_at: new Date().toISOString(),
    })
    .eq("workspace_id", workspaceId)
    .eq("id", id);

  if (error) throw new Error(error.message);

  revalidatePath("/leads");
  revalidatePath(`/leads/${id}`);
}

export async function deleteLead(id: string): Promise<void> {
  const supabase = await createClient();
  const { workspaceId } = await getCurrentWorkspace();

  const { error } = await supabase
    .from("leads")
    .delete()
    .eq("workspace_id", workspaceId)
    .eq("id", id);

  if (error) throw new Error(error.message);

  revalidatePath("/leads");
}
