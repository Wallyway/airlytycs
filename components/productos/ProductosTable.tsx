"use client";

import { useRouter } from "next/navigation";
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
import { useEffect, useMemo, useState } from "react";
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
import type { Inventario, Producto } from "@/types";

interface ProductosTableProps {
  productos: Producto[];
  inventario: Inventario[];
  openCreateInitially?: boolean;
}

interface ProductoFormState {
  id: string;
  nombre: string;
  modelo: string;
  descripcion: string;
}

const initialFormState: ProductoFormState = {
  id: "",
  nombre: "",
  modelo: "",
  descripcion: "",
};

const iconStyles = [
  { className: "bg-blue-50 text-blue-600", icon: Package },
  { className: "bg-orange-50 text-orange-600", icon: Activity },
  { className: "bg-emerald-50 text-emerald-600", icon: Wind },
];

function getIconStyle(index: number) {
  return iconStyles[index] ?? {
    className: "bg-slate-50 text-slate-600",
    icon: Package,
  };
}

export function ProductosTable({
  productos,
  inventario,
  openCreateInitially = false,
}: ProductosTableProps) {
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();
  const [rows, setRows] = useState<Producto[]>(productos);
  const [inventoryRows, setInventoryRows] = useState<Inventario[]>(inventario);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"create" | "edit">("create");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formState, setFormState] = useState<ProductoFormState>(initialFormState);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    setRows(productos);
  }, [productos]);

  useEffect(() => {
    setInventoryRows(inventario);
  }, [inventario]);

  useEffect(() => {
    if (!openCreateInitially) return;
    setDialogMode("create");
    setEditingId(null);
    setFormState(initialFormState);
    setErrorMessage(null);
    setDialogOpen(true);
  }, [openCreateInitially]);

  function openCreateDialog() {
    setDialogMode("create");
    setEditingId(null);
    setFormState(initialFormState);
    setErrorMessage(null);
    setDialogOpen(true);
  }

  function openEditDialog(producto: Producto) {
    setDialogMode("edit");
    setEditingId(producto.id);
    setFormState({
      id: producto.id,
      nombre: producto.nombre,
      modelo: producto.modelo ?? "",
      descripcion: producto.descripcion ?? "",
    });
    setErrorMessage(null);
    setDialogOpen(true);
  }

  async function handleDelete(producto: Producto) {
    const confirmed = window.confirm(
      `¿Seguro que deseas eliminar ${producto.nombre}?`,
    );
    if (!confirmed) return;

    const { error } = await supabase.from("productos").delete().eq("id", producto.id);

    if (error) {
      setErrorMessage("No se pudo eliminar el producto.");
      return;
    }

    setRows((prev) => prev.filter((item) => item.id !== producto.id));
    setInventoryRows((prev) => prev.filter((item) => item.producto_id !== producto.id));
    router.refresh();
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!formState.id.trim() || !formState.nombre.trim()) {
      setErrorMessage("ID y nombre son obligatorios.");
      return;
    }

    setSaving(true);
    setErrorMessage(null);

    const payload = {
      id: formState.id.trim(),
      nombre: formState.nombre.trim(),
      modelo: formState.modelo.trim() || null,
      descripcion: formState.descripcion.trim() || null,
    };

    if (dialogMode === "create") {
      const { data, error } = await supabase
        .from("productos")
        .insert(payload)
        .select("*")
        .single();

      if (error || !data) {
        setErrorMessage("No se pudo crear el producto. Verifica que el ID no exista.");
        setSaving(false);
        return;
      }

      setRows((prev) =>
        [...prev, data as Producto].sort((a, b) => a.nombre.localeCompare(b.nombre)),
      );
    } else {
      if (!editingId) {
        setErrorMessage("No se encontró el producto a editar.");
        setSaving(false);
        return;
      }

      const { data, error } = await supabase
        .from("productos")
        .update({
          nombre: payload.nombre,
          modelo: payload.modelo,
          descripcion: payload.descripcion,
        })
        .eq("id", editingId)
        .select("*")
        .single();

      if (error || !data) {
        setErrorMessage("No se pudo actualizar el producto.");
        setSaving(false);
        return;
      }

      setRows((prev) =>
        prev
          .map((item) => (item.id === editingId ? (data as Producto) : item))
          .sort((a, b) => a.nombre.localeCompare(b.nombre)),
      );
    }

    setSaving(false);
    setDialogOpen(false);
    setFormState(initialFormState);
    setEditingId(null);
    router.refresh();
  }

  const inventarioMap = useMemo(() => {
    return new Map(inventoryRows.map((item) => [item.producto_id, item]));
  }, [inventoryRows]);

  const productosFiltrados = useMemo(() => {
    const query = search.trim().toLowerCase();

    return rows.filter((producto) => {
      if (!query) return true;
      const nombre = producto.nombre.toLowerCase();
      const modelo = (producto.modelo ?? "").toLowerCase();
      return nombre.includes(query) || modelo.includes(query);
    });
  }, [rows, search]);

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
                      <button
                        type="button"
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all"
                      >
                        <Eye className="text-[20px]" />
                      </button>
                      <button
                        type="button"
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all"
                        onClick={() => openEditDialog(producto)}
                      >
                        <Pencil className="text-[20px]" />
                      </button>
                      <button
                        type="button"
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all"
                        onClick={() => handleDelete(producto)}
                      >
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
            Mostrando {productosFiltrados.length} de {rows.length} productos
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

      <Dialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) {
            setErrorMessage(null);
            if (openCreateInitially) {
              router.replace("/productos");
            }
          }
        }}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {dialogMode === "create" ? "Nuevo producto" : "Editar producto"}
            </DialogTitle>
            <DialogDescription>
              Registra o actualiza la información principal del producto.
            </DialogDescription>
          </DialogHeader>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">ID</label>
                <Input
                  value={formState.id}
                  onChange={(event) =>
                    setFormState((prev) => ({ ...prev, id: event.target.value }))
                  }
                  placeholder="PROD-001"
                  disabled={dialogMode === "edit"}
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Nombre</label>
                <Input
                  value={formState.nombre}
                  onChange={(event) =>
                    setFormState((prev) => ({ ...prev, nombre: event.target.value }))
                  }
                  placeholder="Nombre del producto"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Modelo</label>
              <Input
                value={formState.modelo}
                onChange={(event) =>
                  setFormState((prev) => ({ ...prev, modelo: event.target.value }))
                }
                placeholder="Modelo"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Descripción</label>
              <Input
                value={formState.descripcion}
                onChange={(event) =>
                  setFormState((prev) => ({ ...prev, descripcion: event.target.value }))
                }
                placeholder="Descripción breve"
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
                    ? "Crear producto"
                    : "Guardar cambios"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
