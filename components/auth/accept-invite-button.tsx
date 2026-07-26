"use client";

import { useState, useTransition } from "react";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { acceptInvite } from "@/app/(auth)/accept-invite/actions";

interface AcceptInviteButtonProps {
  token: string;
}

export function AcceptInviteButton({ token }: AcceptInviteButtonProps) {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    setError(null);
    startTransition(async () => {
      const result = await acceptInvite(token);
      if (result?.error) setError(result.error);
    });
  }

  return (
    <div className="flex flex-col gap-2">
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      <Button onClick={handleClick} disabled={isPending} className="w-full">
        {isPending ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Aceitando...
          </>
        ) : (
          "Aceitar convite"
        )}
      </Button>
    </div>
  );
}
