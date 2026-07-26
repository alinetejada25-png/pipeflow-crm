import { cookies } from "next/headers";

import { createClient } from "@/lib/supabase/server";
import type { WorkspacePlan } from "@/types/supabase";

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
