import type { LucideIcon } from "lucide-react";
import { BarChart3, KanbanSquare, LayoutDashboard, Settings, Users } from "lucide-react";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

export const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Leads", href: "/leads", icon: Users },
  { label: "Pipeline", href: "/pipeline", icon: KanbanSquare },
  { label: "Relatórios", href: "/reports", icon: BarChart3 },
  { label: "Configurações", href: "/settings", icon: Settings },
];
