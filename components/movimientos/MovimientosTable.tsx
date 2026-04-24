import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Movimiento } from "@/types";

interface MovimientosTableProps {
  movimientos: Movimiento[];
}

function getTipoBadgeClass(tipo: Movimiento["tipo"]) {
  switch (tipo) {
    case "entrada":
      return "bg-emerald-100 text-emerald-700";
    case "salida":
      return "bg-red-100 text-red-700";
    case "ajuste":
      return "bg-amber-100 text-amber-800";
    default:
      return "bg-slate-100 text-slate-700";
  }
}

export function MovimientosTable({ movimientos }: MovimientosTableProps) {
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="bg-slate-50 hover:bg-slate-50">
            <TableHead className="text-slate-600 font-semibold text-label-bold uppercase tracking-wider">Fecha</TableHead>
            <TableHead className="text-slate-600 font-semibold text-label-bold uppercase tracking-wider">Producto</TableHead>
            <TableHead className="text-slate-600 font-semibold text-label-bold uppercase tracking-wider">Tipo</TableHead>
            <TableHead className="text-slate-600 font-semibold text-label-bold uppercase tracking-wider text-right">Cantidad</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {movimientos.map((movimiento) => (
            <TableRow key={movimiento.id} className="hover:bg-slate-50">
              <TableCell className="text-slate-600">
                {new Date(movimiento.fecha).toLocaleDateString("es-CO")}
              </TableCell>
              <TableCell className="text-slate-900 font-medium">{movimiento.productos?.nombre ?? movimiento.producto_id ?? "-"}</TableCell>
              <TableCell>
                <Badge className={getTipoBadgeClass(movimiento.tipo)}>
                  {movimiento.tipo}
                </Badge>
              </TableCell>
              <TableCell className="text-right font-semibold text-slate-900">{movimiento.cantidad}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
