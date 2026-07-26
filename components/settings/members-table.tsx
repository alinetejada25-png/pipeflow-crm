"use client";

import { useState, useTransition } from "react";
import { Loader2, MoreHorizontal } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { removeMember, updateMemberRole } from "@/app/(dashboard)/settings/actions";
import type { WorkspaceMemberDetail, WorkspaceRole } from "@/types/workspace";

interface MembersTableProps {
  members: WorkspaceMemberDetail[];
  currentUserId: string;
  isAdmin: boolean;
}

export function MembersTable({ members, currentUserId, isAdmin }: MembersTableProps) {
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleRoleChange(memberId: string, role: WorkspaceRole) {
    setError(null);
    setPendingId(memberId);
    startTransition(async () => {
      const result = await updateMemberRole(memberId, role);
      if (result.error) setError(result.error);
      setPendingId(null);
    });
  }

  function handleRemove(memberId: string) {
    setError(null);
    setPendingId(memberId);
    startTransition(async () => {
      const result = await removeMember(memberId);
      if (result.error) setError(result.error);
      setPendingId(null);
    });
  }

  return (
    <div className="flex flex-col gap-3">
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>E-mail</TableHead>
            <TableHead>Papel</TableHead>
            {isAdmin ? <TableHead className="w-12" /> : null}
          </TableRow>
        </TableHeader>
        <TableBody>
          {members.map((member) => {
            const isSelf = member.userId === currentUserId;
            const isRowPending = isPending && pendingId === member.id;

            return (
              <TableRow key={member.id}>
                <TableCell className="font-medium">
                  {member.name}
                  {isSelf ? <span className="ml-2 text-xs text-muted-foreground">(você)</span> : null}
                </TableCell>
                <TableCell className="text-muted-foreground">{member.email}</TableCell>
                <TableCell>
                  <Badge variant={member.role === "admin" ? "default" : "secondary"}>
                    {member.role === "admin" ? "Administrador" : "Membro"}
                  </Badge>
                </TableCell>
                {isAdmin ? (
                  <TableCell>
                    {isRowPending ? (
                      <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                    ) : (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Ações</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {member.role === "admin" ? (
                            <DropdownMenuItem onClick={() => handleRoleChange(member.id, "membro")}>
                              Tornar membro
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem onClick={() => handleRoleChange(member.id, "admin")}>
                              Tornar administrador
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={() => handleRemove(member.id)}
                          >
                            Remover do workspace
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </TableCell>
                ) : null}
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
