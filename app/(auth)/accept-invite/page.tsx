import Link from "next/link";
import { MailWarning } from "lucide-react";

import { AcceptInviteButton } from "@/components/auth/accept-invite-button";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";

const REASON_MESSAGES: Record<string, string> = {
  not_found: "Este link de convite não é válido.",
  used: "Este convite já foi utilizado ou cancelado.",
  expired: "Este convite expirou. Peça para o administrador do workspace enviar um novo.",
};

interface AcceptInvitePageProps {
  searchParams: Promise<{ token?: string }>;
}

export default async function AcceptInvitePage({ searchParams }: AcceptInvitePageProps) {
  const { token } = await searchParams;

  if (!token) {
    return <InvalidInviteCard message="Link de convite inválido." />;
  }

  const supabase = await createClient();
  const { data } = await supabase.rpc("get_invite_preview", { p_token: token });
  const preview = data?.[0];

  if (!preview || !preview.is_valid) {
    return (
      <InvalidInviteCard
        message={REASON_MESSAGES[preview?.reason ?? "not_found"] ?? "Este link de convite não é válido."}
      />
    );
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const roleLabel = preview.role === "admin" ? "administrador" : "membro";
  const nextUrl = `/accept-invite?token=${token}`;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Convite para {preview.workspace_name}</CardTitle>
        <CardDescription>
          Você foi convidado para participar do workspace <strong>{preview.workspace_name}</strong> como{" "}
          <strong>{roleLabel}</strong>, usando o e-mail <strong>{preview.email}</strong>.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {user ? (
          <AcceptInviteButton token={token} />
        ) : (
          <>
            <Button asChild className="w-full">
              <Link href={`/signup?next=${encodeURIComponent(nextUrl)}`}>Criar conta</Link>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link href={`/login?next=${encodeURIComponent(nextUrl)}`}>Já tenho conta</Link>
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}

function InvalidInviteCard({ message }: { message: string }) {
  return (
    <Card>
      <CardHeader>
        <MailWarning className="h-8 w-8 text-muted-foreground" />
        <CardTitle>Convite indisponível</CardTitle>
        <CardDescription>{message}</CardDescription>
      </CardHeader>
      <CardContent>
        <Button asChild variant="outline" className="w-full">
          <Link href="/login">Ir para o login</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
