import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Inventario } from "@/types";

interface InventarioTableProps {
  inventario: Inventario[];
}

function getEstado(stockDisponible: number, stockMinimo: number) {
  if (stockDisponible < stockMinimo) {
    return { label: "Crítico", className: "bg-red-100 text-red-700" };
  }
  if (stockDisponible < stockMinimo * 2) {
    return { label: "Bajo", className: "bg-amber-100 text-amber-800" };
  }
  return { label: "OK", className: "bg-emerald-100 text-emerald-700" };
}

export function InventarioTable({ inventario }: InventarioTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Producto</TableHead>
          <TableHead>Ubicación</TableHead>
          <TableHead>Stock disponible</TableHead>
          <TableHead>Stock mínimo</TableHead>
          <TableHead>Estado</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {inventario.map((item) => {
          const estado = getEstado(item.stock_disponible, item.stock_minimo);

          return (
            <TableRow key={item.id}>
              <TableCell className="font-medium">
                {item.productos?.nombre ?? item.producto_id}
              </TableCell>
              <TableCell>{item.ubicacion ?? "-"}</TableCell>
              <TableCell>{item.stock_disponible}</TableCell>
              <TableCell>{item.stock_minimo}</TableCell>
              <TableCell>
                <Badge className={estado.className}>{estado.label}</Badge>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
