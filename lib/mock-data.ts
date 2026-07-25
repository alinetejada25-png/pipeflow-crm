import type { CurrentUser, Workspace } from "@/types/workspace";

export const MOCK_WORKSPACES: Workspace[] = [
  { id: "ws_1", name: "Aline Consultoria", plan: "pro" },
  { id: "ws_2", name: "Studio Nômade", plan: "free" },
  { id: "ws_3", name: "TechBridge Soluções", plan: "free" },
];

export const MOCK_CURRENT_USER: CurrentUser = {
  id: "user_1",
  name: "Aline Tejada",
  email: "aline.tejada25@gmail.com",
  role: "admin",
};
