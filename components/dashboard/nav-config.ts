import type { LucideIcon } from "lucide-react";
import { KanbanSquare, LayoutDashboard, Settings, Users } from "lucide-react";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

export const NAV_ITEMS: NavItem[] = [
  { label: "Leads", href: "/leads", icon: Users },
  { label: "Pipeline", href: "/pipeline", icon: KanbanSquare },
  { label: "Relatórios", href: "/reports", icon: LayoutDashboard },
  { label: "Configurações", href: "/settings", icon: Settings },
];
