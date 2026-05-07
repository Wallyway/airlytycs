import Link from "next/link";
import { MovimientosTable } from "@/components/movimientos/MovimientosTable";
import { getMovimientos } from "@/lib/queries/movimientos";
import { getProductos } from "@/lib/queries/productos";
import { ArrowDown, ArrowUp, Edit3, Plus } from "lucide-react";

interface MovimientosPageProps {
  searchParams?: Promise<{ nuevo?: string }>;
}

export default async function MovimientosPage({ searchParams }: MovimientosPageProps) {
  const params = searchParams ? await searchParams : undefined;
  const [movimientos, productos] = await Promise.all([
    getMovimientos(),
    getProductos(),
  ]);

  const entradas = movimientos.filter((m) => m.tipo === "entrada").length;
  const salidas = movimientos.filter((m) => m.tipo === "salida").length;
  const ajustes = movimientos.filter((m) => m.tipo === "ajuste").length;
  const openCreateInitially = params?.nuevo === "1";

  return (
    <main className="ml-[260px] min-h-screen">
      <div className="pt-24 px-8 pb-12 space-y-8">
        <div className="flex justify-between items-end">
          <div>
            <h2 className="font-h2 text-h2 text-slate-900 mb-1">Movimientos</h2>
            <p className="text-slate-500 text-body-md font-body-md">
              Historial de entradas, salidas y ajustes de inventario
            </p>
          </div>
          <Link
            href="/movimientos?nuevo=1"
            className="bg-[#6FBFEF] text-slate-900 px-6 py-2.5 rounded-lg font-bold shadow-sm hover:bg-[#90D5FF] hover:text-white active:scale-95 transition-all flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Nuevo Movimiento
          </Link>
        </div>

        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-12 md:col-span-4 bg-white p-6 rounded-xl shadow-[0px_4px_20px_rgba(0,0,0,0.04)] border border-slate-100 flex items-center justify-between">
            <div>
              <p className="text-slate-500 text-label-bold font-label-bold uppercase tracking-wider mb-2">
                ENTRADAS
              </p>
              <h3 className="text-data-display font-data-display text-slate-900">
                {entradas}
              </h3>
            </div>
            <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center text-green-600">
              <ArrowUp className="text-[28px]" />
            </div>
          </div>
          <div className="col-span-12 md:col-span-4 bg-white p-6 rounded-xl shadow-[0px_4px_20px_rgba(0,0,0,0.04)] border border-slate-100 flex items-center justify-between">
            <div>
              <p className="text-slate-500 text-label-bold font-label-bold uppercase tracking-wider mb-2">
                SALIDAS
              </p>
              <h3 className="text-data-display font-data-display text-error">
                {salidas}
              </h3>
            </div>
            <div className="w-12 h-12 bg-error-container/20 rounded-lg flex items-center justify-center text-error">
              <ArrowDown className="text-[28px]" />
            </div>
          </div>
          <div className="col-span-12 md:col-span-4 bg-white p-6 rounded-xl shadow-[0px_4px_20px_rgba(0,0,0,0.04)] border border-slate-100 flex items-center justify-between">
            <div>
              <p className="text-slate-500 text-label-bold font-label-bold uppercase tracking-wider mb-2">
                AJUSTES
              </p>
              <h3 className="text-data-display font-data-display text-slate-900">
                {ajustes}
              </h3>
            </div>
            <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center text-slate-600">
              <Edit3 className="text-[28px]" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-[0px_4px_20px_rgba(0,0,0,0.04)] border border-slate-100 overflow-hidden">
          <div className="p-6 border-b border-slate-100">
            <h3 className="font-h3 text-h3 text-slate-900">
              Historial de Movimientos ({movimientos.length})
            </h3>
          </div>
          <MovimientosTable
            movimientos={movimientos}
          />
        </div>
      </div>
    </main>
  );
}
