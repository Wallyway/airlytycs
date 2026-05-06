import Link from "next/link";
import { InventarioTable } from "@/components/inventario/InventarioTable";
import { StockAlerta } from "@/components/inventario/StockAlerta";
import { getInventario, getStockCritico } from "@/lib/queries/inventario";
import { getProductos } from "@/lib/queries/productos";
import { AlertTriangle, CheckCircle, LayoutGrid, Plus } from "lucide-react";

interface InventarioPageProps {
  searchParams?: Promise<{ nuevo?: string }>;
}

export default async function InventarioPage({ searchParams }: InventarioPageProps) {
  const params = searchParams ? await searchParams : undefined;
  const [inventario, criticos, productos] = await Promise.all([
    getInventario(),
    getStockCritico(),
    getProductos(),
  ]);

  const totalProductos = inventario.length;
  const conStock = inventario.filter((item) => item.stock_disponible > 0).length;
  const criticosCount = criticos.length;
  const openCreateInitially = params?.nuevo === "1";

  return (
    <main className="ml-[260px] min-h-screen">
      <div className="pt-24 px-8 pb-12 space-y-8">
        <div className="flex justify-between items-end">
          <div>
            <h2 className="font-h2 text-h2 text-slate-900 mb-1">Inventario</h2>
            <p className="text-slate-500 text-body-md font-body-md">
              Control de stock y disponibilidad de productos médicos
            </p>
          </div>
          <Link
            href="/inventario?nuevo=1"
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
                TOTAL PRODUCTOS
              </p>
              <h3 className="text-data-display font-data-display text-slate-900">
                {totalProductos}
              </h3>
            </div>
            <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600">
              <LayoutGrid className="text-[28px]" />
            </div>
          </div>
          <div className="col-span-12 md:col-span-4 bg-white p-6 rounded-xl shadow-[0px_4px_20px_rgba(0,0,0,0.04)] border border-slate-100 flex items-center justify-between">
            <div>
              <p className="text-slate-500 text-label-bold font-label-bold uppercase tracking-wider mb-2">
                CON STOCK DISPONIBLE
              </p>
              <h3 className="text-data-display font-data-display text-tertiary">
                {conStock}
              </h3>
            </div>
            <div className="w-12 h-12 bg-tertiary-container/10 rounded-lg flex items-center justify-center text-tertiary">
              <CheckCircle className="text-[28px]" />
            </div>
          </div>
          <div className="col-span-12 md:col-span-4 bg-white p-6 rounded-xl shadow-[0px_4px_20px_rgba(0,0,0,0.04)] border border-slate-100 flex items-center justify-between">
            <div>
              <p className="text-slate-500 text-label-bold font-label-bold uppercase tracking-wider mb-2">
                STOCK CRÍTICO
              </p>
              <h3 className="text-data-display font-data-display text-error">
                {criticosCount}
              </h3>
            </div>
            <div className="w-12 h-12 bg-error-container/20 rounded-lg flex items-center justify-center text-error">
              <AlertTriangle className="text-[28px]" />
            </div>
          </div>
        </div>

        <StockAlerta items={criticos} />
        
        <div className="bg-white rounded-xl shadow-[0px_4px_20px_rgba(0,0,0,0.04)] border border-slate-100 overflow-hidden">
          <div className="p-6 border-b border-slate-100">
            <h3 className="font-h3 text-h3 text-slate-900">
              Productos en Inventario
            </h3>
          </div>
          <InventarioTable
            inventario={inventario}
            productos={productos}
            openCreateInitially={openCreateInitially}
          />
        </div>
      </div>
    </main>
  );
}
