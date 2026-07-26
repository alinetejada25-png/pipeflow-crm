import Link from "next/link";
import { Waypoints } from "lucide-react";

import { NavList } from "@/components/dashboard/nav-list";
import { WorkspaceSwitcher } from "@/components/dashboard/workspace-switcher";

interface SidebarProps {
  onNavigate?: () => void;
}

export function Sidebar({ onNavigate }: SidebarProps) {
  return (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center gap-2 px-4">
        <Link href="/dashboard" onClick={onNavigate} className="flex items-center gap-2 font-semibold">
          <Waypoints className="h-5 w-5" />
          PipeFlow
        </Link>
      </div>

      <div className="px-3 pb-4">
        <WorkspaceSwitcher />
      </div>

      <div className="flex-1 overflow-y-auto pb-4">
        <NavList onNavigate={onNavigate} />
      </div>
    </div>
  );
}
