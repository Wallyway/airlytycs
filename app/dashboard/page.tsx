import Link from "next/link";
import { getClientes } from "@/lib/queries/clientes";
import { getInventario, getStockCritico } from "@/lib/queries/inventario";
import { getTotalVentasMes, getVentas } from "@/lib/queries/ventas";

type PeriodoGrafica = "semana" | "mes" | "anio";

type PuntoSerie = {
  key: string;
  label: string;
  total: number;
};

function toISODateKey(fecha: Date) {
  return fecha.toISOString().slice(0, 10);
}

function getSerieVentas(
  ventas: { fecha: string; total: number }[],
  periodo: PeriodoGrafica
): PuntoSerie[] {
  const hoy = new Date();

  if (periodo === "anio") {
    const year = hoy.getFullYear();
    const meses: PuntoSerie[] = Array.from({ length: 12 }, (_, index) => ({
      key: `${year}-${String(index + 1).padStart(2, "0")}`,
      label: new Date(year, index, 1).toLocaleDateString("es-CO", {
        month: "short",
      }),
      total: 0,
    }));
    const mapaMes = new Map(meses.map((mes) => [mes.key, mes]));

    for (const venta of ventas) {
      const fechaVenta = new Date(venta.fecha);
      if (fechaVenta.getFullYear() !== year) continue;

      const key = `${fechaVenta.getFullYear()}-${String(
        fechaVenta.getMonth() + 1
      ).padStart(2, "0")}`;
      const mes = mapaMes.get(key);

      if (mes) {
        mes.total += Number(venta.total);
      }
    }

    return meses;
  }

  if (periodo === "semana") {
    const inicioSemana = new Date(hoy);
    const day = inicioSemana.getDay();
    const diffToMonday = day === 0 ? 6 : day - 1;
    inicioSemana.setDate(inicioSemana.getDate() - diffToMonday);
    inicioSemana.setHours(0, 0, 0, 0);

    const diasSemana: PuntoSerie[] = Array.from({ length: 7 }, (_, index) => {
      const fecha = new Date(inicioSemana);
      fecha.setDate(inicioSemana.getDate() + index);

      return {
        key: toISODateKey(fecha),
        label: fecha.toLocaleDateString("es-CO", { weekday: "short" }),
        total: 0,
      };
    });
    const mapaDia = new Map(diasSemana.map((dia) => [dia.key, dia]));

    for (const venta of ventas) {
      const fechaVenta = new Date(venta.fecha);
      fechaVenta.setHours(0, 0, 0, 0);
      const diaSerie = mapaDia.get(toISODateKey(fechaVenta));

      if (diaSerie) {
        diaSerie.total += Number(venta.total);
      }
    }

    return diasSemana;
  }

  const year = hoy.getFullYear();
  const month = hoy.getMonth();
  const ultimoDiaMes = new Date(year, month + 1, 0).getDate();

  const dias: PuntoSerie[] = Array.from({ length: ultimoDiaMes }, (_, index) => {
    const fecha = new Date(year, month, index + 1);
    fecha.setHours(0, 0, 0, 0);

    return {
      key: toISODateKey(fecha),
      label: String(index + 1),
      total: 0,
    };
  });
  const mapaDia = new Map(dias.map((dia) => [dia.key, dia]));

  for (const venta of ventas) {
    const fechaVenta = new Date(venta.fecha);
    fechaVenta.setHours(0, 0, 0, 0);
    const dia = mapaDia.get(toISODateKey(fechaVenta));

    if (dia) {
      dia.total += Number(venta.total);
    }
  }

  return dias;
}

function shouldShowTick(
  periodo: PeriodoGrafica,
  index: number,
  total: number
) {
  if (periodo === "semana" || periodo === "anio") return true;
  if (index === 0 || index === total - 1) return true;
  if (periodo === "mes") {
    return (index + 1) % 5 === 0;
  }

  return false;
}

