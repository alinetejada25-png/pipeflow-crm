import { createClient } from "@/lib/supabase/server";

interface CurrentWorkspace {
  workspaceId: string;
  userId: string;
}

/**
 * Até a Milestone 1 (auth real + criação automática de workspace) estar pronta,
 * usamos um workspace/usuário fixos de desenvolvimento vindos do .env.local.
 * Quando a auth real existir, isso passa a ler a sessão do Supabase Auth.
 */
export async function getCurrentWorkspace(): Promise<CurrentWorkspace> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const { data: membership } = await supabase
      .from("workspace_members")
      .select("workspace_id")
      .eq("user_id", user.id)
      .limit(1)
      .maybeSingle();

    if (membership) {
      return { workspaceId: membership.workspace_id, userId: user.id };
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
