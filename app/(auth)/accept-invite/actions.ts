"use server";

import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { setActiveWorkspace } from "@/lib/supabase/workspace-actions";

interface AcceptInviteResult {
  error?: string;
}

export async function acceptInvite(token: string): Promise<AcceptInviteResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Você precisa estar logado para aceitar o convite." };
  }

  const { data, error } = await supabase.rpc("accept_workspace_invite", { p_token: token });

  if (error || !data) {
    return { error: error?.message ?? "Não foi possível aceitar o convite." };
  }

  await setActiveWorkspace(data.workspace_id);
  redirect("/dashboard");
}
