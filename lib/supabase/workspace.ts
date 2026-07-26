import { cookies } from "next/headers";

import { createClient } from "@/lib/supabase/server";
import type { WorkspaceMember } from "@/types/lead";
import type { WorkspacePlan } from "@/types/supabase";
import type { WorkspaceInvite, WorkspaceMemberDetail, WorkspaceRole } from "@/types/workspace";

const ACTIVE_WORKSPACE_COOKIE = "workspace_id";

interface CurrentWorkspace {
  workspaceId: string;
  userId: string;
}

export interface WorkspaceSummary {
  id: string;
  name: string;
  plan: WorkspacePlan;
}

export interface CurrentUserProfile {
  name: string;
  email: string;
}

/**
 * Até a Milestone 1 (auth real + criação automática de workspace) estar pronta,
 * usamos um workspace/usuário fixos de desenvolvimento vindos do .env.local.
 * Quando a auth real existir, isso passa a ler a sessão do Supabase Auth.
 */
export async function getCurrentWorkspace(): Promise<CurrentWorkspace> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const { data: memberships } = await supabase
      .from("workspace_members")
      .select("workspace_id")
      .eq("user_id", user.id);

    if (memberships && memberships.length > 0) {
      const cookieStore = await cookies();
      const preferredId = cookieStore.get(ACTIVE_WORKSPACE_COOKIE)?.value;
      const active =
        memberships.find((membership) => membership.workspace_id === preferredId) ??
        memberships[0]!;

      return { workspaceId: active.workspace_id, userId: user.id };
    }
  }

  const devWorkspaceId = process.env.DEV_WORKSPACE_ID;
  const devUserId = process.env.DEV_USER_ID;

  if (!devWorkspaceId || !devUserId) {
    throw new Error(
      "Nenhum workspace autenticado encontrado e DEV_WORKSPACE_ID/DEV_USER_ID não configurados em .env.local.",
    );
  }

  return { workspaceId: devWorkspaceId, userId: devUserId };
}

export async function listUserWorkspaces(): Promise<WorkspaceSummary[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return [];

  const { data: memberships } = await supabase
    .from("workspace_members")
    .select("workspace_id")
    .eq("user_id", user.id);

  const workspaceIds = (memberships ?? []).map((membership) => membership.workspace_id);
  if (workspaceIds.length === 0) return [];

  const { data: workspaces } = await supabase
    .from("workspaces")
    .select("id, name, plan")
    .in("id", workspaceIds);

  return workspaces ?? [];
}

export async function listWorkspaceMembers(): Promise<WorkspaceMember[]> {
  const supabase = await createClient();
  const { workspaceId } = await getCurrentWorkspace();

  const { data: memberships, error } = await supabase
    .from("workspace_members")
    .select("user_id")
    .eq("workspace_id", workspaceId);

  if (error) throw new Error(error.message);
  if (!memberships || memberships.length === 0) return [];

  const { data: profiles, error: profilesError } = await supabase
    .from("profiles")
    .select("id, name")
    .in(
      "id",
      memberships.map((membership) => membership.user_id),
    );

  if (profilesError) throw new Error(profilesError.message);

  return (profiles ?? []).map((profile) => ({ userId: profile.id, name: profile.name }));
}

export async function getCurrentUserRole(): Promise<WorkspaceRole | null> {
  const supabase = await createClient();
  const { workspaceId, userId } = await getCurrentWorkspace();

  const { data, error } = await supabase
    .from("workspace_members")
    .select("role")
    .eq("workspace_id", workspaceId)
    .eq("user_id", userId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data?.role ?? null;
}

export async function listWorkspaceMembersDetailed(): Promise<WorkspaceMemberDetail[]> {
  const supabase = await createClient();
  const { workspaceId } = await getCurrentWorkspace();

  const { data: memberships, error } = await supabase
    .from("workspace_members")
    .select("id, user_id, role, created_at")
    .eq("workspace_id", workspaceId)
    .order("created_at", { ascending: true });

  if (error) throw new Error(error.message);
  if (!memberships || memberships.length === 0) return [];

  const { data: profiles, error: profilesError } = await supabase
    .from("profiles")
    .select("id, name, email")
    .in(
      "id",
      memberships.map((membership) => membership.user_id),
    );

  if (profilesError) throw new Error(profilesError.message);

  const profileById = new Map((profiles ?? []).map((profile) => [profile.id, profile]));

  return memberships.map((membership) => {
    const profile = profileById.get(membership.user_id);
    return {
      id: membership.id,
      userId: membership.user_id,
      name: profile?.name ?? "Usuário",
      email: profile?.email ?? "",
      role: membership.role,
      createdAt: membership.created_at,
    };
  });
}

export async function listPendingInvites(): Promise<WorkspaceInvite[]> {
  const supabase = await createClient();
  const { workspaceId } = await getCurrentWorkspace();

  const { data, error } = await supabase
    .from("workspace_invites")
    .select("id, email, role, status, expires_at, created_at")
    .eq("workspace_id", workspaceId)
    .eq("status", "pending")
    .order("created_at", { ascending: true });

  if (error) throw new Error(error.message);

  return (data ?? []).map((invite) => ({
    id: invite.id,
    email: invite.email,
    role: invite.role,
    status: invite.status,
    expiresAt: invite.expires_at,
    createdAt: invite.created_at,
  }));
}

export async function getCurrentUserProfile(): Promise<CurrentUserProfile> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { name: "Usuário", email: "" };
  }

  const name = (user.user_metadata?.name as string | undefined) ?? user.email ?? "Usuário";
  return { name, email: user.email ?? "" };
}
