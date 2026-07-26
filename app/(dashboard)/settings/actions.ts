"use server";

import { revalidatePath } from "next/cache";

import { getResendClient } from "@/lib/resend/client";
import { renderInviteEmail } from "@/lib/resend/invite-email";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUserProfile, getCurrentUserRole, getCurrentWorkspace } from "@/lib/supabase/workspace";
import { FREE_PLAN_MEMBER_LIMIT, type WorkspaceRole } from "@/types/workspace";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface ActionResult {
  error?: string;
}

async function requireAdmin(): Promise<{ workspaceId: string; userId: string } | { error: string }> {
  const { workspaceId, userId } = await getCurrentWorkspace();
  const role = await getCurrentUserRole();

  if (role !== "admin") {
    return { error: "Apenas administradores podem gerenciar colaboradores." };
  }

  return { workspaceId, userId };
}

function buildAcceptUrl(token: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  return `${baseUrl}/accept-invite?token=${token}`;
}

export async function inviteMember(email: string, role: WorkspaceRole): Promise<ActionResult> {
  const trimmedEmail = email.trim().toLowerCase();

  if (!EMAIL_REGEX.test(trimmedEmail)) {
    return { error: "Informe um e-mail válido." };
  }

  const auth = await requireAdmin();
  if ("error" in auth) return auth;
  const { workspaceId } = auth;

  const supabase = await createClient();

  const { data: workspace, error: workspaceError } = await supabase
    .from("workspaces")
    .select("name, plan")
    .eq("id", workspaceId)
    .single();

  if (workspaceError || !workspace) {
    return { error: "Não foi possível carregar o workspace." };
  }

  const [{ count: memberCount }, { count: pendingInviteCount }] = await Promise.all([
    supabase
      .from("workspace_members")
      .select("id", { count: "exact", head: true })
      .eq("workspace_id", workspaceId),
    supabase
      .from("workspace_invites")
      .select("id", { count: "exact", head: true })
      .eq("workspace_id", workspaceId)
      .eq("status", "pending"),
  ]);

  if (
    workspace.plan === "free" &&
    (memberCount ?? 0) + (pendingInviteCount ?? 0) >= FREE_PLAN_MEMBER_LIMIT
  ) {
    return {
      error: `O plano Free permite no máximo ${FREE_PLAN_MEMBER_LIMIT} colaboradores. Faça upgrade para o plano Pro para convidar mais pessoas.`,
    };
  }

  const { data: profileByEmail } = await supabase
    .from("profiles")
    .select("id")
    .eq("email", trimmedEmail)
    .maybeSingle();

  if (profileByEmail) {
    const { data: existingMembership } = await supabase
      .from("workspace_members")
      .select("id")
      .eq("workspace_id", workspaceId)
      .eq("user_id", profileByEmail.id)
      .maybeSingle();

    if (existingMembership) {
      return { error: "Este e-mail já faz parte do workspace." };
    }
  }

  const inviter = await getCurrentUserProfile();

  const { data: invite, error: inviteError } = await supabase
    .from("workspace_invites")
    .insert({ workspace_id: workspaceId, email: trimmedEmail, role, invited_by: auth.userId })
    .select("token")
    .single();

  if (inviteError || !invite) {
    if (inviteError?.code === "23505") {
      return { error: "Já existe um convite pendente para este e-mail." };
    }
    return { error: "Não foi possível criar o convite. Tente novamente." };
  }

  try {
    const { subject, html } = renderInviteEmail({
      workspaceName: workspace.name,
      inviterName: inviter.name,
      role,
      acceptUrl: buildAcceptUrl(invite.token),
    });

    await getResendClient().emails.send({
      from: process.env.RESEND_FROM_EMAIL ?? "PipeFlow <onboarding@resend.dev>",
      to: trimmedEmail,
      subject,
      html,
    });
  } catch {
    return { error: "Convite criado, mas houve falha ao enviar o e-mail. Use reenviar depois." };
  }

  revalidatePath("/settings");
  return {};
}

