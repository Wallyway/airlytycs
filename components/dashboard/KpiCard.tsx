import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface KpiCardProps {
  titulo: string;
  valor: string | number;
  descripcion?: string;
  alerta?: boolean;
}

export function KpiCard({ titulo, valor, descripcion, alerta }: KpiCardProps) {
  return (
    <Card
      className={cn(
        "ring-foreground/10",
        alerta ? "ring-red-200 text-red-700" : "text-slate-900"
      )}
    >
      <CardContent className="space-y-1">
        <p className="text-sm text-muted-foreground">{titulo}</p>
        <p className="text-2xl font-semibold">{valor}</p>
        {descripcion ? (
          <p className="text-xs text-muted-foreground">{descripcion}</p>
        ) : null}
      </CardContent>
    </Card>
  );
}
