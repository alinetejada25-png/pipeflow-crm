const STATS = [
  { value: "+47%", label: "taxa de conversão" },
  { value: "3.2x", label: "mais leads qualificados" },
  { value: "-62%", label: "no ciclo de venda" },
  { value: "1200+", label: "times usando o PipeFlow" },
];

export function Stats() {
  return (
    <section className="border-y border-border/60 bg-secondary/40">
      <div className="container grid grid-cols-2 gap-8 py-12 sm:grid-cols-4 sm:py-16">
        {STATS.map((stat) => (
          <div key={stat.label} className="flex flex-col items-center text-center">
            <span className="text-3xl font-semibold text-indigo-500 sm:text-4xl">
              {stat.value}
            </span>
            <span className="mt-1 text-sm text-muted-foreground">{stat.label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
