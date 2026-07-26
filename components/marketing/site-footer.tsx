import Link from "next/link";

import { Logo } from "@/components/marketing/logo";

const FOOTER_LINKS = [
  { href: "#funcionalidades", label: "Funcionalidades" },
  { href: "#precos", label: "Preços" },
  { href: "/login", label: "Entrar" },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-border/60">
      <div className="container flex flex-col items-center gap-6 py-10 sm:flex-row sm:justify-between">
        <Logo />
        <nav className="flex items-center gap-6">
          {FOOTER_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <p className="text-sm text-muted-foreground">
          © {new Date().getFullYear()} PipeFlow. Todos os direitos reservados.
        </p>
      </div>
    </footer>
  );
}
