import Link from "next/link";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { VentasTable } from "@/components/ventas/VentasTable";
import { getClientes } from "@/lib/queries/clientes";
import { getTotalVentasMes, getVentas } from "@/lib/queries/ventas";
import { DollarSign, Plus, TrendingUp } from "lucide-react";

const formatoMoneda = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
});

interface VentasPageProps {
  searchParams?: Promise<{ nuevo?: string }>;
}

export default async function VentasPage({ searchParams }: VentasPageProps) {
  const params = searchParams ? await searchParams : undefined;
  const [ventas, totalVentasMes, clientes] = await Promise.all([
    getVentas(),
    getTotalVentasMes(),
    getClientes(),
  ]);

  const totalVentas = ventas.reduce((acc, v) => acc + Number(v.total), 0);
  const promedioPorVenta = ventas.length > 0 ? totalVentas / ventas.length : 0;
  const openCreateInitially = params?.nuevo === "1";

  return (
    <main className="ml-[260px] min-h-screen">
      <div className="pt-24 px-8 pb-12 space-y-8">
        <div className="flex justify-between items-end">
          <div>
            <h2 className="font-h2 text-h2 text-slate-900 mb-1">Ventas</h2>
            <p className="text-slate-500 text-body-md font-body-md">
              Registro y seguimiento de todas las transacciones de ventas
            </p>
          </div>
          <Link
            href="/ventas?nuevo=1"
            className="bg-[#6FBFEF] text-slate-900 px-6 py-2.5 rounded-lg font-bold shadow-sm hover:bg-[#90D5FF] hover:text-white active:scale-95 transition-all flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Nueva Venta
          </Link>
        </div>

        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-12 md:col-span-4 bg-white p-6 rounded-xl shadow-[0px_4px_20px_rgba(0,0,0,0.04)] border border-slate-100 flex items-center justify-between">
            <div>
              <p className="text-slate-500 text-label-bold font-label-bold uppercase tracking-wider mb-2">
                VENTAS DEL MES
              </p>
              <h3 className="text-data-display font-data-display text-slate-900">
                {formatoMoneda.format(totalVentasMes)}
              </h3>
            </div>
            <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600">
              <DollarSign className="text-[28px]" />
            </div>
          </div>
          <div className="col-span-12 md:col-span-4 bg-white p-6 rounded-xl shadow-[0px_4px_20px_rgba(0,0,0,0.04)] border border-slate-100 flex items-center justify-between">
            <div>
              <p className="text-slate-500 text-label-bold font-label-bold uppercase tracking-wider mb-2">
                TOTAL VENTAS
              </p>
              <h3 className="text-data-display font-data-display text-tertiary">
                {formatoMoneda.format(totalVentas)}
              </h3>
            </div>
            <div className="w-12 h-12 bg-tertiary-container/10 rounded-lg flex items-center justify-center text-tertiary">
              <TrendingUp className="text-[28px]" />
            </div>
          </div>
          <div className="col-span-12 md:col-span-4 bg-white p-6 rounded-xl shadow-[0px_4px_20px_rgba(0,0,0,0.04)] border border-slate-100 flex items-center justify-between">
            <div>
              <p className="text-slate-500 text-label-bold font-label-bold uppercase tracking-wider mb-2">
                PROMEDIO POR VENTA
              </p>
              <h3 className="text-data-display font-data-display text-slate-900">
                {formatoMoneda.format(promedioPorVenta)}
              </h3>
            </div>
            <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center text-slate-600">
              <DollarSign className="text-[28px]" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-[0px_4px_20px_rgba(0,0,0,0.04)] border border-slate-100 overflow-hidden">
          <div className="p-6 border-b border-slate-100">
            <h3 className="font-h3 text-h3 text-slate-900">
              Registro de Ventas ({ventas.length})
            </h3>
          </div>
          <VentasTable
            ventas={ventas}
          />
        </div>
      </div>
    </main>
  );
}
