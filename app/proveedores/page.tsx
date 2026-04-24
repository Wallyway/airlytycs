import { ProveedoresTable } from "@/components/proveedores/ProveedoresTable";
import { getProveedores } from "@/lib/queries/proveedores";
import {
  AlertTriangle,
  CheckCircle,
  Package,
  Plus,
  Receipt,
} from "lucide-react";

export default async function ProveedoresPage() {
  const proveedores = await getProveedores();
  const total = proveedores.length;
  const alto = proveedores.filter(
    (proveedor) => (proveedor.cumplimiento_calidad ?? "").toLowerCase() === "alto"
  ).length;
  const bajo = proveedores.filter(
    (proveedor) => (proveedor.cumplimiento_calidad ?? "").toLowerCase() === "bajo"
  ).length;

  return (
    <main className="ml-[260px] flex-1 flex flex-col min-h-screen max-h-screen overflow-y-auto">
      <div className="p-8 space-y-8 flex-1">
        <div className="flex justify-between items-end">
          <div className="space-y-1">
            <h1 className="text-h1 font-h1 text-slate-900">Proveedores</h1>
            <p className="text-slate-500 font-body-md">
              Gestión de proveedores y órdenes de compra
            </p>
          </div>
          <button className="bg-[#90D5FF] text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-blue-200 hover:shadow-xl transition-all">
            <Plus className="h-4 w-4" />
            + Nuevo Proveedor
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl shadow-[0px_4px_20px_rgba(0,0,0,0.04)] border border-slate-50 flex items-center justify-between">
            <div>
              <p className="text-slate-500 font-label-bold mb-2">Total Proveedores</p>
              <p className="text-data-display font-manrope">{total}</p>
            </div>
            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
              <Package className="text-blue-600" />
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-[0px_4px_20px_rgba(0,0,0,0.04)] border border-slate-50 flex items-center justify-between">
            <div>
              <p className="text-slate-500 font-label-bold mb-2">Cumplimiento Alto</p>
              <div className="flex items-center gap-3">
                <p className="text-data-display font-manrope">{alto}</p>
                <span className="px-2 py-1 bg-tertiary/10 text-tertiary text-xs font-bold rounded-md">
                  Estable
                </span>
              </div>
            </div>
            <div className="w-12 h-12 bg-tertiary/10 rounded-xl flex items-center justify-center">
              <CheckCircle className="text-tertiary" />
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-[0px_4px_20px_rgba(0,0,0,0.04)] border border-slate-50 flex items-center justify-between">
            <div>
              <p className="text-slate-500 font-label-bold mb-2">Cumplimiento Bajo</p>
              <div className="flex items-center gap-3">
                <p className="text-data-display font-manrope">{bajo}</p>
                <span className="px-2 py-1 bg-error/10 text-error text-xs font-bold rounded-md">
                  Atención
                </span>
              </div>
            </div>
            <div className="w-12 h-12 bg-error/10 rounded-xl flex items-center justify-center">
              <AlertTriangle className="text-error" />
            </div>
          </div>
        </div>

        <ProveedoresTable proveedores={proveedores} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-[0px_4px_20px_rgba(0,0,0,0.04)] border border-slate-50 p-6">
            <h3 className="text-h3 font-h3 mb-6 flex items-center gap-2">
              <Receipt className="text-blue-600" />
              Órdenes Recientes
            </h3>
            <p className="text-sm text-slate-500">Sin órdenes recientes</p>
          </div>
          <div className="relative rounded-2xl overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-900 z-10"></div>
            <div className="relative z-20 p-8 h-full flex flex-col justify-end text-white space-y-4">
              <h3 className="text-h2 font-h2">Evaluar Proveedor</h3>
              <p className="text-slate-300 text-sm font-body-md leading-relaxed">
                Asegure la calidad de su cadena de suministro. Realice evaluaciones periódicas basadas en tiempos de entrega y calidad.
              </p>
              <button className="bg-white text-slate-900 py-3 rounded-xl font-bold text-sm w-full hover:bg-blue-50 transition-colors">
                Comenzar Evaluación
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
