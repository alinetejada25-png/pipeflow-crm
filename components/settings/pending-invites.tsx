"use client";

import { useState, useTransition } from "react";
import { Loader2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { resendInvite, revokeInvite } from "@/app/(dashboard)/settings/actions";
import type { WorkspaceInvite } from "@/types/workspace";

interface PendingInvitesProps {
  invites: WorkspaceInvite[];
}

export function PendingInvites({ invites }: PendingInvitesProps) {
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [action, setAction] = useState<"resend" | "revoke" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleResend(inviteId: string) {
    setError(null);
    setPendingId(inviteId);
    setAction("resend");
    startTransition(async () => {
      const result = await resendInvite(inviteId);
      if (result.error) setError(result.error);
      setPendingId(null);
    });
  }

  function handleRevoke(inviteId: string) {
    setError(null);
    setPendingId(inviteId);
    setAction("revoke");
    startTransition(async () => {
      const result = await revokeInvite(inviteId);
      if (result.error) setError(result.error);
      setPendingId(null);
    });
  }

  if (invites.length === 0) {
    return <p className="text-sm text-muted-foreground">Nenhum convite pendente.</p>;
  }

  return (
    <div className="flex flex-col gap-3">
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>E-mail</TableHead>
            <TableHead>Papel</TableHead>
            <TableHead>Expira em</TableHead>
            <TableHead className="w-40" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {invites.map((invite) => {
            const isRowPending = isPending && pendingId === invite.id;

            return (
              <TableRow key={invite.id}>
                <TableCell className="font-medium">{invite.email}</TableCell>
                <TableCell>
                  <Badge variant="outline">{invite.role === "admin" ? "Administrador" : "Membro"}</Badge>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {new Date(invite.expiresAt).toLocaleDateString("pt-BR")}
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={isRowPending}
                      onClick={() => handleResend(invite.id)}
                    >
                      {isRowPending && action === "resend" ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        "Reenviar"
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive"
                      disabled={isRowPending}
                      onClick={() => handleRevoke(invite.id)}
                    >
                      {isRowPending && action === "revoke" ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        "Cancelar"
                      )}
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
