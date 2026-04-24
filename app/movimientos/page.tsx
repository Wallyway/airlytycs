import { MovimientosTable } from "@/components/movimientos/MovimientosTable";
import { getMovimientos } from "@/lib/queries/movimientos";

export default async function MovimientosPage() {
  const movimientos = await getMovimientos();

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">
        Movimientos ({movimientos.length})
      </h1>
      <MovimientosTable movimientos={movimientos} />
    </div>
  );
}
