import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { InviteForm } from "@/components/settings/invite-form";
import { MembersTable } from "@/components/settings/members-table";
import { PendingInvites } from "@/components/settings/pending-invites";
import { createClient } from "@/lib/supabase/server";
import {
  getCurrentUserRole,
  getCurrentWorkspace,
  listPendingInvites,
  listWorkspaceMembersDetailed,
} from "@/lib/supabase/workspace";
import { FREE_PLAN_MEMBER_LIMIT } from "@/types/workspace";

export default async function SettingsPage() {
  const { workspaceId, userId } = await getCurrentWorkspace();
  const supabase = await createClient();

  const [{ data: workspace }, role, members, invites] = await Promise.all([
    supabase.from("workspaces").select("name, plan").eq("id", workspaceId).single(),
    getCurrentUserRole(),
    listWorkspaceMembersDetailed(),
    listPendingInvites(),
  ]);

  const isAdmin = role === "admin";
  const plan = workspace?.plan ?? "free";
  const seatsUsed = members.length + invites.length;
  const seatsLimitReached = plan === "free" && seatsUsed >= FREE_PLAN_MEMBER_LIMIT;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Configurações</h1>
        <p className="text-sm text-muted-foreground">
          {workspace?.name ?? "Workspace"} · plano {plan === "pro" ? "Pro" : "Free"}
        </p>
      </div>

      {isAdmin ? (
        <Card>
          <CardHeader>
            <CardTitle>Convidar colaborador</CardTitle>
            <CardDescription>
              Envie um convite por e-mail. O plano Free permite até {FREE_PLAN_MEMBER_LIMIT}{" "}
              colaboradores no workspace.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <InviteForm
              disabled={seatsLimitReached}
              disabledReason={
                seatsLimitReached
                  ? `Limite do plano Free atingido (${FREE_PLAN_MEMBER_LIMIT} colaboradores). Faça upgrade para o plano Pro para convidar mais pessoas.`
                  : undefined
              }
            />
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>Colaboradores</CardTitle>
          <CardDescription>
            {members.length} de {plan === "pro" ? "∞" : FREE_PLAN_MEMBER_LIMIT} colaboradores.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <MembersTable members={members} currentUserId={userId} isAdmin={isAdmin} />
        </CardContent>
      </Card>

      {isAdmin ? (
        <Card>
          <CardHeader>
            <CardTitle>Convites pendentes</CardTitle>
            <CardDescription>Convites aguardando aceite.</CardDescription>
          </CardHeader>
          <CardContent>
            <PendingInvites invites={invites} />
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
