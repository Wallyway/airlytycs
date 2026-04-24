"use client";

import {
  ChevronLeft,
  ChevronRight,
  Pencil,
  Search,
  Trash2,
} from "lucide-react";
import { useMemo, useState } from "react";
import type { Proveedor } from "@/types";

interface ProveedoresTableProps {
  proveedores: Proveedor[];
}

function normalizeText(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "");
}

function getInitials(nombre: string) {
  const parts = nombre.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}

function getAvatarClass(categoria: string | null) {
  const normalized = normalizeText(categoria ?? "");
  if (normalized.includes("tecnologia") || normalized.includes("tech")) {
    return "bg-purple-100 text-purple-600";
  }
  if (normalized.includes("equipo") || normalized.includes("medico")) {
    return "bg-blue-100 text-blue-600";
  }
  return "bg-slate-100 text-slate-600";
}

function getCategoriaBadgeClass(categoria: string | null) {
  const normalized = normalizeText(categoria ?? "");
  if (normalized.includes("tecnologia") || normalized.includes("tech")) {
    return "bg-purple-50 text-purple-600";
  }
  if (normalized.includes("equipo") || normalized.includes("medico")) {
    return "bg-blue-50 text-blue-600";
  }
  return "bg-slate-100 text-slate-600";
}

function getCumplimientoBadge(cumplimiento: string | null) {
  switch (normalizeText(cumplimiento ?? "")) {
    case "alto":
      return {
        className: "bg-green-50 text-green-600",
        dotClassName: "bg-green-600",
        label: "Alto",
      };
    case "medio":
      return {
        className: "bg-yellow-50 text-yellow-600",
        dotClassName: "bg-yellow-600",
        label: "Medio",
      };
    case "bajo":
      return {
        className: "bg-red-50 text-red-600",
        dotClassName: "bg-red-600",
        label: "Bajo",
      };
    default:
      return {
        className: "bg-slate-100 text-slate-600",
        dotClassName: "bg-slate-400",
        label: "-",
      };
  }
}

export function ProveedoresTable({ proveedores }: ProveedoresTableProps) {
  const [search, setSearch] = useState("");
  const [categoriaFiltro, setCategoriaFiltro] = useState("todas");
  const [cumplimientoFiltro, setCumplimientoFiltro] = useState("todos");

  const categorias = useMemo(() => {
    const values = new Set(
      proveedores
        .map((proveedor) => proveedor.categoria)
        .filter((value): value is string => Boolean(value))
    );
    return Array.from(values).sort((a, b) => a.localeCompare(b));
  }, [proveedores]);

  const cumplimientos = useMemo(() => {
    const values = new Set(
      proveedores
        .map((proveedor) => proveedor.cumplimiento_calidad)
        .filter((value): value is string => Boolean(value))
    );
    return Array.from(values).sort((a, b) => a.localeCompare(b));
  }, [proveedores]);

  const proveedoresFiltrados = useMemo(() => {
    const query = search.trim().toLowerCase();

    return proveedores.filter((proveedor) => {
      const nombre = proveedor.nombre_empresa.toLowerCase();
      const coincideNombre = query.length === 0 || nombre.includes(query);
      const coincideCategoria =
        categoriaFiltro === "todas" || proveedor.categoria === categoriaFiltro;
      const coincideCumplimiento =
        cumplimientoFiltro === "todos" ||
        proveedor.cumplimiento_calidad === cumplimientoFiltro;

      return coincideNombre && coincideCategoria && coincideCumplimiento;
    });
  }, [categoriaFiltro, cumplimientoFiltro, proveedores, search]);

  return (
    <div className="bg-white rounded-2xl shadow-[0px_4px_20px_rgba(0,0,0,0.04)] border border-slate-50 overflow-hidden">
      <div className="p-4 border-b border-slate-100 flex flex-wrap gap-4 items-center bg-slate-50/30">
        <div className="relative flex-1 min-w-[280px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
            placeholder="Buscar proveedor..."
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>
        <select
          className="py-2 pl-4 pr-10 border border-slate-200 rounded-lg text-sm text-slate-600 bg-white focus:ring-2 focus:ring-blue-500 outline-none"
          value={categoriaFiltro}
          onChange={(event) => setCategoriaFiltro(event.target.value)}
        >
          <option value="todas">Categorías</option>
          {categorias.map((categoria) => (
            <option key={categoria} value={categoria}>
              {categoria}
            </option>
          ))}
        </select>
        <select
          className="py-2 pl-4 pr-10 border border-slate-200 rounded-lg text-sm text-slate-600 bg-white focus:ring-2 focus:ring-blue-500 outline-none"
          value={cumplimientoFiltro}
          onChange={(event) => setCumplimientoFiltro(event.target.value)}
        >
          <option value="todos">Cumplimientos</option>
          {cumplimientos.map((cumplimiento) => (
            <option key={cumplimiento} value={cumplimiento}>
              {cumplimiento}
            </option>
          ))}
        </select>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-50/50">
            <tr>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                Empresa
              </th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                Contacto
              </th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                Categoría
              </th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                Cumplimiento
              </th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {proveedoresFiltrados.map((proveedor) => {
              const categoriaBadgeClass = getCategoriaBadgeClass(
                proveedor.categoria
              );
              const cumplimientoBadge = getCumplimientoBadge(
                proveedor.cumplimiento_calidad
              );

              return (
                <tr key={proveedor.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${getAvatarClass(
                          proveedor.categoria
                        )}`}
                      >
                        {getInitials(proveedor.nombre_empresa)}
                      </div>
                      <span className="font-manrope font-semibold text-slate-900">
                        {proveedor.nombre_empresa}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-600 text-sm">
                    {proveedor.contacto ?? "-"}
                  </td>
                  <td className="px-6 py-4 text-slate-600 text-sm">
                    {proveedor.email ?? "-"}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${categoriaBadgeClass}`}
                    >
                      {proveedor.categoria ?? "-"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 w-fit ${cumplimientoBadge.className}`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${cumplimientoBadge.dotClassName}`}
                      ></span>
                      {cumplimientoBadge.label}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button className="p-2 text-slate-400 hover:text-blue-600 transition-colors">
                        <Pencil className="text-xl" />
                      </button>
                      <button className="p-2 text-slate-400 hover:text-error transition-colors">
                        <Trash2 className="text-xl" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="p-6 border-t border-slate-100 flex justify-between items-center">
        <p className="text-sm text-slate-500 font-body-md">
          Mostrando {proveedoresFiltrados.length} de {proveedores.length} proveedores
        </p>
        <div className="flex gap-2">
          <button className="w-10 h-10 border border-slate-200 rounded-lg flex items-center justify-center text-slate-400 hover:border-blue-500 hover:text-blue-500 transition-all">
            <ChevronLeft />
          </button>
          <button className="w-10 h-10 bg-blue-600 text-white rounded-lg flex items-center justify-center font-bold text-sm">
            1
          </button>
          <button className="w-10 h-10 border border-slate-200 rounded-lg flex items-center justify-center text-slate-400 hover:border-blue-500 hover:text-blue-500 transition-all">
            <ChevronRight />
          </button>
        </div>
      </div>
    </div>
  );
}
