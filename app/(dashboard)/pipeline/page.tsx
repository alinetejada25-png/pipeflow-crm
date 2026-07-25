import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function PipelinePage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Pipeline</h1>
        <p className="text-sm text-muted-foreground">
          Acompanhe seus negócios em cada etapa do funil.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Em construção</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          O board Kanban com drag-and-drop chega no próximo milestone.
        </CardContent>
      </Card>
    </div>
  );
}