function construirPuntosYPath(valores: number[]) {
  const width = 600;
  const height = 240;
  const topPadding = 20;
  const bottomPadding = 40;
  const usableHeight = height - topPadding - bottomPadding;
  const stepX = width / Math.max(valores.length - 1, 1);
  const maxValor = Math.max(...valores, 1);

  const puntos = valores.map((valor, index) => {
    const x = index * stepX;
    const y = topPadding + (1 - valor / maxValor) * usableHeight;
    return { x, y };
  });

  const pathLinea = puntos
    .map((punto, index) => `${index === 0 ? "M" : "L"}${punto.x} ${punto.y}`)
    .join(" ");
  const pathArea = `${pathLinea} L${width} ${height} L0 ${height} Z`;

  return { pathLinea, pathArea };
}

function getTextoPeriodo(periodo: PeriodoGrafica) {
  if (periodo === "mes") return "mes";
  if (periodo === "anio") return "año";
  return "semana";
}

function getSubtituloGrafica(periodo: PeriodoGrafica) {
  if (periodo === "mes") {
    return "Días del mes actual con marcas cada 5 días.";
  }

  if (periodo === "anio") {
    return "Comparación mensual del año actual.";
  }

  return "Comparación día a día de la semana actual.";
}

function getLabelGrafica(periodo: PeriodoGrafica, label: string) {
  if (periodo === "mes") {
    return label;
  }

  return label;
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

export default async function DashboardPage({
  searchParams,
}: {
  searchParams?: Promise<{ periodo?: string }>;
}) {
  const resolvedSearchParams = await searchParams;
  const periodoRaw = resolvedSearchParams?.periodo;
  const periodo: PeriodoGrafica =
    periodoRaw === "mes" || periodoRaw === "anio" || periodoRaw === "semana"
      ? periodoRaw
      : "semana";

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
  const serieVentas = getSerieVentas(ventas, periodo);
  const { pathLinea, pathArea } = construirPuntosYPath(
    serieVentas.map((punto) => punto.total)
  );

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
                Ventas de la {getTextoPeriodo(periodo)}
              </h3>
              <p className="text-sm text-slate-400">
                {getSubtituloGrafica(periodo)}
              </p>
            </div>
            <div className="inline-flex rounded-lg border border-slate-200 bg-slate-50 p-1 text-xs font-semibold">
              {(["semana", "mes", "anio"] as const).map((opcion) => {
                const activo = periodo === opcion;
                const etiqueta =
                  opcion === "semana"
                    ? "Semana"
                    : opcion === "mes"
                    ? "Mes"
                    : "Año";

                return (
                  <Link
                    key={opcion}
                    href={`/dashboard?periodo=${opcion}`}
                    className={`rounded-md px-3 py-1 transition-colors ${
                      activo
                        ? "bg-white text-slate-900 shadow-sm"
                        : "text-slate-500 hover:text-slate-900"
                    }`}
                  >
                    {etiqueta}
                  </Link>
                );
              })}
            </div>
          </div>
          <svg
            viewBox="0 0 600 240"
            className="h-64 w-full"
            role="img"
            aria-label={`Gráfica de ventas por ${getTextoPeriodo(periodo)}`}
          >
            <defs>
              <linearGradient id="line" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#0095ff" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#0095ff" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path
              d={pathArea}
              fill="url(#line)"
            />
            <path
              d={pathLinea}
              fill="none"
              stroke="#0095ff"
              strokeWidth="3"
              strokeLinecap="round"
            />
          </svg>
          <div className="flex justify-between mt-4 px-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            {serieVentas.map((punto, index) => (
              <span
                key={punto.key}
                className={
                  shouldShowTick(periodo, index, serieVentas.length)
                    ? ""
                    : "opacity-0"
                }
              >
                {getLabelGrafica(periodo, punto.label)}
              </span>
            ))}
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
