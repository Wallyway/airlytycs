import { getClientes } from "@/lib/queries/clientes";
import { getInventario, getStockCritico } from "@/lib/queries/inventario";
import { getTotalVentasMes, getVentas } from "@/lib/queries/ventas";

function getEstado(stockDisponible: number, stockMinimo: number) {
  if (stockDisponible < stockMinimo) {
    return { label: "Crítico", className: "bg-red-100 text-red-700" };
  }
  if (stockDisponible < stockMinimo * 2) {
    return { label: "Bajo", className: "bg-amber-100 text-amber-800" };
  }
  return { label: "OK", className: "bg-emerald-100 text-emerald-700" };
}

export default async function DashboardPage() {
  const [totalVentasMes, clientes, stockCritico, inventario, ventas] =
    await Promise.all([
      getTotalVentasMes(),
      getClientes(),
      getStockCritico(),
      getInventario(),
      getVentas(),
    ]);

  const formatoMoneda = new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
  });
  const ventasRecientes = ventas.slice(0, 3);
  const inventarioResumen = inventario.slice(0, 3);
  const stockCriticoCount = stockCritico.length;

  return (
    <main className="ml-64 pt-24 px-8 pb-12">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h2 className="text-3xl font-heading font-extrabold text-slate-900 tracking-tight">
            Analytics Overview
          </h2>
          <p className="text-slate-400 mt-1 font-sans">
            Precision tracking para operaciones medicas.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-l-[#0095ff]">
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">
            VENTAS DEL MES
          </p>
          <p className="text-2xl font-heading font-extrabold text-slate-900">
            {formatoMoneda.format(totalVentasMes)}
          </p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-l-[#0095ff]">
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">
            CLIENTES ACTIVOS
          </p>
          <p className="text-2xl font-heading font-extrabold text-slate-900">
            {clientes.length}
          </p>
        </div>
        <div
          className={`bg-white p-6 rounded-xl shadow-sm border-l-4 ${
            stockCriticoCount > 0 ? "border-l-red-500" : "border-l-[#0095ff]"
          }`}
        >
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">
            STOCK CRÍTICO
          </p>
          <p className="text-2xl font-heading font-extrabold text-slate-900">
            {stockCriticoCount}
          </p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-l-[#0095ff]">
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">
            ÓRDENES PENDIENTES
          </p>
          <p className="text-2xl font-heading font-extrabold text-slate-900">
            0
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        <div className="lg:col-span-2 bg-white p-8 rounded-xl shadow-sm relative overflow-hidden">
          <div className="flex justify-between items-center mb-10">
            <div>
              <h3 className="text-lg font-heading font-bold text-slate-900">
                User Engagement Over Time
              </h3>
              <p className="text-sm text-slate-400">
                Tracking active sessions against historical benchmarks
              </p>
            </div>
          </div>
          <svg
            viewBox="0 0 600 240"
            className="h-64 w-full"
            role="img"
            aria-label="Grafica de actividad"
          >
            <defs>
              <linearGradient id="line" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#0095ff" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#0095ff" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path
              d="M0 180 L80 140 L160 150 L240 110 L320 120 L400 80 L480 90 L560 60 L600 70 L600 240 L0 240 Z"
              fill="url(#line)"
            />
            <path
              d="M0 180 L80 140 L160 150 L240 110 L320 120 L400 80 L480 90 L560 60 L600 70"
              fill="none"
              stroke="#0095ff"
              strokeWidth="3"
              strokeLinecap="round"
            />
          </svg>
          <div className="flex justify-between mt-4 px-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            <span>Mon</span>
            <span>Tue</span>
            <span>Wed</span>
            <span>Thu</span>
            <span>Fri</span>
            <span>Sat</span>
            <span>Sun</span>
          </div>
        </div>
        <div className="bg-[#283044] p-8 rounded-xl shadow-xl text-white">
          <h3 className="text-lg font-heading font-bold mb-1">
            Bienvenido a AirLytics
          </h3>
          <p className="text-sm text-slate-300 mb-8">
            Analiza ventas, clientes e inventario en tiempo real.
          </p>
          <div className="space-y-6">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="font-medium text-slate-300">Ventas del mes</span>
                <span className="font-bold">
                  {formatoMoneda.format(totalVentasMes)}
                </span>
              </div>
              <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-[#0095ff] rounded-full w-2/3" />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="font-medium text-slate-300">Stock crítico</span>
                <span className="font-bold">{stockCriticoCount}</span>
              </div>
              <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-red-400 rounded-full w-1/3" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="px-8 py-6 border-b border-slate-200/60 flex justify-between items-center">
            <h3 className="text-lg font-heading font-bold text-slate-900">
              Inventario Destacado
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    Producto
                  </th>
                  <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">
                    Stock
                  </th>
                  <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">
                    Estado
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {inventarioResumen.map((item) => {
                  const estado = getEstado(item.stock_disponible, item.stock_minimo);

                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-slate-50 transition-colors"
                    >
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-sm bg-[#0095ff]/10 flex items-center justify-center text-[#0095ff]">
                            <span className="text-xs font-bold">PR</span>
                          </div>
                          <span className="font-medium text-sm">
                            {item.productos?.nombre ?? item.producto_id}
                          </span>
                        </div>
                      </td>
                      <td className="px-8 py-5 text-right text-sm text-slate-500">
                        {item.stock_disponible}
                      </td>
                      <td className="px-8 py-5 text-right">
                        <span
                          className={`px-2 py-0.5 text-xs font-bold rounded-full ${estado.className}`}
                        >
                          {estado.label}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
        <div className="bg-[#1a2233] p-8 rounded-xl shadow-xl text-white">
          <h3 className="text-lg font-heading font-bold mb-1">
            Actividad Reciente
          </h3>
          <p className="text-sm text-slate-300 mb-6">
            Ultimas ventas registradas
          </p>
          <div className="space-y-4">
            {ventasRecientes.map((venta) => (
              <div key={venta.id} className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-semibold text-white">
                    {venta.clientes?.nombre ?? "Cliente"}
                  </p>
                  <p className="text-xs text-slate-300">
                    {new Date(venta.fecha).toLocaleDateString("es-CO")}
                  </p>
                </div>
                <span className="text-sm font-bold text-[#0095ff]">
                  {formatoMoneda.format(venta.total)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
