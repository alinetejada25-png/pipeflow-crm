"use server";

import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

export async function createWorkspace(name: string): Promise<{ error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { error } = await supabase.rpc("create_workspace", { p_name: name });

  if (error) {
    return { error: "Não foi possível criar o workspace. Tente novamente." };
  }

  redirect("/dashboard");
}
