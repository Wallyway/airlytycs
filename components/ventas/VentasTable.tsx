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
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="bg-slate-50 hover:bg-slate-50">
            <TableHead className="text-slate-600 font-semibold text-label-bold uppercase tracking-wider">Fecha</TableHead>
            <TableHead className="text-slate-600 font-semibold text-label-bold uppercase tracking-wider">Cliente</TableHead>
            <TableHead className="text-slate-600 font-semibold text-label-bold uppercase tracking-wider text-right">Total</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {ventas.map((venta) => (
            <TableRow key={venta.id} className="hover:bg-slate-50">
              <TableCell className="text-slate-600">
                {new Date(venta.fecha).toLocaleDateString("es-CO")}
              </TableCell>
              <TableCell className="text-slate-900 font-medium">{venta.clientes?.nombre ?? "-"}</TableCell>
              <TableCell className="text-right font-semibold text-slate-900">{formatoMoneda.format(venta.total)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
