export type WorkspaceRole = "admin" | "membro";
export type WorkspaceInviteStatus = "pending" | "accepted" | "revoked";

export const FREE_PLAN_MEMBER_LIMIT = 2;

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

export interface WorkspaceMemberDetail {
  id: string;
  userId: string;
  name: string;
  email: string;
  role: WorkspaceRole;
  createdAt: string;
}

export interface WorkspaceInvite {
  id: string;
  email: string;
  role: WorkspaceRole;
  status: WorkspaceInviteStatus;
  expiresAt: string;
  createdAt: string;
}
