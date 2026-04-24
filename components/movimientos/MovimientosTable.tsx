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
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Fecha</TableHead>
          <TableHead>Producto</TableHead>
          <TableHead>Tipo</TableHead>
          <TableHead>Cantidad</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {movimientos.map((movimiento) => (
          <TableRow key={movimiento.id}>
            <TableCell>
              {new Date(movimiento.fecha).toLocaleDateString("es-CO")}
            </TableCell>
            <TableCell>{movimiento.producto_id ?? "-"}</TableCell>
            <TableCell>
              <Badge className={getTipoBadgeClass(movimiento.tipo)}>
                {movimiento.tipo}
              </Badge>
            </TableCell>
            <TableCell>{movimiento.cantidad}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
