"use client";

import { FormEvent, useState, useTransition } from "react";
import { Loader2, UserPlus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { inviteMember } from "@/app/(dashboard)/settings/actions";
import type { WorkspaceRole } from "@/types/workspace";

interface InviteFormProps {
  disabled: boolean;
  disabledReason?: string;
}

export function InviteForm({ disabled, disabledReason }: InviteFormProps) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<WorkspaceRole>("membro");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    startTransition(async () => {
      const result = await inviteMember(email, role);
      if (result.error) {
        setError(result.error);
        return;
      }
      setSuccess(`Convite enviado para ${email}.`);
      setEmail("");
      setRole("membro");
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {disabled && disabledReason ? (
        <p className="text-sm text-muted-foreground">{disabledReason}</p>
      ) : null}
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      {success ? <p className="text-sm text-emerald-600 dark:text-emerald-400">{success}</p> : null}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
        <div className="flex flex-1 flex-col gap-2">
          <Label htmlFor="invite-email">E-mail</Label>
          <Input
            id="invite-email"
            type="email"
            placeholder="colega@empresa.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            disabled={disabled || isPending}
            required
          />
        </div>

        <div className="flex w-full flex-col gap-2 sm:w-40">
          <Label htmlFor="invite-role">Papel</Label>
          <Select value={role} onValueChange={(value) => setRole(value as WorkspaceRole)}>
            <SelectTrigger id="invite-role" disabled={disabled || isPending}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="membro">Membro</SelectItem>
              <SelectItem value="admin">Administrador</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button type="submit" disabled={disabled || isPending} className="gap-2">
          {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
          Convidar
        </Button>
      </div>
    </form>
  );
}
