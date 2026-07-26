export type WorkspaceRole = "admin" | "membro";

export interface Workspace {
  id: string;
  name: string;
  plan: "free" | "pro";
}

export interface CurrentUser {
  id: string;
  name: string;
  email: string;
  role: WorkspaceRole;
  avatarUrl?: string;
}
