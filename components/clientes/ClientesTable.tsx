"use client";

import { ChevronDown, Pencil, Search, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import type { Cliente } from "@/types";

interface ClientesTableProps {
  clientes: Cliente[];
}

type TipoFiltro = "todos" | "empresa" | "particular";

function getTipoNormalizado(tipo: string | null) {
  const value = (tipo ?? "").toLowerCase();
  return value === "particular" ? "particular" : "empresa";
}

function getInitials(nombre: string) {
  const parts = nombre.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 1).toUpperCase();
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}

export function ClientesTable({ clientes }: ClientesTableProps) {
  const [search, setSearch] = useState("");
  const [filtroTipo, setFiltroTipo] = useState<TipoFiltro>("todos");

  const clientesFiltrados = useMemo(() => {
    const query = search.trim().toLowerCase();

    return clientes.filter((cliente) => {
      const nombre = cliente.nombre.toLowerCase();
      const coincideNombre = query.length === 0 || nombre.includes(query);
      const tipoNormalizado = getTipoNormalizado(cliente.tipo ?? null);
      const coincideTipo =
        filtroTipo === "todos" || tipoNormalizado === filtroTipo;

      return coincideNombre && coincideTipo;
    });
  }, [clientes, filtroTipo, search]);

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            placeholder="Buscar cliente..."
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>
        <div className="relative min-w-[200px]">
          <select
            className="w-full pl-4 pr-10 py-2 bg-white border border-slate-200 rounded-lg text-sm appearance-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            value={filtroTipo}
            onChange={(event) =>
              setFiltroTipo(event.target.value as TipoFiltro)
            }
          >
            <option value="todos">Todos los tipos</option>
            <option value="empresa">Empresa</option>
            <option value="particular">Particular</option>
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-[0px_4px_20px_rgba(0,0,0,0.04)] border border-slate-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-50/50 border-b border-slate-100">
            <tr>
              <th className="px-6 py-4 text-label-bold text-on-surface-variant uppercase tracking-wider">
                Nombre
              </th>
              <th className="px-6 py-4 text-label-bold text-on-surface-variant uppercase tracking-wider">
                Teléfono
              </th>
              <th className="px-6 py-4 text-label-bold text-on-surface-variant uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-4 text-label-bold text-on-surface-variant uppercase tracking-wider">
                Dirección
              </th>
              <th className="px-6 py-4 text-label-bold text-on-surface-variant uppercase tracking-wider text-center">
                Tipo
              </th>
              <th className="px-6 py-4 text-label-bold text-on-surface-variant uppercase tracking-wider text-right">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {clientesFiltrados.map((cliente) => {
              const tipoNormalizado = getTipoNormalizado(cliente.tipo ?? null);
              const avatarClass =
                tipoNormalizado === "empresa"
                  ? "bg-blue-100 text-blue-600"
                  : "bg-slate-100 text-slate-600";
              const badgeClass =
                tipoNormalizado === "empresa"
                  ? "bg-[#90D5FF]/20 text-[#0060a8]"
                  : "bg-slate-100 text-slate-600";

              return (
                <tr key={cliente.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${avatarClass}`}
                      >
                        {getInitials(cliente.nombre)}
                      </div>
                      <span className="text-body-md font-semibold text-on-surface">
                        {cliente.nombre}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-body-md text-on-secondary-container">
                    {cliente.telefono ?? "-"}
                  </td>
                  <td className="px-6 py-4 text-body-md text-on-secondary-container">
                    {cliente.email ?? "-"}
                  </td>
                  <td className="px-6 py-4 text-body-md text-on-secondary-container">
                    {cliente.direccion ?? "-"}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span
                      className={`px-3 py-1 text-[11px] font-bold rounded-full ${badgeClass}`}
                    >
                      {tipoNormalizado === "empresa" ? "Empresa" : "Particular"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button className="p-1.5 text-slate-400 hover:text-primary hover:bg-primary/10 rounded transition-all">
                        <Pencil className="text-[20px]" />
                      </button>
                      <button className="p-1.5 text-slate-400 hover:text-error hover:bg-error/10 rounded transition-all">
                        <Trash2 className="text-[20px]" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <div className="px-6 py-4 bg-slate-50/50 flex items-center justify-between border-t border-slate-100">
          <span className="text-body-md text-slate-500 italic">
            Mostrando {clientesFiltrados.length} de {clientes.length} clientes
          </span>
          <div className="flex items-center gap-2">
            <button
              className="px-4 py-1.5 border border-slate-200 rounded text-slate-400 text-sm font-medium cursor-not-allowed"
              disabled
            >
              Anterior
            </button>
            <button
              className="px-4 py-1.5 border border-slate-200 rounded text-slate-400 text-sm font-medium cursor-not-allowed"
              disabled
            >
              Siguiente
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
