"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

import { createDeal, updateDeal } from "@/app/(dashboard)/pipeline/actions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DEAL_STAGES, DEAL_STAGE_LABELS, type Deal, type DealStage } from "@/types/deal";
import type { Lead, WorkspaceMember } from "@/types/lead";

interface FormErrors {
  title?: string;
  value?: string;
  leadId?: string;
}

interface DealFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  deal?: Deal;
  defaultStage?: DealStage;
  leads: Lead[];
  members: WorkspaceMember[];
}

const NO_OWNER = "none";

export function DealFormDialog({
  open,
  onOpenChange,
  deal,
  defaultStage,
  leads,
  members,
}: DealFormDialogProps) {
  const router = useRouter();
  const isEditing = Boolean(deal);

  const [title, setTitle] = useState("");
  const [value, setValue] = useState("");
  const [leadId, setLeadId] = useState("");
  const [ownerId, setOwnerId] = useState(NO_OWNER);
  const [stage, setStage] = useState<DealStage>("novo_lead");
  const [dueDate, setDueDate] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setTitle(deal?.title ?? "");
    setValue(deal ? String(deal.value) : "");
    setLeadId(deal?.leadId ?? "");
    setOwnerId(deal?.ownerId ?? NO_OWNER);
    setStage(deal?.stage ?? defaultStage ?? "novo_lead");
    setDueDate(deal?.dueDate ? deal.dueDate.slice(0, 10) : "");
    setErrors({});
    setSubmitError(null);
  }, [open, deal, defaultStage]);

  function validate(): FormErrors {
    const nextErrors: FormErrors = {};
    if (!title.trim()) {
      nextErrors.title = "Informe o título do negócio.";
    }
    const numericValue = Number(value);
    if (!value.trim() || Number.isNaN(numericValue) || numericValue <= 0) {
      nextErrors.value = "Informe um valor válido.";
    }
    if (!leadId) {
      nextErrors.leadId = "Selecione o lead vinculado.";
    }
    return nextErrors;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitError(null);

    const nextErrors = validate();
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setIsSubmitting(true);
    try {
      const input = {
        title: title.trim(),
        value: Number(value),
        leadId,
        ownerId: ownerId === NO_OWNER ? undefined : ownerId,
        stage,
        dueDate: dueDate || undefined,
      };

      if (isEditing && deal) {
        await updateDeal(deal.id, input);
      } else {
        await createDeal(input);
      }

      onOpenChange(false);
      router.refresh();
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Erro ao salvar o negócio.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditing ? "Editar negócio" : "Novo negócio"}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Atualize as informações do negócio."
              : "Cadastre um novo negócio no pipeline."}
          </DialogDescription>
        </DialogHeader>

        <form noValidate onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="title">Título</Label>
            <Input
              id="title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              aria-invalid={Boolean(errors.title)}
              disabled={isSubmitting}
            />
            {errors.title ? <p className="text-sm text-destructive">{errors.title}</p> : null}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <Label htmlFor="value">Valor (R$)</Label>
              <Input
                id="value"
                type="number"
                min="0"
                step="0.01"
                value={value}
                onChange={(event) => setValue(event.target.value)}
                aria-invalid={Boolean(errors.value)}
                disabled={isSubmitting}
              />
              {errors.value ? <p className="text-sm text-destructive">{errors.value}</p> : null}
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="dueDate">Prazo</Label>
              <Input
                id="dueDate"
                type="date"
                value={dueDate}
                onChange={(event) => setDueDate(event.target.value)}
                disabled={isSubmitting}
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="leadId">Lead vinculado</Label>
            <Select value={leadId} onValueChange={setLeadId}>
              <SelectTrigger id="leadId" aria-invalid={Boolean(errors.leadId)}>
                <SelectValue placeholder="Selecione um lead" />
              </SelectTrigger>
              <SelectContent>
                {leads.map((lead) => (
                  <SelectItem key={lead.id} value={lead.id}>
                    {lead.name}
                    {lead.company ? ` — ${lead.company}` : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.leadId ? <p className="text-sm text-destructive">{errors.leadId}</p> : null}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <Label htmlFor="ownerId">Responsável</Label>
              <Select value={ownerId} onValueChange={setOwnerId}>
                <SelectTrigger id="ownerId">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NO_OWNER}>Sem responsável</SelectItem>
                  {members.map((member) => (
                    <SelectItem key={member.userId} value={member.userId}>
                      {member.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="stage">Etapa</Label>
              <Select value={stage} onValueChange={(next) => setStage(next as DealStage)}>
                <SelectTrigger id="stage">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DEAL_STAGES.map((option) => (
                    <SelectItem key={option} value={option}>
                      {DEAL_STAGE_LABELS[option]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {submitError ? <p className="text-sm text-destructive">{submitError}</p> : null}

          <DialogFooter>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                "Salvar"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
