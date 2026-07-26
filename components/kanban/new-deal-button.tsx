"use client";

import { useState } from "react";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { DealFormDialog } from "@/components/kanban/deal-form-dialog";
import type { Lead, WorkspaceMember } from "@/types/lead";

interface NewDealButtonProps {
  leads: Lead[];
  members: WorkspaceMember[];
}

export function NewDealButton({ leads, members }: NewDealButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Plus className="h-4 w-4" />
        Novo negócio
      </Button>
      <DealFormDialog open={open} onOpenChange={setOpen} leads={leads} members={members} />
    </>
  );
}
