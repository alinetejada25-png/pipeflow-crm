"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

export async function setActiveWorkspace(workspaceId: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set("workspace_id", workspaceId, {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
  });

  revalidatePath("/", "layout");
}
