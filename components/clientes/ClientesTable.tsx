"use client";

import { useRouter } from "next/navigation";
import { ChevronDown, Pencil, Search, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";
import type { Cliente } from "@/types";

interface ClientesTableProps {
  clientes: Cliente[];
  openCreateInitially?: boolean;
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

interface ClienteFormState {
  nombre: string;
  telefono: string;
  email: string;
  direccion: string;
  tipo: "empresa" | "particular";
}

const initialFormState: ClienteFormState = {
  nombre: "",
  telefono: "",
  email: "",
  direccion: "",
  tipo: "empresa",
};

export function ClientesTable({
  clientes: initialClientes,
  openCreateInitially = false,
}: ClientesTableProps) {
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();
  const [rows, setRows] = useState<Cliente[]>(initialClientes);
  const [search, setSearch] = useState("");
  const [filtroTipo, setFiltroTipo] = useState<TipoFiltro>("todos");
  const [dialogOpen, setDialogOpen] = useState(openCreateInitially);
  const [dialogMode, setDialogMode] = useState<"create" | "edit">("create");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formState, setFormState] = useState<ClienteFormState>(initialFormState);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Note: we intentionally don't mirror props into state; after a mutation we
  // update local state and call router.refresh().

  // Open the create dialog on first render if requested.

  function openEditDialog(cliente: Cliente) {
    setDialogMode("edit");
    setEditingId(cliente.id);
    setFormState({
      nombre: cliente.nombre,
      telefono: cliente.telefono ?? "",
      email: cliente.email ?? "",
      direccion: cliente.direccion ?? "",
      tipo: getTipoNormalizado(cliente.tipo ?? null),
    });
    setErrorMessage(null);
    setDialogOpen(true);
  }

  async function handleDelete(cliente: Cliente) {
    const confirmed = window.confirm(
      `¿Seguro que deseas eliminar a ${cliente.nombre}?`,
    );
    if (!confirmed) return;

    const { error } = await supabase.from("clientes").delete().eq("id", cliente.id);

    if (error) {
      setErrorMessage("No se pudo eliminar el cliente.");
      return;
    }

    setRows((prev) => prev.filter((item) => item.id !== cliente.id));
    router.refresh();
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!formState.nombre.trim()) {
      setErrorMessage("El nombre es obligatorio.");
      return;
    }

    setSaving(true);
    setErrorMessage(null);

    const payload = {
      nombre: formState.nombre.trim(),
      telefono: formState.telefono.trim() || null,
      email: formState.email.trim() || null,
      direccion: formState.direccion.trim() || null,
      tipo: formState.tipo,
    };

    if (dialogMode === "create") {
      const { data, error } = await supabase
        .from("clientes")
        .insert(payload)
        .select("*")
        .single();

      if (error || !data) {
        setErrorMessage("No se pudo crear el cliente.");
        setSaving(false);
        return;
      }

      setRows((prev) =>
        [...prev, data as Cliente].sort((a, b) => a.nombre.localeCompare(b.nombre)),
      );
    } else {
      if (!editingId) {
        setErrorMessage("No se encontró el cliente a editar.");
        setSaving(false);
        return;
      }

      const { data, error } = await supabase
        .from("clientes")
        .update(payload)
        .eq("id", editingId)
        .select("*")
        .single();

      if (error || !data) {
        setErrorMessage("No se pudo actualizar el cliente.");
        setSaving(false);
        return;
      }

      setRows((prev) =>
        prev
          .map((item) => (item.id === editingId ? (data as Cliente) : item))
          .sort((a, b) => a.nombre.localeCompare(b.nombre)),
      );
    }

    setSaving(false);
    setDialogOpen(false);
    setFormState(initialFormState);
    setEditingId(null);
    router.refresh();
  }

  const clientesFiltrados = useMemo(() => {
    const query = search.trim().toLowerCase();

    return rows.filter((cliente) => {
      const nombre = cliente.nombre.toLowerCase();
      const coincideNombre = query.length === 0 || nombre.includes(query);
      const tipoNormalizado = getTipoNormalizado(cliente.tipo ?? null);
      const coincideTipo =
        filtroTipo === "todos" || tipoNormalizado === filtroTipo;

      return coincideNombre && coincideTipo;
    });
  }, [rows, filtroTipo, search]);

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

              return (
                <tr
                  key={cliente.id}
                  className="hover:bg-slate-50 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${avatarClass}`}
                      >
                        {getInitials(cliente.nombre)}
                      </div>
                      <span className="font-medium text-slate-900">
                        {cliente.nombre}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-600">
                    {cliente.telefono ?? "-"}
                  </td>
                  <td className="px-6 py-4 text-slate-600">
                    {cliente.email ?? "-"}
                  </td>
                  <td className="px-6 py-4 text-slate-600">
                    {cliente.direccion ?? "-"}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span
                      className={`inline-block px-2 py-1 rounded text-xs font-bold ${
                        tipoNormalizado === "empresa"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-slate-100 text-slate-700"
                      }`}
                    >
                      {tipoNormalizado === "empresa" ? "Empresa" : "Particular"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      type="button"
                      className="p-1.5 rounded text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                      onClick={() => openEditDialog(cliente)}
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      className="p-1.5 rounded text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                      onClick={() => handleDelete(cliente)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <Dialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) {
            setErrorMessage(null);
            if (openCreateInitially) {
              router.replace("/clientes");
            }
          }
        }}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {dialogMode === "create" ? "Agregar cliente" : "Editar cliente"}
            </DialogTitle>
            <DialogDescription>
              Completa la información del cliente para guardarla en el sistema.
            </DialogDescription>
          </DialogHeader>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Nombre</label>
              <Input
                value={formState.nombre}
                onChange={(event) =>
                  setFormState((prev) => ({ ...prev, nombre: event.target.value }))
                }
                placeholder="Nombre completo"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Teléfono</label>
                <Input
                  value={formState.telefono}
                  onChange={(event) =>
                    setFormState((prev) => ({ ...prev, telefono: event.target.value }))
                  }
                  placeholder="3001234567"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Tipo</label>
                <select
                  className="w-full h-8 rounded-lg border border-input bg-transparent px-2.5 text-sm"
                  value={formState.tipo}
                  onChange={(event) =>
                    setFormState((prev) => ({
                      ...prev,
                      tipo: event.target.value as "empresa" | "particular",
                    }))
                  }
                >
                  <option value="empresa">Empresa</option>
                  <option value="particular">Particular</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Email</label>
              <Input
                type="email"
                value={formState.email}
                onChange={(event) =>
                  setFormState((prev) => ({ ...prev, email: event.target.value }))
                }
                placeholder="cliente@correo.com"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Dirección</label>
              <Input
                value={formState.direccion}
                onChange={(event) =>
                  setFormState((prev) => ({ ...prev, direccion: event.target.value }))
                }
                placeholder="Ciudad, dirección"
              />
            </div>

            {errorMessage && (
              <p className="text-sm text-red-600" role="alert">
                {errorMessage}
              </p>
            )}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogOpen(false)}
                disabled={saving}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={saving}>
                {saving
                  ? "Guardando..."
                  : dialogMode === "create"
                    ? "Crear cliente"
                    : "Guardar cambios"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
