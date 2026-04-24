"use client";

import {
  Activity,
  ChevronLeft,
  ChevronRight,
  Eye,
  Package,
  Pencil,
  Search,
  Trash2,
  Wind,
} from "lucide-react";
import { useMemo, useState } from "react";
import type { Inventario, Producto } from "@/types";

interface ProductosTableProps {
  productos: Producto[];
  inventario: Inventario[];
}

const iconStyles = [
  { className: "bg-blue-50 text-blue-600", icon: Package },
  { className: "bg-orange-50 text-orange-600", icon: Activity },
  { className: "bg-emerald-50 text-emerald-600", icon: Wind },
];

function getIconStyle(index: number) {
  return iconStyles[index] ?? { className: "bg-slate-50 text-slate-600", icon: Package };
}

export function ProductosTable({ productos, inventario }: ProductosTableProps) {
  const [search, setSearch] = useState("");

  const inventarioMap = useMemo(() => {
    return new Map(inventario.map((item) => [item.producto_id, item]));
  }, [inventario]);

  const productosFiltrados = useMemo(() => {
    const query = search.trim().toLowerCase();

    return productos.filter((producto) => {
      if (!query) return true;
      const nombre = producto.nombre.toLowerCase();
      const modelo = (producto.modelo ?? "").toLowerCase();
      return nombre.includes(query) || modelo.includes(query);
    });
  }, [productos, search]);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-[0px_4px_20px_rgba(0,0,0,0.04)] border border-slate-100 p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex-1 min-w-[300px] relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            className="w-full pl-12 pr-4 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-body-md transition-all"
            placeholder="Buscar producto por nombre o modelo..."
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>
        <div className="flex bg-slate-100 p-1 rounded-lg">
          <button className="flex items-center gap-2 px-4 py-2 rounded-md bg-white shadow-sm text-blue-600 font-bold text-body-md transition-all">
            <Package className="text-[18px]" />
            Vista Tabla
          </button>
          <button className="flex items-center gap-2 px-4 py-2 rounded-md text-slate-500 hover:text-slate-700 font-medium text-body-md transition-all">
            <Package className="text-[18px]" />
            Vista Tarjetas
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-[0px_4px_20px_rgba(0,0,0,0.04)] border border-slate-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              <th className="px-6 py-4 text-label-bold font-label-bold text-slate-500 uppercase tracking-wider">
                Producto
              </th>
              <th className="px-6 py-4 text-label-bold font-label-bold text-slate-500 uppercase tracking-wider">
                ID
              </th>
              <th className="px-6 py-4 text-label-bold font-label-bold text-slate-500 uppercase tracking-wider">
                Descripción
              </th>
              <th className="px-6 py-4 text-label-bold font-label-bold text-slate-500 uppercase tracking-wider">
                Stock
              </th>
              <th className="px-6 py-4 text-label-bold font-label-bold text-slate-500 uppercase tracking-wider text-right">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {productosFiltrados.map((producto, index) => {
              const inventoryItem = inventarioMap.get(producto.id);
              const stockDisponible = inventoryItem?.stock_disponible ?? null;
              const stockMinimo = inventoryItem?.stock_minimo ?? null;
              const isCritico =
                stockDisponible !== null &&
                stockMinimo !== null &&
                stockDisponible < stockMinimo;
              const Icon = getIconStyle(index).icon;
              const iconClass = getIconStyle(index).className;

              return (
                <tr key={producto.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${iconClass}`}>
                        <Icon />
                      </div>
                      <span className="font-bold text-slate-900 text-body-md">
                        {producto.nombre}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-slate-500 font-mono text-xs">
                    {producto.id}
                  </td>
                  <td className="px-6 py-5 text-slate-600 text-body-md">
                    {producto.modelo ?? "-"}
                  </td>
                  <td className="px-6 py-5">
                    {!inventoryItem ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-500 font-bold text-[11px]">
                        Sin registro
                      </span>
                    ) : (
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-bold text-[11px] ${
                          isCritico
                            ? "bg-red-50 text-red-600"
                            : "bg-green-50 text-green-600"
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            isCritico ? "bg-red-600" : "bg-green-600"
                          }`}
                        ></span>
                        {stockDisponible} unidades ({isCritico ? "Crítico" : "OK"})
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-5 text-right">
                    <div className="flex justify-end gap-2">
                      <button className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all">
                        <Eye className="text-[20px]" />
                      </button>
                      <button className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all">
                        <Pencil className="text-[20px]" />
                      </button>
                      <button className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-error hover:bg-error-container/20 transition-all">
                        <Trash2 className="text-[20px]" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <div className="px-6 py-4 bg-white border-t border-slate-100 flex items-center justify-between">
          <p className="text-slate-500 text-body-md font-body-md">
            Mostrando {productosFiltrados.length} de {productos.length} productos
          </p>
          <div className="flex items-center gap-2">
            <button className="p-2 border border-slate-200 rounded-lg text-slate-400 hover:bg-slate-50 disabled:opacity-50" disabled>
              <ChevronLeft />
            </button>
            <div className="flex gap-1">
              <button className="w-10 h-10 bg-blue-600 text-white rounded-lg font-bold text-body-md">1</button>
            </div>
            <button className="p-2 border border-slate-200 rounded-lg text-slate-400 hover:bg-slate-50 disabled:opacity-50" disabled>
              <ChevronRight />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
