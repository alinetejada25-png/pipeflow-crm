"use client";

import { useRouter } from "next/navigation";
import { FormEvent, ReactNode, useState } from "react";
import { Loader2 } from "lucide-react";

import { createLead, updateLead } from "@/app/(dashboard)/leads/actions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { LEAD_STATUSES, LEAD_STATUS_LABELS, type Lead, type LeadStatus } from "@/types/lead";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface FormErrors {
  name?: string;
  email?: string;
}

interface LeadFormDialogProps {
  trigger: ReactNode;
  lead?: Lead;
}

export function LeadFormDialog({ trigger, lead }: LeadFormDialogProps) {
  const router = useRouter();
  const isEditing = Boolean(lead);

  const [open, setOpen] = useState(false);
  const [name, setName] = useState(lead?.name ?? "");
  const [email, setEmail] = useState(lead?.email ?? "");
  const [phone, setPhone] = useState(lead?.phone ?? "");
  const [company, setCompany] = useState(lead?.company ?? "");
  const [jobTitle, setJobTitle] = useState(lead?.jobTitle ?? "");
  const [status, setStatus] = useState<LeadStatus>(lead?.status ?? "novo");
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  function resetForm() {
    setName(lead?.name ?? "");
    setEmail(lead?.email ?? "");
    setPhone(lead?.phone ?? "");
    setCompany(lead?.company ?? "");
    setJobTitle(lead?.jobTitle ?? "");
    setStatus(lead?.status ?? "novo");
    setErrors({});
    setSubmitError(null);
  }

  function validate(): FormErrors {
    const nextErrors: FormErrors = {};
    if (!name.trim()) {
      nextErrors.name = "Informe o nome do lead.";
    }
    if (email.trim() && !EMAIL_REGEX.test(email)) {
      nextErrors.email = "Informe um e-mail válido.";
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
        name: name.trim(),
        email: email.trim() || undefined,
        phone: phone.trim() || undefined,
        company: company.trim() || undefined,
        jobTitle: jobTitle.trim() || undefined,
        status,
      };

      if (isEditing && lead) {
        await updateLead(lead.id, input);
      } else {
        await createLead(input);
      }

      setOpen(false);
      router.refresh();
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Erro ao salvar o lead.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen);
        if (!nextOpen) resetForm();
      }}
    >
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditing ? "Editar lead" : "Novo lead"}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Atualize as informações do lead."
              : "Cadastre um novo lead no seu workspace."}
          </DialogDescription>
        </DialogHeader>

        <form noValidate onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="name">Nome</Label>
            <Input
              id="name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              aria-invalid={Boolean(errors.name)}
              disabled={isSubmitting}
            />
            {errors.name ? <p className="text-sm text-destructive">{errors.name}</p> : null}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                aria-invalid={Boolean(errors.email)}
                disabled={isSubmitting}
              />
              {errors.email ? <p className="text-sm text-destructive">{errors.email}</p> : null}
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="phone">Telefone</Label>
              <Input
                id="phone"
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                disabled={isSubmitting}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <Label htmlFor="company">Empresa</Label>
              <Input
                id="company"
                value={company}
                onChange={(event) => setCompany(event.target.value)}
                disabled={isSubmitting}
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="jobTitle">Cargo</Label>
              <Input
                id="jobTitle"
                value={jobTitle}
                onChange={(event) => setJobTitle(event.target.value)}
                disabled={isSubmitting}
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="status">Status</Label>
            <Select value={status} onValueChange={(value) => setStatus(value as LeadStatus)}>
              <SelectTrigger id="status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {LEAD_STATUSES.map((option) => (
                  <SelectItem key={option} value={option}>
                    {LEAD_STATUS_LABELS[option]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
