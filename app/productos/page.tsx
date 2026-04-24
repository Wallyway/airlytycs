import { ProductosTable } from "@/components/productos/ProductosTable";
import { getInventario } from "@/lib/queries/inventario";
import { getProductos } from "@/lib/queries/productos";
import { AlertTriangle, CheckCircle, LayoutGrid, Plus } from "lucide-react";

export default async function ProductosPage() {
  const [productos, inventario] = await Promise.all([
    getProductos(),
    getInventario(),
  ]);
  const total = productos.length;
  const conStock = inventario.filter((item) => item.stock_disponible > 0).length;
  const criticos = inventario.filter(
    (item) => item.stock_disponible < item.stock_minimo
  ).length;

  return (
    <main className="ml-[260px] min-h-screen">
      <div className="pt-24 px-8 pb-12 space-y-8">
        <div className="flex justify-between items-end">
          <div>
            <h2 className="font-h2 text-h2 text-slate-900 mb-1">Productos</h2>
            <p className="text-slate-500 text-body-md font-body-md">
              Catálogo de productos médicos disponibles
            </p>
          </div>
          <button className="bg-[#90D5FF] hover:bg-[#7bc8f0] text-on-primary-container px-6 py-2.5 rounded-lg font-bold text-body-md flex items-center gap-2 shadow-sm transition-all active:scale-95">
            <Plus className="text-[20px]" />
            + Nuevo Producto
          </button>
        </div>

        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-12 md:col-span-4 bg-white p-6 rounded-xl shadow-[0px_4px_20px_rgba(0,0,0,0.04)] border border-slate-100 flex items-center justify-between">
            <div>
              <p className="text-slate-500 text-label-bold font-label-bold uppercase tracking-wider mb-2">
                TOTAL PRODUCTOS
              </p>
              <h3 className="text-data-display font-data-display text-slate-900">
                {total}
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
                {criticos}
              </h3>
            </div>
            <div className="w-12 h-12 bg-error-container/20 rounded-lg flex items-center justify-center text-error">
              <AlertTriangle className="text-[28px]" />
            </div>
          </div>
        </div>

        <ProductosTable productos={productos} inventario={inventario} />

        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-12 lg:col-span-8 bg-white p-6 rounded-xl shadow-[0px_4px_20px_rgba(0,0,0,0.04)] border border-slate-100">
            <h3 className="font-h3 text-h3 text-slate-900 mb-6">
              Resumen de Inventario
            </h3>
            <div className="space-y-6">
              {inventario.map((item) => {
                const porcentaje = Math.min(
                  100,
                  Math.max(0, (item.stock_disponible / 50) * 100)
                );
                const esCritico = item.stock_disponible < item.stock_minimo;

                return (
                  <div key={item.id} className="space-y-2">
                    <div
                      className={`flex justify-between text-body-md font-medium ${
                        esCritico ? "text-error" : "text-slate-700"
                      }`}
                    >
                      <span>{item.productos?.nombre ?? item.producto_id}</span>
                      <span className="text-slate-500">
                        {item.stock_disponible}/50
                      </span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          esCritico ? "bg-error" : "bg-blue-500"
                        }`}
                        style={{ width: `${porcentaje}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="col-span-12 lg:col-span-4 bg-slate-900 dark:bg-black p-6 rounded-xl flex flex-col justify-between relative overflow-hidden">
            <div
              className="absolute inset-0 opacity-10 pointer-events-none"
              style={{
                backgroundImage:
                  "radial-gradient(circle at 2px 2px, white 1px, transparent 0)",
                backgroundSize: "24px 24px",
              }}
            ></div>
            <div className="relative z-10">
              <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center text-white mb-6">
                <LayoutGrid className="text-[32px]" />
              </div>
              <h3 className="text-h3 font-h3 text-white mb-2">
                Agregar al Inventario
              </h3>
              <p className="text-slate-400 text-body-md font-body-md">
                Optimiza tu stock registrando nuevos ingresos de material y equipamiento médico.
              </p>
            </div>
            <div className="mt-8 relative z-10">
              <button className="w-full bg-white text-slate-900 py-3 rounded-lg font-bold text-body-md hover:bg-slate-100 transition-all active:scale-98">
                Gestionar Stock
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
