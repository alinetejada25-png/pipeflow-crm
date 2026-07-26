import type { WorkspaceRole } from "@/types/workspace";

const ROLE_LABELS: Record<WorkspaceRole, string> = {
  admin: "administrador",
  membro: "membro",
};

interface InviteEmailParams {
  workspaceName: string;
  inviterName: string;
  role: WorkspaceRole;
  acceptUrl: string;
}

export function renderInviteEmail({
  workspaceName,
  inviterName,
  role,
  acceptUrl,
}: InviteEmailParams): { subject: string; html: string } {
  const roleLabel = ROLE_LABELS[role];

  return {
    subject: `${inviterName} convidou você para o workspace ${workspaceName} no PipeFlow`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; color: #1f2937;">
        <h1 style="font-size: 20px; margin-bottom: 8px;">Você foi convidado para o PipeFlow</h1>
        <p style="font-size: 14px; line-height: 1.6;">
          <strong>${inviterName}</strong> convidou você para participar do workspace
          <strong>${workspaceName}</strong> como <strong>${roleLabel}</strong>.
        </p>
        <p style="margin: 24px 0;">
          <a
            href="${acceptUrl}"
            style="background-color: #4f46e5; color: #ffffff; padding: 10px 20px; border-radius: 6px; text-decoration: none; font-size: 14px; font-weight: 600;"
          >
            Aceitar convite
          </a>
        </p>
        <p style="font-size: 12px; color: #6b7280;">
          Este convite expira em 7 dias. Se você não esperava este e-mail, pode ignorá-lo.
        </p>
      </div>
    `,
  };
}