export async function resendInvite(inviteId: string): Promise<ActionResult> {
  const auth = await requireAdmin();
  if ("error" in auth) return auth;
  const { workspaceId } = auth;

  const supabase = await createClient();

  const { data: invite, error: inviteError } = await supabase
    .from("workspace_invites")
    .select("email, role, token, status")
    .eq("id", inviteId)
    .eq("workspace_id", workspaceId)
    .single();

  if (inviteError || !invite || invite.status !== "pending") {
    return { error: "Convite não encontrado ou já utilizado." };
  }

  const { data: workspace } = await supabase
    .from("workspaces")
    .select("name")
    .eq("id", workspaceId)
    .single();

  const { error: updateError } = await supabase
    .from("workspace_invites")
    .update({ expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() })
    .eq("id", inviteId);

  if (updateError) {
    return { error: "Não foi possível renovar o convite." };
  }

  const inviter = await getCurrentUserProfile();

  try {
    const { subject, html } = renderInviteEmail({
      workspaceName: workspace?.name ?? "PipeFlow",
      inviterName: inviter.name,
      role: invite.role,
      acceptUrl: buildAcceptUrl(invite.token),
    });

    await getResendClient().emails.send({
      from: process.env.RESEND_FROM_EMAIL ?? "PipeFlow <onboarding@resend.dev>",
      to: invite.email,
      subject,
      html,
    });
  } catch {
    return { error: "Não foi possível reenviar o e-mail. Tente novamente." };
  }

  revalidatePath("/settings");
  return {};
}

export async function revokeInvite(inviteId: string): Promise<ActionResult> {
  const auth = await requireAdmin();
  if ("error" in auth) return auth;
  const { workspaceId } = auth;

  const supabase = await createClient();
  const { error } = await supabase
    .from("workspace_invites")
    .update({ status: "revoked" })
    .eq("id", inviteId)
    .eq("workspace_id", workspaceId);

  if (error) {
    return { error: "Não foi possível cancelar o convite." };
  }

  revalidatePath("/settings");
  return {};
}

export async function updateMemberRole(memberId: string, role: WorkspaceRole): Promise<ActionResult> {
  const auth = await requireAdmin();
  if ("error" in auth) return auth;
  const { workspaceId } = auth;

  const supabase = await createClient();

  const { data: member, error: memberError } = await supabase
    .from("workspace_members")
    .select("role")
    .eq("id", memberId)
    .eq("workspace_id", workspaceId)
    .single();

  if (memberError || !member) {
    return { error: "Colaborador não encontrado." };
  }

  if (member.role === "admin" && role !== "admin") {
    const { count: adminCount } = await supabase
      .from("workspace_members")
      .select("id", { count: "exact", head: true })
      .eq("workspace_id", workspaceId)
      .eq("role", "admin");

    if ((adminCount ?? 0) <= 1) {
      return { error: "O workspace precisa de pelo menos um administrador." };
    }
  }

  const { error } = await supabase
    .from("workspace_members")
    .update({ role })
    .eq("id", memberId)
    .eq("workspace_id", workspaceId);

  if (error) {
    return { error: "Não foi possível atualizar o papel do colaborador." };
  }

  revalidatePath("/settings");
  return {};
}

export async function removeMember(memberId: string): Promise<ActionResult> {
  const auth = await requireAdmin();
  if ("error" in auth) return auth;
  const { workspaceId } = auth;

  const supabase = await createClient();

  const { data: member, error: memberError } = await supabase
    .from("workspace_members")
    .select("role")
    .eq("id", memberId)
    .eq("workspace_id", workspaceId)
    .single();

  if (memberError || !member) {
    return { error: "Colaborador não encontrado." };
  }

  if (member.role === "admin") {
    const { count: adminCount } = await supabase
      .from("workspace_members")
      .select("id", { count: "exact", head: true })
      .eq("workspace_id", workspaceId)
      .eq("role", "admin");

    if ((adminCount ?? 0) <= 1) {
      return { error: "O workspace precisa de pelo menos um administrador." };
    }
  }

  const { error } = await supabase
    .from("workspace_members")
    .delete()
    .eq("id", memberId)
    .eq("workspace_id", workspaceId);

  if (error) {
    return { error: "Não foi possível remover o colaborador." };
  }

  revalidatePath("/settings");
  return {};
}
