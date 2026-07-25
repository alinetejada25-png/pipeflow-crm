import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function LeadsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Leads</h1>
        <p className="text-sm text-muted-foreground">
          Gerencie os leads captados pelo seu workspace.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Em construção</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          A listagem de leads chega no próximo milestone.
        </CardContent>
      </Card>
    </div>
  );
}
