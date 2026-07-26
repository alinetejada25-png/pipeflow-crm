import Link from "next/link";
import { ArrowRight, PlayCircle } from "lucide-react";

import { Button } from "@/components/ui/button";

export function Hero() {
  return (
    <section className="container flex flex-col items-center gap-6 py-24 text-center sm:py-32">
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
        <span className="inline-flex items-center rounded-full border border-indigo-600/30 bg-indigo-600/10 px-3 py-1 text-xs font-medium text-indigo-400">
          Feito para pequenas e médias empresas
        </span>
      </div>

      <h1 className="max-w-3xl animate-in fade-in slide-in-from-bottom-4 text-4xl font-semibold tracking-tight duration-700 [animation-delay:100ms] sm:text-6xl">
        Feche mais negócios sem perder nenhum lead pelo caminho
      </h1>

      <p className="max-w-xl animate-in fade-in slide-in-from-bottom-4 text-balance text-lg text-muted-foreground duration-700 [animation-delay:200ms]">
        Pipeline visual, gestão de leads e respostas de WhatsApp em um só lugar —
        para o seu time vender mais rápido, sem planilha e sem perder contexto.
      </p>

      <div className="flex animate-in fade-in slide-in-from-bottom-4 flex-col gap-3 duration-700 [animation-delay:300ms] sm:flex-row">
        <Button
          asChild
          size="lg"
          className="bg-indigo-600 text-white hover:bg-indigo-600/90"
        >
          <Link href="/signup">
            Começar grátis
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
        <Button asChild size="lg" variant="outline">
          <Link href="#funcionalidades">
            <PlayCircle className="h-4 w-4" />
            Ver como funciona
          </Link>
        </Button>
      </div>
    </section>
  );
}
