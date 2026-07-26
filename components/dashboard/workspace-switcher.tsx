"use client";

import { useState } from "react";
import { Check, ChevronsUpDown, Plus } from "lucide-react";

import { cn } from "@/lib/utils";
import { MOCK_WORKSPACES } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function WorkspaceSwitcher() {
  const [activeWorkspaceId, setActiveWorkspaceId] = useState(MOCK_WORKSPACES[0]!.id);
  const activeWorkspace = MOCK_WORKSPACES.find((ws) => ws.id === activeWorkspaceId)!;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="w-full justify-between px-3 font-medium"
        >
          <span className="truncate">{activeWorkspace.name}</span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-64">
        <DropdownMenuLabel>Workspaces</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {MOCK_WORKSPACES.map((ws) => (
          <DropdownMenuItem
            key={ws.id}
            onClick={() => setActiveWorkspaceId(ws.id)}
            className="justify-between"
          >
            <span className="flex items-center gap-2">
              <span className="truncate">{ws.name}</span>
              {ws.plan === "pro" && (
                <span className="rounded-full bg-secondary px-1.5 py-0.5 text-[10px] font-semibold uppercase text-secondary-foreground">
                  Pro
                </span>
              )}
            </span>
            <Check
              className={cn("h-4 w-4", ws.id === activeWorkspaceId ? "opacity-100" : "opacity-0")}
            />
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem className="gap-2">
          <Plus className="h-4 w-4" />
          Novo workspace
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
