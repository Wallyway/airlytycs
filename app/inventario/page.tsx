import { InventarioTable } from "@/components/inventario/InventarioTable";
import { StockAlerta } from "@/components/inventario/StockAlerta";
import { getInventario, getStockCritico } from "@/lib/queries/inventario";

export default async function InventarioPage() {
  const [inventario, criticos] = await Promise.all([
    getInventario(),
    getStockCritico(),
  ]);

  return (
    <div className="space-y-6">
      <StockAlerta items={criticos} />
      <InventarioTable inventario={inventario} />
    </div>
  );
}
