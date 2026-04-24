import { KpiCard } from "@/components/dashboard/KpiCard";
import { VentasTable } from "@/components/ventas/VentasTable";
import { getTotalVentasMes, getVentas } from "@/lib/queries/ventas";

const formatoMoneda = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
});

export default async function VentasPage() {
  const [ventas, totalVentasMes] = await Promise.all([
    getVentas(),
    getTotalVentasMes(),
  ]);

  return (
    <div className="space-y-6">
      <KpiCard titulo="Ventas del mes" valor={formatoMoneda.format(totalVentasMes)} />
      <div className="space-y-3">
        <div className="flex items-baseline gap-2">
          <h1 className="text-2xl font-semibold">Ventas</h1>
          <span className="text-sm text-muted-foreground">({ventas.length})</span>
        </div>
        <VentasTable ventas={ventas} />
      </div>
    </div>
  );
}
