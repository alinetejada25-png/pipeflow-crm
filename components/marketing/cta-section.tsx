import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";

export function CtaSection() {
  return (
    <section className="container pb-24 sm:pb-32">
      <div className="flex flex-col items-center gap-6 rounded-2xl bg-indigo-600 px-6 py-16 text-center text-white sm:py-20">
        <h2 className="max-w-xl text-3xl font-semibold tracking-tight sm:text-4xl">
          Pronto para organizar o seu funil de vendas?
        </h2>
        <p className="max-w-md text-indigo-100">
          Crie sua conta gratuitamente e comece a usar o PipeFlow em minutos, sem
          cartão de crédito.
        </p>
        <Button asChild size="lg" className="bg-white text-indigo-600 hover:bg-white/90">
          <Link href="/signup">
            Começar grátis
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>
    </section>
  );
}
