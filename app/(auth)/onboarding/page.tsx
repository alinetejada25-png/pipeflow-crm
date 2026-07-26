"use client";

import { FormEvent, useState } from "react";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { createWorkspace } from "./actions";

interface FormErrors {
  workspaceName?: string;
}

export default function OnboardingPage() {
  const [workspaceName, setWorkspaceName] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  function validate(): FormErrors {
    const nextErrors: FormErrors = {};

    if (!workspaceName.trim()) {
      nextErrors.workspaceName = "Informe o nome do workspace.";
    } else if (workspaceName.trim().length < 2) {
      nextErrors.workspaceName = "O nome deve ter pelo menos 2 caracteres.";
    }

    return nextErrors;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextErrors = validate();
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setIsSubmitting(true);
    const result = await createWorkspace(workspaceName.trim());
    if (result?.error) {
      setErrors({ workspaceName: result.error });
      setIsSubmitting(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Crie seu workspace</CardTitle>
        <CardDescription>
          O workspace é onde sua equipe vai gerenciar leads e negócios.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form noValidate onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="workspaceName">Nome do workspace</Label>
            <Input
              id="workspaceName"
              type="text"
              autoComplete="organization"
              placeholder="Minha Empresa"
              value={workspaceName}
              onChange={(event) => setWorkspaceName(event.target.value)}
              aria-invalid={Boolean(errors.workspaceName)}
              disabled={isSubmitting}
            />
            {errors.workspaceName ? (
              <p className="text-sm text-destructive">{errors.workspaceName}</p>
            ) : null}
          </div>

          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Criando workspace...
              </>
            ) : (
              "Continuar"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
