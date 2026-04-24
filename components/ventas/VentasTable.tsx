import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Venta } from "@/types";

interface VentasTableProps {
  ventas: Venta[];
}

const formatoMoneda = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
});

export function VentasTable({ ventas }: VentasTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Fecha</TableHead>
          <TableHead>Cliente</TableHead>
          <TableHead>Total</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {ventas.map((venta) => (
          <TableRow key={venta.id}>
            <TableCell>
              {new Date(venta.fecha).toLocaleDateString("es-CO")}
            </TableCell>
            <TableCell>{venta.clientes?.nombre ?? "-"}</TableCell>
            <TableCell>{formatoMoneda.format(venta.total)}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
